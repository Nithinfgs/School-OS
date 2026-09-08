// Shared, read-only projections. No dashboard-owned copies of school records.
export type SchoolRow = {
  id: string;
  kind: string;
  name: string;
  data: any;
  quantity?: number;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
};
const restricted =
  /medical|health|counsell?ing|counsel|private.?message|message|conversation|chat|clinical/i;
export function isMasterVisible(row: SchoolRow): boolean {
  const d = row.data || {};
  return (
    !restricted.test(row.kind) &&
    !restricted.test(String(d.category || '') + ' ' + String(d.module || '')) &&
    !d.restricted &&
    !d.sensitive &&
    !d.requiredPermission &&
    ![d.visibility, d.audience, d.classification].some((value) =>
      ['private', 'restricted', 'confidential'].includes(
        String(value).toLowerCase(),
      ),
    )
  );
}
export function ordinaryData(value: any): any {
  if (Array.isArray(value)) return value.map(ordinaryData);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !/medical|health|counsel|private|password|token|secret|clinical|diagnos|medication|allerg|immuniz|prescription|therapy/i.test(
            key,
          ),
      )
      .map(([key, v]) => [key, ordinaryData(v)]),
  );
}
export const moduleNames = [
  'People',
  'Classes',
  'Departments',
  'Attendance',
  'Teaching',
  'Academics',
  'Exams',
  'Timetable',
  'CAS',
  'Projects',
  'Library',
  'Labs',
  'Announcements',
  'Maintenance',
  'Staff',
  'Houses',
  'Documents',
  'Transport',
  'System',
];
export function moduleFor(r: SchoolRow): string {
  const names: Record<string, string> = {
    student: 'People',
    staff: 'Staff',
    teacher: 'Staff',
    class: 'Classes',
    department: 'Departments',
    attendance: 'Attendance',
    classLog: 'Teaching',
    assignment: 'Academics',
    submission: 'Academics',
    grade: 'Academics',
    record: 'People',
    behaviour: 'People',
    exam: 'Exams',
    examResult: 'Exams',
    timetable: 'Timetable',
    cas: 'CAS',
    casExperience: 'CAS',
    project: 'Projects',
    milestone: 'Projects',
    ia: 'Projects',
    ee: 'Projects',
    book: 'Library',
    loan: 'Library',
    inventory: 'Labs',
    labUsage: 'Labs',
    transaction: 'Labs',
    labTransaction: 'Labs',
    equipmentUsage: 'Labs',
    materialUsage: 'Labs',
    chemicalUsage: 'Labs',
    teacherClassLog: 'Teaching',
    studentRecord: 'People',
    examSession: 'Exams',
    projectMilestone: 'Projects',
    staffLeave: 'Staff',
    houseTransaction: 'Houses',
    announcement: 'Announcements',
    notification: 'Announcements',
    transportNotice: 'Transport',
    maintenance: 'Maintenance',
    leave: 'Staff',
    duty: 'Staff',
    house: 'Houses',
    housePoints: 'Houses',
    file: 'Documents',
    document: 'Documents',
  };
  return r.kind === 'request'
    ? r.data.type === 'library'
      ? 'Library'
      : 'Labs'
    : names[r.kind] || 'System';
}
export function dashboardRows(rows: SchoolRow[], members: any[]): SchoolRow[] {
  const result = rows
    .filter(isMasterVisible)
    .map((r) => ({ ...r, data: ordinaryData(r.data) }));
  for (const m of members.filter((m) => m.role !== 'Student')) {
    const existing = result.find(
      (r) =>
        r.kind === 'staff' && (r.data.userId === m.userId || r.name === m.name),
    );
    if (existing) existing.data = { ...existing.data, ...m };
    else
      result.push({
        id: 'member-' + m.id,
        kind: 'staff',
        name: m.name,
        data: { ...m },
      });
  }
  const departments = new Set(
    result.map((r) => r.data.department).filter(Boolean),
  );
  for (const name of departments)
    if (!result.some((r) => r.kind === 'department' && r.name === name))
      result.push({
        id: 'department-' + name,
        kind: 'department',
        name,
        data: { department: name },
      });
  return result;
}
export function profileMetrics(rows: SchoolRow[]): SchoolRow[] {
  return rows.map((r) => {
    if (r.kind !== 'student') return r;
    const marked = rows.filter(
      (x) => x.kind === 'attendance' && x.data.studentId === r.id,
    );
    const counted = marked.filter((x) => x.data.status !== 'Excused');
    const grades = rows
      .filter(
        (x) =>
          x.kind === 'submission' &&
          x.data.studentId === r.id &&
          x.data.status === 'Graded',
      )
      .flatMap((x) => {
        const assignment = rows.find(
          (a) => a.kind === 'assignment' && a.id === x.data.assignmentId,
        );
        const maximum = Number(assignment?.data.maximumMarks);
        return maximum > 0 && Number.isFinite(Number(x.data.grade))
          ? [(Number(x.data.grade) / maximum) * 100]
          : [];
      });
    return {
      ...r,
      data: {
        ...r.data,
        ...(marked.length
          ? {
              attendance: counted.length
                ? Math.round(
                    (counted.filter((x) =>
                      ['Present', 'Late'].includes(x.data.status),
                    ).length /
                      counted.length) *
                      100,
                  )
                : null,
              attendanceBasis: 'Present or late / marked, excluding excused',
              markedSessions: marked.length,
            }
          : {}),
        ...(grades.length
          ? {
              average: Math.round(
                grades.reduce((a, b) => a + b, 0) / grades.length,
              ),
              gradedSubmissions: grades.length,
            }
          : {}),
      },
    };
  });
}
export function relationships(row: SchoolRow, rows: SchoolRow[]) {
  const students = new Set<string>(),
    teachers = new Set<string>(),
    classes = new Set<string>(),
    grades = new Set<string>(),
    departments = new Set<string>();
  const seen = new Set<string>();
  const visit = (r: SchoolRow, depth = 0) => {
    if (seen.has(r.id) || depth > 3) return;
    seen.add(r.id);
    const d = r.data || {};
    if (r.kind === 'student') {
      students.add(r.id);
      if (d.grade) grades.add(String(d.grade));
    }
    if (r.kind === 'class') classes.add(r.name);
    if (r.kind === 'department') departments.add(r.name);
    if (['staff', 'teacher'].includes(r.kind)) {
      teachers.add(r.id);
      teachers.add(r.name);
      if (d.id) teachers.add(d.id);
      if (d.userId) teachers.add(d.userId);
    }
    if (d.class) classes.add(d.class);
    for (const c of Array.isArray(d.classes)
      ? d.classes
      : String(d.classes || '').split('|'))
      if (c) classes.add(c);
    if (d.department) departments.add(d.department);
    if (d.grade && r.kind !== 'submission' && r.kind !== 'grade')
      grades.add(String(d.grade));
    for (const key of [
      'teacher',
      'teacherId',
      'supervisor',
      'supervisorId',
      'createdBy',
      'updatedBy',
      'requestedBy',
      'whoUsed',
    ])
      if (d[key]) teachers.add(d[key]);
    if (r.updatedBy) teachers.add(r.updatedBy);
    for (const id of [
      d.studentId,
      ...(Array.isArray(d.studentIds) ? d.studentIds : []),
    ])
      if (id) {
        students.add(id);
        const st = rows.find((x) => x.id === id && x.kind === 'student');
        if (st) visit(st, depth + 1);
      }
    for (const key of [
      'classId',
      'assignmentId',
      'projectId',
      'itemId',
      'bookId',
    ])
      if (d[key]) {
        const linked = rows.find((x) => x.id === d[key]);
        if (linked) visit(linked, depth + 1);
      }
  };
  visit(row);
  for (const cls of rows.filter(
    (r) => r.kind === 'class' && classes.has(r.name),
  )) {
    if (cls.data.department) departments.add(cls.data.department);
    if (cls.data.teacher) teachers.add(cls.data.teacher);
  }
  for (const teacher of rows.filter((r) =>
    ['staff', 'teacher'].includes(r.kind),
  )) {
    const d = teacher.data;
    if (
      [teacher.id, teacher.name, d.id, d.userId].some((id) =>
        teachers.has(id),
      ) ||
      String(d.classes || '')
        .split('|')
        .some((c) => classes.has(c))
    ) {
      teachers.add(teacher.id);
      teachers.add(teacher.name);
      if (d.userId) teachers.add(d.userId);
      if (d.id) teachers.add(d.id);
    }
  }
  // Whole-class lessons and assignments are relevant to every enrolled student.
  if (
    !students.size &&
    [
      'class',
      'classLog',
      'assignment',
      'exam',
      'timetable',
      'announcement',
    ].includes(row.kind)
  )
    for (const s of rows.filter(
      (r) => r.kind === 'student' && classes.has(r.data.class),
    )) {
      students.add(s.id);
      grades.add(String(s.data.grade || ''));
    }
  return { students, teachers, classes, grades, departments };
}
export type MasterFilters = {
  date: string;
  student: string;
  teacher: string;
  class: string;
  grade: string;
  dept: string;
  module: string;
  search: string;
};
export const emptyFilters: MasterFilters = {
  date: '',
  student: '',
  teacher: '',
  class: '',
  grade: '',
  dept: '',
  module: '',
  search: '',
};
export function recordDate(r: SchoolRow) {
  return String(
    r.data.date ||
      r.data.occurredAt ||
      r.data.submittedAt ||
      r.data.dueAt ||
      r.data.desiredDate ||
      r.updatedAt ||
      '',
  ).slice(0, 10);
}
/**
 * Build the single search index used by the master dashboard. The index is
 * derived from the shared row projection so names, module labels, record
 * types, field values, and linked people/classes are all discoverable without
 * maintaining a second dashboard-only dataset.
 */
