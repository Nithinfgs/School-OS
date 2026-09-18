export const recordCategories = [
  'Late',
  'LateArrival',
  'Uniform',
  'MissingHomework',
  'Disruption',
  'AcademicConcern',
  'UnauthorizedDevice',
  'DeviceUse',
  'BehaviourConcern',
  'PositiveBehaviour',
  'Achievement',
  'TeacherConcern',
  'Other',
];
export const teacherTabs = [
  'Overview',
  'Roster',
  'Attendance',
  'Lessons',
  'Assignments',
  'Grades',
  'Records',
  'Resources',
  'Labs',
  'Library',
  'Projects & CAS',
  'Calendar',
  'Exams',
  'Communication',
];
export const localDate = () => new Date().toLocaleDateString('en-CA');
export const studentInClass = (student: any, name: string) =>
  student.data.class === name || student.data.classes?.includes(name);
const WEEKDAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};

export function scheduleFor(rows: any[], date: string) {
  const weekday = new Date(date + 'T12:00:00').getDay();
  const dayName = WEEKDAY_NAMES[weekday];

  const baseItems = rows
    .filter(
      (r) =>
        r.kind === 'timetable' &&
        (r.data?.date === date ||
          (!r.data?.date &&
            (r.data?.weekdays || [1, 2, 3, 4, 5]).includes(weekday))),
    )
    .map((r) => ({ ...r, data: { ...r.data } }));

  // Apply any timetable_override rows for this weekday
  if (dayName) {
    const overrides = rows.filter(
      (r) => r.kind === 'timetable_override' && r.data?.day === dayName,
    );
    overrides.forEach((ov) => {
      const pKey = ov.data?.periodKey; // e.g. 'p1'
      const pNum = pKey ? pKey.replace('p', '').toUpperCase() : '';
      const matchingIdx = baseItems.findIndex(
        (b) =>
          b.data?.period === `P${pNum}` ||
          b.data?.period === `Period ${pNum}` ||
          (pNum && b.data?.period?.includes(pNum)),
      );

      const [start, end] = (ov.data?.slot?.time || '08:30–09:10').split('–');
      const overriddenData = {
        class: ov.data?.slot?.title || 'Subject',
        code: ov.data?.slot?.code || '',
        period: `Period ${pNum}`,
        startTime: start?.trim() || '08:30',
        endTime: end?.trim() || '09:10',
        room: ov.data?.slot?.room || '',
        teacher: ov.data?.slot?.teacher || '',
        substitution: ov.data?.slot?.notes || '',
        description: ov.data?.slot?.title || '',
      };

      if (matchingIdx >= 0) {
        baseItems[matchingIdx].data = {
          ...baseItems[matchingIdx].data,
          ...overriddenData,
        };
      } else {
        baseItems.push({
          id: ov.id,
          kind: 'timetable',
          name: `${overriddenData.class} · Period ${pNum}`,
          quantity: 1,
          data: overriddenData,
        });
      }
    });
  }

  return baseItems.sort((a, b) =>
    String(a.data?.startTime || '').localeCompare(String(b.data?.startTime || '')),
  );
}
export function submissionState(
  assignment: any,
  studentId: string,
  rows: any[],
) {
  const submissions = rows
    .filter(
      (r) =>
        r.kind === 'submission' &&
        r.data.assignmentId === assignment.id &&
        r.data.studentId === studentId,
    )
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const latest = submissions[0];
  return { submission: latest, status: latest?.data.status || 'NotStarted' };
}
export function calendarEvents(rows: any[], day: string) {
  return [
    ...scheduleFor(rows, day),
    ...rows.filter(
      (r) =>
        [
          'assignment',
          'exam',
          'classLog',
          'project',
          'cas',
          'announcement',
        ].includes(r.kind) &&
        (r.data.date || r.data.dueAt || '').slice(0, 10) === day,
    ),
    ...rows.flatMap((r) => {
      if (!['project', 'cas'].includes(r.kind)) return [];
      const events = (r.data.milestoneList || [])
        .filter((m: any) => m.dueAt === day)
        .map((m: any, i: number) => ({
          ...r,
          eventId: r.id + '-milestone-' + i,
          name: 'Milestone · ' + m.title,
          data: { ...r.data, date: day },
        }));
      if (r.data.meetingAt?.slice(0, 10) === day)
        events.push({
          ...r,
          eventId: r.id + '-meeting',
          name: 'Meeting · ' + r.name,
          data: { ...r.data, date: day },
        });
      return events;
    }),
  ];
}
export function studentIssues(student: any, rows: any[], today: string) {
  const own = rows.filter((r) => r.data.studentId === student.id);
  const late = own.filter(
    (r) =>
      r.kind === 'attendance' &&
      r.data.status === 'Late' &&
      r.data.date >=
        new Date(Date.parse(today) - 30 * 86400000).toISOString().slice(0, 10),
  ).length;
  const missing = rows.filter(
    (r) =>
      r.kind === 'assignment' &&
      studentInClass(student, r.data.class) &&
      r.data.status !== 'Draft' &&
      r.data.dueAt < today &&
      !['Submitted', 'Late', 'Graded'].includes(
        submissionState(r, student.id, rows).status,
      ),
  ).length;
  const follow = own.filter(
    (r) =>
      ['record', 'attendance'].includes(r.kind) &&
      r.data.status !== 'Resolved' &&
      r.data.followUp &&
      r.data.followUp <= today,
  ).length;
  const concerns = own.filter(
    (r) =>
      r.kind === 'record' &&
      !['Resolved', 'Closed'].includes(r.data.status) &&
      [
        'AcademicConcern',
        'BehaviourConcern',
        'TeacherConcern',
        'Academic concern',
        'Behaviour concern',
        'Teacher concern',
      ].includes(r.data.category),
  ).length;
  return [
    late >= 2 ? `${late} late arrivals in 30 days` : '',
    missing ? `${missing} overdue assignments` : '',
    follow ? `${follow} follow-ups due` : '',
    concerns ? `${concerns} open concerns` : '',
  ].filter(Boolean);
}
