import { seed, classes, students } from './seed';
import { dashboardRows, profileMetrics } from './master-dashboard';
import { IBDP_ACADEMIC_CALENDAR_EVENTS } from './ibdp-calendar';
import { demoTeacherEntries, MAYA_HOMEROOM, MAYA_SUBJECT, MAYA_TEACHER_ID } from './demo-teacher';
import { demoTrackingRows } from './platform/demo-data';
import { RecordRegistry, activityEvent, trackedRecord } from './tracking';

export type MockWorkspaceData = {
  rows: any[];
  contacts: any[];
  member: any;
  audit: any[];
  members: any[];
  masterRows: any[];
  refreshedAt: string;
};

// Default full mock members directory
export const mockMembers = [
  {
    id: 'dev-transport-member', userId: 'dev:transport-staff', name: 'Leena Joseph',
    role: 'Transport Staff', email: 'transport.dev@schoolos.local', department: 'Transport', classes: '', studentId: '',
  },
  {
    id: 'dev-hos-member', userId: 'dev:hos', name: 'Dr. Aisha Rahman',
    role: 'Head of School', email: 'hos.dev@schoolos.local', department: 'Leadership', classes: '', studentId: '',
  },
  {
    id: 'dev-admin-member',
    userId: 'dev:admin',
    name: 'Nithin Selvaraj',
    role: 'Admin',
    email: 'admin.dev@schoolos.local',
    department: 'Leadership',
    classes: '',
    studentId: '',
  },
  {
    id: 'dev-teacher-member',
    userId: 'dev:teacher',
    name: 'Maya Iyer',
    role: 'Teacher',
    email: 'teacher.dev@schoolos.local',
    department: 'Science',
    classes: 'Physics HL|Chemistry HL|Math AA HL',
    studentId: '',
  },
  {
    id: 'dev-student-member',
    userId: 'dev:student',
    name: 'Nithin Selvaraj',
    role: 'Student',
    email: 'nithin.selvaraj@schoolos.local',
    department: 'DP-2',
    classes: 'Physics|Chemistry|Digital Society|Math AA|English|French B|Theory of Knowledge (TOK)|CAS Experience|DEAR (Drop Everything And Read)|Physical Education (PE)|Extended Essay (EE Workshop)',
    studentId: 'student-1',
  },
  {
    id: 'member-david-park',
    userId: 'dev:david-park',
    name: 'David Park',
    role: 'Teacher',
    email: 'david.park@schoolos.local',
    department: 'Science',
    classes: 'Chemistry HL',
    studentId: '',
  },
  {
    id: 'member-maya-rao',
    userId: 'dev:maya-rao',
    name: 'Dr. Maya Rao',
    role: 'Teacher',
    email: 'maya.rao@schoolos.local',
    department: 'Science',
    classes: 'Biology HL',
    studentId: '',
  },
  {
    id: 'member-james-wilson',
    userId: 'dev:james-wilson',
    name: 'James Wilson',
    role: 'Teacher',
    email: 'james.wilson@schoolos.local',
    department: 'Mathematics',
    classes: 'Math AA HL',
    studentId: '',
  },
  {
    id: 'member-emily-thompson',
    userId: 'dev:emily-thompson',
    name: 'Emily Thompson',
    role: 'Teacher',
    email: 'emily.thompson@schoolos.local',
    department: 'Humanities',
    classes: 'Economics',
    studentId: '',
  },
  {
    id: 'member-michael-brooks',
    userId: 'dev:michael-brooks',
    name: 'Michael Brooks',
    role: 'Teacher',
    email: 'michael.brooks@schoolos.local',
    department: 'Languages',
    classes: 'English',
    studentId: '',
  },
  {
    id: 'member-olivia-reed',
    userId: 'dev:olivia-reed',
    name: 'Olivia Reed',
    role: 'Lab Assistant',
    email: 'olivia.reed@schoolos.local',
    department: 'Science Labs',
    classes: '',
    studentId: '',
  },
  {
    id: 'member-daniel-moore',
    userId: 'dev:daniel-moore',
    name: 'Daniel Moore',
    role: 'Librarian',
    email: 'daniel.moore@schoolos.local',
    department: 'Library Services',
    classes: '',
    studentId: '',
  },
];

