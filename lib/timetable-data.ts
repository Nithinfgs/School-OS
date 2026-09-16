export interface TimetableSlot {
  code: string;
  title: string;
  teacher: string;
  room: string;
  time: string;
  notes?: string;
  isCustomized?: boolean;
}

export type TimetableGrid = Record<string, Record<string, TimetableSlot>>;

export const TIMETABLE_DAYS = [
  { name: 'Monday', short: 'Mon', dayNum: 1 },
  { name: 'Tuesday', short: 'Tue', dayNum: 2 },
  { name: 'Wednesday', short: 'Wed', dayNum: 3 },
  { name: 'Thursday', short: 'Thu', dayNum: 4 },
  { name: 'Friday', short: 'Fri', dayNum: 5 },
] as const;

export const TIMETABLE_PERIODS = [
  { key: 'p1', name: 'Period 1', defaultTime: '08:30–09:10' },
  { key: 'p2', name: 'Period 2', defaultTime: '09:10–09:50' },
  { key: 'p3', name: 'Period 3', defaultTime: '10:00–10:40' },
  { key: 'p4', name: 'Period 4', defaultTime: '10:40–11:20' },
  { key: 'p5', name: 'Period 5', defaultTime: '11:20–12:00' },
  { key: 'p6', name: 'Period 6', defaultTime: '12:00–12:40' },
  { key: 'p7', name: 'Period 7', defaultTime: '01:20–02:00' },
  { key: 'p8', name: 'Period 8', defaultTime: '02:00–02:40' },
  { key: 'p9', name: 'Period 9', defaultTime: '02:40–03:20' },
] as const;

