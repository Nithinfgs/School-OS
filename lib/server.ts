import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { seed } from './seed';
import { studentScope } from './student';
import { isMasterVisible, ordinaryData } from './master-dashboard';
export function db() {
  return env.DB as D1Database;
}
export async function context() {
  const user = await getChatGPTUser();
  if (!user) throw new Error('UNAUTHORIZED');
  if (user.userId.startsWith('dev:')) return devContext(user);
  const hash = Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(user.userId),
      ),
    ),
  )
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
  const org = 'school-' + hash;
  let member = await db()
    .prepare('SELECT * FROM members WHERE userId = ? OR email = ?')
    .bind(user.userId, user.email.toLowerCase())
    .first<any>();
  if (!member) {
    await db().batch([
      db()
        .prepare(
          'INSERT OR IGNORE INTO organizations (id,name,ownerId) VALUES (?,?,?)',
        )
        .bind(org, 'Westbridge International', user.userId),
      db()
        .prepare(
          'INSERT OR IGNORE INTO members (id,organizationId,userId,role,name,email) VALUES (?,?,?,?,?,?)',
        )
        .bind(
          user.userId,
          org,
          user.userId,
          'Admin',
          user.displayName,
          user.email.toLowerCase(),
        ),
    ]);
    member = await db()
      .prepare('SELECT * FROM members WHERE userId = ? OR email = ?')
      .bind(user.userId, user.email.toLowerCase())
      .first<any>();
  }
  if (member.userId.startsWith('pending:')) {
    await db()
      .prepare('UPDATE members SET userId=? WHERE id=? AND userId=?')
      .bind(user.userId, member.id, member.userId)
      .run();
    member.userId = user.userId;
  }
  return { user, member, org: member.organizationId };
}

const DEV_MEMBERS: Record<string, any> = {
  'dev:admin': {
    id: 'dev-admin-member',
    organizationId: 'schoolos-dev',
    userId: 'dev:admin',
    role: 'Admin',
    name: 'Nithin Selvaraj',
    email: 'admin.dev@schoolos.local',
    classes: '',
    studentId: '',
    department: 'Administration',
  },
  'dev:teacher': {
    id: 'dev-teacher-member',
    organizationId: 'schoolos-dev',
    userId: 'dev:teacher',
    role: 'Teacher',
    name: 'Maya Iyer',
    email: 'teacher.dev@schoolos.local',
    classes: 'Physics HL|Math AA HL',
    studentId: '',
    department: 'Physics',
  },
  'dev:student': {
    id: 'dev-student-member',
    organizationId: 'schoolos-dev',
    userId: 'dev:student',
    role: 'Student',
    name: 'Aarav Sharma',
    email: 'student.dev@schoolos.local',
    classes: 'Physics HL|Chemistry HL|Math AA HL|English',
    studentId: 'student-1',
    department: 'Grade 12',
  },
};