export function buildMockRows(): any[] {
  const base = seed();
  const rows: any[] = [...base];
  rows.push(...demoTeacherEntries());
  rows.push(...demoTrackingRows());

  // DP2 Timetable 2026-27 Schedule (Mon-Fri, Periods 1-9)
  const dp2Schedule = [
    // Monday (1)
    { day: 1, p: 'P1', start: '08:30', end: '09:10', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 1, p: 'P2', start: '09:10', end: '09:50', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 1, p: 'P3', start: '10:00', end: '10:40', code: 'C5', class: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
    { day: 1, p: 'P4', start: '10:40', end: '11:20', code: 'C1', class: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },
    { day: 1, p: 'P5', start: '11:20', end: '12:00', code: 'C4', class: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
    { day: 1, p: 'P6', start: '12:00', end: '12:40', code: 'C2', class: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
    { day: 1, p: 'P7', start: '13:20', end: '14:00', code: 'C6', class: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
    { day: 1, p: 'P8', start: '14:00', end: '14:40', code: 'C6', class: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
    { day: 1, p: 'P9', start: '14:40', end: '15:20', code: 'CAS', class: 'CAS Experience', teacher: 'Sarah Jenkins', room: 'CAS Hub' },

    // Tuesday (2)
    { day: 2, p: 'P1', start: '08:30', end: '09:10', code: 'C6', class: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
    { day: 2, p: 'P2', start: '09:10', end: '09:50', code: 'C2', class: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
    { day: 2, p: 'P3', start: '10:00', end: '10:40', code: 'C5', class: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
    { day: 2, p: 'P4', start: '10:40', end: '11:20', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 2, p: 'P5', start: '11:20', end: '12:00', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 2, p: 'P6', start: '12:00', end: '12:40', code: 'C4', class: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
    { day: 2, p: 'P7', start: '13:20', end: '14:00', code: 'TOK', class: 'Theory of Knowledge (TOK)', teacher: 'Marcus Vance', room: 'Lecture Hall 2' },
    { day: 2, p: 'P8', start: '14:00', end: '14:40', code: 'C1', class: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },
    { day: 2, p: 'P9', start: '14:40', end: '15:20', code: 'C1', class: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },

    // Wednesday (3)
    { day: 3, p: 'P1', start: '08:30', end: '09:10', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 3, p: 'P2', start: '09:10', end: '09:50', code: 'C6', class: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
    { day: 3, p: 'P3', start: '10:00', end: '10:40', code: 'C5', class: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
    { day: 3, p: 'P4', start: '10:40', end: '11:20', code: 'C5', class: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
    { day: 3, p: 'P5', start: '11:20', end: '12:00', code: 'C4', class: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
    { day: 3, p: 'P6', start: '12:00', end: '12:40', code: 'C4', class: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
    { day: 3, p: 'P7', start: '13:20', end: '14:00', code: 'C2', class: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
    { day: 3, p: 'P8', start: '14:00', end: '14:40', code: 'C1', class: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },
    { day: 3, p: 'P9', start: '14:40', end: '15:20', code: 'DEAR', class: 'DEAR (Drop Everything And Read)', teacher: 'Daniel Moore', room: 'Library' },

    // Thursday (4)
    { day: 4, p: 'P1', start: '08:30', end: '09:10', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 4, p: 'P2', start: '09:10', end: '09:50', code: 'C6', class: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
    { day: 4, p: 'P3', start: '10:00', end: '10:40', code: 'C5', class: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
    { day: 4, p: 'P4', start: '10:40', end: '11:20', code: 'C1', class: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },
    { day: 4, p: 'P5', start: '11:20', end: '12:00', code: 'C4', class: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
    { day: 4, p: 'P6', start: '12:00', end: '12:40', code: 'C2', class: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
    { day: 4, p: 'P7', start: '13:20', end: '14:00', code: 'TOK', class: 'Theory of Knowledge (TOK)', teacher: 'Marcus Vance', room: 'Lecture Hall 2' },
    { day: 4, p: 'P8', start: '14:00', end: '14:40', code: 'PE', class: 'Physical Education (PE)', teacher: 'Coach Ryan', room: 'Sports Complex' },
    { day: 4, p: 'P9', start: '14:40', end: '15:20', code: 'PE', class: 'Physical Education (PE)', teacher: 'Coach Ryan', room: 'Sports Complex' },

    // Friday (5)
    { day: 5, p: 'P1', start: '08:30', end: '09:10', code: 'C3', class: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
    { day: 5, p: 'P2', start: '09:10', end: '09:50', code: 'C4', class: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
    { day: 5, p: 'P3', start: '10:00', end: '10:40', code: 'C5', class: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
    { day: 5, p: 'P4', start: '10:40', end: '11:20', code: 'C6', class: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
    { day: 5, p: 'P5', start: '11:20', end: '12:00', code: 'C2', class: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
    { day: 5, p: 'P6', start: '12:00', end: '12:40', code: 'C2', class: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
    { day: 5, p: 'P7', start: '13:20', end: '14:00', code: 'C1', class: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },
    { day: 5, p: 'P8', start: '14:00', end: '14:40', code: 'EE', class: 'Extended Essay (EE Workshop)', teacher: 'Dr. Sarah Mitchell', room: 'Resource Hub' },
    { day: 5, p: 'P9', start: '14:40', end: '15:20', code: 'CAS', class: 'CAS Experience', teacher: 'Sarah Jenkins', room: 'CAS Hub' },
  ];

  dp2Schedule.forEach((item, idx) => {
    rows.push({
      id: `timetable-dp2-${idx + 1}`,
      kind: 'timetable',
      name: `${item.class} · Period ${item.p.replace('P', '')}`,
      quantity: 1,
      data: {
        classId: `class-${item.code.toLowerCase()}`,
        class: item.class,
        code: item.code,
        period: item.p,
        weekdays: [item.day],
        startTime: item.start,
        endTime: item.end,
        room: item.room,
        teacher: item.teacher,
        substitution: '',
        description: 'DP2 Timetable 2026–27',
      },
    });
  });

  // Class logs / Teaching logs
  const sampleLogs = [
    {
      class: 'Physics HL',
      teacher: 'Maya Iyer',
      topic: 'Conservation of Linear Momentum & 2D Collisions',
      notes: 'Conducted air track trolley experiment with photogates. Verified elastic vs inelastic collision momentum conservation.',
      homework: 'Complete analysis on Chapter 4 problem set, questions 14-22.',
      date: '2026-09-07',
    },
    {
      class: 'Physics HL',
      teacher: 'Maya Iyer',
      topic: 'Newtonian Dynamics and Friction Coefficients',
      notes: 'Reviewed static and kinetic friction equations. Analyzed inclined plane data sets with error bars.',
      homework: 'Submit laboratory write-up by Friday 16:00.',
      date: '2026-09-05',
    },
    {
      class: 'Chemistry HL',
      teacher: 'David Park',
      topic: 'Acid-Base Titration Curves and Buffer Solutions',
      notes: 'Practiced volumetric titration using standardized NaOH and unknown monoprotic weak acid.',
      homework: 'Plot pH titration curve in Excel or Python and calculate pKa.',
      date: '2026-09-06',
    },
    {
      class: 'Math AA HL',
      teacher: 'James Wilson',
      topic: 'Integration by Parts & Trigonometric Substitutions',
      notes: 'Explored reduction formulas and definite integral applications in mechanics.',
      homework: 'Exercise 7C all even problems.',
      date: '2026-09-07',
    },
  ];

  sampleLogs.forEach((log, i) => {
    rows.push({
      id: `class-log-${i + 1}`,
      kind: 'classLog',
      name: `${log.class} · ${log.topic}`,
      quantity: 1,
      data: {
        class: log.class,
        teacher: log.teacher,
        topic: log.topic,
        notes: log.notes,
        homework: log.homework,
        date: log.date,
        period: 'P1',
        room: 'Lab 101',
      },
    });
  });

  // Submissions
  const sampleSubmissions = [
    {
      assignmentId: 'assignment-1',
      name: 'Forces and motion investigation',
      class: 'Physics HL',
      teacher: 'Maya Iyer',
      studentId: 'student-1',
      studentName: 'Nithin Selvaraj',
      text: 'For the dynamics trolley, weight and the normal reaction force balance vertically. A net horizontal force of 2.4 N acting on a 0.8 kg trolley produced an acceleration of 3.0 m/s², confirming F = ma within 1.8% experimental uncertainty.',
      score: 29,
      maxScore: 30,
      status: 'Graded',
      feedback: 'Excellent experimental methodology and error analysis. Derivation steps are very clear.',
      submittedAt: '2026-09-04T15:30:00Z',
      gradedAt: '2026-09-05T10:15:00Z',
    },
    {
      assignmentId: 'assignment-2',
      name: 'Acid-base equilibrium write-up',
      class: 'Chemistry HL',
      teacher: 'David Park',
      studentId: 'student-1',
      studentName: 'Nithin Selvaraj',
      text: 'Using Henderson-Hasselbalch equation pH = pKa + log([A-]/[HA]), the buffer capacity was measured across 5 titrations. The equivalence point matched theoretical pH 8.72.',
      score: 19,
      maxScore: 20,
      status: 'Graded',
      feedback: 'Great precision in titration curve analysis. Well done.',
      submittedAt: '2026-09-06T14:00:00Z',
      gradedAt: '2026-09-06T18:00:00Z',
    },
    {
      assignmentId: 'assignment-3',
      name: 'Electric circuits analysis',
      class: 'Physics HL',
      teacher: 'Maya Iyer',
      studentId: 'student-1',
      studentName: 'Nithin Selvaraj',
      text: 'Kirchhoff’s voltage and current laws were validated using digital multimeters across bridge circuit configurations.',
      score: null,
      maxScore: 25,
      status: 'Submitted',
      feedback: '',
      submittedAt: '2026-09-07T08:45:00Z',
      gradedAt: null,
    },
    {
      assignmentId: 'assignment-1',
      name: 'Forces and motion investigation',
      class: 'Physics HL',
      teacher: 'Maya Iyer',
      studentId: 'student-2',
      studentName: 'Emma Wilson',
      text: 'Acceleration measured using light gates matched theoretical calculations. Systematic friction was accounted for.',
      score: 28,
      maxScore: 30,
      status: 'Graded',
      feedback: 'Very thorough discussion of systematic errors.',
      submittedAt: '2026-09-04T16:00:00Z',
      gradedAt: '2026-09-05T11:00:00Z',
    },
    {
      assignmentId: 'assignment-1',
      name: 'Forces and motion investigation',
      class: 'Physics HL',
      teacher: 'Maya Iyer',
      studentId: 'student-3',
      studentName: 'Liam Chen',
      text: 'We plotted force against acceleration giving a linear gradient representing total mass M = 0.82 kg.',
      score: null,
      maxScore: 30,
      status: 'Submitted',
      feedback: '',
      submittedAt: '2026-09-06T17:20:00Z',
      gradedAt: null,
    },
  ];

  sampleSubmissions.forEach((sub, i) => {
    rows.push({
      id: `teaching-submission-${i + 1}`,
      kind: 'submission',
      name: sub.name,
      quantity: 1,
      data: {
        assignmentId: sub.assignmentId,
        class: sub.class,
        teacher: sub.teacher,
        studentId: sub.studentId,
        studentName: sub.studentName,
        text: sub.text,
        score: sub.score,
        maxScore: sub.maxScore,
        status: sub.status,
        feedback: sub.feedback,
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt,
      },
    });
  });

  // Attendance Records
  const todayStr = '2026-09-07';
  students.slice(0, 15).forEach((stu, i) => {
    const status = i === 4 ? 'Absent' : i === 8 ? 'Late' : 'Present';
    rows.push({
      id: `att-today-${i + 1}`,
      kind: 'attendance',
      name: `${stu} · Physics HL`,
      quantity: 1,
      data: {
        studentId: `student-${i + 1}`,
        studentName: stu,
        class: 'Physics HL',
        date: todayStr,
        period: 'P1',
        status,
        notes: status === 'Late' ? 'Arrived 10 min late (bus delay)' : '',
      },
    });
  });

  // Student documents
  rows.push(
    {
      id: 'student-handbook-doc',
      kind: 'document',
      name: 'Student Handbook · 2026–2027',
      quantity: 1,
      data: {
        audience: 'school',
        category: 'Handbooks',
        version: '2026.1',
        date: '2026-09-01',
        description: 'Comprehensive guidelines for academics, laboratory safety protocols, student conduct, attendance procedures, and campus amenities.',
      },
    },
    {
      id: 'lab-safety-doc',
      kind: 'document',
      name: 'Laboratory Safety & Chemical Handling Guidelines',
      quantity: 1,
      data: {
        audience: 'school',
        category: 'Safety',
        version: '4.2',
        date: '2026-08-25',
        description: 'Mandatory safety protocol for Chemistry and Biology laboratories. Eye protection must be worn at all times.',
      },
    },
    {
      id: 'cas-guidelines-doc',
      kind: 'document',
      name: 'CAS Program Guide & Reflection Framework',
      quantity: 1,
      data: {
        audience: 'students',
        category: 'Curriculum',
        version: '2026.2',
        date: '2026-09-02',
        description: 'Creativity, Activity, Service (CAS) milestone requirements, supervisor sign-off steps, and reflection diary templates.',
      },
    },
    {
      id: 'term-1-report-card-student-1',
      kind: 'document',
      name: 'Term 1 Report Card · 2026–2027',
      quantity: 1,
      data: {
        studentId: 'student-1',
        studentFacing: true,
        category: 'Academic',
        date: '2026-09-05',
        description: 'Published academic report card for Term 1, including subject grades and teacher feedback.',
      },
    },
    {
      id: 'enrollment-certificate-student-1',
      kind: 'document',
      name: 'Enrollment Certificate',
      quantity: 1,
      data: {
        studentId: 'student-1',
        studentFacing: true,
        category: 'Official',
        date: '2026-09-03',
        description: 'Official confirmation of current enrollment at Westbridge International School.',
      },
    },
    {
      id: 'school-id-form-student-1',
      kind: 'document',
      name: 'School ID Request Form',
      quantity: 1,
      data: {
        studentId: 'student-1',
        studentFacing: true,
        category: 'Forms',
        date: '2026-09-01',
        description: 'Form for requesting a replacement or updated school identification card.',
      },
    },
  );

  // Cafeteria Meals
  rows.push(
    {
      id: 'meal-today-1',
      kind: 'meal',
      name: 'Mediterranean Vegetable Rice Bowl',
      quantity: 1,
      data: {
        audience: 'school',
        date: todayStr,
        weekdays: [1, 2, 3, 4, 5],
        description: 'Steamed brown rice with roasted Mediterranean vegetables, spiced chickpeas, creamy tahini dressing, and fresh herbs.',
        dietary: 'Vegetarian · Gluten-free · Dairy-free',
        allergens: 'Sesame. Prepared in a facility handling nuts and soy.',
        available: true,
        orderBy: `${todayStr}T10:00`,
      },
    },
    {
      id: 'meal-today-2',
      kind: 'meal',
      name: 'Artisan Tomato & Basil Penne',
      quantity: 1,
      data: {
        audience: 'school',
        date: todayStr,
        weekdays: [1, 2, 3, 4, 5],
        description: 'Durum wheat penne tossed in slow-simmered San Marzano tomato sauce, fresh torn basil, and aged parmesan shavings.',
        dietary: 'Vegetarian',
        allergens: 'Wheat (gluten), Milk.',
        available: true,
        orderBy: `${todayStr}T10:00`,
      },
    },
  );

  // Events
  rows.push(
    {
      id: 'event-trip-1',
      kind: 'event',
      name: 'National Science & Technology Exhibition Visit',
      quantity: 1,
      data: {
        class: 'Physics HL',
        date: '2026-09-18',
        startTime: '09:00',
        endTime: '15:30',
        room: 'Depart from Main Reception',
        description: 'Field trip to explore particle physics interactive exhibits, renewable energy demos, and meet university research fellows.',
      },
    },
    {
      id: 'event-olympiad-1',
      kind: 'event',
      name: 'Regional Senior Mathematics Olympiad',
      quantity: 1,
      data: {
        class: 'Math AA HL',
        date: '2026-09-24',
        startTime: '10:00',
        endTime: '12:30',
        room: 'Auditorium Hall',
        description: 'Annual competitive mathematics challenge. Calculators not permitted.',
      },
    },
  );

  // IBDP Academic Calendar 2026-2027 Events
  IBDP_ACADEMIC_CALENDAR_EVENTS.forEach((evt) => {
    rows.push({
      id: evt.id,
      kind: 'event',
      name: evt.title,
      quantity: 1,
      data: {
        title: evt.title,
        date: evt.startDate,
        startDate: evt.startDate,
        endDate: evt.endDate,
        category: evt.category,
        categoryLabel: evt.categoryLabel,
        target: evt.target || 'All',
        description: evt.description || evt.title,
        color: evt.color,
        startTime: '08:30',
        endTime: '15:30',
        room: 'Campus Wide',
        studentFacing: true,
      },
    });
  });

  // Messages / Communication threads
  rows.push(
    {
      id: 'message-thread-1',
      kind: 'message',
      name: 'Internal Assessment Topic Discussion',
      quantity: 1,
      data: {
        senderId: 'dev-teacher-member',
        senderName: 'Maya Iyer',
        recipientId: 'dev-student-member',
        recipientName: 'Nithin Selvaraj',
        class: 'Physics HL',
        timestamp: '2026-09-06T14:22:00Z',
        body: 'Hi Aarav, your proposal on analyzing damping coefficients of oscillating springs in different fluids looks great. We have glycerin and mineral oil ready in Lab 101 whenever you want to begin preliminary trials.',
      },
    },
    {
      id: 'message-thread-2',
      kind: 'message',
      name: 'Re: Internal Assessment Topic Discussion',
      quantity: 1,
      data: {
        senderId: 'dev-student-member',
        senderName: 'Nithin Selvaraj',
        recipientId: 'dev-teacher-member',
        recipientName: 'Maya Iyer',
        class: 'Physics HL',
        timestamp: '2026-09-06T15:10:00Z',
        body: 'Thank you Ms. Iyer! I will set up the ultrasonic motion sensor during Tuesday’s free period and log initial calibration readings.',
      },
    },
  );

  // Maintenance & Facilities
  rows.push(
    {
      id: 'maintenance-1',
      kind: 'maintenance',
      name: 'Fume hood air velocity sensor calibration',
      quantity: 1,
      data: {
        location: 'Chemistry Lab 102',
        priority: 'High',
        status: 'In Progress',
        reportedBy: 'David Park',
        reportedAt: '2026-09-05',
        assignedTo: 'Facilities Team',
        description: 'Scheduled semi-annual airflow velocity test and filter check.',
      },
    },
    {
      id: 'maintenance-2',
      kind: 'maintenance',
      name: 'Interactive projector lamp replacement',
      quantity: 1,
      data: {
        location: 'Room 204',
        priority: 'Medium',
        status: 'Resolved',
        reportedBy: 'James Wilson',
        reportedAt: '2026-09-02',
        assignedTo: 'AV Support',
        description: 'Replacement high-output lamp installed and color balance calibrated.',
      },
    },
  );

  return rows;
}

export function buildMockAudits(): any[] {
  return [
    {
      id: 101,
      organizationId: 'schoolos-dev',
      entityId: 'schoolos-dev:inventory-6',
      action: 'Updated inventory',
      actor: 'dev:teacher',
      actorName: 'Maya Iyer',
      timestamp: '2026-09-07T08:30:00Z',
      before: JSON.stringify({ name: 'Sodium hydroxide', quantity: 12 }),
      after: JSON.stringify({ name: 'Sodium hydroxide', quantity: 10 }),
    },
    {
      id: 102,
      organizationId: 'schoolos-dev',
      entityId: 'schoolos-dev:att-today-1',
      action: 'Marked attendance',
      actor: 'dev:teacher',
      actorName: 'Maya Iyer',
      timestamp: '2026-09-07T08:35:00Z',
      before: '{}',
      after: JSON.stringify({ class: 'Physics HL', present: 14, absent: 1 }),
    },
    {
      id: 103,
      organizationId: 'schoolos-dev',
      entityId: 'schoolos-dev:teaching-submission-1',
      action: 'Graded assignment',
      actor: 'dev:teacher',
      actorName: 'Maya Iyer',
      timestamp: '2026-09-05T10:15:00Z',
      before: JSON.stringify({ status: 'Submitted' }),
      after: JSON.stringify({ status: 'Graded', score: 29 }),
    },
    {
      id: 104,
      organizationId: 'schoolos-dev',
      entityId: 'schoolos-dev:loan-1',
      action: 'Issued library loan',
      actor: 'dev:daniel-moore',
      actorName: 'Daniel Moore',
      timestamp: '2026-09-01T09:00:00Z',
      before: '{}',
      after: JSON.stringify({ book: 'University Physics with Modern Physics', borrower: 'Nithin Selvaraj' }),
    },
    {
      id: 105,
      organizationId: 'schoolos-dev',
      entityId: 'schoolos-dev:member-maya-iyer',
      action: 'Updated curriculum',
      actor: 'dev:admin',
      actorName: 'Nithin Selvaraj',
      timestamp: '2026-08-30T14:00:00Z',
      before: '{}',
      after: JSON.stringify({ department: 'Science', term: 'Term 1 2026' }),
    },
  ];
}

// In-memory data store for live offline mutations
let memoryRows: any[] | null = null;
let memoryAudits: any[] | null = null;

export function getInMemoryStore() {
  if (!memoryRows) {
    memoryRows = buildMockRows();
  }
  if (!memoryAudits) {
    memoryAudits = buildMockAudits();
  }
  return { rows: memoryRows, audits: memoryAudits };
}

export function getMockWorkspaceData(userOrRole?: any): MockWorkspaceData {
  let role = 'Admin';
  let userId = 'dev:admin';
  let name = 'Nithin Selvaraj';
  let email = 'admin.dev@schoolos.local';
  let studentId = '';
  let memberClasses = '';

  if (typeof userOrRole === 'string') {
    const r = userOrRole.toLowerCase();
    if (r.includes('hos') || r.includes('head')) role = 'Head of School';
    else if (r.includes('transport')) role = 'Transport Staff';
    else if (r.includes('student')) role = 'Student';
    else if (r.includes('teacher')) role = 'Teacher';
    else if (r.includes('lab')) role = 'Lab Assistant';
    else if (r.includes('library')) role = 'Library Assistant';
    else role = 'Admin';
  } else if (userOrRole && typeof userOrRole === 'object') {
    if (userOrRole.role) {
      const r = String(userOrRole.role).toLowerCase();
      if (r.includes('hos') || r.includes('head')) role = 'Head of School';
      else if (r.includes('transport')) role = 'Transport Staff';
      else if (r.includes('student')) role = 'Student';
      else if (r.includes('teacher')) role = 'Teacher';
      else if (r.includes('lab')) role = 'Lab Assistant';
      else if (r.includes('library')) role = 'Library Assistant';
      else if (userOrRole.userId === 'dev:hos') role = 'Head of School';
      else role = 'Admin';
    } else if (userOrRole.userId) {
      if (userOrRole.userId === 'dev:transport-staff') role = 'Transport Staff';
      else if (userOrRole.userId === 'dev:student') role = 'Student';
      else if (userOrRole.userId === 'dev:teacher') role = 'Teacher';
      else if (userOrRole.userId === 'dev:lab-assistant') role = 'Lab Assistant';
      else if (userOrRole.userId === 'dev:library-assistant') role = 'Library Assistant';
      else role = 'Admin';
    }
  }

  if (role === 'Head of School') {
    userId = 'dev:hos'; name = 'Dr. Aisha Rahman'; email = 'hos.dev@schoolos.local';
  } else if (role === 'Transport Staff') {
    userId = 'dev:transport-staff'; name = 'Leena Joseph'; email = 'transport.dev@schoolos.local';
  } else if (role === 'Student') {
    userId = 'dev:student';
    name = 'Nithin Selvaraj';
    email = 'student.dev@schoolos.local';
    studentId = 'student-1';
    memberClasses = 'Physics|Chemistry|Digital Society|Math AA|English|French B|Theory of Knowledge (TOK)|CAS Experience|DEAR (Drop Everything And Read)|Physical Education (PE)|Extended Essay (EE Workshop)';
  } else if (role === 'Teacher') {
    userId = 'dev:teacher';
    name = 'Maya Iyer';
    email = 'teacher.dev@schoolos.local';
    memberClasses = `${MAYA_HOMEROOM}|${MAYA_SUBJECT}`;
  } else if (role === 'Lab Assistant') {
    userId = 'dev:lab-assistant';
    name = 'Olivia Reed';
    email = 'lab.assistant.dev@schoolos.local';
    memberClasses = '';
  } else if (role === 'Library Assistant') {
    userId = 'dev:library-assistant';
    name = 'Daniel Moore';
    email = 'library.assistant.dev@schoolos.local';
    memberClasses = '';
  } else {
    userId = 'dev:admin';
    name = 'Nithin Selvaraj';
    email = 'admin.dev@schoolos.local';
    memberClasses = '';
  }

  const member = {
    id: userId.replace(':', '-') + '-member',
    userId,
    name,
    email,
    role,
    department:
      role === 'Admin'
        ? 'Leadership'
        : role === 'Teacher'
          ? 'Science'
          : role === 'Lab Assistant'
            ? 'Science Labs'
            : role === 'Library Assistant'
              ? 'Library Services'
              : role === 'Transport Staff'
                ? 'Transport'
                : 'DP-2',
    classes: memberClasses,
    studentId,
  };

  const store = getInMemoryStore();
  let rows = [...store.rows];

  // Role scoping
  if (role === 'Teacher') {
    const teacherClasses = (memberClasses || '').split('|');
    rows = rows.filter((r) => {
      if (['inventory', 'book', 'document', 'meal', 'event', 'maintenance'].includes(r.kind)) return true;
      if (r.kind === 'student') {
        return r.data?.classTeacherId === MAYA_TEACHER_ID || r.data?.subjectTeacherIds?.includes(MAYA_TEACHER_ID);
      }
      if (r.kind === 'timetable' || r.kind === 'class' || r.kind === 'assignment' || r.kind === 'classLog' || r.kind === 'attendance') {
        const c = r.data?.class || r.name;
        return teacherClasses.includes(c) || r.data?.teacher === name;
      }
      if (r.kind === 'submission') {
        return teacherClasses.includes(r.data?.class) || r.data?.teacher === name;
      }
      return true;
    });
  } else if (role === 'Student') {
    const stuClasses = (memberClasses || '').split('|');
    rows = rows.filter((r) => {
      if (['book', 'document', 'meal', 'event', 'notification', 'timetable'].includes(r.kind)) return true;
      if (r.kind === 'class' || r.kind === 'assignment' || r.kind === 'resource' || r.kind === 'classLog' || r.kind === 'exam') {
        const c = r.data?.class || r.name;
        return !c || stuClasses.includes(c);
      }
      if (r.kind === 'submission') {
        return r.data?.studentId === studentId || r.data?.studentName === name;
      }
      if (r.kind === 'attendance') {
        return r.data?.studentId === studentId || r.data?.studentName === name;
      }
      if (r.kind === 'loan') {
        return r.data?.studentId === studentId || r.data?.studentName === name;
      }
      if (r.kind === 'record') {
        return r.data?.studentId === studentId && r.data?.studentVisible !== false;
      }
      if (['damageBrokenLog', 'attendanceReport', 'transportNotice'].includes(r.kind)) {
        return (r.data?.studentId === studentId || r.data?.metadata?.studentId === studentId) &&
          r.data?.visibility?.studentVisible !== false &&
          r.data?.visibility?.restricted !== true;
      }
      if (r.kind === 'activityEvent') {
        return (r.data?.relatedStudentId === studentId || r.data?.metadata?.studentId === studentId) &&
          r.data?.visibility?.studentVisible === true;
      }
      if (r.kind === 'request') {
        return r.data?.studentId === studentId;
      }
      if (['project', 'cas'].includes(r.kind)) {
        return true;
      }
      return false;
    });
  }

  rows = profileMetrics(rows);

  const members = role === 'Admin' ? mockMembers : [];
  const masterRows = role === 'Admin' ? dashboardRows(rows, mockMembers) : [];
  let audit = role === 'Admin' ? store.audits : role === 'Teacher' ? store.audits.filter((a: any) => a.actor === 'dev:teacher' || a.action.includes('inventory')) : [];

  const contacts = role === 'Student'
    ? mockMembers
        .filter((m) => m.role === 'Teacher')
        .map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          department: m.department,
          classes: (m.classes || '').split('|'),
        }))
    : [];

  return {
    rows,
    contacts,
    member,
    audit,
    members,
    masterRows,
    refreshedAt: new Date().toISOString(),
  };
}

export function handleMockMutation(payload: any, activeMember: any) {
  const store = getInMemoryStore();
  const nowStr = new Date().toISOString();
  const track = (row: any, context: any) => {
    const entity = trackedRecord({
      id: row.id,
      ...row.data,
      metadata: { ...(row.data || {}), studentId: context.studentId || row.data?.studentId },
    }, {
      organizationId: 'schoolos-dev', actorId: activeMember?.userId || 'system',
      module: context.module, recordType: context.recordType, status: context.status,
      studentId: context.studentId, classId: context.classId,
      labels: context.labels, visibility: context.visibility,
    });
    row.data = { ...row.data, ...entity };
    store.rows.unshift({ id: `event-${row.id}`, kind: 'activityEvent', name: row.name, quantity: 1, data: activityEvent(entity, { actorId: activeMember?.userId || 'system', actorRole: activeMember?.role || 'System', studentId: context.studentId, classId: context.classId }) });
    store.audits.unshift({ actor: activeMember?.userId || 'system', action: `Created ${context.recordType}`, entityId: row.id, after: JSON.stringify(entity), timestamp: nowStr, organizationId: 'schoolos-dev' });
  };

  if (payload.action === 'notificationRead') {
    const notification = store.rows.find((row) => row.id === payload.id && row.kind === 'notification');
    if (!notification) return { ok: false, error: 'Notification not found' };
    notification.data = { ...notification.data, read: payload.read !== false };
    return { ok: true, id: notification.id };
  }

  if (payload.action === 'notificationsReadAll') {
    store.rows
      .filter((row) => row.kind === 'notification')
      .forEach((row) => { row.data = { ...row.data, read: true }; });
    return { ok: true };
  }

  if (payload.action === 'classLog') {
    const newLog = {
      id: `class-log-${Date.now()}`,
      kind: 'classLog',
      name: `${payload.class} · ${payload.topic || 'Lesson log'}`,
      quantity: 1,
      data: {
        ...payload,
        teacher: activeMember?.name || 'Maya Iyer',
        date: payload.date || nowStr.slice(0, 10),
      },
    };
    store.rows.unshift(newLog);
    return { ok: true, id: newLog.id, item: newLog };
  }

  if (payload.action === 'studentRecord' || payload.action === 'behaviorReport') {
    const student = store.rows.find((r) => r.kind === 'student' && r.id === payload.studentId);
    const row = {
      id: payload.id || `record-${Date.now()}`,
      kind: 'record',
      name: payload.category || 'Student record',
      quantity: 1,
      data: {
        ...payload,
        studentId: payload.studentId,
        studentName: student?.name || payload.studentName,
        description: payload.whatHappened || payload.description || '',
        createdBy: activeMember?.userId || 'dev:teacher',
        createdAt: nowStr,
      },
    };
    track(row, { module: 'Classroom', recordType: payload.action === 'behaviorReport' ? RecordRegistry.STUDENT_BEHAVIOUR : (String(payload.category || '').toLowerCase().includes('positive') ? RecordRegistry.STUDENT_POSITIVE : 'STUDENT_RECORD'), status: payload.status || 'Reported', studentId: payload.studentId, classId: payload.classId || payload.class, labels: [payload.category || 'Student record'], visibility: { studentVisible: payload.studentVisible === true, teacherVisible: true, adminVisible: true } });
    store.rows.unshift(row);
    return { ok: true, id: row.id, item: row };
  }

  if (payload.action === 'transportNotice') {
    const duplicate = store.rows.find(
      (r) => r.kind === 'transportNotice' &&
        r.data.studentId === payload.studentId &&
        r.data.date === payload.date &&
        r.data.status !== 'Resolved',
    );
    if (duplicate) return { ok: false, error: 'A transport notice already exists for this student and date' };
    const student = store.rows.find((r) => r.kind === 'student' && r.id === payload.studentId);
    const row = {
      id: `transport-${Date.now()}`,
      kind: 'transportNotice',
      name: `${student?.name || 'Student'} · Transport notice`,
      quantity: 1,
      data: {
        ...payload,
        studentName: student?.name || payload.studentName,
        status: 'Submitted',
        submittedBy: activeMember?.userId || 'dev:teacher',
        submittedAt: nowStr,
      },
    };
    track(row, { module: 'Transport', recordType: RecordRegistry.TRANSPORT_NOTICE, status: 'Submitted', studentId: payload.studentId, classId: payload.classId, labels: ['Transport notice'], visibility: { studentVisible: payload.studentVisible !== false, teacherVisible: true, adminVisible: true } });
    store.rows.unshift(row);
    store.rows.unshift({
      id: `notification-${Date.now()}`,
      kind: 'notification',
      name: 'Transport notice submitted',
      quantity: 1,
      data: {
        studentId: payload.studentId,
        audience: 'transport',
        authorizedRoles: ['Admin', 'Transport Department'],
        studentFacing: true,
        description: `${payload.changeType} notice submitted for ${payload.date}.`,
        sourceId: row.id,
        date: payload.date,
      },
    });
    return { ok: true, id: row.id, item: row };
  }

  if (payload.action === 'labOrderStatus') {
    const order = store.rows.find(
      (r) => ['labOrder', 'order'].includes(r.kind) && r.id === payload.id,
    );
    if (!order) return { ok: false, error: 'Lab order not found' };
    order.data = {
      ...order.data,
      status: payload.status,
      approvalHistory: [
        ...(Array.isArray(order.data.approvalHistory) ? order.data.approvalHistory : []),
        { status: payload.status, actor: activeMember?.userId || 'dev:admin', time: nowStr },
      ],
    };
    track(order, { module: 'Lab', recordType: payload.status === 'Received' ? RecordRegistry.LAB_ORDER_RECEIVED : RecordRegistry.LAB_ORDER, status: payload.status, labels: ['Lab order'], visibility: { teacherVisible: false, adminVisible: true } });
    return { ok: true, id: order.id, item: order };
  }

  if (payload.action === 'attendance' || payload.kind === 'attendance') {
    const id = payload.id || `att-${Date.now()}`;
    const existing = store.rows.find((r) => r.id === id);
    if (existing) {
      existing.data = { ...existing.data, ...payload.data };
    } else {
    const attendanceRow = {
        id,
        kind: 'attendance',
        name: payload.name || `${payload.studentName} · ${payload.class}`,
        quantity: 1,
        data: payload.data || payload,
      };
    track(attendanceRow, { module: 'Classroom', recordType: payload.data?.status === 'Late' || payload.status === 'Late' ? RecordRegistry.LATE_ARRIVAL : RecordRegistry.ATTENDANCE_MARK, status: payload.data?.status || payload.status || 'Marked', studentId: payload.data?.studentId || payload.studentId, classId: payload.data?.class || payload.class, labels: ['Attendance'], visibility: { studentVisible: true, teacherVisible: true, adminVisible: true } });
    store.rows.push(attendanceRow);
    }
    return { ok: true, id };
  }

  if (payload.action === 'submit' || payload.kind === 'submission') {
    const newSub = {
      id: payload.id || `submission-${Date.now()}`,
      kind: 'submission',
      name: payload.name || 'Assignment submission',
      quantity: 1,
      data: {
        ...payload.data,
        ...payload,
        studentId: activeMember?.studentId || 'student-1',
        studentName: activeMember?.name || 'Nithin Selvaraj',
        submittedAt: nowStr,
        status: 'Submitted',
      },
    };
    track(newSub, { module: 'Academics', recordType: RecordRegistry.ASSIGNMENT_SUBMITTED, status: 'Submitted', studentId: newSub.data.studentId, classId: newSub.data.class, labels: ['Assignment submission'], visibility: { studentVisible: true, teacherVisible: true, adminVisible: true } });
    store.rows.push(newSub);
    return { ok: true, id: newSub.id, item: newSub };
  }

  if (payload.action === 'grade') {
    const sub = store.rows.find((r) => r.id === payload.id);
    if (sub) {
      sub.data = {
        ...sub.data,
        score: payload.score,
        feedback: payload.feedback,
        status: 'Graded',
        gradedAt: nowStr,
      };
      track(sub, { module: 'Academics', recordType: RecordRegistry.ASSIGNMENT_GRADED, status: 'Graded', studentId: sub.data.studentId, classId: sub.data.class, labels: ['Assignment grade'], visibility: { studentVisible: sub.data.returned === true, teacherVisible: true, adminVisible: true } });
    }
    return { ok: true, id: payload.id };
  }

  if (payload.action === 'update' || payload.action === 'save') {
    const row = store.rows.find((r) => r.id === payload.id);
    if (row) {
      if (payload.data) row.data = { ...row.data, ...payload.data };
      if (payload.name) row.name = payload.name;
      if (payload.quantity !== undefined) row.quantity = payload.quantity;
      return { ok: true, item: row };
    }
  }

  if (payload.action === 'request') {
    const newReq = {
      id: `request-${Date.now()}`,
      kind: 'request',
      name: payload.name || 'Lab/Library request',
      quantity: Number(payload.quantity || 1),
      data: {
        ...payload,
        type: payload.type || (payload.kind === 'book' ? 'library' : 'lab'),
        status: 'Pending',
        requestedBy: activeMember?.name || 'Nithin Selvaraj',
        requestedAt: nowStr,
      },
    };
    track(newReq, { module: newReq.data.type === 'library' ? 'Library' : 'Lab', recordType: newReq.data.type === 'library' ? RecordRegistry.ORDER_CREATED : RecordRegistry.LAB_REQUEST, status: 'Pending', studentId: newReq.data.studentId || activeMember?.studentId, classId: newReq.data.class, labels: [newReq.data.type === 'library' ? 'Library request' : 'Lab request'], visibility: { studentVisible: true, teacherVisible: true, adminVisible: true } });
    store.rows.unshift(newReq);
    return { ok: true, id: newReq.id, item: newReq };
  }

  if (payload.action === 'create' || payload.action === 'add') {
    const newRow = {
      id: payload.id || `${payload.kind || 'record'}-${Date.now()}`,
      kind: payload.kind || 'record',
      name: payload.name || 'New entry',
      quantity: payload.quantity || 1,
      data: payload.data || {},
    };
    store.rows.push(newRow);
    return { ok: true, id: newRow.id, item: newRow };
  }

  if (payload.action === 'delete') {
    store.rows = store.rows.filter((r) => r.id !== payload.id);
    return { ok: true };
  }

  // Fallback generic success
  return { ok: true, message: 'Saved successfully' };
}
