import { calendarEvents, localDate, submissionState } from './teaching';

export const studentSections = [
  'Home',
  'Today',
  'Classes',
  'Academics',
  'Assignments',
  'Grades',
  'Resources',
  'Attendance',
  'Calendar',
  'Exams',
  'Labs',
  'Library',
  'CAS',
  'Projects',
  'Announcements',
  'Messages',
  'Notifications',
  'Profile',
  'Maintenance',
  'Cafeteria',
  'Counselling',
  'Medical',
  'Documents',
  'House',
];
export function studentScope(rows: any[], member: any) {
  const classes = (member.classes || '').split('|');
  const own = member.studentId;
  const profile =
    rows.find((r) => r.kind === 'student' && r.id === own)?.data || {};
  const targeted = (d: any) => {
    if (d.studentId) return d.studentId === own;
    if (d.studentIds?.length) return d.studentIds.includes(own);
    if (d.class) return classes.includes(d.class);
    if (d.grade) return String(d.grade) === String(profile.grade);
    if (d.house) return d.house === profile.house;
    return d.audience === 'school' || d.studentFacing === true;
  };
  return rows
    .filter((r) => {
      const d = r.data;
      if (r.kind === 'student') return r.id === own;
      if (r.kind === 'class') return classes.includes(r.name);
      if (
        [
          'attendance',
          'record',
          'submission',
          'loan',
          'request',
          'maintenance',
          'absenceRequest',
          'mealOrder',
          'housePoint',
        ].includes(r.kind)
      )
        return (
          d.studentId === own &&
          (r.kind !== 'record' || d.studentVisible === true)
        );
      if (r.kind === 'reading') return d.userId === member.userId;
      if (['counsellingRequest', 'medicalRequest'].includes(r.kind))
        return d.studentId === own && d.studentFacing === true;
      if (['inventory', 'book'].includes(r.kind))
        return !d.restricted && d.studentAvailable !== false;
      if (r.kind === 'message') return d.participants?.includes(member.userId);
      if (['project', 'cas'].includes(r.kind))
        return d.studentIds?.includes(own);
      if (r.kind === 'file')
        return (
          d.ownerId === member.userId ||
          d.studentIds?.includes(own) ||
          (d.audience === 'class' && classes.includes(d.class)) ||
          (d.audience === 'school' && d.studentFacing === true)
        );
      if (
        ['assignment', 'timetable', 'exam', 'resource', 'classLog'].includes(
          r.kind,
        )
      )
        return (
          classes.includes(d.class) &&
          d.status !== 'Draft' &&
          (!d.studentId || d.studentId === own)
        );
      if (
        [
          'announcement',
          'document',
          'event',
          'meal',
          'servicePolicy',
          'appointmentSlot',
          'house',
          'notification',
        ].includes(r.kind)
      )
        return (
          targeted(d) &&
          (!d.publishAt || Date.parse(d.publishAt) <= Date.now()) &&
          (!d.expiresAt || Date.parse(d.expiresAt) > Date.now())
        );
      return false;
    })
    .map((r) => {
      const hide = (v: any): any =>
        Array.isArray(v)
          ? v.map(hide)
          : v && typeof v === 'object'
            ? Object.fromEntries(
                Object.entries(v)
                  .filter(
                    ([k]) =>
                      !/^(internal|private|teacherNotes|parentNotify|audit|storage|hazard|supplier|cost|lastTransaction|key$)/i.test(
                        k,
                      ),
                  )
                  .map(([k, v]) => [k, hide(v)]),
              )
            : v;
      const d = hide(r.data);
      if (r.kind === 'submission' && d.returned !== true) {
        delete d.grade;
        delete d.feedback;
        delete d.rubricFeedback;
        if (d.status === 'Graded') d.status = 'Submitted';
      }
      if (r.kind === 'exam') {
        d.results =
          d.resultsPublished === true
            ? (d.results || []).filter((x: any) => x.studentId === own)
            : [];
        delete d.seats;
        d.seat =
          r.data.seats?.find((s: any) => s.studentId === own)?.seat || d.seat;
      }
      if (r.kind === 'inventory') {
        const safe: any = {};
        for (const key of [
          'lab',
          'category',
          'type',
          'unit',
          'description',
          'generalLocation',
          'status',
          'requestable',
          'image',
          'images',
          'minimum',
        ])
          if (d[key] != null) safe[key] = d[key];
        safe.availableQty = r.quantity;
        safe.generalLocation =
          d.generalLocation || String(d.location || '').split(' · ')[0];
        safe.status =
          d.status || (r.quantity > 0 ? 'Available' : 'Unavailable');
        return { ...r, data: safe };
      }
      if (['counsellingRequest', 'medicalRequest'].includes(r.kind)) {
        const safe: any = {};
        for (const k of [
          'studentId',
          'studentFacing',
          'preferredTime',
          'reasonCategory',
          'notes',
          'status',
          'appointmentAt',
          'counsellor',
          'studentComment',
          'createdAt',
        ])
          if (d[k] != null) safe[k] = d[k];
        return { ...r, data: safe };
      }
      return { ...r, data: d };
    });
}
export function personalEvents(rows: any[], day: string) {
  return [
    ...calendarEvents(rows, day),
    ...rows.filter(
      (r) =>
        [
          'loan',
          'event',
          'counsellingRequest',
          'medicalRequest',
          'absenceRequest',
        ].includes(r.kind) &&
        (r.data.dueAt || r.data.appointmentAt || r.data.date || '').slice(
          0,
          10,
        ) === day,
    ),
  ];
}
export function personalNotifications(rows: any[], studentId: string) {
  const today = localDate();
  return rows
    .filter((r) =>
      [
        'assignment',
        'submission',
        'classLog',
        'attendance',
        'exam',
        'timetable',
        'request',
        'loan',
        'project',
        'cas',
        'announcement',
        'message',
        'maintenance',
        'absenceRequest',
        'mealOrder',
        'event',
      ].includes(r.kind),
    )
    .map((r) => {
      let detail = r.data.status || r.data.class || 'Updated';
      if (r.kind === 'assignment') {
        const state = submissionState(r, studentId, rows).status;
        detail = `${state} · Due ${r.data.dueAt || 'not set'}`;
      }
      if (r.kind === 'loan')
        detail = `${r.data.dueAt < today && r.data.status !== 'Returned' ? 'Overdue' : 'Library due'} · ${r.data.dueAt}`;
      if (r.kind === 'submission' && r.data.returned) detail = 'Feedback ready';
      const key = r.id + ':' + (r.version ?? r.updatedAt ?? '0');
      const read = rows.some(
        (x) => x.kind === 'reading' && x.data.sourceKey === key && x.data.read,
      );
      return { id: key, source: r, detail, read };
    })
    .sort((a, b) =>
      (b.source.updatedAt || '').localeCompare(a.source.updatedAt || ''),
    );
}