async function devContext(
  user: NonNullable<Awaited<ReturnType<typeof getChatGPTUser>>>,
) {
  const org = 'schoolos-dev';
  const defaultMember = DEV_MEMBERS[user.userId] || DEV_MEMBERS['dev:admin'];
  try {
    let existing = await db()
      .prepare('SELECT * FROM members WHERE organizationId=? AND userId=?')
      .bind(org, user.userId)
      .first<any>();

    if (!existing || existing.role !== defaultMember.role) {
      await db()
        .prepare(
          'INSERT OR IGNORE INTO organizations (id,name,ownerId) VALUES (?,?,?)',
        )
        .bind(org, 'Westbridge International', 'dev:admin')
        .run()
        .catch(() => {});

      for (const m of Object.values(DEV_MEMBERS)) {
        await db()
          .prepare(
            'INSERT OR REPLACE INTO members (id,organizationId,userId,role,name,email,classes,studentId,department) VALUES (?,?,?,?,?,?,?,?,?)',
          )
          .bind(
            m.id,
            m.organizationId,
            m.userId,
            m.role,
            m.name,
            m.email,
            m.classes,
            m.studentId,
            m.department,
          )
          .run()
          .catch(() => {});
      }

      existing = await db()
        .prepare('SELECT * FROM members WHERE organizationId=? AND userId=?')
        .bind(org, user.userId)
        .first<any>();
    }

    return { user, member: existing || defaultMember, org };
  } catch {
    return { user, member: defaultMember, org };
  }
}
export async function ensureSeed(org: string, actor: string) {
  if (
    await db()
      .prepare('SELECT id FROM records WHERE organizationId=? AND id=?')
      .bind(org, org + ':staff-15')
      .first()
  )
    return;
  const rows = seed();
  for (let i = 0; i < rows.length; i += 50)
    await db().batch(
      rows.slice(i, i + 50).map((r) =>
        db()
          .prepare(
            'INSERT OR IGNORE INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,?,0,?,?)',
          )
          .bind(
            org + ':' + r.id,
            org,
            r.kind,
            r.name,
            JSON.stringify(r.data),
            r.quantity,
            'system:seed',
            new Date().toISOString(),
          ),
      ),
    );
}
export const rolePermissions: Record<string, string[]> = {
  Admin: ['*'],
  Teacher: [
    'inventory.view',
    'request.create',
    'assignment.edit',
    'submission.grade',
    'record.edit',
    'student.view',
    'book.view',
  ],
  Student: [
    'inventory.view',
    'book.view',
    'request.create',
    'submission.create',
  ],
  'Lab Assistant': [
    'inventory.view',
    'inventory.edit',
    'request.approve',
    'request.create',
    'book.view',
  ],
  Librarian: [
    'book.view',
    'book.edit',
    'loan.edit',
    'request.create',
    'request.approve',
    'student.view',
  ],
  'Department Head': [
    'inventory.view',
    'book.view',
    'student.view',
    'assignment.edit',
    'submission.grade',
    'record.edit',
  ],
};
export function allow(role: string, p: string) {
  if (!rolePermissions[role]?.some((x) => x === '*' || x === p))
    throw new Error('FORBIDDEN');
}
export function encode(r: any) {
  return { ...r, id: r.id.split(':').pop(), data: JSON.parse(r.data) };
}
export async function schoolRows(org: string) {
  const result = await db()
    .prepare('SELECT * FROM records WHERE organizationId=? ORDER BY id')
    .bind(org)
    .all<any>();
  const memberships = (
    await db()
      .prepare(
        "SELECT studentId,classes FROM members WHERE organizationId=? AND role='Student'",
      )
      .bind(org)
      .all<any>()
  ).results;
  return result.results.map(encode).map((r) =>
    r.kind === 'student'
      ? {
          ...r,
          data: {
            ...r.data,
            classes: [
              ...new Set(
                [
                  r.data.class,
                  ...(Array.isArray(r.data.classes) ? r.data.classes : []),
                  ...memberships
                    .filter((m) => m.studentId === r.id)
                    .flatMap((m) => String(m.classes || '').split('|')),
                ].filter(Boolean),
              ),
            ],
          },
        }
      : r,
  );
}

function legacyScopeRows(rows: any[], member: any) {
  rows = rows
    .filter(
      (r) =>
        isMasterVisible(r) ||
        (r.kind === 'file' && r.data.ownerId === member.userId),
    )
    .map((r) => ({ ...r, data: ordinaryData(r.data) }));
  if (member.role === 'Admin') return rows;
  const enrolled = new Set((member.classes || '').split('|').filter(Boolean));
  const ownStudent = member.studentId;
  const allowedStudents = new Set(
    rows
      .filter(
        (r) =>
          r.kind === 'student' &&
          (member.role === 'Student'
            ? r.id === ownStudent
            : enrolled.has(r.data.class) ||
              r.data.classes?.some((c: string) => enrolled.has(c))),
      )
      .map((r) => r.id),
  );
  const allowedAssignments = new Set(
    rows
      .filter((r) => r.kind === 'assignment' && enrolled.has(r.data.class))
      .map((r) => r.id),
  );
  return rows
    .filter((r) => {
      if (['inventory', 'book', 'notification'].includes(r.kind)) return true;
      if (r.kind === 'file')
        return (
          r.data.ownerId === member.userId ||
          (['Teacher', 'Department Head'].includes(member.role) &&
            enrolled.has(r.data.class)) ||
          (r.data.audience === 'class' && enrolled.has(r.data.class))
        );
      if (r.kind === 'student')
        return (
          member.role === 'Librarian' ||
          (['Student', 'Teacher', 'Department Head'].includes(member.role) &&
            allowedStudents.has(r.id))
        );
      if (r.kind === 'attendance')
        return (
          ['Student', 'Teacher', 'Department Head'].includes(member.role) &&
          (member.role === 'Student'
            ? r.data.studentId === ownStudent
            : enrolled.has(r.data.class))
        );
      if (r.kind === 'record')
        return (
          ['Student', 'Teacher', 'Department Head'].includes(member.role) &&
          allowedStudents.has(r.data.studentId) &&
          (member.role !== 'Student' || r.data.studentVisible === true)
        );
      if (r.kind === 'submission')
        return !['Student', 'Teacher', 'Department Head'].includes(member.role)
          ? false
          : member.role === 'Student'
            ? r.data.studentId === ownStudent
            : allowedAssignments.has(r.data.assignmentId);
      if (['assignment', 'class'].includes(r.kind))
        return (
          ['Student', 'Teacher', 'Department Head'].includes(member.role) &&
          enrolled.has(r.kind === 'class' ? r.name : r.data.class)
        );
      if (r.kind === 'loan')
        return (
          member.role === 'Librarian' ||
          (['Student', 'Teacher', 'Department Head'].includes(member.role) &&
            allowedStudents.has(r.data.studentId))
        );
      if (r.kind === 'request')
        return (
          (member.role === 'Lab Assistant' && r.data.type === 'lab') ||
          (member.role === 'Librarian' && r.data.type === 'library') ||
          r.data.requestedBy === member.userId ||
          r.data.studentId === ownStudent
        );
      return false;
    })
    .map((r) =>
      r.kind === 'record' && member.role === 'Student'
        ? { ...r, data: { ...r.data, internalNotes: undefined } }
        : r,
    );
}

