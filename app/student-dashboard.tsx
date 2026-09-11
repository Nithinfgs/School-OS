'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  Bell,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  LogOut,
  Users,
  Wrench,
  Plus,
  Search,
  Cpu,
  Microscope,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Atom,
  HeartPulse,
  UtensilsCrossed,
  FileText,
  Megaphone,
  Building2,
  LayoutGrid,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TeachingSelect } from './teacher-dashboard';
import { ClassHistory, ClassLogDetail } from './class-logs';
import { MessageThread } from './message-thread';
import { ChatRoomView } from './chat-room';
import { ChatModal } from './chat-modal';
import { localDate, scheduleFor, submissionState } from '@/lib/teaching';
import {
  studentSections,
  personalEvents,
  personalNotifications,
} from '@/lib/student';
import { navigateWebsite, webSlug } from '@/lib/web-navigation';
import { AppleCalendarView } from '@/app/components/apple-calendar-view';
import { LabAssistantWorkspace } from './lab-assistant/LabAssistantWorkspace';
import { LegalFooter } from './components/legal-footer';

const labels: any = {
  assignment: 'Assignment',
  submission: 'Your work',
  classLog: 'Lesson',
  attendance: 'Attendance',
  request: 'Request',
  loan: 'Library loan',
  project: 'Project',
  cas: 'CAS',
  announcement: 'Announcement',
  message: 'Message',
  resource: 'Resource',
  exam: 'Exam',
};
function Links({ data }: any) {
  return (
    <div className="student-links">
      {[...(data.attachments || []), ...(data.studentAttachments || [])].map(
        (f: any) => (
          <a
            className="resource-link"
            key={f.id}
            href={'/api/files?id=' + encodeURIComponent(f.id)}
          >
            {f.name} ↗
          </a>
        ),
      )}
      {(data.resources || []).map((x: any, i: number) => {
        const url = typeof x === 'string' ? x : x.url;
        return /^(https?:\/\/|\/api\/files\?)/.test(url || '') ? (
          <a
            className="resource-link"
            target="_blank"
            rel="noreferrer"
            key={i}
            href={url}
          >
            {typeof x === 'string' ? x : x.name || url} ↗
          </a>
        ) : null;
      })}
    </div>
  );
}
function List({ rows, open, empty = 'Nothing here yet.', meta }: any) {
  return rows.length ? (
    <div className="teacher-entry-list">
      {rows.map((r: any) => (
        <button
          className="master-related"
          key={r.eventId || r.id}
          onClick={() => open(r)}
        >
          <span>
            <b>{r.name}</b>
            <small>
              {meta
                ? meta(r)
                : [
                    labels[r.kind] || r.kind,
                    r.data.class,
                    r.data.status,
                    r.data.dueAt || r.data.date,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
            </small>
          </span>
          <ArrowUpRight size={16} />
        </button>
      ))}
    </div>
  ) : (
    <p className="teacher-empty">{empty}</p>
  );
}
function Details({ row }: any) {
  return (
    <>
      <dl className="student-details">
        {Object.entries(row.data)
          .filter(
            ([k, v]) =>
              v != null &&
              v !== '' &&
              ![
                'attachments',
                'resources',
                'studentAttachments',
                'results',
                'milestoneList',
                'participants',
                'studentIds',
                'createdBy',
                'createdAt',
              ].includes(k) &&
              !k.endsWith('Id') &&
              typeof v !== 'object',
          )
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k.replace(/([A-Z])/g, ' $1')}</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
      </dl>
      <Links data={row.data} />
      {row.data.results?.map((x: any, i: number) => (
        <p className="detail-note" key={i}>
          Your result: <b>{x.mark}%</b> {x.feedback}
        </p>
      ))}
      {row.data.milestoneList?.map((m: any, i: number) => (
        <p className="detail-note" key={i}>
          {m.completed ? '✓' : '○'} {m.title} · {m.dueAt || 'No deadline'}
        </p>
      ))}
    </>
  );
}

export function DP2TimetableMatrix() {
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const days = [
    { name: 'Monday', short: 'Mon' },
    { name: 'Tuesday', short: 'Tue' },
    { name: 'Wednesday', short: 'Wed' },
    { name: 'Thursday', short: 'Thu' },
    { name: 'Friday', short: 'Fri' },
  ];

  const gridData: Record<
    string,
    Record<
      string,
      { code: string; title: string; teacher: string; room: string; time: string }
    >
  > = {
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

  const getCellClass = (code: string) => {
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
  };

  const legend = [
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

  return (
    <div className="dp2-timetable-wrapper">
      <div className="dp2-timetable-card">
        <div className="dp2-timetable-header-bar">
          <div className="dp2-timetable-title-group">
            <h2 className="dp2-timetable-main-title">DP2 Timetable 2026–27</h2>
            <p className="dp2-timetable-subtitle">
              Student: <b>Nithin Selvaraj</b> · Grade: <b>DP-2 (Grade 12)</b> · Academic Year 2026–2027
            </p>
          </div>
          <span className="dp2-timetable-pill-badge">
            <Clock size={13} className="inline mr-1" /> Term 1 Active
          </span>
        </div>

        <div className="dp2-table-responsive-container">
          <table className="dp2-timetable-grid-table">
            <thead>
              <tr className="dp2-header-row-numbers">
                <th rowSpan={2} className="dp2-th-corner">
                  <span className="dp2-th-corner-text">Day \ Period</span>
                </th>
                <th className="dp2-th-period">1</th>
                <th className="dp2-th-period">2</th>
                <th rowSpan={2} className="dp2-th-break-time">
                  <div>09:50</div>
                  <div>–</div>
                  <div>10:00</div>
                </th>
                <th className="dp2-th-period">3</th>
                <th className="dp2-th-period">4</th>
                <th className="dp2-th-period">5</th>
                <th className="dp2-th-period">6</th>
                <th rowSpan={2} className="dp2-th-break-time">
                  <div>12:40</div>
                  <div>–</div>
                  <div>01:20</div>
                </th>
                <th className="dp2-th-period">7</th>
                <th className="dp2-th-period">8</th>
                <th className="dp2-th-period">9</th>
              </tr>
              <tr className="dp2-header-row-times">
                <th className="dp2-th-time">08:30–09:10</th>
                <th className="dp2-th-time">09:10–09:50</th>
                <th className="dp2-th-time">10:00–10:40</th>
                <th className="dp2-th-time">10:40–11:20</th>
                <th className="dp2-th-time">11:20–12:00</th>
                <th className="dp2-th-time">12:00–12:40</th>
                <th className="dp2-th-time">01:20–02:00</th>
                <th className="dp2-th-time">02:00–02:40</th>
                <th className="dp2-th-time">02:40–03:20</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, dayIndex) => {
                const daySchedule = gridData[d.name];
                return (
                  <tr key={d.name} className="dp2-data-row">
                    <td className="dp2-day-cell">
                      <b>{d.name}</b>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p1.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p1, day: d.name, period: 'Period 1' })}
                      >
                        {daySchedule.p1.code}
                      </button>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p2.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p2, day: d.name, period: 'Period 2' })}
                      >
                        {daySchedule.p2.code}
                      </button>
                    </td>

                    {/* Short break: Render with rowSpan=5 on the first day */}
                    {dayIndex === 0 && (
                      <td rowSpan={5} className="dp2-th-break-title">
                        <div className="dp2-break-label-vertical">SHORT BREAK</div>
                      </td>
                    )}

                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p3.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p3, day: d.name, period: 'Period 3' })}
                      >
                        {daySchedule.p3.code}
                      </button>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p4.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p4, day: d.name, period: 'Period 4' })}
                      >
                        {daySchedule.p4.code}
                      </button>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p5.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p5, day: d.name, period: 'Period 5' })}
                      >
                        {daySchedule.p5.code}
                      </button>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p6.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p6, day: d.name, period: 'Period 6' })}
                      >
                        {daySchedule.p6.code}
                      </button>
                    </td>

                    {/* Lunch break: Render with rowSpan=5 on the first day */}
                    {dayIndex === 0 && (
                      <td rowSpan={5} className="dp2-th-break-title">
                        <div className="dp2-break-label-vertical">LUNCH BREAK</div>
                      </td>
                    )}

                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p7.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p7, day: d.name, period: 'Period 7' })}
                      >
                        {daySchedule.p7.code}
                      </button>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p8.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p8, day: d.name, period: 'Period 8' })}
                      >
                        {daySchedule.p8.code}
                      </button>
                    </td>
                    <td className="dp2-cell-wrapper">
                      <button
                        type="button"
                        className={`dp2-cell-btn ${getCellClass(daySchedule.p9.code)}`}
                        onClick={() => setSelectedCell({ ...daySchedule.p9, day: d.name, period: 'Period 9' })}
                      >
                        {daySchedule.p9.code}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedCell && (
          <div className="dp2-cell-detail-popover">
            <div className="dp2-detail-card">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`dp2-badge-large ${getCellClass(selectedCell.code)}`}>
                  {selectedCell.code} · {selectedCell.title}
                </span>
                <Button size="sm" variant="ghost" onClick={() => setSelectedCell(null)}>
                  Close
                </Button>
              </div>
              <div className="dp2-detail-meta-grid">
                <div>
                  <small className="text-slate-500 block">Day & Time</small>
                  <b>{selectedCell.day} · {selectedCell.period} ({selectedCell.time})</b>
                </div>
                <div>
                  <small className="text-slate-500 block">Teacher</small>
                  <b>{selectedCell.teacher}</b>
                </div>
                <div>
                  <small className="text-slate-500 block">Room / Location</small>
                  <b>{selectedCell.room}</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="dp2-timetable-legend-section">
          <h4 className="dp2-legend-title">Subject & Course Mapping</h4>
          <div className="dp2-legend-grid">
            {legend.map((item) => (
              <div
                key={item.code}
                className="dp2-legend-chip"
                style={{ backgroundColor: item.bg, color: item.text, borderColor: item.border }}
              >
                <b>{item.code}</b>
                <span>{item.name.replace(`${item.code} · `, '')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard({ ws, page = 'Home' }: any) {
  const [section, setSection] = useState(
      page === 'Students' ? 'Profile' : page,
    ),
    [classId, setClassId] = useState(''),
    [classTab, setClassTab] = useState('Overview'),
    [selected, setSelected] = useState<any>(null),
    [form, setForm] = useState<any>(null),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState(''),
    [subject, setSubject] = useState(''),
    [day, setDay] = useState(localDate()),
    [calendarMode, setCalendarMode] = useState('Week'),
    [category, setCategory] = useState(''),
    [error, setError] = useState(''),
    [recordsTab, setRecordsTab] = useState<'Attendance' | 'Medical' | 'Cafeteria' | 'Documents'>('Attendance'),
    [documentsCategory, setDocumentsCategory] = useState<'All' | 'Academic' | 'Official' | 'Forms'>('All'),
    [academicsTab, setAcademicsTab] = useState<'assignments' | 'grades' | 'resources' | 'feedback' | 'exams'>('assignments'),
    [facilitiesTab, setFacilitiesTab] = useState<'Labs' | 'Library'>('Labs'),
    [casTab, setCasTab] = useState<'all' | 'cas' | 'projects'>('all'),
    [notificationsTab, setNotificationsTab] = useState<'all' | 'announcements' | 'alerts'>('all'),
    [markingAllRead, setMarkingAllRead] = useState(false),
    [timetableTab, setTimetableTab] = useState<'schedule' | 'grid'>('schedule'),
    [directoryQuery, setDirectoryQuery] = useState(''),
    [directoryDepartment, setDirectoryDepartment] = useState('All'),
    [homeTasksTab, setHomeTasksTab] = useState<'upcoming' | 'past' | 'overdue'>('upcoming'),
    [homeDate, setHomeDate] = useState(localDate());
  const stepHomeDate = (direction: -1 | 1) => {
    const d = new Date(homeDate + 'T12:00:00');
    d.setDate(d.getDate() + direction);
    setHomeDate(d.toLocaleDateString('en-CA'));
  };
  const assignmentOrigin = useRef<any>(null);
  const closingAssignment = useRef(false);
  const rows = ws.rows,
    own = ws.member.studentId,
    today = localDate(),
    classes = rows.filter((r: any) => r.kind === 'class'),
    cls = classes.find((r: any) => r.id === classId),
    profile = rows.find((r: any) => r.kind === 'student' && r.id === own),
    notifications = personalNotifications(rows, own),
    unread = notifications.filter((n) => !n.read).length;
  const of = (k: string) => rows.filter((r: any) => r.kind === k);
  const classKey = (value: any) =>
    String(value || '')
      .replace(/^mathematics\b/i, 'math')
      .replace(/\s+(HL|SL)$/i, '')
      .trim()
      .toLowerCase();
  const sameClass = (left: any, right: any) => classKey(left) === classKey(right);
  const documentCategory = (row: any) => {
    const category = String(row.data?.category || '').toLowerCase();
    if (category.includes('academic') || category.includes('curriculum') || category.includes('report')) return 'Academic';
    if (category.includes('form') || category.includes('template')) return 'Forms';
    return 'Official';
  };
  const downloadDocument = (row: any) => {
    const data = row.data || {};
    if (data.url || data.fileUrl) {
      window.open(data.url || data.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const body = `${row.name}\n\n${data.description || 'School-issued document'}\nIssued: ${data.date || 'Current'}\nCategory: ${documentCategory(row)}`;
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${row.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'school-document'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const classLabel = (value: any) => {
    const name = String(value || '');
    if (name === 'Physics') return 'Physics HL';
    if (name === 'Chemistry') return 'Chemistry HL';
    if (name === 'Math AA') return 'Mathematics AA HL';
    return name;
  };
  const directoryTeachers = (ws.contacts || [])
    .filter((contact: any) => {
      const role = String(contact.role || '').toLowerCase();
      return role === 'teacher' || role === 'department head' || role.includes('teacher');
    })
    .map((contact: any) => ({
      ...contact,
      directoryDepartment: contact.department || contact.section || 'Teaching staff',
      email: contact.email || '',
    }));
  const directoryDepartments = Array.from(
    new Set(directoryTeachers.map((teacher: any) => teacher.directoryDepartment).filter(Boolean)),
  ).sort((a: any, b: any) => String(a).localeCompare(String(b)));
  const visibleDirectoryTeachers = directoryTeachers.filter((teacher: any) => {
    const matchesDepartment = directoryDepartment === 'All' || teacher.directoryDepartment === directoryDepartment;
    const haystack = [teacher.name, teacher.email, teacher.directoryDepartment, ...(teacher.classes || [])]
      .join(' ')
      .toLowerCase();
    return matchesDepartment && haystack.includes(directoryQuery.trim().toLowerCase());
  });
  const homeContacts = [
    {
      name: 'Dr Rajalakshmi P A',
      role: 'Homeroom Advisor',
      email: 'rajalakshmi.pa@manchesters.in',
      phone: '9894983779',
    },
    {
      name: 'Ms. Sheeba S',
      role: 'DP Coordinator / Advisor',
      email: 'sheeba@manchesters.in',
      phone: '9894983779',
    },
    ...(classes
      .map((c: any) => ({
        name: c.data?.teacher,
        role: `${classLabel(c.name)} Teacher`,
        email: `${String(c.data?.teacher || '')
          .toLowerCase()
          .replace(/[^a-z]/g, '.')}@manchesters.in`,
        phone: c.data?.phone || '9894983779',
      }))
      .filter(
        (c: any) =>
          c.name && !['Dr Rajalakshmi P A', 'Ms. Sheeba S'].includes(c.name),
      )
      .slice(0, 2)),
  ];
  const route = (part: string, id?: string) => {
    navigateWebsite(
      '/student/' + part + (id ? '/' + encodeURIComponent(id) : ''),
    );
  };
  const go = (s: string) => {
    setQuery('');
    setFilter('');
    setSubject('');
    setCategory('');
    setClassId('');
    setSelected(null);
    setSection(s);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof window !== 'undefined') {
      const target = '/student/page/' + webSlug(s);
      if (location.pathname !== target) {
        history.pushState(null, '', target);
      }
    }
  };
  const open = (r: any) => {
    if (r.kind === 'assignment' && typeof window !== 'undefined') {
      const sidebar = document.querySelector<HTMLElement>(
        "[data-slot='sidebar-content']",
      );
      assignmentOrigin.current = {
        path: location.pathname + location.search + location.hash,
        section,
        classId,
        classTab,
        day,
        calendarMode,
        query,
        filter,
        subject,
        category,
        academicsTab,
        facilitiesTab,
        casTab,
        notificationsTab,
        recordsTab,
        timetableTab,
        scrollTop: window.scrollY,
        sidebarScrollTop: sidebar?.scrollTop ?? null,
      };
    }
    if (r.kind === 'class') {
      route('class', r.id);
      return;
    }
    route('record', r.id);
  };
  const closeAssignment = () => {
    if (closingAssignment.current) return;
    closingAssignment.current = true;
    
    // Find the class of the current assignment
    const currentClassName = selected?.data?.class;
    const currentClass = currentClassName
      ? classes.find((c: any) => sameClass(c.name, currentClassName))
      : null;

    setSelected(null);
    assignmentOrigin.current = null;

    if (currentClass) {
      setClassId(currentClass.id);
      setSubject(currentClass.name);
      setSection('Academics');
      setAcademicsTab('assignments');
      navigateWebsite('/student/class/' + encodeURIComponent(currentClass.id), true);
    } else {
      setClassId('');
      setSubject('');
      setSection('Academics');
      setAcademicsTab('assignments');
      navigateWebsite('/student/page/academics', true);
    }

    requestAnimationFrame(() => {
      closingAssignment.current = false;
    });
  };
  useLayoutEffect(() => {
    setSection(page === 'Students' ? 'Profile' : page);
    setQuery('');
    setFilter('');
    setSubject('');
  }, [page]);
  useEffect(() => {
    const read = () => {
      const [root, type, id] = location.pathname.slice(1).split('/');
      if (root !== 'student') return;
      const key = decodeURIComponent(id || '');
      if (type === 'page') {
        const rawKey = key.toLowerCase();
        let targetSection = studentSections.find((name) => webSlug(name) === rawKey);
        if (!targetSection) {
          if (rawKey === 'assignments') {
            targetSection = 'Academics';
            setAcademicsTab('assignments');
          } else if (rawKey === 'grades') {
            targetSection = 'Academics';
            setAcademicsTab('grades');
          } else if (rawKey === 'resources') {
            targetSection = 'Academics';
            setAcademicsTab('resources');
          } else if (rawKey === 'exams') {
            targetSection = 'Academics';
            setAcademicsTab('exams');
          } else if (rawKey === 'labs') {
            targetSection = 'Facilities';
            setFacilitiesTab('Labs');
          } else if (rawKey === 'library') {
            targetSection = 'Facilities';
            setFacilitiesTab('Library');
          } else if (rawKey === 'projects') {
            targetSection = 'CAS';
            setCasTab('projects');
          } else if (rawKey === 'announcements') {
            targetSection = 'Notifications';
            setNotificationsTab('announcements');
          } else if (rawKey === 'attendance') {
            targetSection = 'Records';
            setRecordsTab('Attendance');
          } else if (rawKey === 'medical') {
            targetSection = 'Records';
            setRecordsTab('Medical');
          } else if (rawKey === 'cafeteria') {
            targetSection = 'Records';
            setRecordsTab('Cafeteria');
          } else if (rawKey === 'documents') {
            targetSection = 'Records';
            setRecordsTab('Documents');
          } else if (rawKey === 'maintenance') {
            targetSection = 'Maintenance';
          }
        }
        setSection(targetSection || 'Home');
        setSelected(null);
        setClassId('');
      }
      if (type === 'class') {
        setClassId(key);
        setSection('Academics');
        setSelected(null);
      }
      if (type === 'record') {
        const row = rows.find((r: any) => r.id === key);
        if (row) {
          setSelected(row);
          if (row.kind === 'assignment' || row.data?.class) {
            const matchedClass = classes.find((c: any) => sameClass(c.name, row.data?.class));
            if (matchedClass) {
              setClassId(matchedClass.id);
              setSubject(matchedClass.name);
            }
            setSection('Academics');
          }
        }
      }
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, [rows]);
  const matched = (items: any[]) =>
    items.filter(
      (r) =>
        (!query ||
          JSON.stringify([r.name, r.data])
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!subject || sameClass(r.data.class, subject)) &&
        (!filter ||
          r.data.status === filter ||
          (r.kind === 'assignment' &&
            submissionState(r, own, rows).status === filter)),
    );
  const schedule = scheduleFor(rows, day);
  const upcoming = of('assignment')
    .filter(
      (a: any) =>
        !['Submitted', 'Late', 'Graded'].includes(
          submissionState(a, own, rows).status,
        ),
    )
    .sort((a: any, b: any) =>
      (a.data.dueAt || '').localeCompare(b.data.dueAt || ''),
    );
  const next = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today + 'T12:00');
    d.setDate(d.getDate() + i);
    return scheduleFor(rows, d.toLocaleDateString('en-CA')).map((r) => ({
      ...r,
      nextDate: d.toLocaleDateString('en-CA'),
    }));
  })
    .flat()
    .find(
      (r) =>
        new Date(r.nextDate + 'T' + (r.data.endTime || '23:59')) > new Date(),
    );
  const quick = (action: string, row?: any) =>
    setForm({
      action,
      row,
      classId:
        row?.data.classId ||
        classes.find((c: any) => c.name === row?.data.class)?.id ||
        classId ||
        classes[0]?.id,
    });
  const pane = (title: string, items: any[], empty?: string) => (
    <section className="teacher-panel">
      <h2>{title}</h2>
      <List rows={items} open={open} empty={empty} />
    </section>
  );
  const readNotification = async (n: any, value: boolean) => {
    try {
      await ws.act({
        student: true,
        action: 'read',
        sourceId: n.source.id,
        read: value,
      });
    } catch (e: any) {
      setError(e.message);
    }
  };
  const markAllNotificationsRead = async () => {
    const unreadList = notifications.filter((n) => !n.read);
    if (!unreadList.length || markingAllRead) return;
    setMarkingAllRead(true);
    try {
      await Promise.all(
        unreadList.map((n) =>
          ws.act({
            student: true,
            action: 'read',
            sourceId: n.source.id,
            read: true,
          }),
        ),
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setMarkingAllRead(false);
    }
  };
  const timetable = (date: string, compact = false) => {
    const scheduledItems = scheduleFor(rows, date);
    const items = compact
      ? scheduledItems
          .reduce((grouped: any[], item: any) => {
            const previous = grouped[grouped.length - 1];
            if (previous && previous.data.class === item.data.class && previous.data.endTime === item.data.startTime) {
              previous.data = { ...previous.data, endTime: item.data.endTime };
              return grouped;
            }
            grouped.push({ ...item, data: { ...item.data } });
            return grouped;
          }, [])
          .slice(0, 4)
      : scheduledItems;
    return (
      <div className="student-day" suppressHydrationWarning>
        {items.length ? (
          items.map((r: any, i: number) => {
            const attendance = of('attendance').find(
              (a: any) =>
                a.data.class === r.data.class &&
                a.data.date === date &&
                (a.data.period === r.data.period || a.data.period === 'Daily'),
            );
            const log = of('classLog')
              .filter(
                (l: any) =>
                  l.data.class === r.data.class && l.data.date <= date,
              )
              .sort((a: any, b: any) =>
                b.data.date.localeCompare(a.data.date),
              )[0];
            const c = classes.find((c: any) => c.name === r.data.class);
            return (
              <article className={`student-lesson${compact ? ' student-lesson-compact' : ''}`} key={r.id}>
                <div className="student-lesson-time">
                  <b>{r.data.startTime}</b>
                  <small>{r.data.endTime}</small>
                  <span>{r.data.period}</span>
                </div>
                <div>
                  <button
                    className="student-title-link"
                    onClick={() => c && open(c)}
                  >
                    {classLabel(r.data.class)}
                  </button>
                  <p>
                    {r.data.substitution || r.data.teacher} · {r.data.room}
                  </p>
                  {r.data.substitution && (
                    <p className="student-attention">
                      Substitution: {r.data.substitution}
                    </p>
                  )}
                  {r.data.roomChange && (
                    <p className="student-attention">
                      Room change: {r.data.roomChange}
                    </p>
                  )}
                  {!compact && <span className="student-status">
                    {attendance?.data.status || 'Attendance not recorded'}
                  </span>}
                  {!compact && log && (
                    <button
                      className="student-lesson-log"
                      onClick={() => open(log)}
                    >
                      <b>{log.data.topic}</b>
                      <span>{log.data.contentCovered}</span>
                      {log.data.homework && (
                        <small>Homework · {log.data.homework}</small>
                      )}
                    </button>
                  )}
                  {!compact && i < items.length - 1 &&
                    r.data.endTime < items[i + 1].data.startTime && (
                      <small className="student-free">
                        Break / free time · {r.data.endTime}–
                        {items[i + 1].data.startTime}
                      </small>
                    )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="teacher-empty">No lessons scheduled for this day.</p>
        )}
      </div>
    );
  };
  let content: any;
  if (section === 'Home') {
    const allAssignments = of('assignment');
    const homeUpcomingTasks = allAssignments
      .filter(
        (a: any) =>
          !['Submitted', 'Graded'].includes(
            submissionState(a, own, rows).status,
          ) && (!a.data.dueAt || a.data.dueAt >= today),
      )
      .sort((a: any, b: any) =>
        (a.data.dueAt || '').localeCompare(b.data.dueAt || ''),
      );

    const homePastTasks = allAssignments
      .filter(
        (a: any) =>
          ['Submitted', 'Graded'].includes(
            submissionState(a, own, rows).status,
          ) ||
          (a.data.dueAt &&
            a.data.dueAt < today &&
            submissionState(a, own, rows).status !== 'Pending'),
      )
      .sort((a: any, b: any) =>
        (b.data.dueAt || '').localeCompare(a.data.dueAt || ''),
      );

    const homeOverdueTasks = allAssignments
      .filter(
        (a: any) =>
          a.data.dueAt &&
          a.data.dueAt < today &&
          !['Submitted', 'Graded'].includes(
            submissionState(a, own, rows).status,
          ),
      )
      .sort((a: any, b: any) =>
        (a.data.dueAt || '').localeCompare(b.data.dueAt || ''),
      );

    const homeCurrentTasks =
      homeTasksTab === 'upcoming'
        ? homeUpcomingTasks
        : homeTasksTab === 'past'
        ? homePastTasks
        : homeOverdueTasks;

    const homeDaySchedule = scheduleFor(rows, homeDate);

    const homeProjectDeadlines = [
      ...of('project'),
      ...of('cas').filter((r: any) => r.data?.status !== 'Approved'),
      ...of('exam').filter(
        (r: any) => (r.data.dueAt || r.data.date || '') >= today,
      ),
    ]
      .map((r: any) => ({
        id: r.id,
        title: r.name,
        category:
          r.data?.category ||
          (r.kind === 'cas'
            ? 'CAS'
            : r.kind === 'exam'
            ? 'Exam'
            : 'Project'),
        date: r.data?.dueAt || r.data?.deadline || r.data?.date || '',
        description: r.data?.description || r.data?.topic || '',
        raw: r,
      }))
      .filter((item) => item.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);

    content = (
      <div className="student-home-container" suppressHydrationWarning>
        {/* Top 3 Quick Action Chips */}
        <div className="student-quick-strip">
          <div
            className="student-quick-chip"
            onClick={() => go('Portfolio')}
          >
            <span className="chip-icon text-amber-600">
              <Briefcase size={18} />
            </span>
            <span>Portfolio</span>
            <span
              className="chip-plus"
              title="Add portfolio item"
              onClick={(e) => {
                e.stopPropagation();
                quick('portfolio');
              }}
            >
              +
            </span>
          </div>
          <div
            className="student-quick-chip"
            onClick={() => go('CAS')}
          >
            <span className="chip-icon text-blue-600">
              <GraduationCap size={18} />
            </span>
            <span>CAS</span>
            <span
              className="chip-plus"
              title="Add CAS experience"
              onClick={(e) => {
                e.stopPropagation();
                quick('portfolio');
              }}
            >
              +
            </span>
          </div>
          <div
            className="student-quick-chip"
            onClick={() => {
              go('CAS');
              setCasTab('projects');
            }}
          >
            <span className="chip-icon text-emerald-600">
              <FolderKanban size={18} />
            </span>
            <span>Projects</span>
            <span
              className="chip-plus"
              title="Add project proposal"
              onClick={(e) => {
                e.stopPropagation();
                quick('request');
              }}
            >
              +
            </span>
          </div>
        </div>

        {/* 3-Column Middle Bento Grid */}
        <div className="student-bento-grid">
          {/* Card 1: Daily Calendar */}
          <section className="student-bento-card">
            <div className="student-bento-header">
              <h2>Daily Calendar</h2>
              <button
                type="button"
                className="action-btn"
                onClick={() => go('Today')}
              >
                View All
              </button>
            </div>
            <div className="student-date-nav">
              <button
                type="button"
                className="arrow-btn"
                aria-label="Previous day"
                onClick={() => stepHomeDate(-1)}
              >
                <ChevronLeft size={16} />
              </button>
              <label className="date-display">
                <span>
                  {new Date(homeDate + 'T12:00:00').toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <CalendarIcon size={16} className="text-slate-400" />
                <input
                  type="date"
                  value={homeDate}
                  onChange={(e) => e.target.value && setHomeDate(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="arrow-btn"
                aria-label="Next day"
                onClick={() => stepHomeDate(1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            {homeDaySchedule.length ? (
              <div className="space-y-2 mt-1">
                {homeDaySchedule.slice(0, 3).map((r: any) => {
                  const c = classes.find((c: any) => c.name === r.data.class);
                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100/90 transition-colors cursor-pointer"
                      onClick={() => c && open(c)}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>{r.data.startTime} – {r.data.endTime}</span>
                        <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-700">
                          {r.data.period}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {classLabel(r.data.class)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {r.data.room} · {r.data.substitution || r.data.teacher}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="student-empty-card">
                <div className="empty-illustration text-slate-300">
                  <CalendarDays size={36} />
                </div>
                <h4>No Events</h4>
                <p>There are no events yet.</p>
              </div>
            )}
          </section>

          {/* Card 2: Project Deadlines */}
          <section className="student-bento-card">
            <div className="student-bento-header">
              <h2>Project Deadlines</h2>
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  go('CAS');
                  setCasTab('projects');
                }}
              >
                View All
              </button>
            </div>
            {homeProjectDeadlines.length ? (
              <div className="space-y-2.5">
                {homeProjectDeadlines.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100/90 transition-colors cursor-pointer"
                    onClick={() => open(p.raw || p)}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                        {p.category}
                      </span>
                      <span className="text-slate-600 font-medium">{p.date || 'Pending'}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 truncate">
                      {p.title}
                    </div>
                    {p.description && (
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {p.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="student-empty-card">
                <div className="empty-illustration text-slate-300">
                  <ClipboardList size={36} />
                </div>
                <h4>No Upcoming Deadlines</h4>
                <p>You don't have any upcoming deadlines yet.</p>
              </div>
            )}
          </section>

          {/* Card 3: Key Contacts */}
          <section className="student-bento-card">
            <div className="student-bento-header">
              <h2>Key Contacts</h2>
              <button
                type="button"
                className="action-btn"
                onClick={() => quick('message')}
              >
                Message
              </button>
            </div>
            <div>
              {homeContacts.map((contact: any, i: number) => {
                const initials = contact.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'TR';
                return (
                  <div key={i} className="student-contact-row">
                    <div className="student-avatar-monogram">
                      {initials}
                    </div>
                    <div className="student-contact-info">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-role">{contact.role}</span>
                      <span className="contact-meta">
                        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </span>
                      {contact.phone && (
                        <span className="contact-meta">
                          Mobile Phone: <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom Full-Width Tasks & Deadlines Section */}
        <section className="student-tasks-card">
          <div className="student-tasks-header">
            <h2>Tasks & Deadlines</h2>
            <div className="student-segmented-tabs">
              <button
                type="button"
                className={homeTasksTab === 'upcoming' ? 'active' : ''}
                onClick={() => setHomeTasksTab('upcoming')}
              >
                Upcoming
                <span className="badge-count">{homeUpcomingTasks.length}</span>
              </button>
              <button
                type="button"
                className={homeTasksTab === 'past' ? 'active' : ''}
                onClick={() => setHomeTasksTab('past')}
              >
                Past
                <span className="badge-count">{homePastTasks.length}</span>
              </button>
              <button
                type="button"
                className={homeTasksTab === 'overdue' ? 'active' : ''}
                onClick={() => setHomeTasksTab('overdue')}
              >
                Overdue
                {homeOverdueTasks.length > 0 && (
                  <span className="badge-count overdue">{homeOverdueTasks.length}</span>
                )}
              </button>
            </div>
          </div>
          {homeCurrentTasks.length ? (
            <div className="space-y-2.5">
              {homeCurrentTasks.map((a: any) => {
                const state = submissionState(a, own, rows);
                const isPastDue = a.data.dueAt && a.data.dueAt < today;
                return (
                  <div
                    key={a.id}
                    className="student-task-item hover:shadow-xs transition-shadow cursor-pointer"
                    onClick={() => open(a)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap">
                        {classLabel(a.data.class)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">
                          {a.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {a.data.dueAt ? `Due ${a.data.dueAt}` : 'No due date'} · {a.data.type || 'Coursework'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          state.status === 'Submitted' || state.status === 'Graded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPastDue
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {state.status || (isPastDue ? 'Overdue' : 'Pending')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-semibold gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          open(a);
                        }}
                      >
                        {state.status === 'Submitted' ? 'View' : 'Open'}{' '}
                        <ArrowUpRight size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm">
              {homeTasksTab === 'overdue'
                ? 'No overdue tasks! You are all caught up.'
                : homeTasksTab === 'upcoming'
                ? 'No upcoming tasks scheduled.'
                : 'No past tasks recorded.'}
            </div>
          )}
        </section>
      </div>
    );
  }
  else if (section === 'Today')
    content = (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="sub-tabs-pill">
            <button
              className={timetableTab === 'schedule' ? 'bg-white shadow-sm font-bold' : ''}
              onClick={() => setTimetableTab('schedule')}
            >
              <Clock size={14} className="inline mr-1.5" />
              Daily Schedule View
            </button>
            <button
              className={timetableTab === 'grid' ? 'bg-white shadow-sm font-bold' : ''}
              onClick={() => setTimetableTab('grid')}
            >
              <LayoutGrid size={14} className="inline mr-1.5" />
              DP2 Timetable 2026–27 Matrix
            </button>
          </div>
          {timetableTab === 'schedule' && (
            <div className="teacher-toolbar" style={{ marginBottom: 0 }}>
              <Input
                aria-label="Timetable date"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
              <Button onClick={() => setDay(today)}>Today</Button>
              <Button variant="outline" onClick={() => go('Calendar')}>
                Week calendar
              </Button>
            </div>
          )}
        </div>
        {timetableTab === 'schedule' ? timetable(day) : <DP2TimetableMatrix />}
      </>
    );
  else if (['Classes', 'Academics', 'Assignments', 'Grades', 'Resources'].includes(section)) {
    if (cls) {
      const classAssignments = of('assignment').filter((a: any) =>
        sameClass(a.data.class, cls.name),
      );
      const classResources = of('resource').filter((r: any) =>
        sameClass(r.data.class, cls.name),
      );
      const classGrades = of('submission').filter(
        (r: any) =>
          sameClass(r.data.class, cls.name) && r.data.returned === true,
      );
      const classExams = of('exam').filter((e: any) =>
        sameClass(e.data.class, cls.name),
      );

      const filteredAssignments = classAssignments
        .filter(
          (a: any) =>
            !filter || submissionState(a, own, rows).status === filter,
        )
        .sort((a: any, b: any) =>
          (a.data.dueAt || '').localeCompare(b.data.dueAt || ''),
        );

      const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'graded':
            return {
              label: 'Graded',
              className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            };
          case 'submitted':
            return {
              label: 'Submitted',
              className: 'bg-blue-50 text-blue-700 border-blue-200',
            };
          case 'inprogress':
            return {
              label: 'In Progress',
              className: 'bg-amber-50 text-amber-700 border-amber-200',
            };
          case 'late':
            return {
              label: 'Late',
              className: 'bg-rose-50 text-rose-700 border-rose-200',
            };
          default:
            return {
              label: status || 'To Do',
              className: 'bg-slate-100 text-slate-600 border-slate-200',
            };
        }
      };

      const formatPrettyDate = (dateStr: string) => {
        if (!dateStr) return 'Date TBA';
        const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      };

      content = (
        <div className="space-y-6">
          {/* Header Bento Card (ManageBac Inspired) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-lg shadow-2xs">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {classLabel(cls.name)}
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                      {cls.name.includes('HL') ? 'Higher Level (HL)' : cls.name.includes('SL') ? 'Standard Level (SL)' : 'Course'}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                      {cls.data.room || 'Room TBA'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Teacher: <b className="text-slate-700">{cls.data.teacher}</b></span>
                    <span>•</span>
                    <span>{classAssignments.length} active tasks</span>
                  </p>
                </div>
              </div>

              {/* Action Toolbar on Top Right */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 shadow-xs"
                  onClick={() => {
                    setClassId('');
                    setSubject('');
                  }}
                >
                  <ArrowLeft size={14} /> All Subjects
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 shadow-xs"
                  onClick={() => go('Calendar')}
                >
                  <CalendarIcon size={14} /> Full Calendar
                </Button>
                <TeachingSelect
                  label="Switch Subject"
                  value={cls.name}
                  onChange={(name: any) => {
                    const targetCls = classes.find((c: any) => c.name === name);
                    if (targetCls) {
                      setClassId(targetCls.id);
                      setSubject(targetCls.name);
                    }
                  }}
                  options={classes.map((c: any) => ({
                    id: c.name,
                    name: classLabel(c.name),
                  }))}
                />
              </div>
            </div>

            {/* Sub-Tabs Pill Navigation Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-1.5">
              <button
                type="button"
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${academicsTab === 'assignments' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setAcademicsTab('assignments')}
              >
                Tasks & Assignments ({classAssignments.length})
              </button>
              <button
                type="button"
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${academicsTab === 'grades' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setAcademicsTab('grades')}
              >
                Grades & Feedback
              </button>
              <button
                type="button"
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${academicsTab === 'resources' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setAcademicsTab('resources')}
              >
                Files & Resources ({classResources.length})
              </button>
              <button
                type="button"
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${academicsTab === 'exams' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setAcademicsTab('exams')}
              >
                Exams ({classExams.length})
              </button>
            </div>
          </div>

          {/* Tab Content Section in Defined Bento Container */}
          {academicsTab === 'assignments' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Tasks & Deadlines
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Coursework, lab reports, investigations, and summative assessments.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <TeachingSelect
                    label="Status Filter"
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { id: '', name: 'All Statuses' },
                      'NotStarted',
                      'InProgress',
                      'Submitted',
                      'Late',
                      'Graded',
                    ]}
                  />
                </div>
              </div>

              {/* Defined Boxed Cards List */}
              {filteredAssignments.length > 0 ? (
                <div className="space-y-3">
                  {filteredAssignments.map((a: any) => {
                    const state = submissionState(a, own, rows).status;
                    const badge = getStatusBadge(state);
                    const teacherInitial = (cls.data.teacher || 'T')
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('');

                    return (
                      <div
                        key={a.id}
                        onClick={() => open(a)}
                        className="bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:border-primary/40 group-hover:text-primary transition-all shrink-0 shadow-2xs">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {a.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                              <span>{cls.data.teacher}</span>
                              <span>•</span>
                              <span>Due {formatPrettyDate(a.data.dueAt)}</span>
                              {a.data.type && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{a.data.type}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-slate-200/80 border border-slate-300/80 text-[11px] font-bold text-slate-600 flex items-center justify-center">
                            {teacherInitial}
                          </div>
                          <ArrowUpRight
                            size={16}
                            className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <ClipboardList size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No tasks found</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filter ? `No ${filter} tasks for this subject.` : 'No active assignments assigned yet.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grades View in Defined Bento Container */}
          {academicsTab === 'grades' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Published Results & Marks
              </h2>
              {classGrades.length > 0 || classExams.length > 0 ? (
                <div className="space-y-3">
                  {[...classGrades, ...classExams].map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => open(item)}
                      className="bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.data.feedback || 'Teacher evaluated'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-slate-900 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.kind === 'exam' ? `${item.data.results?.[0]?.mark || '—'}%` : `${item.data.grade ?? '—'} pts`}
                        </span>
                        <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No published grades or exam marks yet.</p>
              )}
            </div>
          )}

          {/* Resources View in Defined Bento Container */}
          {academicsTab === 'resources' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Course Materials & Files
              </h2>
              {classResources.length > 0 ? (
                <div className="space-y-3">
                  {classResources.map((res: any) => (
                    <div
                      key={res.id}
                      onClick={() => open(res)}
                      className="bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {res.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {res.data.category || 'Course File'} • {formatPrettyDate(res.data.date)}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No resources or files uploaded for this course yet.</p>
              )}
            </div>
          )}

          {/* Exams View in Defined Bento Container */}
          {academicsTab === 'exams' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Scheduled Exams & Assessments
              </h2>
              {classExams.length > 0 ? (
                <div className="space-y-3">
                  {classExams.map((exam: any) => (
                    <div
                      key={exam.id}
                      onClick={() => open(exam)}
                      className="bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-600 shrink-0">
                          <CalendarCheck size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {exam.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Exam Date: {formatPrettyDate(exam.data.date || exam.data.dueAt)}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">No scheduled exams for this subject.</p>
              )}
            </div>
          )}
        </div>
      );
    } else {
      content = (
        <div className="space-y-6">
          {/* Subject Cards Grid (Image 1) */}
          <div className="student-catalog grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c: any) => {
              const count = of('assignment').filter((a: any) =>
                sameClass(a.data.class, c.name),
              ).length;
              return (
                <button
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all text-left group flex flex-col justify-between h-[200px] cursor-pointer"
                  onClick={() => {
                    setClassId(c.id);
                    setSubject(c.name);
                  }}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {classLabel(c.name)}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{c.data.teacher}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400">
                      {c.data.room} · {count} {count === 1 ? 'assignment' : 'assignments'}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }
  } else if (section === 'Calendar') {
    content = (
      <AppleCalendarView
        ws={ws}
        initialDate={day || '2026-09-07'}
        onOpenClass={open}
      />
    );
  } else if (section === 'Facilities' && facilitiesTab === 'Labs') {
    content = <LabAssistantWorkspace member={ws.member} />;
  } else if (['Facilities', 'Labs', 'Library'].includes(section)) {
    const lab = facilitiesTab === 'Labs',
      items = of(lab ? 'inventory' : 'book');
    content = (
      <>
        <div
          className="teacher-toolbar"
          style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}
        >
          <div
            className="sub-tabs-pill"
            style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              background: 'var(--muted, #f1f5f9)',
              borderRadius: '8px',
            }}
          >
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${facilitiesTab === 'Labs' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => {
                navigateWebsite('/labs');
              }}
            >
              <FlaskConical size={14} />
              <span>Science & Tech Labs</span>
            </button>
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${facilitiesTab === 'Library' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => {
                navigateWebsite('/library');
              }}
            >
              <BookOpen size={14} />
              <span>Library Catalog ({of('book').length})</span>
            </button>
          </div>
          <TeachingSelect
            label={lab ? 'Lab' : 'Subject'}
            value={subject}
            onChange={setSubject}
            options={[
              { id: '', name: 'All' },
              ...Array.from(
                new Set<string>(
                  items
                    .map((r: any) => r.data[lab ? 'lab' : 'subject'])
                    .filter(Boolean),
                ),
              ),
            ]}
          />
          <TeachingSelect
            label="Availability"
            value={filter}
            onChange={setFilter}
            options={[{ id: '', name: 'All' }, 'Available', 'Unavailable']}
          />
          <TeachingSelect
            label={lab ? 'Category' : 'Author'}
            value={category}
            onChange={setCategory}
            options={[
              { id: '', name: 'All' },
              ...Array.from(
                new Set<string>(
                  items
                    .map((r: any) => r.data[lab ? 'category' : 'author'])
                    .filter(Boolean),
                ),
              ),
            ]}
          />
          <div style={{ marginLeft: 'auto' }}>
            <Button
              onClick={() =>
                quick('request', {
                  name: '',
                  kind: lab ? 'inventory' : 'book',
                  data: { lab: subject || 'Physics', unit: 'pcs' },
                })
              }
            >
              <Plus size={15} style={{ marginRight: '6px' }} />
              {lab ? 'Request custom lab item' : 'Request title'}
            </Button>
          </div>
        </div>
        <div className="student-catalog">
          {items
            .filter(
              (r: any) =>
                (!query ||
                  JSON.stringify([r.name, r.data])
                    .toLowerCase()
                    .includes(query.toLowerCase())) &&
                (!subject || r.data[lab ? 'lab' : 'subject'] === subject) &&
                (!category ||
                  r.data[lab ? 'category' : 'author'] === category) &&
                (!filter ||
                  (filter === 'Available' ? r.quantity > 0 : r.quantity < 1)),
            )
            .map((r: any) => {
              const isPhysics = r.data.lab === 'Physics';
              const isBio = r.data.lab === 'Biology';
              const isChem = r.data.lab === 'Chemistry';
              const iconBg = isPhysics
                ? '#f0f9ff'
                : isBio
                  ? '#f0fdf4'
                  : isChem
                    ? '#ecfdf5'
                    : '#f3f6f4';
              const iconColor = isPhysics
                ? '#0284c7'
                : isBio
                  ? '#16a34a'
                  : isChem
                    ? '#059669'
                    : '#66927a';

              return (
                <article className="teacher-panel student-item" key={r.id}>
                  {r.data.image || r.data.cover ? (
                    <img src={r.data.image || r.data.cover} alt={r.name} />
                  ) : (
                    <div
                      className="student-item-icon"
                      style={{ background: iconBg, color: iconColor }}
                    >
                      {lab ? (
                        isPhysics ? (
                          <Cpu size={36} />
                        ) : isBio ? (
                          <Microscope size={36} />
                        ) : (
                          <FlaskConical size={36} />
                        )
                      ) : (
                        <BookOpen size={36} />
                      )}
                    </div>
                  )}
                  <h3>
                    <button onClick={() => open(r)}>{r.name}</button>
                  </h3>
                  <p>
                    {lab
                      ? `${r.data.lab || 'Lab'}${r.data.category ? ' · ' + r.data.category : ''}`
                      : r.data.author}
                  </p>
                  <span className="student-status">
                    {r.quantity > 0
                      ? `${r.quantity} ${r.data.unit || 'copies'} available`
                      : lab
                        ? 'Out of stock'
                        : 'Waitlist available'}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => quick('request', r)}
                    disabled={r.data.requestable === false}
                  >
                    {!lab && r.quantity < 1 ? 'Join waitlist' : 'Request'}
                  </Button>
                </article>
              );
            })}
        </div>
        <div className="teacher-grid">
          {pane(
            lab ? 'My lab requests' : 'My library requests',
            of('request').filter(
              (r: any) => r.data.type === (lab ? 'lab' : 'library'),
            ),
          )}
          {pane(
            lab ? 'My usage history' : 'My books & borrowing history',
            of(lab ? 'labUsage' : 'loan'),
          )}
        </div>
      </>
    );
  } else if (['CAS', 'Projects'].includes(section)) {
    const casRows = of('cas');
    const projectRows = of('project');
    const combinedRows =
      casTab === 'cas'
        ? casRows
        : casTab === 'projects'
          ? projectRows
          : [...casRows, ...projectRows];
    const filteredRows = matched(combinedRows);

    const creativityCount = casRows.filter((r: any) =>
      String(r.data?.strand || '').toLowerCase().includes('creat'),
    ).length;
    const activityCount = casRows.filter((r: any) =>
      String(r.data?.strand || '').toLowerCase().includes('act'),
    ).length;
    const serviceCount = casRows.filter((r: any) =>
      String(r.data?.strand || '').toLowerCase().includes('serv'),
    ).length;

    content = (
      <div className="space-y-6">
        {/* Hero Banner Bento Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  IB Core Portfolio
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                CAS & Supervised Projects
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Log Creativity, Activity, and Service experiences, track learning outcomes, and manage supervisor reviews.
              </p>
            </div>
          </div>
          <Button
            className="bg-[#2D7F9F] hover:bg-[#236F91] text-white shrink-0 font-semibold text-xs gap-1.5 shadow-xs"
            onClick={() => quick('portfolio')}
          >
            <Plus size={15} /> Add CAS Experience
          </Button>
        </div>

        {/* 4-Stat Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Creativity</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">{creativityCount}</p>
            <span className="text-[11px] text-slate-400">Experiences logged</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Activity</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">{activityCount}</p>
            <span className="text-[11px] text-slate-400">Experiences logged</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Service</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">{serviceCount}</p>
            <span className="text-[11px] text-slate-400">Experiences logged</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Projects</span>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">{projectRows.length}</p>
            <span className="text-[11px] text-slate-400">Supervised projects</span>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div
            className="sub-tabs-pill inline-flex gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/60"
          >
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${casTab === 'all' ? 'bg-white shadow-xs text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCasTab('all')}
            >
              All Portfolio ({casRows.length + projectRows.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${casTab === 'cas' ? 'bg-white shadow-xs text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCasTab('cas')}
            >
              CAS Experiences ({casRows.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${casTab === 'projects' ? 'bg-white shadow-xs text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCasTab('projects')}
            >
              Supervised Projects ({projectRows.length})
            </button>
          </div>
        </div>

        {/* Portfolio Content or Elevated Empty State */}
        {filteredRows.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <List
              rows={filteredRows}
              open={open}
              meta={(r: any) =>
                r.kind === 'cas'
                  ? `CAS · ${r.data.strand || 'Creativity/Activity/Service'} · ${r.data.status || 'Active'}`
                  : `Project · ${r.data.supervisor || 'Supervisor'} · ${r.data.status || 'In Progress'}`
              }
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <FolderKanban size={22} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {casTab === 'cas'
                ? 'No CAS experiences logged yet'
                : casTab === 'projects'
                  ? 'No supervised projects assigned'
                  : 'No CAS or project records found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              {casTab === 'cas'
                ? 'Begin your CAS portfolio by adding your first reflection across Creativity, Activity, or Service.'
                : casTab === 'projects'
                  ? 'Your CAS coordinator or supervisor will assign major projects here.'
                  : 'Get started by creating your first portfolio entry or logging an experience.'}
            </p>
            {casTab !== 'projects' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold gap-1.5 border-slate-300 hover:bg-slate-50"
                onClick={() => quick('portfolio')}
              >
                <Plus size={14} /> Add CAS Experience
              </Button>
            )}
          </div>
        )}
      </div>
    );
  } else if (section === 'Messages')
    content = (
      <>
        <Button onClick={() => quick('message')}>Message a teacher</Button>
        <List
          rows={matched(of('message')).filter((r: any) => !r.data.threadId)}
          open={open}
        />
      </>
    );
  else if (['Notifications', 'Announcements'].includes(section)) {
    const announcements = of('announcement');
    content = (
      <>
        <div
          className="teacher-toolbar"
          style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div
              className="sub-tabs-pill"
              style={{
                display: 'flex',
                gap: '6px',
                padding: '4px',
                background: 'var(--muted, #f1f5f9)',
                borderRadius: '8px',
              }}
            >
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${notificationsTab === 'all' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setNotificationsTab('all')}
              >
                All Updates ({announcements.length + notifications.length})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${notificationsTab === 'announcements' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setNotificationsTab('announcements')}
              >
                School Announcements ({announcements.length})
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${notificationsTab === 'alerts' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setNotificationsTab('alerts')}
              >
                Personal Alerts ({unread} unread)
              </button>
            </div>
            {notificationsTab !== 'announcements' && (
              <TeachingSelect
                label="Read status"
                value={filter}
                onChange={setFilter}
                options={[{ id: '', name: 'All alerts' }, 'Unread', 'Read']}
              />
            )}
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={markingAllRead}
              className="text-xs font-semibold h-8 gap-1.5 rounded-lg border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all shadow-xs"
              onClick={markAllNotificationsRead}
            >
              {markingAllRead ? (
                <Loader2 size={13} className="animate-spin text-primary" />
              ) : (
                <CheckCheck size={14} className="text-primary" />
              )}
              <span>{markingAllRead ? 'Marking read...' : 'Mark all as read'}</span>
            </Button>
          )}
        </div>

        {(notificationsTab === 'all' || notificationsTab === 'announcements') &&
          announcements.length > 0 && (
            <div
              className="announcements-section"
              style={{ marginBottom: '24px' }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Megaphone size={16} />
                <span>School Announcements</span>
              </h2>
              <List
                rows={matched(announcements)}
                open={open}
                meta={(r: any) =>
                  `${r.data.author || 'School Office'} · ${r.data.date || 'Recent'} · ${r.data.audience || 'All students'}`
                }
              />
            </div>
          )}

        {(notificationsTab === 'all' || notificationsTab === 'alerts') && (
          <div className="personal-alerts-section">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Bell size={16} />
                <span>Personal Alerts & Notifications</span>
                {unread > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {unread} unread
                  </span>
                )}
              </h2>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={markingAllRead}
                  className="text-xs font-medium h-7 gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={markAllNotificationsRead}
                >
                  {markingAllRead ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCheck size={13} />
                  )}
                  <span>Mark all as read</span>
                </Button>
              )}
            </div>
            {notifications
              .filter(
                (n) =>
                  (!filter || (filter === 'Unread' ? !n.read : n.read)) &&
                  (!query ||
                    `${n.source.name} ${n.detail}`
                      .toLowerCase()
                      .includes(query.toLowerCase())),
              )
              .map((n) => (
                <article
                  className={
                    'student-notification ' + (!n.read ? 'unread' : '')
                  }
                  key={n.id}
                >
                  <button
                    onClick={() => {
                      open(n.source);
                      void readNotification(n, true);
                    }}
                  >
                    <b>{n.source.name}</b>
                    <span>{n.detail}</span>
                  </button>
                  <Button
                    variant="ghost"
                    onClick={() => readNotification(n, !n.read)}
                  >
                    {n.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                </article>
              ))}
          </div>
        )}
      </>
    );
  } else if (section === 'Directory')
    content = (
      <section className="teacher-panel student-directory" aria-labelledby="student-directory-title">
        <div className="teacher-panel-heading student-directory-heading">
          <div>
            <span className="eyebrow">STUDENT SERVICES</span>
            <h2 id="student-directory-title">School Directory</h2>
            <p className="student-directory-intro">Find a teacher’s school email by department or section.</p>
          </div>
          <Users size={22} aria-hidden="true" />
        </div>
        <div className="student-directory-toolbar">
          <label className="student-directory-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search teachers</span>
            <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder="Search by name or email" />
          </label>
          <label className="student-directory-filter">
            <span>Department / section</span>
            <select value={directoryDepartment} onChange={(event) => setDirectoryDepartment(event.target.value)}>
              <option value="All">All departments</option>
              {directoryDepartments.map((department: any) => (
                <option key={String(department)} value={String(department)}>{String(department)}</option>
              ))}
            </select>
          </label>
        </div>
        {visibleDirectoryTeachers.length ? (
          <div className="student-directory-grid">
            {visibleDirectoryTeachers.map((teacher: any) => (
              <article className="student-directory-card" key={teacher.id || teacher.email || teacher.name}>
                <div className="student-directory-avatar" aria-hidden="true">
                  {(teacher.name || 'T').split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="student-directory-card-body">
                  <h3>{teacher.name}</h3>
                  <span>{teacher.directoryDepartment}</span>
                  {teacher.email ? <a href={`mailto:${teacher.email}`} className="student-directory-email">{teacher.email}</a> : <small className="student-directory-unavailable">Email unavailable</small>}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="student-directory-empty">No teachers match your search.</p>}
      </section>
    );
  else if (section === 'Profile')
    content = (
      <>
        <div className="student-profile-account-bar">
          <div className="student-profile-account-info">
            <span className="avatar">
              {(profile?.name || ws.member.name || 'NS')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <b>{profile?.name || ws.member.name}</b>
              <small>
                Student · Grade DP-2 (Grade 12) ·{' '}
                {ws.member.email || 'nithin.selvaraj@schoolos.local'}
              </small>
            </div>
          </div>
          <div className="student-profile-account-actions">
            <span className="student-switch-label">Switch to:</span>
            <a
              href="/api/dev-login?role=teacher&return_to=/"
              className="student-role-switch-btn teacher"
            >
              <Users size={14} /> Teacher (Maya)
            </a>
            <a
              href="/api/dev-login?role=admin&return_to=/"
              className="student-role-switch-btn admin"
            >
              <Wrench size={14} /> Admin (Nithin)
            </a>
            <a
              href="/api/dev-login?role=clear&return_to=/"
              className="student-signout-btn"
              target="_top"
            >
              <LogOut size={14} /> Sign out
            </a>
          </div>
        </div>
        <section className="teacher-panel student-profile-overview">
          <div className="student-profile-overview-heading">
            <div>
              <span className="eyebrow">STUDENT PROFILE</span>
              <h2>{profile?.name || ws.member.name}</h2>
            </div>
            <button
              type="button"
              className="profile-maintenance-tab"
              onClick={() => document.getElementById('student-profile-maintenance')?.scrollIntoView({ behavior: 'instant', block: 'start' })}
            >
              Maintenance
            </button>
          </div>
          {profile && <Details row={profile} />}
          <div className="student-profile-metrics" aria-label="Profile metrics">
            <div>
              <span>Attendance</span>
              <strong>{profile?.data?.attendance == null ? '—' : `${profile.data.attendance}%`}</strong>
              <small>{profile?.data?.markedSessions ? `${profile.data.markedSessions} sessions marked` : 'No sessions recorded'}</small>
            </div>
            <div>
              <span>Academic average</span>
              <strong>{profile?.data?.average == null ? '—' : `${profile.data.average}%`}</strong>
              <small>{profile?.data?.gradedSubmissions ? `${profile.data.gradedSubmissions} graded submissions` : 'No graded work yet'}</small>
            </div>
            <div>
              <span>Enrolled classes</span>
              <strong>{profile?.data?.classes?.length || classes.length}</strong>
              <small>Current timetable</small>
            </div>
          </div>
        </section>
        <div className="teacher-grid">
          {pane('Recognition & visible records', of('record'))}
          {pane('Attendance', of('attendance').slice(-10))}
          {pane('Academic work', of('submission'))}
          {pane(
            'Library & labs',
            rows.filter((r: any) => ['loan', 'request'].includes(r.kind)),
          )}
          {pane(
            'Projects & CAS',
            rows.filter((r: any) => ['project', 'cas'].includes(r.kind)),
          )}
          <section className="teacher-panel" id="student-profile-maintenance">
            <div className="teacher-panel-heading">
              <h2>Maintenance</h2>
              <Button variant="outline" onClick={() => quick('maintenance')}>
                Report an issue
              </Button>
            </div>
            <List
              rows={of('maintenance')}
              open={open}
              empty="No maintenance reports yet."
            />
          </section>
        </div>
      </>
    );
  else if (section === 'Maintenance')
    content = (
      <>
        <Button onClick={() => quick('maintenance')}>Report an issue</Button>
        <List
          rows={matched(of('maintenance'))}
          open={open}
          empty="You have no maintenance reports."
        />
      </>
    );
  else if (section === 'Counselling') {
    const enabled = of('servicePolicy')[0]?.data.counsellingEnabled !== false;
    content = (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Pastoral & Counselling Support</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confidential pastoral care, mental wellbeing support, and academic guidance.
            </p>
          </div>
          {enabled ? (
            <Button
              className="bg-[#2D7F9F] hover:bg-[#236F91] text-white shrink-0 font-semibold text-xs"
              onClick={() => quick('counsellingRequest')}
            >
              <Plus size={15} className="mr-1.5" /> Request Appointment
            </Button>
          ) : (
            <span className="text-xs text-slate-500 italic">
              Online booking unavailable. Please visit the counselling suite.
            </span>
          )}
        </div>
        <div className="teacher-grid">
          {pane(
            'Your confidential appointment requests',
            of('counsellingRequest'),
            'No appointment requests submitted yet.',
          )}
          {pane(
            'Available counsellor appointment slots',
            of('appointmentSlot'),
            'No open counsellor slots scheduled for this week.',
          )}
        </div>
      </div>
    );
  } else if (section === 'Reports') {
    const reportKinds = new Set(['record', 'damageBrokenLog', 'transportNotice', 'attendance', 'labDamage', 'libraryDamage', 'activityEvent']);
    const reports = rows
      .filter((row: any) => {
        const data = row.data || {};
        const trackedStudent = data.studentId || data.relatedStudentId || data.metadata?.studentId;
        const recordType = String(data.recordType || data.eventType || '');
        const relevantKind = reportKinds.has(row.kind) || recordType.startsWith('ATTENDANCE_') || ['STUDENT_BEHAVIOUR', 'STUDENT_POSITIVE', 'DAMAGE_BROKEN_LOG', 'LIBRARY_DAMAGE', 'LAB_DAMAGE', 'TRANSPORT_NOTICE', 'LATE_ARRIVAL'].includes(recordType);
        return relevantKind && trackedStudent === own && data.visibility?.studentVisible !== false && data.studentVisible !== false && !data.visibility?.restricted;
      })
      .map((row: any) => {
        const data = row.data || {}; const type = data.recordType || data.eventType || row.kind;
        return {
          id: row.id, type: String(type).replace(/_/g, ' '), title: data.title || row.name || 'School report',
          dateTime: data.dateTime || data.occurredAt || data.date || data.createdAt || data.reportedAt || row.updatedAt,
          module: data.module || data.sourceModule || (row.kind === 'transportNotice' ? 'Transport' : row.kind === 'attendance' ? 'Classroom' : 'School'),
          status: data.status || 'Recorded', relatedItem: data.assetName || data.itemName || data.relatedItem,
          relatedClass: data.class || data.classId || data.relatedClass, description: data.description || data.whatHappened || data.metadata?.description || '',
          action: data.actionTaken || data.resolution || data.action || data.metadata?.actionTaken, reportedBy: data.reportedBy || data.createdByName,
        };
      })
      .filter((report: any) => !query.trim() || [report.type, report.title, report.module, report.status, report.relatedItem, report.relatedClass, report.description, report.action, report.reportedBy].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a: any, b: any) => String(b.dateTime || '').localeCompare(String(a.dateTime || '')));
    content = <section className="teacher-panel student-reports-panel">
      <div className="teacher-panel-heading"><div><span className="eyebrow">MY REPORTS</span><h2>Reports & history</h2><p>Only records your school has made visible to you are shown here.</p></div></div>
      <div className="student-reports-list">
        {reports.map((report: any) => <article key={report.id} className="student-report-card"><div className="student-report-top"><div><span className="student-report-type">{report.type}</span><h3>{report.title}</h3></div><span className="student-report-status">{report.status}</span></div><div className="student-report-meta">{report.module} · {report.dateTime ? new Date(report.dateTime).toLocaleString() : 'Date not recorded'}{report.relatedClass ? ` · ${report.relatedClass}` : ''}</div>{report.relatedItem && <p><b>Related item:</b> {report.relatedItem}</p>}{report.description && <p>{report.description}</p>}{report.action && <p><b>Action / status:</b> {report.action}</p>}{report.reportedBy && <p><b>Reported by:</b> {report.reportedBy}</p>}</article>)}
        {!reports.length && <p className="teacher-empty">No student-visible reports have been recorded.</p>}
      </div>
    </section>;
  } else if (
    [
      'Records',
      'Record',
      'Attendance',
      'Medical',
      'Cafeteria',
      'Documents',
    ].includes(section)
  ) {
    const attendance = of('attendance');
    const medicalRequests = of('medicalRequest');
    const meals = of('meal');
    const mealOrders = of('mealOrder');
    const documents = of('document');
    const medicalEnabled =
      of('servicePolicy')[0]?.data.medicalEnabled !== false;
    const preordersEnabled =
      of('servicePolicy')[0]?.data.preordersEnabled !== false;

    content = (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${recordsTab === 'Attendance' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setRecordsTab('Attendance')}
            >
              <CalendarCheck size={14} className={recordsTab === 'Attendance' ? 'text-emerald-600' : 'text-slate-500'} />
              <span>Attendance</span>
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${recordsTab === 'Medical' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setRecordsTab('Medical')}
            >
              <HeartPulse size={14} className={recordsTab === 'Medical' ? 'text-rose-600' : 'text-slate-500'} />
              <span>Medical</span>
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${recordsTab === 'Cafeteria' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setRecordsTab('Cafeteria')}
            >
              <UtensilsCrossed size={14} className={recordsTab === 'Cafeteria' ? 'text-amber-600' : 'text-slate-500'} />
              <span>Cafeteria</span>
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${recordsTab === 'Documents' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setRecordsTab('Documents')}
            >
              <FileText size={14} className={recordsTab === 'Documents' ? 'text-blue-600' : 'text-slate-500'} />
              <span>Documents</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {recordsTab === 'Attendance' && of('servicePolicy')[0]?.data.absenceRequests && (
              <Button onClick={() => quick('absenceRequest')} className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs">
                <Plus size={14} /> Request Absence / Excuse
              </Button>
            )}
            {recordsTab === 'Medical' && medicalEnabled && (
              <Button onClick={() => quick('medicalRequest')} className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs">
                <Plus size={14} /> Request Nurse Visit
              </Button>
            )}
            {recordsTab === 'Cafeteria' && preordersEnabled && (
              <Button onClick={() => quick('mealOrder')} className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs">
                <Plus size={14} /> Preorder Meal
              </Button>
            )}
          </div>
        </div>

        {recordsTab === 'Attendance' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Present', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', active: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/80', icon: CheckCircle2 },
                { label: 'Absent', color: 'text-rose-700 bg-rose-50 border-rose-200', active: 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/80', icon: CalendarCheck },
                { label: 'Late', color: 'text-amber-700 bg-amber-50 border-amber-200', active: 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/80', icon: Clock },
                { label: 'Excused', color: 'text-blue-700 bg-blue-50 border-blue-200', active: 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/80', icon: ClipboardList },
              ].map((s) => {
                const count = attendance.filter((r: any) => r.data.status === s.label).length;
                const isSelected = filter === s.label;
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setFilter(filter === s.label ? '' : s.label)}
                    className={`p-4 rounded-xl border text-left transition-all bg-white shadow-xs hover:border-slate-300 flex flex-col justify-between ${isSelected ? s.active : 'border-slate-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                      <div className={`p-1.5 rounded-lg border ${s.color}`}>
                        <Icon size={14} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <strong className="text-2xl font-bold tabular-nums text-slate-900">{count}</strong>
                      <span className="text-[11px] text-slate-400">sessions</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance History</h3>
                  <p className="text-xs text-slate-500">
                    {filter ? `Showing ${filter} records` : 'All logged class and homeroom attendance'}
                  </p>
                </div>
                {filter && (
                  <Button variant="ghost" size="sm" onClick={() => setFilter('')} className="h-7 text-xs text-slate-600 hover:text-slate-900">
                    Clear Filter
                  </Button>
                )}
              </div>
              <List
                rows={matched(attendance).sort((a: any, b: any) =>
                  b.data.date.localeCompare(a.data.date),
                )}
                open={open}
                meta={(r: any) =>
                  `${r.data.date} · ${r.data.class} · ${r.data.period || 'Daily'} · ${r.data.status}${r.data.arrivalTime ? ' · ' + r.data.arrivalTime : ''}`
                }
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              {pane(
                'Your submitted absence & excuse requests',
                of('absenceRequest'),
              )}
            </div>
          </div>
        )}

        {recordsTab === 'Medical' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                <HeartPulse size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Medical & Health Records</h3>
                <p className="text-xs text-slate-500">
                  Student health profile, nurse station visits, and medical incident history.
                </p>
              </div>
            </div>
            <List
              rows={medicalRequests}
              open={open}
              empty="No active medical requests or incident records."
              meta={(r: any) =>
                `Nurse Visit · ${r.data.status || 'Logged'} · ${r.data.createdAt || 'Record'}`
              }
            />
          </div>
        )}

        {recordsTab === 'Cafeteria' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                  <UtensilsCrossed size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dining Hall & Cafeteria</h3>
                  <p className="text-xs text-slate-500">
                    Daily dining hall menus, nutrition details, and dietary information.
                  </p>
                </div>
              </div>
              <List
                rows={matched(meals)}
                open={open}
                empty="No cafeteria meal items listed for today."
              />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              {pane('Your meal preorders', mealOrders)}
            </div>
          </div>
        )}

        {recordsTab === 'Documents' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">School Documents</h3>
                  <p className="text-xs text-slate-500">View and download documents and reports released to you.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="documents-category-tabs" role="tablist" aria-label="Document categories">
                {(['All', 'Academic', 'Official', 'Forms'] as const).map((category) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={documentsCategory === category}
                    className={documentsCategory === category ? 'active' : ''}
                    key={category}
                    onClick={() => setDocumentsCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const visibleDocuments = documents.filter((row: any) => {
                const matchesCategory = documentsCategory === 'All' || documentCategory(row) === documentsCategory;
                const matchesSearch = !query || JSON.stringify([row.name, row.data]).toLowerCase().includes(query.toLowerCase());
                return matchesCategory && matchesSearch;
              });
              return visibleDocuments.length ? (
                <div className="documents-grid">
                  {visibleDocuments.map((row: any) => (
                    <article className="document-card" key={row.id}>
                      <div className="document-card-icon"><FileText size={20} /></div>
                      <div className="document-card-body">
                        <span className="document-card-category">{documentCategory(row)}</span>
                        <h3>{row.name}</h3>
                        <p>{row.data?.description || 'School-issued document'}</p>
                        <small>Issued {row.data?.date || 'recently'}{row.data?.version ? ` · Version ${row.data.version}` : ''}</small>
                      </div>
                      <div className="document-card-actions">
                        <Button variant="outline" onClick={() => open(row)}>View</Button>
                        <Button onClick={() => downloadDocument(row)}>Download</Button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p className="student-directory-empty">No documents in this category.</p>;
            })()}
          </div>
        )}
      </div>
    );
  }
  else if (['Messages', 'Chat', 'Communication'].includes(section)) {
    content = <ChatRoomView ws={ws} />;
  } else {
    const kind = (
      {
        Resources: 'resource',
        Exams: 'exam',
        Announcements: 'announcement',
        Documents: 'document',
      } as any
    )[section];
    content = <List rows={matched(of(kind))} open={open} />;
  }
  return (
    <div className="student-dashboard" suppressHydrationWarning>
      <div className="page-heading">
        <div>
          <div className="eyebrow" suppressHydrationWarning>
            {section === 'Home'
              ? new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'MY SCHOOL DAY'}
          </div>
          <h1 suppressHydrationWarning>
            {section === 'Home'
              ? `Welcome, ${ws.member.name.split(' ')[0]}!`
              : section}
          </h1>
          <p suppressHydrationWarning>
            {section === 'Home'
              ? 'Your classes, project milestones, and upcoming tasks.'
              : new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {section === 'Home' && (
            <Button
              variant="outline"
              className="bg-white border-slate-200 shadow-xs text-xs font-semibold gap-1.5"
              onClick={() => go('Today')}
            >
              <SlidersHorizontal size={14} /> Customise Dashboard
            </Button>
          )}
          <Button variant="outline" onClick={() => go('Notifications')}>
            <Bell size={16} />
            {unread} unread
          </Button>
        </div>
      </div>
      <nav className="student-tabs" aria-label="Student sections">
        {studentSections.map((s) => (
          <button
            key={s}
            aria-current={section === s ? 'page' : undefined}
            onClick={() => go(s)}
          >
            {s}
          </button>
        ))}
      </nav>
      {(ws.error || error) && (
        <div className="error-banner" role="alert">
          {error || ws.error}
          <Button
            variant="ghost"
            onClick={() => {
              setError('');
              ws.refresh();
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {ws.message && (
        <p role="status" className="student-success">
          {ws.message}
        </p>
      )}
      {!['Home', 'Today', 'Calendar', 'Facilities', 'Labs', 'Library', 'CAS', 'Projects', 'Counselling', 'Directory', 'Messages', 'Chat', 'Communication', 'Records', 'Record', 'Attendance', 'Medical', 'Cafeteria', 'Documents'].includes(section) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <Input
            className="student-search max-w-md bg-white border-slate-200 shadow-xs text-xs"
            aria-label={'Search ' + section}
            placeholder={'Search ' + section.toLowerCase() + '…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}{' '}
      <div
        key={section + (classId || '')}
        className="student-content-view tab-pane-animated"
      >
        {ws.loading ? <p role="status">Loading your school day…</p> : content}
      </div>
      <LegalFooter className="mt-10" />
      <Sheet
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) {
            closeAssignment();
          }
        }}
      >
        <SheetContent
          className={
            selected?.kind === 'assignment'
              ? 'teacher-sheet teacher-sheet-centered'
              : 'teacher-sheet'
          }
          style={
            selected?.kind === 'assignment'
              ? {
                  width: 'min(680px, calc(100vw - 40px))',
                  maxWidth: '680px',
                }
              : undefined
          }
        >
          <SheetHeader
            className={
              selected?.kind === 'assignment'
                ? 'student-assignment-header'
                : undefined
            }
          >
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>
              {selected ? labels[selected.kind] || selected.kind : ''}
            </SheetDescription>
          </SheetHeader>
          {selected &&
            (selected.kind === 'assignment' ? (
              <StudentAssignment ws={ws} row={selected} />
            ) : selected.kind === 'classLog' ? (
              <ClassLogDetail row={selected} ws={ws} />
            ) : selected.kind === 'message' ? (
              <MessageThread row={selected} ws={ws} />
            ) : (
              <>
                <Details row={selected} />
                {['project', 'cas'].includes(selected.kind) && (
                  <Button onClick={() => quick('portfolio', selected)}>
                    Update work & evidence
                  </Button>
                )}
                {['inventory', 'book'].includes(selected.kind) &&
                  selected.data.requestable !== false && (
                    <Button onClick={() => quick('request', selected)}>
                      {selected.kind === 'book' && selected.quantity < 1
                        ? 'Join waitlist'
                        : 'Request item'}
                    </Button>
                  )}
                {selected.kind === 'meal' &&
                  of('servicePolicy')[0]?.data.preordersEnabled && (
                    <Button onClick={() => quick('mealOrder', selected)}>
                      Preorder meal
                    </Button>
                  )}
                {selected.kind === 'submission' && (
                  <Button
                    onClick={() => {
                      const a = rows.find(
                        (r: any) => r.id === selected.data.assignmentId,
                      );
                      if (a) open(a);
                    }}
                  >
                    Open assignment
                  </Button>
                )}
                {selected.kind === 'file' && (
                  <a
                    className="resource-link"
                    href={'/api/files?id=' + selected.id}
                  >
                    Download file
                  </a>
                )}
              </>
            ))}
        </SheetContent>
      </Sheet>
      {form && (
        <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
          {form.action === 'message' ? (
            <ChatModal
              ws={ws}
              form={form}
              role="student"
              close={() => setForm(null)}
            />
          ) : (
            <DialogContent className="teacher-dialog">
              <DialogHeader>
                <DialogTitle>
                  {
                    (
                      {
                        request: 'Request item',
                        portfolio: form.row
                          ? 'Update portfolio'
                          : 'New CAS experience',
                        maintenance: 'Report maintenance',
                        absenceRequest: 'Absence / excuse request',
                        counsellingRequest: 'Private counselling request',
                        medicalRequest: 'Medical visit request',
                        mealOrder: 'Preorder meal',
                      } as any
                    )[form.action]
                  }
                </DialogTitle>
                <DialogDescription>
                  {form.row?.name || 'Complete the details below.'}
                </DialogDescription>
              </DialogHeader>
              <StudentForm
                key={form.action + (form.row?.id || '')}
                ws={ws}
                form={form}
                close={() => setForm(null)}
              />
            </DialogContent>
          )}
        </Dialog>
      )}
    </div>
  );
}

function StudentAssignment({ ws, row }: any) {
  const current = ws.rows.find((r: any) => r.id === row.id) || row,
    { submission, status } = submissionState(
      current,
      ws.member.studentId,
      ws.rows,
    );
  const [text, setText] = useState(submission?.data.text || ''),
    [link, setLink] = useState(submission?.data.link || ''),
    [files, setFiles] = useState<any[]>(submission?.data.attachments || []),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const locked =
    current.data.submissionType === 'none' ||
    current.data.submissionsClosed ||
    (current.data.acceptUntil &&
      Date.parse(current.data.acceptUntil) < Date.now()) ||
    (current.data.allowLate === false &&
      Date.parse(current.data.dueAt) < Date.now()) ||
    (current.data.allowReplacement === false &&
      ['Submitted', 'Late', 'Graded'].includes(status));
  const dueAt = current.data.dueAt
    ? new Date(current.data.dueAt).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'No due date';
  const save = async (draft: boolean) => {
    setBusy(true);
    setError('');
    try {
      await ws.act({
        teaching: true,
        action: 'submitWork',
        assignmentId: row.id,
        version: submission?.version,
        text,
        link,
        attachments: files.map((f) => f.id),
        draft,
      });
      setNotice(
        draft
          ? 'Draft saved.'
          : `Submitted successfully at ${new Date().toLocaleString()}.`,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="teacher-form student-assignment-form">
      <p className="student-status">
        {status.replace(/([a-z])([A-Z])/g, '$1 $2')} · Due {dueAt}
      </p>
      <p className="log-text assignment-instructions">
        {current.data.instructions || current.data.description}
      </p>
      <p className="assignment-marks">
        Maximum marks{' '}
        <strong>{current.data.maximumMarks || current.data.maxMarks || '—'}</strong>
      </p>
      {current.data.rubric && (
        <div className="detail-note">
          <h3>Assessment criteria</h3>
          <p className="log-text">{current.data.rubric}</p>
        </div>
      )}
      <Links data={current.data} />
      {submission?.data.returned && (
        <div className="detail-note">
          <h3>Your returned work · {submission.data.grade} marks</h3>
          <p>{submission.data.feedback}</p>
        </div>
      )}
      {submission?.data.submittedAt && (
        <p>
          Last submitted:{' '}
          {new Date(submission.data.submittedAt).toLocaleString()}
        </p>
      )}
      {locked ? (
        <p className="teacher-empty">
          {current.data.submissionType === 'none'
            ? 'Complete this work as instructed; no online submission is required.'
            : 'Submissions are closed under the assignment policy.'}
        </p>
      ) : (
        <>
          <label className="field">
            Your response / working draft
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
          </label>
          {current.data.submissionType === 'link' && (
            <label className="field">
              Work link
              <Input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
              />
            </label>
          )}
          <StudentUpload
            ws={ws}
            classNameValue={current.data.class}
            files={files}
            setFiles={setFiles}
          />
          <div className="teacher-toolbar student-assignment-actions">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => save(true)}
            >
              Save draft
            </Button>
            <Button disabled={busy} onClick={() => save(false)}>
              {busy
                ? 'Saving…'
                : submission?.data.submittedAt
                  ? 'Replace submission'
                  : 'Submit work'}
            </Button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="student-success">
          {notice}
        </p>
      )}
    </section>
  );
}
function StudentUpload({ ws, classNameValue, files, setFiles }: any) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <div className="field">
      <span>Files / evidence · up to 10 MB each</span>
      <Input
        type="file"
        disabled={busy || !classNameValue}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError('');
          try {
            const body = new FormData();
            body.set('file', file);
            body.set('class', classNameValue);
            const res = await fetch('/api/files', { method: 'POST', body }),
              data: any = await res.json();
            if (!res.ok) throw Error(data.error);
            setFiles([...files, { id: data.id, name: data.name }]);
            await ws.refresh();
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
            e.target.value = '';
          }
        }}
      />
      {busy && <small role="status">Uploading…</small>}
      {files.map((f: any) => (
        <div className="teacher-toolbar" key={f.id}>
          <a href={'/api/files?id=' + f.id}>{f.name}</a>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setFiles(files.filter((x: any) => x.id !== f.id))}
          >
            Remove
          </Button>
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
function StudentForm({ ws, form, close }: any) {
  const old = form.row?.data || {},
    action = form.action,
    classes = ws.rows.filter((r: any) => r.kind === 'class');
  const [v, setV] = useState<any>({
      classId: form.classId || classes[0]?.id || '',
      name: form.row?.name || '',
      quantity: 1,
      purpose: '',
      desiredDate: localDate(),
      date: localDate(),
      notes: '',
      category: 'Facilities',
      location: '',
      description: old.description || '',
      urgency: 'Normal',
      reason: '',
      preferredTime: localDate() + 'T13:00',
      reasonCategory: 'General support',
      reflections: old.reflections || '',
      evidence: old.evidence || '',
      strands: old.strands || '',
      outcomes: old.outcomes || '',
      hours: old.hours || 0,
      studentNotes: old.studentNotes || '',
      recipientId: '',
      completedMilestones: (old.milestoneList || []).flatMap(
        (m: any, i: number) => (m.completed ? [i] : []),
      ),
    }),
    [files, setFiles] = useState<any[]>(old.studentAttachments || []),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const set = (k: string, value: any) =>
    setV((x: any) => ({ ...x, [k]: value }));
  const field = (k: string, label: string, type = 'text', required = false) => (
    <label className="field">
      {label}
      <Input
        type={type}
        required={required}
        value={v[k] ?? ''}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );
  const area = (k: string, label: string, required = false) => (
    <label className="field">
      {label}
      <Textarea
        required={required}
        value={v[k] ?? ''}
        onChange={(e) => set(k, e.target.value)}
      />
    </label>
  );
  const cls = classes.find((c: any) => c.id === v.classId);
  const save = async (submit: boolean) => {
    setBusy(true);
    setError('');
    try {
      await ws.act({
        student: true,
        action,
        ...v,
        id: form.row?.id,
        version: form.row?.version,
        kind: 'cas',
        attachments: files.map((f) => f.id),
        submit,
      });
      close();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      className="teacher-form"
      onSubmit={(e) => {
        e.preventDefault();
        void save(false);
      }}
    >
      {!['counsellingRequest', 'medicalRequest', 'mealOrder'].includes(
        action,
      ) && (
        <TeachingSelect
          label="Class"
          value={v.classId}
          onChange={(id: string) => {
            set('classId', id);
            set('recipientId', '');
          }}
          disabled={!!form.row && action === 'portfolio'}
          options={classes.map((c: any) => ({ id: c.id, name: c.name }))}
        />
      )}{' '}
      {action === 'request' && (
        <>
          {!form.row?.name && field('name', 'Item / equipment title', 'text', true)}
          {field('quantity', 'Quantity', 'number', true)}
          <label className="field">
            Purpose / experiment
            <Textarea
              required
              value={v.purpose ?? ''}
              onChange={(e) => set('purpose', e.target.value)}
              placeholder="e.g. Kinematics investigation, Titration experiment..."
            />
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '-4px', marginBottom: '8px' }}>
            {['Kinematics practical', 'Titration experiment', 'Microscopy research', 'Coursework investigation'].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => set('purpose', sug)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  color: '#334155'
                }}
              >
                + {sug}
              </button>
            ))}
          </div>
          {field('desiredDate', 'Desired date', 'date', true)}
          {area('notes', 'Notes / special requirements')}
          {cls && <p style={{ fontSize: '12px', color: '#64748b' }}>Assigned teacher: {cls.data.teacher}</p>}
        </>
      )}
      {action === 'maintenance' && (
        <>
          {field('name', 'Issue title', 'text', true)}
          {field('category', 'Category', 'text', true)}
          {field('location', 'Location', 'text', true)}
          {area('description', 'What needs attention?', true)}
          <TeachingSelect
            label="Urgency"
            value={v.urgency}
            onChange={(x: string) => set('urgency', x)}
            options={['Low', 'Normal', 'High']}
          />
          <StudentUpload
            ws={ws}
            classNameValue={cls?.name}
            files={files}
            setFiles={setFiles}
          />
        </>
      )}
      {action === 'absenceRequest' && (
        <>
          {field('date', 'Date', 'date', true)}
          {area('reason', 'Reason / explanation', true)}
          <StudentUpload
            ws={ws}
            classNameValue={cls?.name}
            files={files}
            setFiles={setFiles}
          />
        </>
      )}
      {['counsellingRequest', 'medicalRequest'].includes(action) && (
        <>
          {field(
            'preferredTime',
            'Preferred date & time',
            'datetime-local',
            true,
          )}
          {field('reasonCategory', 'Reason category')}
          {area('notes', 'Private notes')}
          <p>
            Your request is separate from your normal profile and teacher views.
          </p>
        </>
      )}
      {action === 'message' && (
        <>
          <TeachingSelect
            label="Teacher"
            value={v.recipientId}
            onChange={(x: string) => set('recipientId', x)}
            options={(ws.contacts || [])
              .filter((c: any) => c.classes.includes(cls?.name))
              .map((c: any) => ({ id: c.id, name: c.name }))}
          />
          {field('name', 'Subject', 'text', true)}
          {area('description', 'Message', true)}
          <StudentUpload
            ws={ws}
            classNameValue={cls?.name}
            files={files}
            setFiles={setFiles}
          />
        </>
      )}
      {action === 'portfolio' && (
        <>
          {!form.row && (
            <>
              {field('name', 'Experience title', 'text', true)}
              {area('description', 'Experience plan', true)}
            </>
          )}
          {field('strands', 'CAS strands (creativity, activity, service)')}
          {area('outcomes', 'Learning outcomes')}
          {field('hours', 'Hours', 'number')}
          {area('reflections', 'Reflections')}
          {area('evidence', 'Evidence / work summary')}
          {area('studentNotes', 'Notes for your supervisor')}
          {old.milestoneList?.map((m: any, i: number) => (
            <label className="student-check" key={i}>
              <input
                type="checkbox"
                checked={v.completedMilestones.includes(i)}
                onChange={(e) =>
                  set(
                    'completedMilestones',
                    e.target.checked
                      ? [...v.completedMilestones, i]
                      : v.completedMilestones.filter((n: number) => n !== i),
                  )
                }
              />
              {m.title} · {m.dueAt || 'No date'}
            </label>
          ))}
          <StudentUpload
            ws={ws}
            classNameValue={cls?.name}
            files={files}
            setFiles={setFiles}
          />
        </>
      )}
      {action === 'mealOrder' && area('notes', 'Order notes')}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <div className="teacher-toolbar">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : action === 'message' ? 'Send message' : 'Save'}
        </Button>
        {action === 'portfolio' && (
          <Button type="button" disabled={busy} onClick={() => save(true)}>
            Submit for approval
          </Button>
        )}
      </div>
    </form>
  );
}
