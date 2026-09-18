import { context, db } from '@/lib/server';

export async function POST(req: Request) {
  try {
    if (
      req.headers.get('origin') &&
      req.headers.get('origin') !== new URL(req.url).origin
    )
      return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
    const { member, org, user } = await context();
    if (member.role !== 'Teacher')
      return Response.json(
        { error: 'Only assigned teachers can write class logs' },
        { status: 403 },
      );
    const b = (await req.json()) as any;
    const cls = await db()
      .prepare(
        "SELECT id,name FROM records WHERE id=? AND organizationId=? AND kind='class'",
      )
      .bind(org + ':' + b.classId, org)
      .first<any>();
    if (!cls || !(member.classes || '').split('|').includes(cls.name))
      return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
    if (
      typeof b.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
      !Number.isFinite(Date.parse(b.date)) ||
      new Date(b.date).toISOString().slice(0, 10) !== b.date
    )
      throw Error('Enter a valid date');
    const field = (key: string, max: number, required = false) => {
      if (b[key] != null && typeof b[key] !== 'string')
        throw Error('Invalid ' + key);
      const value = (b[key] || '').trim();
      if ((required && !value) || value.length > max)
        throw Error(key + ' is required or exceeds ' + max + ' characters');
      return value;
    };
    const topic = field('topic', 200, true),
      content = field('contentCovered', 10000, true),
      notes = field('notes', 5000),
      homework = field('homework', 5000);
    const period = field('period', 40) || 'Daily',
      activities = field('activities', 10000);
    const requestedResources = b.resources ?? [];
    if (!Array.isArray(requestedResources) || requestedResources.length > 20)
      throw Error('Use up to 20 resource links');
    const resources = requestedResources.map((s: unknown) => {
      if (typeof s !== 'string' || s.length > 2000)
        throw Error('Invalid resource link');
      const url = new URL(s);
      if (!['http:', 'https:'].includes(url.protocol))
        throw Error('Resources must use http or https');
      return url.href;
    });
    const prior = await db()
      .prepare(
        'SELECT * FROM teacher_class_logs WHERE organizationId=? AND classId=? AND date=? AND period=?',
      )
      .bind(org, cls.id, b.date, period)
      .first<any>();
    if (prior && (b.id !== prior.id || b.version !== prior.version))
      return Response.json(
        {
          error:
            'A log already exists or was changed. Refresh class history and edit the latest entry.',
        },
        { status: 409 },
      );
    if (!prior && b.id)
      throw Error('Existing logs cannot change class or date');
    const id = prior?.id || crypto.randomUUID(),
      now = new Date().toISOString();
    const after = {
      topic,
      contentCovered: content,
      notes,
      homework,
      resources,
      period,
      activities,
      classId: b.classId,
      class: cls.name,
      date: b.date,
      teacher: member.name,
    };
    // The audit insert and versioned write share one atomic batch. The audit
    // SELECT is conditional so competing stale edits cannot create false history.
    const audit = prior
      ? db()
          .prepare(`INSERT INTO audits (organizationId,entityId,action,before,after,actor,timestamp)
          SELECT organizationId,id,'Updated class log',?, ?, ?, ? FROM teacher_class_logs WHERE id=? AND organizationId=? AND version=?`)
          .bind(
            JSON.stringify(prior),
            JSON.stringify(after),
            user.userId,
            now,
            id,
            org,
            b.version,
          )
      : db()
          .prepare(
            'INSERT INTO audits (organizationId,entityId,action,after,actor,timestamp) VALUES (?,?,?,?,?,?)',
          )
          .bind(
            org,
            id,
            'Created class log',
            JSON.stringify(after),
            user.userId,
            now,
          );
    const write = prior
      ? db()
          .prepare(
            'UPDATE teacher_class_logs SET topic=?,contentCovered=?,notes=?,homework=?,resources=?,activities=?,updatedBy=?,updatedAt=?,version=version+1 WHERE id=? AND organizationId=? AND version=?',
          )
          .bind(
            topic,
            content,
            notes,
            homework,
            JSON.stringify(resources),
            activities,
            member.id,
            now,
            id,
            org,
            b.version,
          )
      : db()
          .prepare(
            'INSERT INTO teacher_class_logs (id,organizationId,classId,date,topic,contentCovered,notes,homework,resources,createdBy,updatedBy,createdAt,updatedAt,period,activities,version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)',
          )
          .bind(
            id,
            org,
            cls.id,
            b.date,
            topic,
            content,
            notes,
            homework,
            JSON.stringify(resources),
            member.id,
            member.id,
            now,
            now,
            period,
            activities,
          );
    const result = await db().batch([audit, write]);
    if (!result[1].meta.changes)
      return Response.json(
        { error: 'Log changed. Refresh and try again.' },
        { status: 409 },
      );
    return Response.json({ ok: true, id });
  } catch (e: any) {
    const unauthorized = e.message === 'UNAUTHORIZED';
    return Response.json(
      {
        error: unauthorized
          ? e.message
          : /UNIQUE/.test(e.message)
            ? 'A log already exists for this class and date. Refresh history.'
            : e.message || 'Unable to save log',
      },
      { status: unauthorized ? 401 : 400 },
    );
  }
}
