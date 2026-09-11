import {
  context,
  db,
  ensureSeed,
  allow,
  encode,
  scopeRows,
  schoolRows,
} from '@/lib/server';
import { classLogRows } from '@/lib/class-logs';
import { seedTeachingDemo } from '@/lib/teaching-seed';
import { seedStudentDemo } from '@/lib/student-seed';
import {
  dashboardRows,
  visibleAudits,
  profileMetrics,
} from '@/lib/master-dashboard';
import { getMockWorkspaceData, handleMockMutation } from '@/lib/mock-workspace';
import { backendConfig } from '@/lib/platform/config';
import { loadSupabaseWorkspace } from '@/lib/platform/supabase-workspace';
import { handleSupabaseWorkspaceMutation } from '@/lib/platform/supabase-mutations';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function GET() {
  try {
    if (backendConfig.adapter === 'supabase') {
      const user=await getChatGPTUser();
      if(!user) return Response.json({error:'UNAUTHORIZED'},{status:401});
      if (!user.userId.startsWith('dev:')) return Response.json(await loadSupabaseWorkspace(user));
    }
    const { user, member, org } = await context();
    await ensureSeed(org, user.userId);
    await seedTeachingDemo(org);
    await seedStudentDemo(org);
    let rows = await schoolRows(org);
    rows = scopeRows(rows, member);
    rows.push(...(await classLogRows(org, member)));
    rows = profileMetrics(rows);
    let audit: any[] = ['Admin', 'Teacher', 'Lab Assistant'].includes(
      member.role,
    )
      ? (
          await db()
            .prepare(
              "SELECT * FROM audits WHERE organizationId = ? AND (? IN ('Admin','Teacher') OR action = 'Updated inventory') ORDER BY id DESC",
            )
            .bind(org, member.role)
            .all()
        ).results
      : [];
    if (member.role === 'Teacher')
      audit = audit.filter((a) => {
        try {
          const after = typeof a.after === 'string' ? JSON.parse(a.after || '{}') : a.after || {};
          if (
            after.kind === 'inventory' ||
            rows.some(
              (r) => r.kind === 'inventory' && org + ':' + r.id === a.entityId,
            )
          )
            return (member.classes || '')
              .split('|')
              .includes(after.data?.lastTransaction?.class);
          return true;
        } catch {
          return true;
        }
      });
    const usage = audit.flatMap((a) => {
      try {
        const after = typeof a.after === 'string' ? JSON.parse(a.after || '{}') : a.after || {},
          before = typeof a.before === 'string' ? JSON.parse(a.before || '{}') : a.before || {},
          t = after.data?.lastTransaction;
        if (
          after.kind !== 'inventory' ||
          !t ||
          JSON.stringify(t) === JSON.stringify(before.data?.lastTransaction)
        )
          return [];
        return [
          {
            id: 'usage-' + a.id,
            kind: 'labUsage',
            name: after.name,
            data: {
              ...t,
              itemId: a.entityId.slice(org.length + 1),
              quantity: t.amount,
              date: a.timestamp.slice(0, 10),
              time: a.timestamp,
            },
            updatedAt: a.timestamp,
            updatedBy: a.actor,
          },
        ];
      } catch {
        return [];
      }
    });
    rows.push(...usage);
    const members =
      member.role === 'Admin'
        ? (
            await db()
              .prepare(
                'SELECT id,userId,name,role,email,classes,studentId,department FROM members WHERE organizationId=?',
              )
              .bind(org)
              .all()
          ).results
        : [];
    const masterRows =
      member.role === 'Admin' ? dashboardRows(rows, members) : [];
    const auditActors =
      member.role === 'Teacher'
        ? (
            await db()
              .prepare('SELECT userId,name FROM members WHERE organizationId=?')
              .bind(org)
              .all()
          ).results
        : members;
    audit = visibleAudits(
      audit,
      member.role === 'Admin' ? masterRows : rows,
      org,
      auditActors,
    );
    const contacts =
      member.role === 'Student'
        ? (
            await db()
              .prepare(
                "SELECT id,name,email,role,department,classes FROM members WHERE organizationId=? AND role IN ('Teacher','Department Head')",
              )
              .bind(org)
              .all<any>()
          ).results
            .map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              role: m.role,
              department: m.department,
              classes: (m.classes || '').split('|').filter(Boolean),
            }))
        : [];
    return Response.json(
      {
        rows,
        contacts,
        member,
        audit,
        members,
        masterRows,
        refreshedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (e) {
    // In real backend mode, returning a convincing demo workspace would hide
    // an outage, missing RLS policy, or failed adapter from staff. Dev users
    // still use the isolated demonstration store below.
    if (backendConfig.adapter === 'supabase') {
      const authenticated = await getChatGPTUser().catch(() => null);
      if (authenticated && !authenticated.userId.startsWith('dev:')) {
        return Response.json(
          { error: 'School data could not be loaded. Please try again.', mode: 'supabase' },
          { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
        );
      }
    }
    try {
      const { user, member } = await context();
      return Response.json(getMockWorkspaceData(member || user || 'Admin'), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    } catch {
      return Response.json(getMockWorkspaceData('Admin'), {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }
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
    if (backendConfig.adapter === 'supabase') {
      const user=await getChatGPTUser();
      if(!user) throw new Error('UNAUTHORIZED');
      if (!user.userId.startsWith('dev:')) {
        const payload=await req.json();
        return Response.json(await handleSupabaseWorkspaceMutation(payload,user));
      }
    }
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
    if (action === 'notificationRead' || action === 'read') {
      if (!row || row.kind !== 'notification') throw new Error('Notification not found');
      await db()
        .prepare('UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?')
        .bind(JSON.stringify({ ...data, read: b.read !== false }), user.userId, now, row.id, org)
        .run();
    } else if (action === 'notificationsReadAll') {
      const notifications = (await db()
        .prepare('SELECT id,data FROM records WHERE organizationId=? AND kind=\'notification\'')
        .bind(org)
        .all<any>()).results;
      for (const notification of notifications) {
        const notificationData = JSON.parse(notification.data);
        if (notificationData.read || notificationData.userId !== user.userId) continue;
        await db()
          .prepare('UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?')
          .bind(JSON.stringify({ ...notificationData, read: true }), user.userId, now, notification.id, org)
          .run();
      }
    } else
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
    if (action === 'calendarEvent') {
      allow(member.role, 'calendar.manage');
      const event = b.data;
      if (!event || typeof event.title !== 'string' || !event.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(event.date || '')) || !/^\d{2}:\d{2}$/.test(String(event.startTime || '')) || !/^\d{2}:\d{2}$/.test(String(event.endTime || ''))) throw new Error('Valid event title, date and times are required');
      if (event.endTime <= event.startTime) throw new Error('Event end time must be after its start time');
      const payload = { ...event, title: event.title.trim(), updatedAt: now, createdBy: user.userId };
      if (event.id) {
        const eventId = org + ':' + event.id;
        const existing = await db().prepare("SELECT id FROM records WHERE id=? AND organizationId=? AND kind='calendarEvent'").bind(eventId, org).first<any>();
        if (existing) {
          await db().prepare('UPDATE records SET name=?,data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?').bind(payload.title, JSON.stringify(payload), user.userId, now, eventId, org).run();
          return Response.json({ ok: true, data: { ...payload, id: event.id } });
        }
        // Seed events become real records when first edited; client-provided seed IDs are never database IDs.
        const savedId = await persist('calendarEvent', payload.title, { ...payload, id: undefined });
        return Response.json({ ok: true, data: { ...payload, id: savedId.slice(org.length + 1) } });
      }
      const savedId = await persist('calendarEvent', payload.title, payload);
      return Response.json({ ok: true, data: { ...payload, id: savedId.slice(org.length + 1) } });
    } else if (action === 'inquiryUpdate') {
      allow(member.role, 'inquiries.manage');
      if (!b.data?.id) throw new Error('Inquiry id is required');
      const inquiryId = org + ':' + b.data.id;
      const existing = await db().prepare("SELECT * FROM records WHERE id=? AND organizationId=? AND kind='inquiry'").bind(inquiryId, org).first<any>();
      if (!existing) throw new Error('Inquiry was not found');
      const current = JSON.parse(existing.data);
      const status = b.data.status || current.status;
      if (!['New','Open','AwaitingResponse','AwaitingParentStudent','Resolved','Closed'].includes(status)) throw new Error('Invalid inquiry status');
      const payload = { ...current, ...b.data, status, updatedAt: now, updatedBy: user.userId };
      await db().prepare('UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?').bind(JSON.stringify(payload), user.userId, now, inquiryId, org).run();
      return Response.json({ ok: true, data: payload });
    } else if (action === 'busArrival' || action === 'busDeparture' || action === 'transportNoticeUpdate') {
      allow(member.role, 'transport.manage');
      if (!b.data || typeof b.data !== 'object') throw new Error('Transport data is required');
      const payload = { ...b.data, updatedAt: now, updatedBy: user.userId };
      const savedId = await persist(action === 'transportNoticeUpdate' ? 'transportNotice' : 'transportActivity', payload.title || action, payload);
      return Response.json({ ok: true, data: { ...payload, id: savedId.slice(org.length + 1) } });
    } else if (action === 'attendance') {
      if (!['Admin', 'Teacher'].includes(member.role))
        throw new Error('FORBIDDEN');
      const cls = await db()
        .prepare(
          "SELECT * FROM records WHERE id=? AND organizationId=? AND kind='class'",
        )
        .bind(org + ':' + b.classId, org)
        .first<any>();
      const student = await db()
        .prepare(
          "SELECT * FROM records WHERE id=? AND organizationId=? AND kind='student'",
        )
        .bind(org + ':' + b.studentId, org)
        .first<any>();
      if (!cls || !student || JSON.parse(student.data).class !== cls.name)
        throw new Error('Select a student in this class');
      if (
        member.role === 'Teacher' &&
        !(member.classes || '').split('|').includes(cls.name)
      )
        throw new Error('FORBIDDEN');
      if (!['Present', 'Absent', 'Late', 'Excused'].includes(b.status))
        throw new Error('Invalid attendance status');
      if (
        typeof b.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
        !Number.isFinite(Date.parse(b.date)) ||
        new Date(b.date).toISOString().slice(0, 10) !== b.date
      )
        throw new Error('Valid date required');
      const id =
        org + ':attendance-' + b.classId + '-' + b.studentId + '-' + b.date;
      const existing = await db()
        .prepare('SELECT * FROM records WHERE id=? AND organizationId=?')
        .bind(id, org)
        .first<any>();
      if (existing && existing.version !== b.version)
        throw new Error('Attendance changed. Refresh before correcting it.');
      if (existing && !String(b.notes || '').trim())
        throw new Error('A reason is required for an attendance correction');
      const payload = JSON.stringify({
        classId: b.classId,
        class: cls.name,
        studentId: b.studentId,
        studentName: student.name,
        date: b.date,
        status: b.status,
        notes: String(b.notes || '').slice(0, 2000),
        teacher: member.name,
        teacherId: member.id,
      });
      if (existing) {
        const result = await db()
          .prepare(
            'UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=? AND version=?',
          )
          .bind(payload, user.userId, now, id, org, b.version)
          .run();
        if (!result.meta.changes)
          throw new Error('Attendance changed. Refresh and try again.');
      } else
        await db()
          .prepare(
            "INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,'attendance',?,?,0,0,?,?)",
          )
          .bind(
            id,
            org,
            student.name + ' · ' + cls.name,
            payload,
            user.userId,
            now,
          )
          .run();
    } else if (action === 'member') {
      allow(member.role, 'members.edit');
      const roles = [
        'Student',
        'Teacher',
        'Lab Assistant',
        'Librarian',
        'Admin',
        'Head of School',
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
      if (
        b.class &&
        !(await db()
          .prepare(
            "SELECT id FROM records WHERE organizationId=? AND kind='class' AND name=?",
          )
          .bind(org, b.class)
          .first())
      )
        throw new Error('Class not found');
      let usedStudent: any = null;
      if (b.studentId) {
        usedStudent = await db()
          .prepare(
            "SELECT * FROM records WHERE organizationId=? AND kind='student' AND id=?",
          )
          .bind(org, org + ':' + b.studentId)
          .first<any>();
        if (
          !usedStudent ||
          (b.class && JSON.parse(usedStudent.data).class !== b.class)
        )
          throw new Error('Student must belong to the selected class');
      }
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
          studentId: usedStudent ? b.studentId : '',
          studentName: usedStudent?.name || '',
          whoUsed: usedStudent?.name || member.name,
          actor: user.userId,
          time: now,
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
      if (
        ['Teacher', 'Student', 'Department Head'].includes(member.role) &&
        !(member.classes || '').split('|').includes(b.class)
      )
        throw new Error('FORBIDDEN');
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
    } else if (action === 'labOrderStatus') {
      allow(member.role, 'lab.orders.approve');
      if (!row || !['labOrder', 'order'].includes(row.kind))
        throw new Error('Lab order not found');
      const allowedStatuses = [
        'Draft',
        'Submitted',
        'Approved',
        'Ordered',
        'PartiallyReceived',
        'Received',
        'Cancelled',
      ];
      if (!allowedStatuses.includes(b.status)) throw new Error('Invalid lab order status');
      await db()
        .prepare(
          'UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?',
        )
        .bind(
          JSON.stringify({
            ...data,
            status: b.status,
            approvalHistory: [
              ...(Array.isArray(data.approvalHistory) ? data.approvalHistory : []),
              { status: b.status, actor: user.userId, time: now },
            ],
          }),
          user.userId,
          now,
          row.id,
          org,
        )
        .run();
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
      if (data.status === 'Draft') throw new Error('FORBIDDEN');
      for (const f of b.attachments || []) {
        const file = await db()
          .prepare(
            "SELECT data FROM records WHERE organizationId=? AND id=? AND kind='file'",
          )
          .bind(org, org + ':' + f.id)
          .first<any>();
        if (!file || JSON.parse(file.data).ownerId !== user.userId)
          throw new Error('FORBIDDEN');
      }
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
          "UPDATE records SET data=json_set(data,'$.read',json('true')),updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?",
        )
        .bind(user.userId, now, row.id, org)
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