export function searchableText(r: SchoolRow, all: SchoolRow[]) {
  const rel = relationships(r, all);
  const linkedNames = all
    .filter((candidate) => {
      if (candidate.id === r.id) return false;
      if (candidate.kind === 'student') return rel.students.has(candidate.id);
      if (['staff', 'teacher'].includes(candidate.kind))
        return (
          rel.teachers.has(candidate.id) || rel.teachers.has(candidate.name)
        );
      if (candidate.kind === 'class') return rel.classes.has(candidate.name);
      if (candidate.kind === 'department')
        return rel.departments.has(candidate.name);
      return false;
    })
    .map((candidate) => candidate.name);
  return [
    r.name,
    r.kind,
    moduleFor(r),
    recordDate(r),
    JSON.stringify(r.data || {}),
    ...linkedNames,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
export function matchesFilters(
  r: SchoolRow,
  all: SchoolRow[],
  f: MasterFilters,
  activityDate?: string,
) {
  if (f.module && moduleFor(r) !== f.module) return false;
  if (f.date && (activityDate?.slice(0, 10) || recordDate(r)) !== f.date)
    return false;
  if (
    f.search &&
    !searchableText(r, all).includes(f.search.trim().toLowerCase())
  )
    return false;
  const rel = relationships(r, all);
  return (
    (!f.student || rel.students.has(f.student)) &&
    (!f.teacher || rel.teachers.has(f.teacher)) &&
    (!f.class || rel.classes.has(f.class)) &&
    (!f.grade || rel.grades.has(f.grade)) &&
    (!f.dept || rel.departments.has(f.dept))
  );
}
export function parseSnapshot(value: any) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value || {};
  } catch {
    return {};
  }
}
export function visibleAudits(
  audits: any[],
  rows: SchoolRow[],
  org: string,
  members: any[],
) {
  return audits.flatMap((a) => {
    const id = a.entityId.startsWith(org + ':')
      ? a.entityId.slice(org.length + 1)
      : a.entityId;
    const source =
      rows.find((r) => r.id === id) ||
      (a.action === 'Granted membership'
        ? rows.find((r) => r.data.email === a.entityId)
        : undefined);
    if (!source || !isMasterVisible(source)) return [];
    const before = parseSnapshot(a.before),
      after = parseSnapshot(a.after);
    if (
      (before.kind && !isMasterVisible(before)) ||
      (after.kind && !isMasterVisible(after))
    )
      return [];
    return [
      {
        ...a,
        before: JSON.stringify(ordinaryData(before)),
        after: JSON.stringify(ordinaryData(after)),
        sourceId: source.id,
        actorName: members.find((m) => m.userId === a.actor)?.name || a.actor,
      },
    ];
  });
}
export function alertFor(r: SchoolRow, today: string): string {
  if (
    r.kind === 'record' &&
    r.data.followUp &&
    r.data.followUp <= today &&
    !['Resolved', 'Closed'].includes(r.data.status)
  )
    return 'Follow-up due';
  if (
    r.kind === 'inventory' &&
    Number(r.quantity) <= Number(r.data.minimumQuantity)
  )
    return 'Low stock';
  if (
    r.kind === 'loan' &&
    r.data.status === 'Borrowed' &&
    String(r.data.dueAt).slice(0, 10) < today
  )
    return 'Overdue loan';
  if (r.kind === 'request' && r.data.status === 'Pending')
    return 'Pending request';
  if (r.kind === 'submission' && r.data.status !== 'Graded')
    return 'Needs grading';
  if (r.kind === 'attendance' && ['Absent', 'Late'].includes(r.data.status))
    return r.data.status;
  if (
    r.kind === 'maintenance' &&
    !['Resolved', 'Closed'].includes(r.data.status)
  )
    return 'Open maintenance';
  if (
    ['project', 'milestone', 'cas', 'assignment'].includes(r.kind) &&
    r.data.dueAt &&
    String(r.data.dueAt).slice(0, 10) < today &&
    !['Completed', 'Approved', 'Closed'].includes(r.data.status)
  )
    return 'Past deadline';
  return '';
}