export function scopeRows(rows: any[], member: any) {
  if (member.role === 'Student') return studentScope(rows, member);
  const assigned = new Set((member.classes || '').split('|').filter(Boolean));
  const teacher = ['Teacher', 'Department Head'].includes(member.role);
  const own = member.studentId;
  const related = (r: any) => assigned.has(r.data.class);
  const base = legacyScopeRows(rows, member);
  const added = rows.filter((r) => {
    const d = r.data || {};
    if (r.kind === 'file' && d.audience === 'message')
      return (
        d.participants?.includes(member.userId) ||
        d.ownerId === member.userId ||
        (member.role === 'Student' && d.studentIds?.includes(own))
      );
    if (r.kind === 'message')
      return (
        Array.isArray(d.participants) && d.participants.includes(member.userId)
      );
    if (!isMasterVisible(r)) return false;
    if (
      r.kind === 'file' &&
      member.role === 'Student' &&
      d.studentIds?.includes(own)
    )
      return true;
    if (r.kind === 'request' && teacher && related(r)) return true;
    if (['timetable', 'exam', 'resource', 'announcement'].includes(r.kind))
      return (
        member.role === 'Admin' ||
        ((teacher || member.role === 'Student') &&
          related(r) &&
          (!d.studentId || teacher || d.studentId === own))
      );
    if (['project', 'cas'].includes(r.kind))
      return (
        member.role === 'Admin' ||
        (teacher &&
          related(r) &&
          (d.supervisorId === member.id || d.supervisorId === member.userId)) ||
        (member.role === 'Student' && d.studentIds?.includes(own))
      );
    return false;
  });
  return [...new Map([...base, ...added].map((r) => [r.id, r])).values()]
    .filter((r) => {
      if (member.role === 'Student' && r.kind === 'assignment')
        return r.data.status !== 'Draft';
      if (member.role === 'Student' && r.kind === 'file')
        return (
          r.data.ownerId === member.userId ||
          r.data.audience === 'class' ||
          r.data.studentIds?.includes(own)
        );
      return true;
    })
    .map((r) => {
      let d = { ...r.data };
      if (
        r.kind === 'inventory' &&
        member.role !== 'Admin' &&
        (!teacher || !assigned.has(d.lastTransaction?.class))
      )
        delete d.lastTransaction;
      if (member.role === 'Student') {
        const hide = (v: any): any =>
          Array.isArray(v)
            ? v.map(hide)
            : v && typeof v === 'object'
              ? Object.fromEntries(
                  Object.entries(v)
                    .filter(
                      ([k]) =>
                        !/^internal|privateNotes|teacherNotes|parentNotify/i.test(
                          k,
                        ),
                    )
                    .map(([k, x]) => [k, hide(x)]),
                )
              : v;
        d = hide(d);
        if (r.kind === 'submission' && d.returned === false) {
          delete d.grade;
          delete d.feedback;
        }
        if (r.kind === 'exam' && d.results)
          d.results = d.results.filter((x: any) => x.studentId === own);
      }
      return { ...r, data: d };
    });
}
