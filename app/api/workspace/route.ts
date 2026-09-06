import {
  context,
  db,
  ensureSeed,
  allow,
  encode,
  scopeRows,
} from '@/lib/server';
export async function GET() {
  try {
    const { user, member, org } = await context();
    await ensureSeed(org, user.userId);
    const result = await db()
      .prepare('SELECT * FROM records WHERE organizationId = ? ORDER BY id')
      .bind(org)
      .all<any>();
    let rows = result.results.map(encode);
    rows = scopeRows(rows, member);
    const audit =
      member.role === 'Admin' || member.role === 'Lab Assistant'
        ? (
            await db()
              .prepare(
                "SELECT * FROM audits WHERE organizationId = ? AND (? = 'Admin' OR action = 'Updated inventory') ORDER BY id DESC LIMIT 100",
              )
              .bind(org, member.role)
              .all()
          ).results
        : [];
    const members =
      member.role === 'Admin'
        ? (
            await db()
              .prepare(
                'SELECT id,name,role,email,classes,studentId FROM members WHERE organizationId=?',
              )
              .bind(org)
              .all()
          ).results
        : [];
    return Response.json({ rows, member, audit, members });
  } catch (e) {
    return failure(e);
  }
}
function failure(e: any) {
  const msg = e.message || 'Request failed';
  return Response.json(
    { error: msg },
    { status: msg === 'UNAUTHORIZED' ? 401 : msg === 'FORBIDDEN' ? 403 : 400 },
  );
}
export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin)
      throw new Error('FORBIDDEN');
    const { user, member, org } = await context();
    const b: any = await req.json();
    if (!b || typeof b.action !== 'string') throw new Error('Invalid action');
    const action = b.action;
    const row = b.id
      ? await db()
          .prepare('SELECT * FROM records WHERE id = ? AND organizationId = ?')
          .bind(org + ':' + b.id, org)
          .first<any>()
      : null;
    const now = new Date().toISOString();
    let data = row ? JSON.parse(row.data) : {};
    if (
      row &&
      ['assignment', 'submission', 'record', 'student'].includes(row.kind) &&
      member.role !== 'Admin'
    ) {
      const all = (
        await db()
          .prepare('SELECT * FROM records WHERE organizationId=?')
          .bind(org)
          .all<any>()
      ).results.map(encode);
      if (!scopeRows(all, member).some((r) => r.id === b.id))
        throw new Error('FORBIDDEN');
    }
    const persist = async (
      kind: string,
      name: string,
      payload: any,
      quantity = 0,
    ) => {
      const id = org + ':' + crypto.randomUUID();
      await db()
        .prepare(
          'INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,?,0,?,?)',
        )
        .bind(
          id,
          org,
          kind,
          name,
          JSON.stringify(payload),
          quantity,
          user.userId,
          now,
        )
        .run();
      return id;
    };
    if (action === 'member') {
      allow(member.role, 'members.edit');
      const roles = [
        'Student',
        'Teacher',
        'Lab Assistant',
        'Librarian',
        'Admin',
        'Department Head',
      ];
      if (
        !roles.includes(b.role) ||
        typeof b.email !== 'string' ||
        !/^[-.\w+]+@[-.\w]+\.[a-zA-Z]{2,}$/.test(b.email)
      )
        throw new Error('Valid email and role required');
      if (
        ['Student', 'Teacher', 'Department Head'].includes(b.role) &&
        !b.classes
      )
        throw new Error('Assign at least one class');
      const email = b.email.toLowerCase();
      if (b.role === 'Student' && !b.studentId)
        throw new Error('Select the student profile');
      const existing = await db()
        .prepare('SELECT id FROM members WHERE email=?')
        .bind(email)
        .first();
      if (existing)
        throw new Error('An account with this email already has a membership');
      await db()
        .prepare(
          'INSERT INTO members (id,organizationId,userId,role,name,email,classes,studentId) VALUES (?,?,?,?,?,?,?,?)',
        )
        .bind(
          crypto.randomUUID(),
          org,
          'pending:' + email,
          b.role,
          b.name || email,
          email,
          b.classes || '',
          b.studentId || null,
        )
        .run();
      await db()
        .prepare(
          'INSERT INTO audits (organizationId,entityId,action,after,actor,timestamp) VALUES (?,?,?,?,?,?)',
        )
        .bind(
          org,
          email,
          'Granted membership',
          JSON.stringify({ role: b.role }),
          user.userId,
          now,
        )
        .run();
    } else if (action === 'stock') {
      allow(member.role, 'inventory.edit');
      if (!row || row.kind !== 'inventory') throw new Error('Item not found');
      const amount = Number(b.amount);
      if (
        !Number.isInteger(amount) ||
        amount < (b.type === 'Adjusted' ? 0 : 1) ||
        amount > 1000000
      )
        throw new Error('Enter a positive whole quantity');
      if (
        ![
          'Used',
          'Added',
          'Damaged',
          'Returned',
          'Adjusted',
          'Restocked',
          'Removed',
        ].includes(b.type)
      )
        throw new Error('Invalid transaction type');
      const quantity =
        b.type === 'Adjusted'
          ? amount
          : row.quantity +
            (['Used', 'Damaged', 'Removed'].includes(b.type)
              ? -amount
              : amount);
      if (quantity < 0) throw new Error('Insufficient stock');
      data = {
        ...data,
        lastTransaction: {
          type: b.type,
          amount,
          notes: String(b.notes || '').slice(0, 2000),
          class: b.class,
          experimentName: b.experimentName,
          previousQuantity: row.quantity,
          newQuantity: quantity,
        },
      };
      const result = await db()
        .prepare(
          'UPDATE records SET quantity=?,data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=? AND version=?',
        )
        .bind(
          quantity,
          JSON.stringify(data),
          user.userId,
          now,
          row.id,
          org,
          b.version,
        )
        .run();
      if (!result.meta.changes)
        throw new Error('Stock changed. Refresh and try again');
    } else if (action === 'request') {
      allow(member.role, 'request.create');
      if (!row || !['inventory', 'book'].includes(row.kind))
        throw new Error('Item not found');
      if (!String(b.purpose || '').trim() || !b.desiredDate)
        throw new Error('Purpose and date are required');
      const quantity = Number(b.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000)
        throw new Error('Invalid quantity');
      await persist('request', row.name, {
        itemId: b.id,
        type: row.kind === 'book' ? 'library' : 'lab',
        quantity,
        purpose: String(b.purpose).slice(0, 2000),
        class: b.class || '',
        teacher: b.teacher || '',
        desiredDate: b.desiredDate,
        status: 'Pending',
        studentId: member.studentId || '',
        requestedBy: user.userId,
        notes: b.notes || '',
      });
    } else if (action === 'requestStatus') {
      allow(member.role, 'request.approve');
      if (!row || row.kind !== 'request') throw new Error('Request not found');
      if (
        (member.role === 'Lab Assistant' && data.type !== 'lab') ||
        (member.role === 'Librarian' && data.type !== 'library')
      )
        throw new Error('FORBIDDEN');
      const next: Record<string, string[]> = {
        Pending: ['Approved', 'Rejected'],
        Approved: ['Ordered', 'Available', 'Completed'],
        Ordered: ['Available'],
        Available: ['Completed'],
      };
      if (!next[data.status]?.includes(b.status))
        throw new Error('Invalid status transition');
      await db()
        .prepare(
          'UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=? AND version=?',
        )
        .bind(
          JSON.stringify({ ...data, status: b.status, comment: b.notes || '' }),
          user.userId,
          now,
          row.id,
          org,
          row.version,
        )
        .run();
    } else if (action === 'save') {
      const kind = b.kind;
      if (!['inventory', 'book', 'assignment', 'record'].includes(kind))
        throw new Error('Invalid record type');
      allow(member.role, kind + '.edit');
      if (typeof b.name !== 'string' || !b.name.trim() || b.name.length > 200)
        throw new Error('Name is required (maximum 200 characters)');
      if (!b.data || typeof b.data !== 'object')
        throw new Error('Details are required');
      if (member.role !== 'Admin') {
        const assigned = (member.classes || '').split('|');
        if (kind === 'assignment' && !assigned.includes(b.data.class))
          throw new Error('FORBIDDEN');
        if (kind === 'record') {
          const st = await db()
            .prepare(
              "SELECT data FROM records WHERE id=? AND organizationId=? AND kind='student'",
            )
            .bind(org + ':' + b.data.studentId, org)
            .first<any>();
          if (!st || !assigned.includes(JSON.parse(st.data).class))
            throw new Error('FORBIDDEN');
        }
      }
      if (kind === 'record' && !b.data.studentId)
        throw new Error('Select a student');
      if (
        kind === 'assignment' &&
        (!b.data.class ||
          !b.data.instructions ||
          !Number.isFinite(Number(b.data.maximumMarks)) ||
          Number(b.data.maximumMarks) <= 0 ||
          Number.isNaN(Date.parse(b.data.dueAt)))
      )
        throw new Error(
          'Class, instructions, valid deadline and positive maximum marks required',
        );
      if (kind === 'inventory' && (!b.data.lab || !b.data.unit))
        throw new Error('Laboratory and unit are required');
      const quantity = Number(b.quantity || 0);
      if (!Number.isInteger(quantity) || quantity < 0)
        throw new Error('Invalid stock quantity');
      if (row) {
        if (row.kind !== kind) throw new Error('Invalid kind');
        await db()
          .prepare(
            'UPDATE records SET name=?,data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?',
          )
          .bind(
            b.name,
            JSON.stringify({ ...data, ...b.data }),
            user.userId,
            now,
            row.id,
            org,
          )
          .run();
      } else await persist(kind, b.name, b.data, quantity);
    } else if (action === 'issue') {
      allow(member.role, 'loan.edit');
      if (!row || row.kind !== 'book' || row.quantity < 1)
        throw new Error('No copy available');
      const student = await db()
        .prepare(
          "SELECT * FROM records WHERE id=? AND organizationId=? AND kind='student'",
        )
        .bind(org + ':' + b.studentId, org)
        .first<any>();
      if (!student || !b.dueAt)
        throw new Error('Student and due date required');
      const id = org + ':' + crypto.randomUUID();
      await db().batch([
        db()
          .prepare(
            "INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) SELECT ?,?,'loan',?,?,0,0,?,? WHERE EXISTS (SELECT 1 FROM records WHERE id=? AND organizationId=? AND quantity>0)",
          )
          .bind(
            id,
            org,
            row.name,
            JSON.stringify({
              bookId: b.id,
              studentId: b.studentId,
              studentName: student.name,
              borrowedAt: now.slice(0, 10),
              dueAt: b.dueAt,
              status: 'Borrowed',
            }),
            user.userId,
            now,
            row.id,
            org,
          ),
        db()
          .prepare(
            'UPDATE records SET quantity=quantity-1,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=? AND quantity>0',
          )
          .bind(user.userId, now, row.id, org),
      ]);
    } else if (action === 'return') {
      allow(member.role, 'loan.edit');
      if (!row || row.kind !== 'loan' || data.status !== 'Borrowed')
        throw new Error('Loan already returned or not found');
      await db().batch([
        db()
          .prepare(
            "UPDATE records SET quantity=quantity+1,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=? AND EXISTS (SELECT 1 FROM records WHERE id=? AND json_extract(data,'$.status')='Borrowed')",
          )
          .bind(user.userId, now, org + ':' + data.bookId, org, row.id),
        db()
          .prepare(
            "UPDATE records SET data=json_set(data,'$.status','Returned','$.returnedAt',?),version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=? AND json_extract(data,'$.status')='Borrowed'",
          )
          .bind(now, user.userId, now, row.id, org),
      ]);
    } else if (action === 'submit') {
      allow(member.role, 'submission.create');
      if (!row || row.kind !== 'assignment' || !String(b.text || '').trim())
        throw new Error('Write your response before submitting');
      await persist('submission', row.name, {
        assignmentId: b.id,
        studentId: member.studentId || user.userId,
        text: String(b.text).slice(0, 30000),
        attachments: Array.isArray(b.attachments) ? b.attachments : [],
        status: new Date(data.dueAt) < new Date() ? 'Late' : 'Submitted',
        submittedAt: now,
      });
    } else if (action === 'grade') {
      allow(member.role, 'submission.grade');
      if (!row || row.kind !== 'submission')
        throw new Error('Submission not found');
      const assignment = await db()
        .prepare('SELECT data FROM records WHERE id=? AND organizationId=?')
        .bind(org + ':' + data.assignmentId, org)
        .first<any>();
      const grade = Number(b.grade);
      if (
        !Number.isFinite(grade) ||
        grade < 0 ||
        grade > JSON.parse(assignment.data).maximumMarks
      )
        throw new Error('Grade is outside the allowed range');
      await db()
        .prepare(
          'UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?',
        )
        .bind(
          JSON.stringify({
            ...data,
            grade,
            feedback: String(b.feedback || ''),
            status: 'Graded',
          }),
          user.userId,
          now,
          row.id,
          org,
        )
        .run();
    } else if (action === 'read') {
      if (!row || row.kind !== 'notification')
        throw new Error('Notification not found');
      await db()
        .prepare(
          "UPDATE records SET data=json_set(data,'$.read',json('true')) WHERE id=? AND organizationId=?",
        )
        .bind(row.id, org)
        .run();
    } else if (action === 'problem') {
      if (!row || row.kind !== 'inventory' || !String(b.notes || '').trim())
        throw new Error('Describe the problem');
      await persist('request', 'Problem: ' + row.name, {
        itemId: b.id,
        type: 'lab',
        purpose: b.notes,
        status: 'Pending',
        quantity: 1,
        requestedBy: user.userId,
        studentId: member.studentId || '',
      });
    } else throw new Error('Unknown action');
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
