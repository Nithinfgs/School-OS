import { context, db, schoolRows, scopeRows } from '@/lib/server';
import { classLogRows } from '@/lib/class-logs';
export async function POST(req: Request) {
  try {
    const { user, member, org } = await context();
    if (
      member.role !== 'Student' ||
      (req.headers.get('origin') &&
        req.headers.get('origin') !== new URL(req.url).origin)
    )
      throw Error('FORBIDDEN');
    const b = (await req.json()) as any;
    const all = await schoolRows(org),
      rows = scopeRows(all, member);
    const old = rows.find((r) => r.id === b.id);
    const now = new Date().toISOString();
    const str = (k: string, required = false, max = 5000) => {
      if (b[k] != null && typeof b[k] !== 'string') throw Error('Invalid ' + k);
      const v = (b[k] || '').trim();
      if ((required && !v) || v.length > max) throw Error('Check ' + k);
      return v;
    };
    const date = (k: string) => {
      const v = str(k, true, 40);
      if (!/^\d{4}-\d{2}-\d{2}/.test(v) || !Number.isFinite(Date.parse(v)))
        throw Error('Choose a valid date');
      return v;
    };
    const cls = rows.find((r) => r.kind === 'class' && r.id === b.classId);
    const files = () => {
      if (
        !Array.isArray(b.attachments || []) ||
        (b.attachments || []).length > 20
      )
        throw Error('Choose up to 20 files');
      return (b.attachments || []).map((id: string) => {
        const f = rows.find(
          (r) =>
            r.kind === 'file' && r.id === id && r.data.ownerId === user.userId,
        );
        if (!f) throw Error('FORBIDDEN');
        return { id: f.id, name: f.name };
      });
    };
    let kind = '',
      name = '',
      data: any = {},
      prior: any = null,
      id = crypto.randomUUID() as string;
    const policy = rows.find((r) => r.kind === 'servicePolicy')?.data || {};
    if (b.action === 'read') {
      const source = [...rows, ...(await classLogRows(org, member))].find(
        (r) => r.id === b.sourceId,
      );
      if (!source) throw Error('FORBIDDEN');
      const key = source.id + ':' + (source.version ?? source.updatedAt ?? '0');
      id =
        'read-' + user.userId.replace(/[^a-zA-Z0-9_-]/g, '-') + '-' + source.id;
      prior = rows.find((r) => r.id === id);
      kind = 'reading';
      name = 'Read status';
      data = { userId: user.userId, sourceKey: key, read: b.read === true };
    } else if (b.action === 'request') {
      if (
        !old ||
        !['inventory', 'book'].includes(old.kind) ||
        !cls ||
        old.data.requestable === false
      )
        throw Error('FORBIDDEN');
      const quantity = Number(b.quantity || 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000)
        throw Error('Check quantity');
      kind = 'request';
      name = old.name;
      data = {
        itemId: old.id,
        type: old.kind === 'book' ? 'library' : 'lab',
        quantity,
        purpose: str('purpose', true),
        class: cls.name,
        classId: cls.id,
        teacher: cls.data.teacher,
        desiredDate: date('desiredDate'),
        notes: str('notes'),
        status: 'Pending',
        waitlist: old.kind === 'book' && old.quantity < 1,
        requestedBy: user.userId,
      };
    } else if (b.action === 'maintenance') {
      kind = 'maintenance';
      name = str('name', true, 200);
      data = {
        category: str('category', true, 100),
        location: str('location', true, 200),
        description: str('description', true),
        urgency: str('urgency', true, 50),
        attachments: files(),
        status: 'Reported',
      };
    } else if (b.action === 'absenceRequest') {
      if (!policy.absenceRequests || !cls) throw Error('FORBIDDEN');
      kind = 'absenceRequest';
      name = 'Absence / excuse request';
      data = {
        class: cls.name,
        classId: cls.id,
        date: date('date'),
        reason: str('reason', true),
        attachments: files(),
        status: 'Pending',
      };
    } else if (['counsellingRequest', 'medicalRequest'].includes(b.action)) {
      if (
        !policy[
          b.action === 'counsellingRequest'
            ? 'counsellingEnabled'
            : 'medicalEnabled'
        ]
      )
        throw Error('This service is not enabled by your school');
      kind = b.action;
      name =
        b.action === 'counsellingRequest'
          ? 'Counselling appointment request'
          : 'Medical visit request';
      data = {
        studentFacing: true,
        restricted: true,
        preferredTime: date('preferredTime'),
        reasonCategory: str('reasonCategory'),
        notes: str('notes'),
        status: 'Requested',
      };
    } else if (b.action === 'mealOrder') {
      if (
        !policy.preordersEnabled ||
        !old ||
        old.kind !== 'meal' ||
        old.data.available === false ||
        (old.data.orderBy && Date.parse(old.data.orderBy) < Date.now())
      )
        throw Error('Preordering is unavailable');
      kind = 'mealOrder';
      name = old.name;
      data = {
        mealId: old.id,
        date: old.data.date,
        status: 'Requested',
        notes: str('notes'),
      };
    } else if (b.action === 'portfolio') {
      if (old && !['project', 'cas'].includes(old.kind))
        throw Error('FORBIDDEN');
      if (old && !old.data.studentIds?.includes(member.studentId))
        throw Error('FORBIDDEN');
      if (old?.data.status === 'Approved')
        throw Error('Approved work is locked; contact your supervisor');
      if (!old && (!cls || b.kind !== 'cas'))
        throw Error('Choose an enrolled class for your CAS supervisor');
      prior = old;
      kind = old?.kind || 'cas';
      id = old?.id || id;
      name = old?.name || str('name', true, 200);
      const hours = Number(b.hours || 0);
      if (!Number.isFinite(hours) || hours < 0 || hours > 10000)
        throw Error('Check hours');
      const members = (
        await db()
          .prepare(
            "SELECT id,userId,name,classes FROM members WHERE organizationId=? AND role IN ('Teacher','Department Head')",
          )
          .bind(org)
          .all<any>()
      ).results;
      const supervisor = members.find((m) =>
        (m.classes || '').split('|').includes(cls?.name),
      );
      if (!old && !supervisor)
        throw Error('A supervisor must be assigned to this class first');
      data = old
        ? { ...all.find((r) => r.id === old.id)!.data }
        : {
            class: cls.name,
            classId: cls.id,
            studentIds: [member.studentId],
            supervisorId: supervisor.id,
            supervisor: supervisor.name,
            type: 'CAS',
            description: str('description'),
            status: 'Draft',
          };
      data.reflections = str('reflections');
      data.evidence = str('evidence');
      data.strands = str('strands');
      data.outcomes = str('outcomes');
      data.hours = hours;
      data.studentNotes = str('studentNotes');
      data.studentAttachments = files();
      if (Array.isArray(b.completedMilestones))
        data.milestoneList = (data.milestoneList || []).map(
          (m: any, i: number) => ({
            ...m,
            completed: b.completedMilestones.includes(i),
          }),
        );
      data.status = b.submit
        ? 'Submitted'
        : data.status === 'Submitted'
          ? 'InProgress'
          : data.status;
      if (b.submit) data.submittedAt = now;
    } else if (b.action === 'message') {
      if (!cls) throw Error('FORBIDDEN');
      const recipient = await db()
        .prepare(
          'SELECT id,userId,name,classes,role FROM members WHERE organizationId=? AND id=?',
        )
        .bind(org, b.recipientId)
        .first<any>();
      if (
        !recipient ||
        !['Teacher', 'Department Head'].includes(recipient.role) ||
        !(recipient.classes || '').split('|').includes(cls.name)
      )
        throw Error('FORBIDDEN');
      kind = 'message';
      name = str('name', true, 200);
      data = {
        class: cls.name,
        classId: cls.id,
        studentId: member.studentId,
        participants: [user.userId, recipient.userId],
        senderName: member.name,
        description: str('description', true, 10000),
        attachments: files(),
        sentAt: now,
      };
    } else throw Error('Unknown student action');
    data = { ...data, studentId: data.studentId || member.studentId };
    if (kind === 'message' && data.attachments.length) {
      await db().batch(
        data.attachments.map((f: any) => {
          const file = all.find((r) => r.id === f.id)!;
          return db()
            .prepare(
              'UPDATE records SET data=?,version=version+1,updatedBy=?,updatedAt=? WHERE organizationId=? AND id=?',
            )
            .bind(
              JSON.stringify({
                ...file.data,
                audience: 'message',
                module: 'message',
                participants: data.participants,
              }),
              user.userId,
              now,
              org,
              org + ':' + f.id,
            );
        }),
      );
    }
    if (prior) {
      if (b.action !== 'read' && b.version !== prior.version)
        throw Error('CONFLICT');
      await db()
        .prepare(
          'UPDATE records SET name=?,data=CASE WHEN version=? THEN ? ELSE NULL END,version=version+1,updatedBy=?,updatedAt=? WHERE organizationId=? AND id=?',
        )
        .bind(
          name,
          prior.version,
          JSON.stringify(data),
          user.userId,
          now,
          org,
          org + ':' + id,
        )
        .run();
    } else
      await db()
        .prepare(
          'INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
        )
        .bind(
          org + ':' + id,
          org,
          kind,
          name,
          JSON.stringify({ ...data, createdAt: now, createdBy: user.userId }),
          user.userId,
          now,
        )
        .run();
    return Response.json({ ok: true, id });
  } catch (e: any) {
    return Response.json(
      { error: e.message },
      {
        status:
          e.message === 'FORBIDDEN'
            ? 403
            : e.message === 'UNAUTHORIZED'
              ? 401
              : e.message === 'CONFLICT'
                ? 409
                : 400,
      },
    );
  }
}
