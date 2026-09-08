export const MAYA_TEACHER_ID = 'dev-teacher-member';
export const MAYA_HOMEROOM = 'Maya Homeroom';
export const MAYA_SUBJECT = 'Physics HL';

const mayaStudents = [
  ['maya-student-01', 'Aarav Mehta'],
  ['maya-student-02', 'Amelia Brooks'],
  ['maya-student-03', 'Daniel Okafor'],
  ['maya-student-04', 'Elena Rossi'],
  ['maya-student-05', 'Hugo Tan'],
  ['maya-student-06', 'Ishaan Kapoor'],
  ['maya-student-07', 'Lila Thompson'],
  ['maya-student-08', 'Mateo Silva'],
  ['maya-student-09', 'Nora Williams'],
  ['maya-student-10', 'Owen Patel'],
  ['maya-student-11', 'Priya Nair'],
  ['maya-student-12', 'Samira Hassan'],
  ['maya-student-13', 'Theo Martin'],
  ['maya-student-14', 'Valentina Cruz'],
  ['maya-student-15', 'William Chen'],
] as const;

export function demoTeacherEntries() {
  const entries: any[] = [
    {
      id: 'maya-homeroom',
      kind: 'class',
      name: MAYA_HOMEROOM,
      data: {
        teacher: 'Maya Iyer',
        teacherId: MAYA_TEACHER_ID,
        classTeacherId: MAYA_TEACHER_ID,
        isHomeroom: true,
        room: 'Advisory 12',
        department: 'Student Support',
        time: '08:00',
      },
    },
    {
      id: 'maya-physics-hl',
      kind: 'class',
      name: MAYA_SUBJECT,
      data: {
        teacher: 'Maya Iyer',
        teacherId: MAYA_TEACHER_ID,
        subjectTeacherId: MAYA_TEACHER_ID,
        room: 'Physics Lab',
        department: 'Science',
        time: '10:15',
      },
    },
  ];
  entries.push(
    {
      id: 'maya-homeroom-timetable',
      kind: 'timetable',
      name: `${MAYA_HOMEROOM} · Advisory`,
      data: {
        classId: 'maya-homeroom',
        class: MAYA_HOMEROOM,
        teacher: 'Maya Iyer',
        teacherId: MAYA_TEACHER_ID,
        period: 'P1',
        weekdays: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '08:20',
        room: 'Advisory 12',
      },
    },
    {
      id: 'maya-physics-timetable',
      kind: 'timetable',
      name: `${MAYA_SUBJECT} · Period 3`,
      data: {
        classId: 'maya-physics-hl',
        class: MAYA_SUBJECT,
        teacher: 'Maya Iyer',
        teacherId: MAYA_TEACHER_ID,
        period: 'P3',
        weekdays: [1, 2, 3, 4, 5],
        startTime: '10:15',
        endTime: '11:10',
        room: 'Physics Lab',
      },
    },
  );

  mayaStudents.forEach(([id, name], index) => {
    const inSubject = index < 5;
    entries.push({
      id,
      kind: 'student',
      name,
      quantity: 1,
      data: {
        grade: 'DP-2',
        studentId: id,
        homeroom: MAYA_HOMEROOM,
        classTeacherId: MAYA_TEACHER_ID,
        classes: inSubject ? [MAYA_SUBJECT] : [],
        subjectTeacherIds: inSubject ? [MAYA_TEACHER_ID] : [],
        class: inSubject ? MAYA_SUBJECT : MAYA_HOMEROOM,
        house: ['Orion', 'Phoenix', 'Atlas', 'Lynx'][index % 4],
        attendance: 91 + (index % 8),
        average: 74 + (index % 19),
        status: 'Active',
      },
    });
  });

  const subjectStudents = mayaStudents.slice(0, 5);
  subjectStudents.forEach(([studentId, studentName], index) => {
    entries.push({
      id: `maya-attendance-${index + 1}`,
      kind: 'attendance',
      name: `${studentName} · ${MAYA_SUBJECT}`,
      quantity: 1,
      data: {
        studentId,
        studentName,
        class: MAYA_SUBJECT,
        classId: 'maya-physics-hl',
        teacherId: MAYA_TEACHER_ID,
        date: '2026-09-07',
        period: 'P3',
        status: index === 3 ? 'Late' : 'Present',
        arrivalTime: index === 3 ? '10:23' : '10:10',
      },
    });
  });

  entries.push(
    {
      id: 'maya-physics-assignment',
      kind: 'assignment',
      name: 'Physics IA draft: motion analysis',
      quantity: 1,
      data: {
        class: MAYA_SUBJECT,
        classId: 'maya-physics-hl',
        teacher: 'Maya Iyer',
        teacherId: MAYA_TEACHER_ID,
        title: 'Physics IA draft: motion analysis',
        instructions: 'Submit your research question, variables and first data table.',
        dueAt: '2026-09-12T16:00',
        status: 'Published',
        maxMarks: 20,
      },
    },
    {
      id: 'maya-physics-log',
      kind: 'classLog',
      name: 'Physics HL · Momentum and collisions',
      quantity: 1,
      data: {
        class: MAYA_SUBJECT,
        classId: 'maya-physics-hl',
        teacher: 'Maya Iyer',
        teacherId: MAYA_TEACHER_ID,
        date: '2026-09-07',
        period: 'P3',
        topic: 'Momentum and collisions',
        contentCovered: 'Measured momentum before and after cart collisions using photogates.',
        homework: 'Complete the uncertainty table for the practical.',
      },
    },
  );

  subjectStudents.slice(0, 3).forEach(([studentId, studentName], index) => {
    entries.push({
      id: `maya-submission-${index + 1}`,
      kind: 'submission',
      name: `${studentName} · Physics IA draft`,
      quantity: 1,
      data: {
        studentId,
        studentName,
        class: MAYA_SUBJECT,
        classId: 'maya-physics-hl',
        assignmentId: 'maya-physics-assignment',
        teacherId: MAYA_TEACHER_ID,
        status: index === 2 ? 'Graded' : 'Submitted',
        returned: index === 2,
        grade: index === 2 ? 17 : undefined,
        feedback: index === 2 ? 'Strong method. Clarify the uncertainty discussion.' : '',
      },
    });
  });

  return entries;
}