export const KNOWN_SUBJECTS = [
  { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108' },
  { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210' },
  { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204' },
  { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101' },
  { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102' },
  { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103' },
  { code: 'TOK', title: 'Theory of Knowledge (TOK Core)', teacher: 'Marcus Vance', room: 'Lecture Hall 2' },
  { code: 'EE', title: 'Extended Essay (EE Workshop & Supervision)', teacher: 'Dr. Sarah Mitchell', room: 'Resource Hub' },
  { code: 'CAS', title: 'Creativity, Activity, Service (CAS Portfolio)', teacher: 'Sarah Jenkins', room: 'CAS Hub' },
  { code: 'PE', title: 'Physical Education & Well-being', teacher: 'Coach Ryan', room: 'Sports Complex' },
  { code: 'DEAR', title: 'Drop Everything And Read (Independent Literacy)', teacher: 'Daniel Moore', room: 'Library' },
  { code: 'STUDY', title: 'Self Directed Study', teacher: 'Study Supervisor', room: 'Study Hall' },
];

export const DEFAULT_DP2_GRID: TimetableGrid = {
  Monday: {
    p1: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '08:30–09:10' },
    p2: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '09:10–09:50' },
    p3: { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102', time: '10:00–10:40' },
    p4: { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108', time: '10:40–11:20' },
    p5: { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101', time: '11:20–12:00' },
    p6: { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210', time: '12:00–12:40' },
    p7: { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103', time: '01:20–02:00' },
    p8: { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103', time: '02:00–02:40' },
    p9: { code: 'CAS', title: 'Creativity, Activity, Service (CAS Portfolio)', teacher: 'Sarah Jenkins', room: 'CAS Hub', time: '02:40–03:20' },
  },
  Tuesday: {
    p1: { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103', time: '08:30–09:10' },
    p2: { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210', time: '09:10–09:50' },
    p3: { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102', time: '10:00–10:40' },
    p4: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '10:40–11:20' },
    p5: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '11:20–12:00' },
    p6: { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101', time: '12:00–12:40' },
    p7: { code: 'TOK', title: 'Theory of Knowledge (TOK Core)', teacher: 'Marcus Vance', room: 'Lecture Hall 2', time: '01:20–02:00' },
    p8: { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108', time: '02:00–02:40' },
    p9: { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108', time: '02:40–03:20' },
  },
  Wednesday: {
    p1: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '08:30–09:10' },
    p2: { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103', time: '09:10–09:50' },
    p3: { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102', time: '10:00–10:40' },
    p4: { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102', time: '10:40–11:20' },
    p5: { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101', time: '11:20–12:00' },
    p6: { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101', time: '12:00–12:40' },
    p7: { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210', time: '01:20–02:00' },
    p8: { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108', time: '02:00–02:40' },
    p9: { code: 'DEAR', title: 'Drop Everything And Read (Independent Literacy)', teacher: 'Daniel Moore', room: 'Library', time: '02:40–03:20' },
  },
  Thursday: {
    p1: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '08:30–09:10' },
    p2: { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103', time: '09:10–09:50' },
    p3: { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102', time: '10:00–10:40' },
    p4: { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108', time: '10:40–11:20' },
    p5: { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101', time: '11:20–12:00' },
    p6: { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210', time: '12:00–12:40' },
    p7: { code: 'TOK', title: 'Theory of Knowledge (TOK Core)', teacher: 'Marcus Vance', room: 'Lecture Hall 2', time: '01:20–02:00' },
    p8: { code: 'PE', title: 'Physical Education & Well-being', teacher: 'Coach Ryan', room: 'Sports Complex', time: '02:00–02:40' },
    p9: { code: 'PE', title: 'Physical Education & Well-being', teacher: 'Coach Ryan', room: 'Sports Complex', time: '02:40–03:20' },
  },
  Friday: {
    p1: { code: 'C3', title: 'Math AA', teacher: 'Mr. Pramod', room: 'Room 204', time: '08:30–09:10' },
    p2: { code: 'C4', title: 'Physics', teacher: 'Ms. Shalaba', room: 'Lab 101', time: '09:10–09:50' },
    p3: { code: 'C5', title: 'Digital Society', teacher: 'Mr. Rishikesh', room: 'Lab 102', time: '10:00–10:40' },
    p4: { code: 'C6', title: 'Chemistry', teacher: 'Dr. Mallu', room: 'Lab 103', time: '10:40–11:20' },
    p5: { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210', time: '11:20–12:00' },
    p6: { code: 'C2', title: 'French B', teacher: 'Ms. Brindha', room: 'Room 210', time: '12:00–12:40' },
    p7: { code: 'C1', title: 'English', teacher: 'Dr. Rajesh Vasudevan & Ms. Sangeetha', room: 'Room 108', time: '01:20–02:00' },
    p8: { code: 'EE', title: 'Extended Essay (EE Workshop & Supervision)', teacher: 'Dr. Sarah Mitchell', room: 'Resource Hub', time: '02:00–02:40' },
    p9: { code: 'CAS', title: 'Creativity, Activity, Service (CAS Project)', teacher: 'Sarah Jenkins', room: 'CAS Hub', time: '02:40–03:20' },
  },
};

export const TIMETABLE_LEGEND = [
  { code: 'C1', name: 'C1 · English (Dr. Rajesh Vasudevan & Ms. Sangeetha)', bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  { code: 'C2', name: 'C2 · French B (Ms. Brindha)', bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  { code: 'C3', name: 'C3 · Math AA (Mr. Pramod)', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  { code: 'C4', name: 'C4 · Physics (Ms. Shalaba)', bg: '#cbd5e1', text: '#1e293b', border: '#94a3b8' },
  { code: 'C5', name: 'C5 · Digital Society (Mr. Rishikesh)', bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
  { code: 'C6', name: 'C6 · Chemistry (Dr. Mallu)', bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  { code: 'TOK', name: 'TOK · Theory of Knowledge', bg: '#701a75', text: '#ffffff', border: '#581c87' },
  { code: 'EE', name: 'EE · Extended Essay', bg: '#c2410c', text: '#ffffff', border: '#9a3412' },
  { code: 'CAS', name: 'CAS · Creativity, Activity, Service', bg: '#16a34a', text: '#ffffff', border: '#15803d' },
  { code: 'PE', name: 'PE · Physical Education', bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },
  { code: 'DEAR', name: 'DEAR · Drop Everything & Read', bg: '#ffffff', text: '#334155', border: '#cbd5e1' },
];

export function getTimetableFromWorkspace(rows: any[]): TimetableGrid {
  if (!Array.isArray(rows)) {
    return JSON.parse(JSON.stringify(DEFAULT_DP2_GRID));
  }

  // 1. Check for complete timetable_matrix record
  const matrixRecord = rows.find((r) => r && r.kind === 'timetable_matrix' && r.data?.grid);
  const grid: TimetableGrid = matrixRecord?.data?.grid
    ? JSON.parse(JSON.stringify(matrixRecord.data.grid))
    : JSON.parse(JSON.stringify(DEFAULT_DP2_GRID));

  // 2. Check for individual slot overrides
  rows.forEach((r) => {
    if (r && r.kind === 'timetable_override' && r.data?.day && r.data?.periodKey && r.data?.slot) {
      if (!grid[r.data.day]) grid[r.data.day] = {};
      grid[r.data.day][r.data.periodKey] = {
        ...r.data.slot,
        isCustomized: true,
      };
    }
  });

  return grid;
}

export function getCellClass(code: string): string {
  switch (code) {
    case 'C1': return 'dp2-cell-c1';
    case 'C2': return 'dp2-cell-c2';
    case 'C3': return 'dp2-cell-c3';
    case 'C4': return 'dp2-cell-c4';
    case 'C5': return 'dp2-cell-c5';
    case 'C6': return 'dp2-cell-c6';
    case 'TOK': return 'dp2-cell-tok';
    case 'PE': return 'dp2-cell-pe';
    case 'EE': return 'dp2-cell-ee';
    case 'CAS': return 'dp2-cell-cas';
    case 'DEAR': return 'dp2-cell-dear';
    default: return '';
  }
}
