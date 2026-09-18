import { db } from './server';
import { demoTeacherEntries, MAYA_HOMEROOM, MAYA_SUBJECT, MAYA_TEACHER_ID } from './demo-teacher';

// Development-only relationships for the teacher dashboard. The same records
// are used by teacher scope, student profiles, and the admin master view.
export async function seedTeachingDemo(org: string) {
  if (org !== 'schoolos-dev') return;
  const marker = org + ':maya-teacher-setup-v2';
  if (await db().prepare('SELECT id FROM records WHERE organizationId=? AND id=?').bind(org, marker).first()) return;

  const now = '2026-09-07T08:00:00.000Z';
  const entries = demoTeacherEntries();
  await db().batch([
    ...entries.map((entry) =>
      db()
        .prepare(
          'INSERT OR IGNORE INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
        )
        .bind(org + ':' + entry.id, org, entry.kind, entry.name, JSON.stringify(entry.data), 'system:demo-teacher', now),
    ),
    db()
      .prepare(
        'INSERT OR IGNORE INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
      )
      .bind(marker, org, 'demoSetup', 'Maya teacher setup', JSON.stringify({ teacherId: MAYA_TEACHER_ID, homeroom: MAYA_HOMEROOM, subject: MAYA_SUBJECT, studentCount: 15, subjectStudentCount: 5 }), 'system:demo-teacher', now),
  ]);
}
