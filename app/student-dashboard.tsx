'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Bell,
  FlaskConical,
  LogOut,
  Users,
  Wrench,
  Plus,
  Search,
  Cpu,
  Microscope,
  Sparkles,
  Layers,
  Atom,
  HeartPulse,
  UtensilsCrossed,
  FileText,
  Megaphone,
  Building2,
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
    [academicsTab, setAcademicsTab] = useState<'assignments' | 'classes' | 'grades' | 'resources' | 'feedback'>('assignments'),
    [facilitiesTab, setFacilitiesTab] = useState<'Labs' | 'Library'>('Labs'),
    [casTab, setCasTab] = useState<'all' | 'cas' | 'projects'>('all'),
    [notificationsTab, setNotificationsTab] = useState<'all' | 'announcements' | 'alerts'>('all');
  const rows = ws.rows,
    own = ws.member.studentId,
    today = localDate(),
    classes = rows.filter((r: any) => r.kind === 'class'),
    cls = classes.find((r: any) => r.id === classId),
    profile = rows.find((r: any) => r.kind === 'student' && r.id === own),
    notifications = personalNotifications(rows, own),
    unread = notifications.filter((n) => !n.read).length;
  const of = (k: string) => rows.filter((r: any) => r.kind === k);
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
    if (typeof window !== 'undefined') {
      const target = '/student/page/' + webSlug(s);
      if (location.pathname !== target) {
        history.pushState(null, '', target);
      }
    }
  };
  const open = (r: any) => {
    if (r.kind === 'class') {
      route('class', r.id);
      return;
    }
    route('record', r.id);
  };
  useEffect(() => {
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
          }
        }
        setSection(targetSection || 'Home');
        setSelected(null);
        setClassId('');
      }
      if (type === 'class') {
        setClassId(key);
        setSection('Classes');
        setSelected(null);
        setClassTab('Overview');
      }
      if (type === 'record') {
        const row = rows.find((r: any) => r.id === key);
        if (row) setSelected(row);
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
        (!subject || r.data.class === subject) &&
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
  const timetable = (date: string) => {
    const items = scheduleFor(rows, date);
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
              <article className="student-lesson" key={r.id}>
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
                    {r.data.class}
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
                  <span className="student-status">
                    {attendance?.data.status || 'Attendance not recorded'}
                  </span>
                  {log && (
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
                  {i < items.length - 1 &&
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
  if (section === 'Home')
    content = (
      <>
        <div className="student-focus" suppressHydrationWarning>
          <section suppressHydrationWarning>
            <span className="eyebrow">NEXT CLASS</span>
            <h2 suppressHydrationWarning>{next?.data.class || 'Your school day is clear'}</h2>
            <p suppressHydrationWarning>
              {next
                ? `${next.nextDate === today ? 'Today' : next.nextDate} · ${next.data.startTime} · ${next.data.room} · ${next.data.substitution || next.data.teacher}`
                : 'Check your calendar for upcoming activities.'}
            </p>
            {next && (
              <Button
                onClick={() => {
                  const c = classes.find(
                    (c: any) => c.name === next.data.class,
                  );
                  if (c) open(c);
                }}
              >
                Open class <ArrowUpRight size={16} />
              </Button>
            )}
          </section>
          <div className="student-counts" suppressHydrationWarning>
            {[
              [upcoming.length, 'Assignments to do', 'Assignments'],
              [
                of('attendance').filter(
                  (r: any) =>
                    r.data.date === today &&
                    ['Late', 'Absent'].includes(r.data.status),
                ).length,
                'Late / absent today',
                'Attendance',
              ],
              [unread, 'Unread updates', 'Notifications'],
            ].map(([n, label, s]) => (
              <button key={String(label)} onClick={() => go(String(s))} suppressHydrationWarning>
                <strong suppressHydrationWarning>{n}</strong>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="teacher-grid">
          <section className="teacher-panel">
            <div className="teacher-panel-heading">
              <h2>Today’s classes</h2>
              <Button variant="ghost" onClick={() => go('Today')}>
                Full day
              </Button>
            </div>
            {timetable(today)}
          </section>
          <div>
            {pane(
              'Work to do',
              upcoming.slice(0, 5),
              'You’re up to date with submitted work.',
            )}
            {pane(
              'Recent feedback',
              of('submission')
                .filter((r: any) => r.data.returned)
                .slice(0, 4),
              'No returned feedback yet.',
            )}
          </div>
        </div>
        <div className="teacher-grid">
          {pane(
            'Upcoming exams',
            of('exam')
              .filter((r: any) => r.data.dueAt >= today)
              .slice(0, 4),
          )}
          {pane(
            'Projects & CAS',
            rows
              .filter(
                (r: any) =>
                  ['project', 'cas'].includes(r.kind) &&
                  r.data.status !== 'Approved',
              )
              .slice(0, 4),
          )}
          {pane(
            'Class updates',
            rows
              .filter((r: any) =>
                ['classLog', 'announcement', 'resource'].includes(r.kind),
              )
              .sort((a: any, b: any) =>
                (b.updatedAt || '').localeCompare(a.updatedAt || ''),
              )
              .slice(0, 5),
          )}
          {pane(
            'Requests & borrowed books',
            rows
              .filter(
                (r: any) =>
                  ['request', 'loan', 'maintenance'].includes(r.kind) &&
                  !['Completed', 'Returned', 'Closed'].includes(r.data.status),
              )
              .slice(0, 5),
          )}
          {pane('Messages', of('message').slice(-4))}
          {pane(
            'Coming up',
            Array.from({ length: 7 }, (_, i) => {
              const d = new Date(today + 'T12:00');
              d.setDate(d.getDate() + i);
              return personalEvents(rows, d.toLocaleDateString('en-CA')).filter(
                (r: any) => r.kind !== 'timetable',
              );
            })
              .flat()
              .slice(0, 6),
          )}
        </div>
      </>
    );
  else if (section === 'Today')
    content = (
      <>
        <div className="teacher-toolbar">
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
        {timetable(day)}
      </>
    );
  else if (section === 'Classes' && cls) {
    const related = rows.filter((r: any) => r.data.class === cls.name),
      names = [
        'Overview',
        'Stream',
        'Class history',
        'Assignments',
        'Resources',
        'Grades',
        'Teacher',
        'Calendar',
      ];
    content = (
      <>
        <Button variant="ghost" onClick={() => go('Classes')}>
          <ArrowLeft size={16} /> All classes
        </Button>
        <div className="student-class-heading">
          <h2>{cls.name}</h2>
          <p>
            {cls.data.teacher} · {cls.data.room}
          </p>
        </div>
        <nav className="student-tabs">
          {names.map((t) => (
            <button
              key={t}
              aria-current={classTab === t ? 'page' : undefined}
              onClick={() => setClassTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        {classTab === 'Class history' ? (
          <ClassHistory ws={ws} classId={cls.id} />
        ) : classTab === 'Teacher' ? (
          <section className="teacher-panel">
            <h2>{cls.data.teacher}</h2>
            <p>{cls.data.room}</p>
            <Button onClick={() => quick('message', cls)}>
              Message teacher
            </Button>
          </section>
        ) : classTab === 'Calendar' ? (
          <List
            rows={related.filter((r: any) =>
              ['timetable', 'exam', 'assignment', 'classLog', 'event'].includes(
                r.kind,
              ),
            )}
            open={open}
          />
        ) : (
          <List
            rows={related.filter((r: any) =>
              (
                ({
                  Overview: [
                    'assignment',
                    'classLog',
                    'announcement',
                    'resource',
                  ],
                  Stream: [
                    'announcement',
                    'resource',
                    'assignment',
                    'classLog',
                  ],
                  Assignments: ['assignment'],
                  Resources: ['resource', 'file'],
                  Grades: ['submission', 'exam'],
                }) as any
              )[classTab]?.includes(r.kind),
            )}
            open={open}
          />
        )}
      </>
    );
  } else if (section === 'Classes')
    content = (
      <div className="student-catalog">
        {classes.map((c: any) => (
          <button
            className="teacher-panel student-class-card"
            onClick={() => open(c)}
            key={c.id}
          >
            <BookOpen />
            <h2>{c.name}</h2>
            <p>{c.data.teacher}</p>
            <small>
              {c.data.room} ·{' '}
              {
                of('assignment').filter((a: any) => a.data.class === c.name)
                  .length
              }{' '}
              assignments
            </small>
            <ArrowUpRight />
          </button>
        ))}
      </div>
    );
  else if (['Assignments', 'Academics', 'Grades', 'Resources'].includes(section)) {
    content = (
      <>
        <div
          className="teacher-toolbar"
          style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${academicsTab === 'assignments' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAcademicsTab('assignments')}
            >
              Assignments & Tasks ({of('assignment').length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${academicsTab === 'classes' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAcademicsTab('classes')}
            >
              Enrolled Classes ({classes.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${academicsTab === 'grades' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAcademicsTab('grades')}
            >
              Grades
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${academicsTab === 'resources' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAcademicsTab('resources')}
            >
              Resources ({of('resource').length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${academicsTab === 'feedback' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setAcademicsTab('feedback')}
            >
              Returned Work & Feedback
            </button>
          </div>
          {academicsTab === 'assignments' && (
            <>
              <TeachingSelect
                label="Subject"
                value={subject}
                onChange={setSubject}
                options={[
                  { id: '', name: 'All subjects' },
                  ...classes.map((c: any) => ({ id: c.name, name: c.name })),
                ]}
              />
              <TeachingSelect
                label="Status"
                value={filter}
                onChange={setFilter}
                options={[
                  { id: '', name: 'All statuses' },
                  'NotStarted',
                  'InProgress',
                  'Submitted',
                  'Late',
                  'Graded',
                ]}
              />
            </>
          )}
          {academicsTab === 'resources' && (
            <TeachingSelect
              label="Subject"
              value={subject}
              onChange={setSubject}
              options={[
                { id: '', name: 'All subjects' },
                ...classes.map((c: any) => ({ id: c.name, name: c.name })),
              ]}
            />
          )}
        </div>
        {academicsTab === 'assignments' ? (
          <List
            rows={matched(of('assignment')).sort((a: any, b: any) =>
              (a.data.dueAt || '').localeCompare(b.data.dueAt || ''),
            )}
            open={open}
            meta={(r: any) =>
              `${r.data.class} · ${submissionState(r, own, rows).status} · Due ${r.data.dueAt}`
            }
          />
        ) : academicsTab === 'classes' ? (
          <div className="student-classes-grid">
            {classes.map((c: any) => (
              <button
                className="teacher-panel student-class-card"
                onClick={() => open(c)}
                key={c.id}
              >
                <BookOpen />
                <h2>{c.name}</h2>
                <p>{c.data.teacher}</p>
                <small>
                  {c.data.room} ·{' '}
                  {
                    of('assignment').filter((a: any) => a.data.class === c.name)
                      .length
                  }{' '}
                  assignments
                </small>
                <ArrowUpRight />
              </button>
            ))}
          </div>
        ) : academicsTab === 'grades' ? (
          <div className="academics-grades-grid">
            {classes.map((c: any) => {
              const grades = of('submission').filter(
                  (r: any) =>
                    r.data.class === c.name && r.data.returned === true,
                ),
                exams = of('exam').filter(
                  (r: any) =>
                    r.data.class === c.name && r.data.results?.length,
                );
              return (
                <section className="teacher-panel" key={c.id}>
                  <h2>{c.name}</h2>
                  <List
                    rows={[...grades, ...exams].sort((a: any, b: any) =>
                      (b.updatedAt || '').localeCompare(a.updatedAt || ''),
                    )}
                    open={open}
                    empty="No published results yet."
                    meta={(r: any) =>
                      r.kind === 'exam'
                        ? `${r.data.results[0].mark}% · ${r.data.results[0].feedback || ''}`
                        : `${r.data.grade ?? '—'} marks · ${r.data.feedback || 'Open returned work'}`
                    }
                  />
                </section>
              );
            })}
          </div>
        ) : academicsTab === 'resources' ? (
          <div className="academics-resources-view">
            <List
              rows={matched(of('resource'))}
              open={open}
              empty="No academic resources found for this subject."
              meta={(r: any) =>
                `${r.data.class || 'Academic'} · ${r.data.category || 'Resource'} · ${r.data.date || 'Current term'}`
              }
            />
          </div>
        ) : (
          <div className="teacher-grid">
            {pane(
              'Recent returned work & grades',
              of('submission').filter((r: any) => r.data.returned),
            )}
            {pane(
              'Academic Resources & Course Materials',
              of('resource').slice(0, 8),
            )}
          </div>
        )}
      </>
    );
  }
  else if (section === 'Calendar') {
    const start = new Date(day + 'T12:00'),
      count =
        calendarMode === 'Day'
          ? 1
          : calendarMode === 'Week'
            ? 7
            : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    if (calendarMode === 'Month') start.setDate(1);
    content = (
      <>
        <div className="teacher-toolbar">
          <Input
            aria-label="Calendar date"
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
          <TeachingSelect
            label="View"
            value={calendarMode}
            onChange={setCalendarMode}
            options={['Day', 'Week', 'Month']}
          />
          <TeachingSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { id: '', name: 'All events' },
              'timetable',
              'assignment',
              'classLog',
              'exam',
              'project',
              'cas',
              'loan',
              'event',
              'counsellingRequest',
            ]}
          />
        </div>
        <div
          className={
            'student-calendar ' +
            (calendarMode === 'Month' ? 'student-month' : '')
          }
        >
          {Array.from({ length: count }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const key = d.toLocaleDateString('en-CA');
            return (
              <section className="teacher-panel" key={key}>
                <h3 suppressHydrationWarning>
                  {d.toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </h3>
                <List
                  rows={personalEvents(rows, key).filter(
                    (r) => !category || r.kind === category,
                  )}
                  open={open}
                  empty="No events"
                />
              </section>
            );
          })}
        </div>
      </>
    );
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
              onClick={() => setFacilitiesTab('Labs')}
            >
              <FlaskConical size={14} />
              <span>Science & Tech Labs ({of('inventory').length})</span>
            </button>
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${facilitiesTab === 'Library' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setFacilitiesTab('Library')}
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
    content = (
      <>
        <div
          className="teacher-toolbar"
          style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${casTab === 'all' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCasTab('all')}
            >
              All Portfolio ({casRows.length + projectRows.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${casTab === 'cas' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCasTab('cas')}
            >
              CAS Experiences ({casRows.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${casTab === 'projects' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setCasTab('projects')}
            >
              Supervised Projects ({projectRows.length})
            </button>
          </div>
          <Button onClick={() => quick('portfolio')}>Add CAS Experience</Button>
        </div>
        <List
          rows={matched(combinedRows)}
          open={open}
          empty={
            casTab === 'cas'
              ? 'Start your first CAS experience.'
              : casTab === 'projects'
                ? 'Your supervisor has not assigned a project yet.'
                : 'No CAS or project records found.'
          }
          meta={(r: any) =>
            r.kind === 'cas'
              ? `CAS · ${r.data.strand || 'Creativity/Activity/Service'} · ${r.data.status || 'Active'}`
              : `Project · ${r.data.supervisor || 'Supervisor'} · ${r.data.status || 'In Progress'}`
          }
        />
      </>
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
          style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
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
              <Bell size={16} />
              <span>Personal Alerts & Notifications</span>
            </h2>
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
  } else if (section === 'Profile')
    content = (
      <>
        <div className="student-profile-account-bar">
          <div className="student-profile-account-info">
            <span className="avatar">
              {(profile?.name || ws.member.name || 'AS')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <b>{profile?.name || ws.member.name}</b>
              <small>
                Student · Grade 12 ·{' '}
                {ws.member.email || 'student.dev@schoolos.local'}
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
        <section className="teacher-panel">
          <h2>{profile?.name || ws.member.name}</h2>
          {profile && <Details row={profile} />}
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
      <>
        <div
          className="teacher-toolbar"
          style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--muted-foreground)',
              }}
            >
              Confidential pastoral care, mental wellbeing support, and academic guidance.
            </p>
          </div>
          {enabled ? (
            <Button onClick={() => quick('counsellingRequest')}>
              Request Counselling Appointment
            </Button>
          ) : (
            <p className="teacher-empty">
              Online booking unavailable. Please visit the counselling suite.
            </p>
          )}
        </div>
        <div className="teacher-grid">
          {pane(
            'Your confidential appointment requests',
            of('counsellingRequest'),
          )}
          {pane(
            'Available counsellor appointment slots',
            of('appointmentSlot'),
          )}
        </div>
      </>
    );
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
      <>
        <div
          className="teacher-toolbar"
          style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${recordsTab === 'Attendance' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setRecordsTab('Attendance')}
            >
              <CalendarCheck size={14} />
              <span>Attendance</span>
            </button>
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${recordsTab === 'Medical' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setRecordsTab('Medical')}
            >
              <HeartPulse size={14} />
              <span>Medical</span>
            </button>
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${recordsTab === 'Cafeteria' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setRecordsTab('Cafeteria')}
            >
              <UtensilsCrossed size={14} />
              <span>Cafeteria</span>
            </button>
            <button
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${recordsTab === 'Documents' ? 'bg-white shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setRecordsTab('Documents')}
            >
              <FileText size={14} />
              <span>Documents</span>
            </button>
          </div>

          {recordsTab === 'Attendance' &&
            of('servicePolicy')[0]?.data.absenceRequests && (
              <Button onClick={() => quick('absenceRequest')}>
                Request Absence / Excuse
              </Button>
            )}
          {recordsTab === 'Medical' && medicalEnabled && (
            <Button onClick={() => quick('medicalRequest')}>
              Request Nurse Visit
            </Button>
          )}
          {recordsTab === 'Cafeteria' && preordersEnabled && (
            <Button onClick={() => quick('mealOrder')}>Preorder Meal</Button>
          )}
        </div>

        {recordsTab === 'Attendance' && (
          <div className="records-attendance-tab">
            <div className="student-counts">
              {['Present', 'Absent', 'Late', 'Excused'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(filter === s ? '' : s)}
                >
                  <strong>
                    {attendance.filter((r: any) => r.data.status === s).length}
                  </strong>
                  <span>{s}</span>
                </button>
              ))}
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
            {pane(
              'Your submitted absence & excuse requests',
              of('absenceRequest'),
            )}
          </div>
        )}

        {recordsTab === 'Medical' && (
          <div className="records-medical-tab">
            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                marginBottom: '14px',
              }}
            >
              Student medical profile, nurse station visits, and health records.
            </p>
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
          <div className="records-cafeteria-tab">
            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                marginBottom: '14px',
              }}
            >
              Daily dining hall menus, dietary tags, and pre-ordered lunches.
            </p>
            <List
              rows={matched(meals)}
              open={open}
              empty="No cafeteria meal items listed for today."
            />
            {pane('Your meal preorders', mealOrders)}
          </div>
        )}

        {recordsTab === 'Documents' && (
          <div className="records-documents-tab">
            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                marginBottom: '14px',
              }}
            >
              Official transcripts, enrolment certificates, and handbooks.
            </p>
            <List
              rows={matched(documents)}
              open={open}
              empty="No downloadable documents on file."
              meta={(r: any) =>
                `${r.data.category || 'Official Document'} · ${r.data.date || 'Current'}`
              }
            />
          </div>
        )}
      </>
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
          <div className="eyebrow">MY SCHOOL DAY</div>
          <h1 suppressHydrationWarning>
            {section === 'Home'
              ? `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${ws.member.name.split(' ')[0]}`
              : section}
          </h1>
          <p suppressHydrationWarning>
            {section === 'Home'
              ? 'Your classes, work and latest updates.'
              : new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
          </p>
        </div>
        <Button variant="outline" onClick={() => go('Notifications')}>
          <Bell size={16} />
          {unread} unread
        </Button>
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
      {!['Home', 'Today', 'Calendar'].includes(section) && (
        <Input
          className="student-search"
          aria-label={'Search ' + section}
          placeholder={'Search ' + section.toLowerCase() + '…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}{' '}
      <div
        key={section + (classId || '')}
        className="student-content-view tab-pane-animated"
      >
        {ws.loading ? <p role="status">Loading your school day…</p> : content}
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) {
            setSelected(null);
            navigateWebsite('/student/page/' + webSlug(section), true);
          }
        }}
      >
        <SheetContent className="teacher-sheet">
          <SheetHeader>
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
    <section className="teacher-form">
      <p className="student-status">
        {status} · Due {current.data.dueAt}
      </p>
      <p className="log-text">
        {current.data.instructions || current.data.description}
      </p>
      <p>
        Maximum marks:{' '}
        {current.data.maximumMarks || current.data.maxMarks || '—'}
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
          <div className="teacher-toolbar">
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
