import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { seed } from './seed';
export function db() {
  return env.DB as D1Database;
}
export async function context() {
  const user = await getChatGPTUser();
  if (!user) throw new Error('UNAUTHORIZED');
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
export async function ensureSeed(org: string, actor: string) {
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
            actor,
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

export function scopeRows(rows: any[], member: any) {
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
            : enrolled.has(r.data.class)),
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
      if (r.kind === 'record')
        return (
          ['Student', 'Teacher', 'Department Head'].includes(member.role) &&
          allowedStudents.has(r.data.studentId) &&
          (member.role !== 'Student' || r.data.studentVisible)
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
