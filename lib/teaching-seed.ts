import { db } from './server';
// Development examples use the same source tables and never overwrite edits.
export async function seedTeachingDemo(org: string) {
  if (org !== 'schoolos-dev') return;
  if (
    await db()
      .prepare('SELECT id FROM records WHERE organizationId=? AND id=?')
      .bind(org, org + ':teaching-submission-forces')
      .first()
  )
    return;
  const classes = (
    await db()
      .prepare(
        "SELECT id,name,data FROM records WHERE organizationId=? AND kind='class'",
      )
      .bind(org)
      .all<any>()
  ).results;
  const entries: any[] = [];
  for (const [i, c] of classes.entries()) {
    const classId = c.id.slice(org.length + 1),
      d = JSON.parse(c.data);
    entries.push({
      id: 'teaching-timetable-' + classId,
      kind: 'timetable',
      name: c.name + ' · Period ' + (i + 1),
      data: {
        classId,
        class: c.name,
        period: 'P' + (i + 1),
        weekdays: [1, 2, 3, 4, 5],
        startTime: d.time,
        endTime: ['09:20', '10:20', '11:35', '12:35', '14:20', '15:20'][i],
        room: d.room,
        teacher: d.teacher,
        substitution: '',
        description: 'Term 1 teaching schedule',
      },
    });
  }
  const cls = classes.find((c) => c.name === 'Physics HL');
  if (!cls) return;
  const classId = cls.id.slice(org.length + 1),
    shared = {
      classId,
      class: cls.name,
      teacher: 'Maya Iyer',
      teacherId: 'dev-teacher-member',
    };
  entries.push(
    {
      id: 'teaching-submission-forces',
      kind: 'submission',
      name: 'Forces and motion investigation',
      data: {
        ...shared,
        assignmentId: 'assignment-1',
        studentId: 'student-1',
        text: 'For the trolley, weight and the normal force balance vertically. A net horizontal force of 2.4 N acting on a 0.8 kg trolley produces an acceleration of 3.0 m/s². We measured acceleration over three trials and compared our result with F = ma.',
        status: 'Submitted',
        submittedAt: '2026-09-06T12:30:00.000Z',
        returned: false,
        attachments: [],
      },
    },
    {
      id: 'teaching-exam-physics',
      kind: 'exam',
      name: 'Forces and motion checkpoint',
      data: {
        ...shared,
        dueAt: '2026-09-14T09:00',
        duration: 45,
        room: 'P1',
        description:
          'Bring a calculator and ruler. Free-body diagrams and Newton’s laws.',
        results: [],
      },
    },
    {
      id: 'teaching-project-physics',
      kind: 'project',
      name: 'IA · Investigating pendulum damping',
      data: {
        ...shared,
        studentIds: ['student-1'],
        supervisorId: 'dev-teacher-member',
        supervisor: 'Maya Iyer',
        type: 'IA',
        description:
          'Measure how air resistance affects the amplitude of a pendulum.',
        milestones:
          'Research question — 10 September\nPilot data — 17 September\nDraft analysis — 24 September',
        dueAt: '2026-09-24T16:00',
        meetingAt: '2026-09-10T13:00',
        status: 'InProgress',
        evidence:
          'Pilot measurements will be uploaded after the first practical.',
        feedback: 'Keep the release angle consistent and record uncertainty.',
        resources: [],
        attachments: [],
      },
    },
    {
      id: 'teaching-cas-science',
      kind: 'cas',
      name: 'CAS · Junior science club',
      data: {
        ...shared,
        studentIds: ['student-1'],
        supervisorId: 'dev-teacher-member',
        supervisor: 'Maya Iyer',
        type: 'Service',
        description:
          'Plan and lead safe science demonstrations for younger students.',
        milestones: 'Safety plan — 9 September\nFirst session — 16 September',
        dueAt: '2026-09-16T15:00',
        status: 'Planning',
        feedback: 'Include a short reflection after each session.',
        resources: [],
        attachments: [],
      },
    },
    {
      id: 'teaching-announcement-physics',
      kind: 'announcement',
      name: 'Prepare for our first practical',
      data: {
        ...shared,
        description:
          'Bring your lab notebook and calculator. Review how to draw and label force diagrams before the lesson.',
        priority: 'Normal',
        date: '2026-09-06',
        expiresAt: '2026-10-01',
      },
    },
    {
      id: 'teaching-resource-forces',
      kind: 'resource',
      name: 'Newton’s second law — reading',
      data: {
        ...shared,
        subject: 'Physics',
        unit: 'Mechanics',
        topic: 'Forces',
        description:
          'Read the worked examples before attempting the practice questions.',
        resources: [
          'https://openstax.org/books/physics/pages/4-3-newtons-second-law-of-motion',
        ],
        attachments: [],
        audience: 'class',
      },
    },
  );
  await db().batch(
    entries.map((e) =>
      db()
        .prepare(
          'INSERT OR IGNORE INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
        )
        .bind(
          org + ':' + e.id,
          org,
          e.kind,
          e.name,
          JSON.stringify(e.data),
          'system:seed',
          '2026-09-06T08:00:00.000Z',
        ),
    ),
  );
}
