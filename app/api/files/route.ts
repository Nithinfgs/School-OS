import { env } from 'cloudflare:workers';
import { context, db, schoolRows } from '@/lib/server';
import { isMasterVisible } from '@/lib/master-dashboard';
function allowedFile(r: any, member: any, user: any) {
  const d = JSON.parse(r.data);
  if (d.audience === 'message')
    return (
      d.participants?.includes(user.userId) ||
      d.ownerId === user.userId ||
      (member.role === 'Student' && d.studentIds?.includes(member.studentId))
    );
  if (!isMasterVisible({ ...r, data: d }) && d.ownerId !== user.userId)
    return false;
  return (
    member.role === 'Admin' ||
    d.ownerId === user.userId ||
    (member.role === 'Student' && d.studentIds?.includes(member.studentId)) ||
    (['Teacher', 'Department Head'].includes(member.role) &&
      (member.classes || '').split('|').includes(d.class)) ||
    (d.audience === 'class' &&
      (member.classes || '').split('|').includes(d.class))
  );
}
export async function POST(req: Request) {
  try {
    const { user, member, org } = await context();
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin)
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (
      !['Admin', 'Student', 'Teacher', 'Department Head'].includes(member.role)
    )
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (Number(req.headers.get('content-length') || 0) > 12 * 1024 * 1024)
      return Response.json(
        { error: 'Maximum file size is 10 MB' },
        { status: 400 },
      );
    const f = await req.formData();
    const file = f.get('file');
    const cls = String(f.get('class') || '');
    const requestedAudience = String(f.get('audience') || 'class');
    let studentIds: string[] = [];
    if (
      member.role !== 'Student' &&
      ['targeted', 'message'].includes(requestedAudience)
    ) {
      const ids = JSON.parse(String(f.get('studentIds') || '[]'));
      if (!Array.isArray(ids) || !ids.length || ids.length > 100)
        return Response.json(
          { error: 'Choose the students before uploading this file' },
          { status: 400 },
        );
      for (const id of ids) {
        const s = await db()
          .prepare(
            "SELECT data FROM records WHERE organizationId=? AND id=? AND kind='student'",
          )
          .bind(org, org + ':' + id)
          .first<any>();
        const enrolled =
          s &&
          (await schoolRows(org))
            .find((r) => r.id === id)
            ?.data.classes?.includes(cls);
        if (!s || (JSON.parse(s.data).class !== cls && !enrolled))
          return Response.json(
            { error: 'Student is outside this class' },
            { status: 403 },
          );
      }
      studentIds = [...new Set(ids)] as string[];
    }
    if (
      !(await db()
        .prepare(
          "SELECT id FROM records WHERE organizationId=? AND kind='class' AND name=?",
        )
        .bind(org, cls)
        .first())
    )
      return Response.json({ error: 'Class not found' }, { status: 400 });
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024 || !file.size)
      return Response.json(
        { error: 'Choose a file smaller than 10 MB' },
        { status: 400 },
      );
    if (
      member.role !== 'Admin' &&
      !(member.classes || '').split('|').includes(cls)
    )
      return Response.json(
        { error: 'This class is outside your access' },
        { status: 403 },
      );
    const id = crypto.randomUUID();
    const key = org + '/' + id;
    await env.FILES.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: 'application/octet-stream' },
    });
    await db()
      .prepare(
        'INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
      )
      .bind(
        org + ':' + id,
        org,
        'file',
        file.name.slice(0, 200),
        JSON.stringify({
          key,
          size: file.size,
          ownerId: user.userId,
          class: cls,
          audience:
            member.role === 'Student'
              ? 'submission'
              : ['targeted', 'message'].includes(requestedAudience)
                ? requestedAudience
                : 'class',
          module:
            member.role !== 'Student' && requestedAudience === 'message'
              ? 'message'
              : 'Documents',
          studentIds,
          studentId: member.studentId || '',
          subject: String(f.get('subject') || '').slice(0, 200),
          unit: String(f.get('unit') || '').slice(0, 200),
          topic: String(f.get('topic') || '').slice(0, 200),
        }),
        user.userId,
        new Date().toISOString(),
      )
      .run();
    return Response.json({ id, name: file.name, url: '/api/files?id=' + id });
  } catch (e: any) {
    return Response.json(
      { error: e.message },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 400 },
    );
  }
}
export async function GET(req: Request) {
  try {
    const { org, member, user } = await context();
    const id = new URL(req.url).searchParams.get('id');
    const r = await db()
      .prepare(
        "SELECT * FROM records WHERE id=? AND organizationId=? AND kind='file'",
      )
      .bind(org + ':' + id, org)
      .first<any>();
    if (!r || !allowedFile(r, member, user))
      return new Response('Not found', { status: 404 });
    const file = await env.FILES.get(JSON.parse(r.data).key);
    if (!file) return new Response('Not found', { status: 404 });
    return new Response(file.body, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(r.name)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Sign in required', { status: 401 });
  }
}
