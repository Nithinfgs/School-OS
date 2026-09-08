'use client';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  MessageSquare,
  FlaskConical,
  Upload,
  AlertTriangle,
  BusFront,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ClassHistory, ClassLogDetail } from './class-logs';
import { MessageThread } from './message-thread';
import { ChatRoomView } from './chat-room';
import { ChatModal } from './chat-modal';
import { navigateWebsite } from '@/lib/web-navigation';
import {
  teacherTabs,
  recordCategories,
  localDate,
  scheduleFor,
  submissionState,
  calendarEvents,
  studentInClass,
  studentIssues,
} from '@/lib/teaching';

export function TeachingSelect({
  label,
  value,
  onChange,
  options,
  empty = 'Choose…',
  disabled = false,
}: any) {
  return (
    <label className="field">
      <span>{label}</span>
      <Select
        value={
          value ||
          (options.some((o: any) => typeof o !== 'string' && o.id === '')
            ? 'All'
            : null)
        }
        onValueChange={(v) => onChange(v === 'All' ? '' : v || '')}
        disabled={disabled}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder={empty} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o: any) => (
            <SelectItem
              key={typeof o === 'string' ? o : o.id}
              value={typeof o === 'string' ? o : o.id || 'All'}
            >
              {typeof o === 'string' ? o : o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
function Empty({ children }: any) {
  return <p className="teacher-empty">{children}</p>;
}
function Entries({ rows, open, empty = 'No records yet.' }: any) {
  return !rows.length ? (
    <Empty>{empty}</Empty>
  ) : (
    <div className="teacher-entry-list">
      {rows.map((r: any) => (
        <button
          key={r.eventId || r.id}
          className="master-related"
          onClick={() => open(r)}
        >
          <span>
            <b>{r.name}</b>
            <small>
              {[
                r.data.class,
                r.data.status,
                r.data.date || r.data.dueAt || r.data.occurredAt,
              ]
                .filter(Boolean)
                .join(' · ')}
            </small>
          </span>
          <ArrowUpRight size={15} />
        </button>
      ))}
    </div>
  );
}
const formNames: any = {
  attendance: 'Take attendance',
  lesson: 'Log lesson',
  studentRecord: 'Student record',
  behaviorReport: 'Student behaviour report',
  transportNotice: 'Transport notice',
  assignment: 'Assignment',
  gradeWork: 'Grade and return work',
  resource: 'Class resource',
  message: 'Message class or student',
  labRequest: 'Request lab item',
  announcement: 'Announcement',
  exam: 'Subject exam',
  project: 'Supervised project',
  cas: 'CAS experience',
};

export function TeacherDashboard({ ws }: any) {
  const [classId, setClassId] = useState(''),
    [tab, setTab] = useState('Overview'),
    [query, setQuery] = useState(''),
    [form, setForm] = useState<any>(null),
    [selectedId, setSelectedId] = useState(''),
    [day, setDay] = useState(localDate()),
    [studentSection, setStudentSection] = useState('Overview');
  const rows = ws.rows,
    classes = rows.filter((r: any) => r.kind === 'class'),
    cls = classes.find((r: any) => r.id === classId),
    today = localDate();
  const todayLessons = scheduleFor(rows, today);
  const next = [...Array(14)]
    .flatMap((_, i) => {
      const date = new Date(Date.parse(today) + i * 86400000)
        .toISOString()
        .slice(0, 10);
      return scheduleFor(rows, date).map((r: any) => ({
        ...r,
        data: { ...r.data, date },
      }));
    })
    .find(
      (r: any) =>
        r.data.date > today ||
        r.data.startTime > new Date().toTimeString().slice(0, 5),
    );
  const selected = rows.find((r: any) => r.id === selectedId);
  const inClass = (r: any) =>
    !cls ||
    r.id === cls.id ||
    r.data.class === cls.name ||
    (r.kind === 'student' && (studentInClass(r, cls.name) ||
      (cls.data?.isHomeroom &&
        (r.data.classTeacherId === ws.member.id ||
          r.data.classTeacherId === ws.member.userId)))) ||
    r.data.classId === cls.id ||
    (!r.data.class &&
      r.data.studentId &&
      rows.some(
        (s: any) => s.id === r.data.studentId && s.data.class === cls.name,
      )) ||
    (r.data.assignmentId &&
      rows.some(
        (a: any) => a.id === r.data.assignmentId && a.data.class === cls.name,
      ));
  const scoped = rows.filter(inClass),
    roster = scoped.filter((r: any) => r.kind === 'student'),
    assignments = scoped.filter((r: any) => r.kind === 'assignment');
  const matching = (values: any[]) =>
    values.filter((r) =>
      (r.name + ' ' + JSON.stringify(r.data))
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  const kind = (...k: string[]) =>
    matching(scoped.filter((r: any) => k.includes(r.kind)));
  const open = (r: any) => {
    if (r.kind === 'class') {
      setClassId(r.id);
      setTab('Overview');
      setQuery('');
      navigateWebsite('/teacher/class/' + encodeURIComponent(r.id));
    } else {
      setSelectedId(r.id);
      setStudentSection('Overview');
      navigateWebsite('/teacher/record/' + encodeURIComponent(r.id));
    }
  };
  useEffect(() => {
    const read = () => {
      const action = location.pathname.match(/^\/teacher\/action\/(.+)$/)?.[1];
      if (action) {
        if (action === 'gradeWork') {
          setTab('Grades');
          setSelectedId('');
        } else if (formNames[action] && classes[0])
          setForm({ action, classId: classes[0].id });
        return;
      }
      const match = location.pathname.match(
        /^\/teacher\/(class|record)\/(.+)$/,
      );
      if (match) {
        const id = decodeURIComponent(match[2]);
        if (match[1] === 'class') {
          setClassId(id);
          setTab('Overview');
          setSelectedId('');
        } else setSelectedId(id);
      } else {
        setSelectedId('');
        if (location.pathname === '/home' || location.pathname === '/')
          setClassId('');
      }
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const quick = (action: string, row?: any) => {
    const target =
      classes.find(
        (c: any) =>
          c.name ===
          (row?.data.class ||
            rows.find((a: any) => a.id === row?.data.assignmentId)?.data.class),
      ) ||
      cls ||
      classes[0];
    if (!target) return;
    setForm({
      action,
      row,
      classId: target.id,
      period: scheduleFor(rows, today).find(
        (l: any) => l.data.classId === target.id,
      )?.data.period,
    });
  };
  const pendingAttendance = todayLessons.filter((lesson: any) => {
    const students = rows.filter(
      (r: any) => r.kind === 'student' && studentInClass(r, lesson.data.class),
    );
    return students.some(
      (s: any) =>
        !rows.some(
          (r: any) =>
            r.kind === 'attendance' &&
            r.data.studentId === s.id &&
            r.data.class === lesson.data.class &&
            r.data.date === today &&
            (r.data.period || 'Daily') === lesson.data.period,
        ),
    );
  });
  const missingLogs = todayLessons.filter(
    (l: any) =>
      !rows.some(
        (r: any) =>
          r.kind === 'classLog' &&
          r.data.class === l.data.class &&
          r.data.date === today &&
          (r.data.period || 'Daily') === l.data.period,
      ),
  );
  const toGrade = rows.filter(
    (r: any) =>
      r.kind === 'submission' && ['Submitted', 'Late'].includes(r.data.status),
  );
  const lateAbsent = rows.filter(
    (r: any) =>
      r.kind === 'attendance' &&
      r.data.date === today &&
      ['Late', 'Absent'].includes(r.data.status),
  );
  const concerned = rows.filter(
    (r: any) => r.kind === 'student' && studentIssues(r, rows, today).length,
  );
  const calendar = calendarEvents(scoped, day);
  const recordAction = (r: any) => {
    const names: any = {
      record: 'studentRecord',
      assignment: 'assignment',
      submission: 'gradeWork',
      resource: 'resource',
      exam: 'exam',
      project: 'project',
      cas: 'cas',
    };
    return names[r.kind];
  };
  if (ws.loading)
    return (
      <section className="panel teacher-empty" role="status">
        Loading your teaching workspace…
      </section>
    );
  if (ws.member.role !== 'Teacher') return null;
  return (
    <div className="teacher-dashboard" suppressHydrationWarning>
      <header className="page-heading">
        <div>
          {cls && (
            <Button
              variant="ghost"
              onClick={() => {
                setClassId('');
                setQuery('');
                setTab('Overview');
                navigateWebsite('/home', true);
              }}
            >
              <ArrowLeft size={15} /> All classes
            </Button>
          )}
          <div className="eyebrow">
            {cls ? 'CLASS CONTROL CENTER' : 'YOUR TEACHING DAY'}
          </div>
          <h1 suppressHydrationWarning>
            {cls
              ? cls.name
              : 'Good ' +
                (new Date().getHours() < 12 ? 'morning' : 'afternoon') +
                ', ' +
                ws.member.name.split(' ')[0]}
          </h1>
          <p>
            {cls
              ? `${cls.data.room} · ${roster.length} students`
              : 'Today’s lessons, student follow-ups and work to review.'}
          </p>
        </div>
        <span className="date-label" suppressHydrationWarning>
          <CalendarDays size={17} />
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </span>
      </header>
      {ws.error && (
        <div className="error-banner" role="alert">
          Updates interrupted.{' '}
          <Button variant="outline" onClick={ws.refresh}>
            Retry
          </Button>
        </div>
      )}
      <div className="teacher-quick" aria-label="Teacher quick actions">
        {[
          ['attendance', 'Take attendance', ClipboardCheck],
          ['lesson', 'Log lesson', BookOpen],
          ['studentRecord', 'Add record', Plus],
          ['behaviorReport', 'Behaviour report', AlertTriangle],
          ['transportNotice', 'Transport notice', BusFront],
          ['assignment', 'Create assignment', Plus],
          ['gradeWork', 'Grade work', CheckCircle2],
          ['resource', 'Upload resource', Upload],
          ['message', 'Message class', MessageSquare],
          ['labRequest', 'Request lab item', FlaskConical],
          ['announcement', 'Add announcement', Plus],
        ].map(([action, label, Icon]: any) => (
          <Button
            key={action}
            variant="outline"
            disabled={!classes.length}
            onClick={() =>
              action === 'gradeWork'
                ? toGrade.length
                  ? quick(
                      action,
                      toGrade.find((r: any) => inClass(r)) || toGrade[0],
                    )
                  : (setTab('Grades'), setQuery(''))
                : quick(action)
            }
          >
            <Icon size={15} />
            {label}
          </Button>
        ))}
      </div>
      {!classes.length ? (
        <Empty>
          No classes are assigned to your account. Your school admin can assign
          them in Members.
        </Empty>
      ) : (
        <>
          {!cls && (
            <>
              <div className="teacher-top-grid">
                <section className="panel teacher-panel">
                  <div className="section-heading">
                    <h2>Today’s classes</h2>
                    <Clock size={18} />
                  </div>
                  {todayLessons.length ? (
                    todayLessons.map((l: any) => (
                      <div className="teacher-lesson" key={l.id}>
                        <button
                          onClick={() => {
                            const c = classes.find(
                              (c: any) => c.name === l.data.class,
                            );
                            if (c) open(c);
                          }}
                        >
                          <strong>{l.data.startTime}</strong>
                          <b>{l.data.class}</b>
                          <small>
                            {l.data.period} · {l.data.room}
                            {l.data.substitution
                              ? ' · Cover: ' + l.data.substitution
                              : ''}
                          </small>
                        </button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setForm({
                              action: 'attendance',
                              classId: l.data.classId,
                              period: l.data.period,
                            })
                          }
                        >
                          Register
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setForm({
                              action: 'lesson',
                              classId: l.data.classId,
                              period: l.data.period,
                            })
                          }
                        >
                          Log lesson
                        </Button>
                      </div>
                    ))
                  ) : (
                    <Empty>No scheduled classes today.</Empty>
                  )}
                  {next && (
                    <div className="teacher-next" suppressHydrationWarning>
                      <small suppressHydrationWarning>
                        NEXT CLASS · {next.data.date} at {next.data.startTime}
                      </small>
                      <button
                        suppressHydrationWarning
                        onClick={() => {
                          const c = classes.find(
                            (c: any) => c.name === next.data.class,
                          );
                          if (c) open(c);
                        }}
                      >
                        <b>{next.data.class}</b> · {next.data.room} →
                      </button>
                    </div>
                  )}
                </section>
                <section className="panel teacher-panel">
                  <h2>Needs your attention</h2>
                  {[
                    [
                      pendingAttendance.length,
                      'Registers pending',
                      () => quick('attendance'),
                    ],
                    [
                      missingLogs.length,
                      'Missing lesson logs',
                      () => quick('lesson'),
                    ],
                    [
                      toGrade.length,
                      'Submissions to grade',
                      () => setTab('Grades'),
                    ],
                    [
                      lateAbsent.length,
                      'Late or absent today',
                      () => setTab('Attendance'),
                    ],
                    [
                      concerned.length,
                      'Students needing a check-in',
                      () => setTab('Roster'),
                    ],
                  ].map(([n, label, action]: any) => (
                    <button
                      className="teacher-attention"
                      key={label}
                      onClick={action}
                    >
                      <span>{label}</span>
                      <b>{n}</b>
                    </button>
                  ))}
                </section>
              </div>
              <div className="teacher-class-grid">
                {classes.map((c: any) => (
                  <button
                    className="panel teacher-class-card"
                    key={c.id}
                    onClick={() => open(c)}
                  >
                    <BookOpen size={21} />
                    <h3>{c.name}</h3>
                    <p>
                      {c.data.room} ·{' '}
                      {
                        rows.filter(
                          (r: any) =>
                            r.kind === 'student' && studentInClass(r, c.name),
                        ).length
                      }{' '}
                      students
                    </p>
                    <span>
                      Open class control center <ArrowUpRight size={15} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          <section className="panel teacher-panel">
            <div className="teacher-section-bar">
              <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
                <TabsList variant="line" className="teacher-tabs">
                  {teacherTabs.map((t) => (
                    <TabsTrigger value={t} key={t}>
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <label className="teacher-search">
                <Search size={16} />
                <Input
                  aria-label="Search class or student data"
                  placeholder="Search this view…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <div key={tab} className="tab-pane-animated">
              {tab === 'Overview' ? (
              <div className="teacher-overview-grid">
                {cls && (
                  <section>
                    <h3>Today’s lessons</h3>
                    {scheduleFor(scoped, today).map((l: any) => (
                      <div className="teacher-lesson" key={l.id}>
                        <span>
                          <b>
                            {l.data.period} · {l.data.startTime}
                          </b>
                          <small>
                            {l.data.room}{' '}
                            {l.data.substitution
                              ? '· Cover: ' + l.data.substitution
                              : ''}
                          </small>
                        </span>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setForm({
                              action: 'attendance',
                              classId: cls.id,
                              period: l.data.period,
                            })
                          }
                        >
                          Attendance
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setForm({
                              action: 'lesson',
                              classId: cls.id,
                              period: l.data.period,
                            })
                          }
                        >
                          Log lesson
                        </Button>
                      </div>
                    ))}
                    {!scheduleFor(scoped, today).length && (
                      <Empty>No scheduled lesson today.</Empty>
                    )}
                  </section>
                )}
                {cls && (
                  <section>
                    <h3>Class progress today</h3>
                    <button
                      className="teacher-attention"
                      onClick={() => setTab('Roster')}
                    >
                      <span>Enrolled students</span>
                      <b>{roster.length}</b>
                    </button>
                    <button
                      className="teacher-attention"
                      onClick={() => setTab('Attendance')}
                    >
                      <span>Late / absent today</span>
                      <b>
                        {
                          scoped.filter(
                            (r: any) =>
                              r.kind === 'attendance' &&
                              r.data.date === today &&
                              ['Late', 'Absent'].includes(r.data.status),
                          ).length
                        }
                      </b>
                    </button>
                    <button
                      className="teacher-attention"
                      onClick={() => setTab('Grades')}
                    >
                      <span>Waiting for grading</span>
                      <b>
                        {
                          scoped.filter(
                            (r: any) =>
                              r.kind === 'submission' &&
                              ['Submitted', 'Late'].includes(r.data.status),
                          ).length
                        }
                      </b>
                    </button>
                    <button
                      className="teacher-attention"
                      onClick={() => setTab('Records')}
                    >
                      <span>Unresolved records</span>
                      <b>
                        {
                          scoped.filter(
                            (r: any) =>
                              r.kind === 'record' &&
                              !['Resolved', 'Closed'].includes(r.data.status),
                          ).length
                        }
                      </b>
                    </button>
                  </section>
                )}
                {[
                  [
                    'Assignments due',
                    matching(
                      scoped.filter(
                        (r: any) =>
                          r.kind === 'assignment' &&
                          r.data.status !== 'Draft' &&
                          r.data.dueAt >= today,
                      ),
                    )
                      .sort((a: any, b: any) =>
                        a.data.dueAt.localeCompare(b.data.dueAt),
                      )
                      .slice(0, 6),
                    'Assignments',
                  ],
                  [
                    'Recent student records',
                    kind('record')
                      .sort((a: any, b: any) =>
                        (b.updatedAt || '').localeCompare(a.updatedAt || ''),
                      )
                      .slice(0, 6),
                    'Records',
                  ],
                  [
                    'Lab requests',
                    kind('request')
                      .filter(
                        (r: any) =>
                          r.data.type === 'lab' &&
                          r.data.status !== 'Completed',
                      )
                      .slice(0, 6),
                    'Labs',
                  ],
                  [
                    'Upcoming exams',
                    kind('exam').filter((r: any) => r.data.dueAt >= today),
                    'Exams',
                  ],
                  [
                    'Supervised projects & CAS',
                    kind('project', 'cas'),
                    'Projects & CAS',
                  ],
                  [
                    'Class announcements',
                    kind('announcement').filter(
                      (r: any) =>
                        !r.data.expiresAt || r.data.expiresAt >= today,
                    ),
                    'Communication',
                  ],
                  ['Recent lessons', kind('classLog').slice(0, 5), 'Lessons'],
                  ['Messages', kind('message').slice(0, 5), 'Communication'],
                ].map(([title, list, target]: any) => (
                  <section key={title}>
                    <div className="section-heading">
                      <h3>{title}</h3>
                      <Button variant="ghost" onClick={() => setTab(target)}>
                        View all
                      </Button>
                    </div>
                    <Entries rows={list} open={open} />
                  </section>
                ))}
              </div>
            ) : tab === 'Roster' ? (
              <>
                <h2>Students & monitoring</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Today</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matching(roster).map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <button
                            className="master-record-link"
                            onClick={() => open(s)}
                          >
                            {s.name}
                          </button>
                          <small>{s.data.class}</small>
                        </TableCell>
                        <TableCell>
                          {rows
                            .filter(
                              (r: any) =>
                                r.kind === 'attendance' &&
                                r.data.studentId === s.id &&
                                r.data.date === today,
                            )
                            .map(
                              (r: any) =>
                                `${r.data.period || 'Daily'}: ${r.data.status}`,
                            )
                            .join(' · ') || 'Unmarked'}
                        </TableCell>
                        <TableCell>
                          {studentIssues(s, rows, today).join(' · ') ||
                            'No current alerts'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            onClick={() =>
                              quick('studentRecord', {
                                kind: 'student',
                                id: s.id,
                                data: s.data,
                              })
                            }
                          >
                            Add record
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : tab === 'Attendance' ? (
              <TeacherAttendance ws={ws} classId={cls?.id || classes[0]?.id} />
            ) : tab === 'Lessons' ? (
              <ClassHistory ws={ws} classId={cls?.id} />
            ) : tab === 'Assignments' ? (
              <>
                <div className="section-heading">
                  <h2>Assignments & completion</h2>
                  <Button onClick={() => quick('assignment')}>
                    Create assignment
                  </Button>
                </div>
                {matching(assignments).map((a: any) => {
                  const students = rows.filter(
                    (r: any) =>
                      r.kind === 'student' && studentInClass(r, a.data.class),
                  );
                  const completed = students.filter((s: any) =>
                    ['Submitted', 'Late', 'Graded'].includes(
                      submissionState(a, s.id, rows).status,
                    ),
                  ).length;
                  return (
                    <div className="teacher-assignment" key={a.id}>
                      <button onClick={() => open(a)}>
                        <b>{a.name}</b>
                        <small>
                          {a.data.class} · Due {a.data.dueAt} · {a.data.status}
                        </small>
                      </button>
                      <span>
                        {completed}/{students.length} submitted
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => quick('assignment', a)}
                      >
                        Edit / publish
                      </Button>
                    </div>
                  );
                })}
                {!assignments.length && <Empty>No assignments yet.</Empty>}
              </>
            ) : tab === 'Grades' ? (
              <>
                <h2>Submissions & grading</h2>
                <Entries
                  rows={kind('submission')}
                  open={open}
                  empty="No submissions to review yet."
                />
              </>
            ) : tab === 'Records' ? (
              <>
                <div className="section-heading">
                  <h2>Student records & follow-ups</h2>
                  <div className="detail-actions">
                    <Button onClick={() => quick('studentRecord')}>Add student record</Button>
                    <Button variant="outline" onClick={() => quick('behaviorReport')}>Behaviour report</Button>
                    <Button variant="outline" onClick={() => quick('transportNotice')}>Transport notice</Button>
                  </div>
                </div>
                <Entries rows={kind('record', 'transportNotice')} open={open} />
              </>
            ) : tab === 'Resources' ? (
              <>
                <div className="section-heading">
                  <h2>Subject, unit & lesson resources</h2>
                  <Button onClick={() => quick('resource')}>
                    Upload / link resource
                  </Button>
                </div>
                <Entries rows={kind('resource', 'file')} open={open} />
              </>
            ) : tab === 'Labs' ? (
              <>
                <div className="section-heading">
                  <h2>Requests & class usage</h2>
                  <Button onClick={() => quick('labRequest')}>
                    Request equipment / materials
                  </Button>
                </div>
                <Entries rows={kind('request', 'labUsage')} open={open} />
                <h3>Browse available stock</h3>
                <Entries
                  rows={matching(
                    rows.filter((r: any) => r.kind === 'inventory'),
                  )}
                  open={open}
                />
              </>
            ) : tab === 'Library' ? (
              <>
                <h2>Class library status</h2>
                <Entries rows={kind('loan')} open={open} />
              </>
            ) : tab === 'Projects & CAS' ? (
              <>
                <div className="section-heading">
                  <h2>Supervised work</h2>
                  <div className="detail-actions">
                    <Button onClick={() => quick('project')}>
                      Add project
                    </Button>
                    <Button variant="outline" onClick={() => quick('cas')}>
                      Add CAS experience
                    </Button>
                  </div>
                </div>
                <Entries rows={kind('project', 'cas')} open={open} />
              </>
            ) : tab === 'Calendar' ? (
              <>
                <div className="section-heading">
                  <h2>Timetable & calendar</h2>
                  <Input
                    aria-label="Calendar date"
                    type="date"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                  />
                </div>
                <div className="teacher-week">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(Date.parse(day) + i * 86400000)
                      .toISOString()
                      .slice(0, 10);
                    const events = calendarEvents(scoped, d);
                    return (
                      <section key={d}>
                        <button onClick={() => setDay(d)}>
                          <b suppressHydrationWarning>
                            {new Date(d + 'T12:00').toLocaleDateString(
                              undefined,
                              { weekday: 'short', day: 'numeric' },
                            )}
                          </b>
                        </button>
                        {events.map((r: any) => (
                          <button
                            key={r.eventId || r.id}
                            onClick={() => open(r)}
                          >
                            {r.data.startTime || ''} {r.name}
                          </button>
                        ))}
                      </section>
                    );
                  })}
                </div>
                <h3>Selected day</h3>
                <Entries rows={calendar} open={open} />
              </>
            ) : tab === 'Exams' ? (
              <>
                <div className="section-heading">
                  <h2>Subject exams & results</h2>
                  <Button onClick={() => quick('exam')}>
                    Add subject exam
                  </Button>
                </div>
                <Entries rows={kind('exam')} open={open} />
              </>
            ) : tab === 'Communication' || tab === 'Chat' ? (
              <ChatRoomView ws={ws} />
            ) : (
              <>
                <div className="section-heading">
                  <h2>Class communication</h2>
                  <div className="detail-actions">
                    <Button onClick={() => quick('message')}>Message</Button>
                    <Button
                      variant="outline"
                      onClick={() => quick('announcement')}
                    >
                      Announcement
                    </Button>
                  </div>
                </div>
                <Entries rows={kind('message', 'announcement')} open={open} />
              </>
            )}
            </div>
          </section>
          <section className="panel teacher-panel">
            <h2>Recent updates</h2>
            <p>
              Submissions, requests, corrections and class changes. Refreshes
              every five seconds.
            </p>
            {(ws.audit || []).slice(0, 12).map((a: any) => (
              <button
                key={a.id}
                className="master-related"
                onClick={() => {
                  const r = rows.find((r: any) => r.id === a.sourceId);
                  if (r) open(r);
                }}
              >
                <span>
                  <b>{a.action}</b>
                  <small>{new Date(a.timestamp).toLocaleString()}</small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
            {!ws.audit?.length && (
              <Empty>New class activity will appear here.</Empty>
            )}
          </section>
        </>
      )}
      {form && (
        <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
          {form.action === 'message' ? (
            <ChatModal
              ws={ws}
              form={form}
              role="teacher"
              close={() => setForm(null)}
            />
          ) : (
            <DialogContent className="teacher-dialog">
              <DialogHeader>
                <DialogTitle>{formNames[form.action]}</DialogTitle>
                <DialogDescription>
                  Changes save to the shared school record and authorized activity
                  history.
                </DialogDescription>
              </DialogHeader>
              {form.action === 'attendance' ? (
                <TeacherAttendance
                  key={form.classId + form.period}
                  ws={ws}
                  classId={form.classId}
                  initialPeriod={form.period}
                />
              ) : form.action === 'lesson' ? (
                <ClassHistory
                  key={form.classId + form.period}
                  ws={ws}
                  classId={form.classId}
                  initialDraft
                  period={form.period}
                />
              ) : (
                <TeachingForm
                  key={form.action + (form.row?.id || '')}
                  ws={ws}
                  form={form}
                  close={() => setForm(null)}
                />
              )}
            </DialogContent>
          )}
        </Dialog>
      )}
      <Sheet
        open={!!selectedId}
        onOpenChange={(v) => {
          if (!v) {
            setSelectedId('');
            navigateWebsite(
              cls ? '/teacher/class/' + encodeURIComponent(cls.id) : '/home',
              true,
            );
          }
        }}
      >
        <SheetContent className="detail-sheet teacher-detail">
          <SheetHeader>
            <SheetTitle>{selected?.name || 'Record unavailable'}</SheetTitle>
            <SheetDescription>
              {selected?.data.class || 'Your authorized school records'}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="detail-body">
              {selected.kind === 'student' ? (
                <>
                  <div className="detail-actions">
                    <Button onClick={() => quick('studentRecord', selected)}>
                      Add student record
                    </Button>
                    <Button variant="outline" onClick={() => quick('behaviorReport', selected)}>
                      Behaviour report
                    </Button>
                    <Button variant="outline" onClick={() => quick('transportNotice', selected)}>
                      Transport notice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => quick('message', selected)}
                    >
                      Message student
                    </Button>
                  </div>
                  <div className="info-box">
                    {studentIssues(selected, rows, today).join(' · ') ||
                      'No current monitoring alerts'}
                  </div>
                  <p>
                    Attendance: {selected.data.attendance ?? '—'}% · Academic
                    average: {selected.data.average ?? '—'}%
                  </p>
                  <Tabs
                    value={studentSection}
                    onValueChange={(v) => setStudentSection(String(v))}
                  >
                    <TabsList variant="line" className="teacher-tabs">
                      {[
                        'Overview',
                        'Attendance',
                        'Academics',
                        'Records',
                        'Labs',
                        'Library',
                        'Projects & CAS',
                        'Calendar',
                      ].map((t) => (
                        <TabsTrigger key={t} value={t}>
                          {t}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <Entries
                    rows={rows.filter((r: any) => {
                      if (r.id === selected.id) return false;
                      const related =
                        r.data.studentId === selected.id ||
                        r.data.studentIds?.includes(selected.id) ||
                        ([
                          'assignment',
                          'classLog',
                          'exam',
                          'timetable',
                          'announcement',
                          'resource',
                        ].includes(r.kind) &&
                          studentInClass(selected, r.data.class));
                      const map: any = {
                        Attendance: ['attendance'],
                        Academics: ['assignment', 'submission'],
                        Records: ['record', 'transportNotice'],
                        Labs: ['request', 'labUsage'],
                        Library: ['loan'],
                        'Projects & CAS': ['project', 'cas'],
                        Calendar: [
                          'classLog',
                          'assignment',
                          'exam',
                          'timetable',
                          'project',
                          'cas',
                        ],
                      };
                      return (
                        related &&
                        (studentSection === 'Overview' ||
                          map[studentSection]?.includes(r.kind))
                      );
                    })}
                    open={open}
                  />
                </>
              ) : selected.kind === 'classLog' ? (
                <ClassLogDetail row={selected} />
              ) : selected.kind === 'message' ? (
                <MessageThread row={selected} ws={ws} />
              ) : (
                <RecordContent row={selected} />
              )}
              {selected.kind === 'assignment' && (
                <>
                  <h3>Student completion</h3>
                  {rows
                    .filter(
                      (r: any) =>
                        r.kind === 'student' &&
                        studentInClass(r, selected.data.class),
                    )
                    .map((s: any) => {
                      const state = submissionState(selected, s.id, rows);
                      return (
                        <div className="master-related" key={s.id}>
                          <button onClick={() => open(s)}>{s.name}</button>
                          <span>{state.status}</span>
                          {state.submission && (
                            <Button
                              variant="outline"
                              onClick={() => open(state.submission)}
                            >
                              Open work
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </>
              )}
              {selected.kind === 'submission' && (
                <>
                  <h3>Submitted work</h3>
                  <p className="log-text">{selected.data.text}</p>
                </>
              )}
              {recordAction(selected) && (
                <Button onClick={() => quick(recordAction(selected), selected)}>
                  {selected.kind === 'submission'
                    ? 'Grade / return'
                    : selected.kind === 'record'
                      ? 'Follow up / resolve'
                      : 'Edit / update'}
                </Button>
              )}
              {selected.kind === 'inventory' && (
                <Button onClick={() => quick('labRequest', selected)}>
                  Request this item
                </Button>
              )}
              <h3 className="master-subheading">History</h3>
              {(ws.audit || [])
                .filter(
                  (a: any) =>
                    a.sourceId === selected.id ||
                    (selected.kind === 'student' &&
                      rows.some(
                        (r: any) =>
                          r.id === a.sourceId &&
                          r.data.studentId === selected.id,
                      )),
                )
                .map((a: any) => (
                  <div className="detail-note" key={a.id}>
                    <b>{a.action}</b>
                    <p>
                      {a.actorName} · {new Date(a.timestamp).toLocaleString()}
                    </p>
                    <details>
                      <summary>View change</summary>
                      <RecordContent
                        row={{
                          data: {
                            before: JSON.parse(a.before || '{}'),
                            after: JSON.parse(a.after || '{}'),
                          },
                        }}
                      />
                    </details>
                  </div>
                ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RecordContent({ row }: any) {
  const render = (v: any): any =>
    Array.isArray(v) ? (
      <ul>
        {v.map((x, i) => (
          <li key={i}>{render(x)}</li>
        ))}
      </ul>
    ) : v && typeof v === 'object' ? (
      <dl>
        {Object.entries(v)
          .filter(
            ([k]) => !['organizationId', 'key', 'participants'].includes(k),
          )
          .map(([k, x]) => (
            <div key={k}>
              <dt>{k.replace(/([A-Z])/g, ' $1')}</dt>
              <dd>{render(x)}</dd>
            </div>
          ))}
      </dl>
    ) : typeof v === 'string' && /^https?:\/\//.test(v) ? (
      <a
        href={v}
        target="_blank"
        rel="noopener noreferrer"
        className="resource-link"
      >
        {v}
      </a>
    ) : (
      <span className="log-text">{String(v ?? '—')}</span>
    );
  return (
    <>
      <dl>
        {Object.entries(row.data)
          .filter(
            ([k]) =>
              ![
                'id',
                'organizationId',
                'key',
                'participants',
                'attachments',
                'classId',
                'teacherId',
                'supervisorId',
                'createdBy',
                'readBy',
              ].includes(k),
          )
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k.replace(/([A-Z])/g, ' $1')}</dt>
              <dd>{render(v)}</dd>
            </div>
          ))}
      </dl>
      {row.kind === 'inventory' && (
        <p>
          Available: {row.quantity} {row.data.unit}
        </p>
      )}
      {row.kind === 'file' && (
        <a
          className="resource-link"
          href={'/api/files?id=' + encodeURIComponent(row.id)}
        >
          Download {row.name}
        </a>
      )}
      {row.data.attachments?.map((f: any) => (
        <a
          className="resource-link"
          key={f.id}
          href={'/api/files?id=' + encodeURIComponent(f.id)}
        >
          Download {f.name}
        </a>
      ))}
    </>
  );
}

function TeacherAttendance({ ws, classId, initialPeriod }: any) {
  const classes = ws.rows.filter((r: any) => r.kind === 'class'),
    [choice, setChoice] = useState(classId || classes[0]?.id || ''),
    [date, setDate] = useState(localDate()),
    [period, setPeriod] = useState(
      initialPeriod ||
        ws.rows.find(
          (r: any) => r.kind === 'timetable' && r.data.classId === classId,
        )?.data.period ||
        'Daily',
    ),
    [edits, setEdits] = useState<any>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  const cls = classes.find((r: any) => r.id === choice),
    students = ws.rows.filter(
      (r: any) => r.kind === 'student' && studentInClass(r, cls?.name),
    ),
    records = ws.rows.filter(
      (r: any) =>
        r.kind === 'attendance' &&
        r.data.classId === choice &&
        r.data.date === date &&
        (r.data.period || 'Daily') === period,
    );
  useEffect(() => {
    setEdits({});
    setSuccess('');
    setError('');
  }, [choice, date, period]);
  const entry = (s: any) => {
    const saved = records.find((r: any) => r.data.studentId === s.id);
    return (
      edits[s.id] || {
        studentId: s.id,
        status: saved?.data.status || 'Present',
        arrivalTime: saved?.data.arrivalTime || '',
        reason: '',
        notes: saved?.data.notes || '',
        actionTaken: saved?.data.actionTaken || '',
        followUp: saved?.data.followUp || '',
        version: saved?.version,
      }
    );
  };
  const edit = (s: any, key: string, value: any) =>
    setEdits((old: any) => ({ ...old, [s.id]: { ...entry(s), [key]: value } }));
  return (
    <section className="teacher-register">
      <div className="teacher-form-grid">
        <TeachingSelect
          label="Class"
          value={choice}
          options={classes}
          onChange={setChoice}
        />
        <label className="field">
          Date
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="field">
          Period
          <Input
            value={period}
            maxLength={40}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>
      </div>
      <p>
        Mark individual students or mark all unrecorded students present.
        Corrections need a reason.
      </p>
      <Button
        variant="outline"
        onClick={() =>
          setEdits((old: any) => ({
            ...old,
            ...Object.fromEntries(
              students
                .filter(
                  (s: any) =>
                    !records.some((r: any) => r.data.studentId === s.id),
                )
                .map((s: any) => [s.id, { ...entry(s), status: 'Present' }]),
            ),
          }))
        }
      >
        Mark unrecorded present
      </Button>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          setSuccess('');
          try {
            await ws.act({
              teaching: true,
              action: 'attendanceBulk',
              classId: choice,
              date,
              period,
              entries: Object.values(edits),
            });
            setEdits({});
            setSuccess(
              'Register saved. Student, class and admin views updated.',
            );
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {students.map((s: any) => {
          const v = entry(s),
            saved = records.find((r: any) => r.data.studentId === s.id);
          return (
            <div className="teacher-register-row" key={s.id}>
              <div>
                <b>{s.name}</b>
                <small>
                  {saved ? 'Recorded: ' + saved.data.status : 'Unmarked'}
                  {edits[s.id] ? ' · Unsaved change' : ''}
                </small>
              </div>
              <TeachingSelect
                label={'Status for ' + s.name}
                value={v.status}
                options={['Present', 'Absent', 'Late', 'Excused']}
                onChange={(x: string) => edit(s, 'status', x)}
              />
              {!saved && !edits[s.id] && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => edit(s, 'status', 'Present')}
                >
                  Mark present
                </Button>
              )}
              {(v.status === 'Late' || edits[s.id] || saved) && (
                <details>
                  <summary>Arrival, reason & follow-up</summary>
                  <div className="teacher-form-grid">
                    {[
                      ['arrivalTime', 'Arrival time', 'time'],
                      [
                        'reason',
                        saved ? 'Correction reason' : 'Reason',
                        'text',
                      ],
                      ['notes', 'Note', 'text'],
                      ['actionTaken', 'Action taken', 'text'],
                      ['followUp', 'Follow-up date', 'date'],
                    ].map(([k, label, type]) => (
                      <label className="field" key={k}>
                        {label}
                        <Input
                          type={type}
                          value={v[k]}
                          onChange={(e) => edit(s, k, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
        {!students.length && (
          <Empty>No students are enrolled in this class.</Empty>
        )}
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        {success && <p role="status">{success}</p>}
        <Button
          disabled={busy || !Object.keys(edits).length || !period.trim()}
          type="submit"
        >
          {busy
            ? 'Saving…'
            : 'Save ' + Object.keys(edits).length + ' attendance changes'}
        </Button>
      </form>
    </section>
  );
}

function TeachingForm({ ws, form, close }: any) {
  const action = form.action,
    row = form.row,
    old = row?.data || {},
    isStudent = row?.kind === 'student',
    isReply = row?.kind === 'reply';
  const classes = ws.rows.filter((r: any) => r.kind === 'class');
  const [v, setV] = useState<any>({
    name: row && !isStudent ? row.name : '',
    classId: form.classId,
    studentId: isStudent ? row.id : old.studentId || '',
    studentIds: old.studentIds || [],
    instructions: old.instructions || '',
    dueAt: old.dueAt?.slice(0, 16) || localDate() + 'T16:00',
    maximumMarks: old.maximumMarks || 20,
    rubric: old.rubric || '',
    submissionType: old.submissionType || 'text',
    resultsPublished: old.resultsPublished === true,
    allowLate: old.allowLate !== false,
    allowReplacement: old.allowReplacement !== false,
    acceptUntil: old.acceptUntil || '',
    submissionsClosed: old.submissionsClosed === true,
    status:
      old.status ||
      (action === 'studentRecord'
        ? 'Open'
        : action === 'assignment'
          ? 'Draft'
          : 'Planning'),
    description: isReply ? '' : old.description || '',
    resources: (old.resources || []).join('\n'),
    attachments: (old.attachments || []).map((x: any) => x.id),
    category: recordCategories.includes(old.category)
      ? old.category
      : 'TeacherConcern',
    occurredAt: old.occurredAt?.slice(0, 16) || localDate() + 'T09:00',
    location: old.location || '',
    severity: old.severity || 'Low',
    actionTaken: old.actionTaken || '',
    internalNote: old.internalNote || old.internalNotes || '',
    studentVisible: old.studentVisible ?? false,
    parentNotify: old.parentNotify ?? false,
    followUp: old.followUp || '',
    whatHappened: old.whatHappened || old.description || '',
    note: old.note || old.internalNote || '',
    changeType: old.changeType || 'NotUsingBus',
    route: old.route || '',
    bus: old.bus || '',
    pickup: old.pickup || '',
    dropoff: old.dropoff || '',
    grade: old.grade ?? '',
    feedback: old.feedback || '',
    internalNotes: old.internalNotes || '',
    returned: old.returned ?? true,
    subject: old.subject || '',
    unit: old.unit || '',
    topic: old.topic || '',
    priority: old.priority || 'Normal',
    expiresAt: old.expiresAt || '',
    threadId: old.threadId || '',
    type: old.type || (action === 'cas' ? 'Service' : 'IA'),
    milestones: old.milestones || '',
    milestoneList: old.milestoneList || [],
    meetingAt: old.meetingAt?.slice(0, 16) || '',
    evidence: old.evidence || '',
    duration: old.duration || 45,
    room: old.room || '',
    results: old.results || [],
    itemId: row?.kind === 'inventory' ? row.id : '',
    quantity: 1,
    purpose: '',
    desiredDate: localDate(),
    notes: '',
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [uploading, setUploading] = useState(false),
    [uploaded, setUploaded] = useState<any[]>([]);
  const cls = classes.find((c: any) => c.id === v.classId),
    students = ws.rows.filter(
      (r: any) =>
        r.kind === 'student' &&
        (studentInClass(r, cls?.name) ||
          r.data.classTeacherId === ws.member.id ||
          r.data.classTeacherId === ws.member.userId ||
          r.data.subjectTeacherIds?.includes(ws.member.id) ||
          r.data.subjectTeacherIds?.includes(ws.member.userId)),
    );
  const set = (key: string, value: any) =>
    setV((old: any) => ({ ...old, [key]: value }));
  const field = (
    key: string,
    label: string,
    type = 'text',
    required = false,
  ) => (
    <label className="field" key={key}>
      {label}
      <Input
        value={v[key] ?? ''}
        type={type}
        required={required}
        maxLength={type === 'text' ? 200 : undefined}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  const area = (key: string, label: string, required = false) => (
    <label className="field">
      {label}
      <Textarea
        value={v[key] || ''}
        required={required}
        rows={3}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  const pick = (key: string, label: string, options: any[]) => (
    <TeachingSelect
      label={label}
      value={v[key]}
      onChange={(x: string) => set(key, x)}
      options={options}
    />
  );
  const check = (key: string, label: string) => (
    <label className="teacher-check">
      <Checkbox checked={!!v[key]} onCheckedChange={(x) => set(key, !!x)} />
      {label}
    </label>
  );
  const files = () => (
    <section className="teacher-files">
      <h3>Links & files</h3>
      {area('resources', 'Resource URLs (one per line)')}
      <label className="field">
        Upload a file (up to 10 MB)
        <Input
          type="file"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            setError('');
            try {
              const data = new FormData();
              data.set('file', file);
              data.set('class', cls.name);
              data.set('subject', v.subject || '');
              data.set('unit', v.unit || '');
              data.set('topic', v.topic || '');
              if (['project', 'cas', 'message'].includes(action)) {
                data.set(
                  'audience',
                  action === 'message' ? 'message' : 'targeted',
                );
                data.set(
                  'studentIds',
                  JSON.stringify(
                    action === 'message'
                      ? v.studentId
                        ? [v.studentId]
                        : students.map((s: any) => s.id)
                      : v.studentIds,
                  ),
                );
              }
              const r = await fetch('/api/files', {
                method: 'POST',
                body: data,
              });
              const d: any = await r.json();
              if (!r.ok) throw Error(d.error);
              setUploaded((old) => [...old, d]);
              setV((old: any) => ({
                ...old,
                attachments: [...old.attachments, d.id],
              }));
              await ws.refresh();
            } catch (e: any) {
              setError(e.message);
            } finally {
              setUploading(false);
            }
          }}
        />
      </label>
      {uploading && <p role="status">Uploading…</p>}
      {[
        ...ws.rows.filter(
          (r: any) =>
            r.kind === 'file' &&
            r.data.class === cls?.name &&
            r.data.audience !== 'submission',
        ),
        ...uploaded.filter((f) => !ws.rows.some((r: any) => r.id === f.id)),
      ].map((f: any) => (
        <label className="teacher-check" key={f.id}>
          <Checkbox
            checked={v.attachments.includes(f.id)}
            onCheckedChange={(checked) =>
              set(
                'attachments',
                checked
                  ? [...v.attachments, f.id]
                  : v.attachments.filter((id: string) => id !== f.id),
              )
            }
          />
          {f.name}
        </label>
      ))}
    </section>
  );
  return (
    <form
      className="teacher-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          if (action === 'labRequest') {
            if (!v.itemId) throw Error('Choose a lab item');
            await ws.act({
              action: 'request',
              id: v.itemId,
              quantity: v.quantity,
              purpose: v.purpose,
              desiredDate: v.desiredDate,
              class: cls.name,
              teacher: ws.member.name,
              notes: v.notes,
            });
          } else {
            const result = await ws.act({
              ...v,
              teaching: true,
              action,
              id: row && !isStudent && !isReply ? row.id : undefined,
              version: row?.version,
              resources: v.resources
                .split('\n')
                .map((s: string) => s.trim())
                .filter(Boolean),
            });
            if (result?.ok === false) throw Error(result.error || 'Unable to save this notice');
          }
          close();
        } catch (e: any) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <TeachingSelect
        label="Class"
        value={v.classId}
        options={classes}
        disabled={!!row && !isStudent && !isReply && row.kind !== 'inventory'}
        onChange={(id: string) =>
          setV((old: any) => ({
            ...old,
            classId: id,
            studentId: '',
            studentIds: [],
            attachments: [],
          }))
        }
      />
      {[
        'assignment',
        'resource',
        'announcement',
        'message',
        'project',
        'cas',
        'exam',
      ].includes(action) && field('name', 'Title', 'text', true)}
      {action === 'assignment' && (
        <>
          {area('instructions', 'Instructions', true)}
          <div className="teacher-form-grid">
            {field('dueAt', 'Due date & time', 'datetime-local', true)}
            {field('maximumMarks', 'Maximum marks', 'number', true)}
            {pick('submissionType', 'Submission type', [
              'text',
              'file',
              'either',
              'link',
              'none',
            ])}
            {pick('status', 'Publication', ['Draft', 'Published'])}
          </div>
          {area('rubric', 'Rubric / assessment criteria')}
          {field(
            'acceptUntil',
            'Final submission cutoff (optional)',
            'datetime-local',
          )}
          {['allowLate', 'allowReplacement', 'submissionsClosed'].map((k) => (
            <label className="student-check" key={k}>
              <input
                type="checkbox"
                checked={v[k]}
                onChange={(e) => set(k, e.target.checked)}
              />
              {
                {
                  allowLate: 'Allow late submissions',
                  allowReplacement: 'Allow replacement submissions',
                  submissionsClosed: 'Close submissions',
                }[k]
              }
            </label>
          ))}
          {files()}
        </>
      )}
      {action === 'studentRecord' && (
        <>
          {pick('studentId', 'Student', students)}
          <div className="teacher-form-grid">
            {pick('category', 'Category', recordCategories)}
            {field('occurredAt', 'Date & time', 'datetime-local', true)}
            {field('location', 'Location')}
            {pick('severity', 'Severity', ['Low', 'Medium', 'High'])}
          </div>
          {area('description', 'Description', true)}
          {area('actionTaken', 'Action taken / follow-up notes')}
          {area(
            'internalNote',
            'Internal note — teachers and authorized admins only',
          )}
          {field('followUp', 'Follow-up date', 'date')}
          {pick('status', 'Status', ['Open', 'Monitoring', 'Resolved'])}
          {check('studentVisible', 'Allow the student to see this record')}
          {check(
            'parentNotify',
            'Flag parent contact for staff follow-up (does not send a message)',
          )}
        </>
      )}
      {action === 'behaviorReport' && (
        <>
          {pick('studentId', 'Student', students)}
          <div className="teacher-form-grid">
            {pick('category', 'Category', ['Late', 'Uniform', 'MissingHomework', 'Disruption', 'DeviceUse', 'AcademicConcern', 'BehaviourConcern', 'PositiveBehaviour', 'Achievement', 'Other'])}
            {field('occurredAt', 'Date & time', 'datetime-local', true)}
            {field('class', 'Class / section')}
            {field('location', 'Location')}
            {pick('severity', 'Severity', ['Low', 'Medium', 'High'])}
          </div>
          {area('whatHappened', 'What happened', true)}
          {area('actionTaken', 'Action taken')}
          {area('note', 'Internal note')}
          {field('followUp', 'Follow-up date', 'date')}
          {pick('status', 'Status', ['Open', 'Monitoring', 'Resolved'])}
          {check('studentVisible', 'Allow the student to see this report')}
        </>
      )}
      {action === 'transportNotice' && (
        <>
          {pick('studentId', 'Student', students)}
          <div className="teacher-form-grid">
            {field('date', 'Date', 'date', true)}
            {pick('changeType', 'Change type', ['NotComingByBus', 'NotGoingByBus', 'PickupChange', 'DropoffChange', 'Other'])}
            {field('route', 'Route (optional)')}
            {field('bus', 'Bus (optional)')}
            {field('pickup', 'Pickup change (optional)')}
            {field('dropoff', 'Drop-off change (optional)')}
          </div>
          {area('reason', 'Reason')}
          {area('notes', 'Notes')}
        </>
      )}
      {action === 'gradeWork' && (
        <>
          <p className="log-text">{old.text}</p>
          {field('grade', 'Mark', 'number', true)}
          {area('feedback', 'Student feedback', true)}
          {area('internalNotes', 'Private grading notes — staff only')}
          {check('returned', 'Return this grade and feedback to the student')}
        </>
      )}
      {action === 'resource' && (
        <>
          <div className="teacher-form-grid">
            {field('subject', 'Subject')}
            {field('unit', 'Unit')}
            {field('topic', 'Topic')}
          </div>
          {area('description', 'Description')}
          {files()}
        </>
      )}
      {['message', 'announcement'].includes(action) && (
        <>
          {pick('studentId', 'Audience', [
            { id: '', name: 'Whole class' },
            ...students,
          ])}
          {area('description', 'Message', true)}
          {action === 'announcement' && (
            <>
              {pick('priority', 'Priority', ['Normal', 'Important', 'Urgent'])}
              {field('expiresAt', 'Expiry date (optional)', 'date')}
            </>
          )}
          {files()}
        </>
      )}
      {action === 'labRequest' && (
        <>
          {pick(
            'itemId',
            'Equipment / material',
            ws.rows
              .filter((r: any) => r.kind === 'inventory')
              .map((r: any) => ({
                ...r,
                name:
                  r.name +
                  ' · ' +
                  r.quantity +
                  ' ' +
                  r.data.unit +
                  ' available',
              })),
          )}
          {field('quantity', 'Quantity', 'number', true)}
          {field('desiredDate', 'Needed on', 'date', true)}
          {area('purpose', 'Experiment / purpose', true)}
          {area('notes', 'Notes')}
        </>
      )}
      {['project', 'cas'].includes(action) && (
        <>
          <fieldset>
            <legend>Supervised students</legend>
            {students.map((s: any) => (
              <label className="teacher-check" key={s.id}>
                <Checkbox
                  checked={v.studentIds.includes(s.id)}
                  onCheckedChange={(checked) =>
                    set(
                      'studentIds',
                      checked
                        ? [...v.studentIds, s.id]
                        : v.studentIds.filter((id: string) => id !== s.id),
                    )
                  }
                />
                {s.name}
              </label>
            ))}
          </fieldset>
          {pick(
            'type',
            action === 'cas' ? 'CAS strand' : 'Project type',
            action === 'cas'
              ? ['Creativity', 'Activity', 'Service']
              : ['IA', 'EE', 'Personal', 'Group'],
          )}
          {area('description', 'Description', true)}
          {area('milestones', 'Milestones and deadlines')}
          <h3>Dated milestones</h3>
          {v.milestoneList.map((m: any, i: number) => (
            <div className="teacher-form-grid" key={i}>
              <label className="field">
                Milestone title
                <Input
                  required
                  maxLength={200}
                  value={m.title}
                  onChange={(e) =>
                    set(
                      'milestoneList',
                      v.milestoneList.map((x: any, j: number) =>
                        j === i ? { ...x, title: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="field">
                Due date
                <Input
                  required
                  type="date"
                  value={m.dueAt}
                  onChange={(e) =>
                    set(
                      'milestoneList',
                      v.milestoneList.map((x: any, j: number) =>
                        j === i ? { ...x, dueAt: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label className="teacher-check">
                <Checkbox
                  checked={!!m.completed}
                  onCheckedChange={(checked) =>
                    set(
                      'milestoneList',
                      v.milestoneList.map((x: any, j: number) =>
                        j === i ? { ...x, completed: !!checked } : x,
                      ),
                    )
                  }
                />
                Completed
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  set(
                    'milestoneList',
                    v.milestoneList.filter((_: any, j: number) => j !== i),
                  )
                }
              >
                Remove milestone
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              set('milestoneList', [
                ...v.milestoneList,
                { title: '', dueAt: localDate(), completed: false },
              ])
            }
          >
            Add dated milestone
          </Button>
          {field('dueAt', 'Final deadline', 'datetime-local', true)}
          {field('meetingAt', 'Next meeting', 'datetime-local')}
          {area('evidence', 'Evidence / reflections')}
          {area('feedback', 'Supervisor comments / feedback')}
          {pick('status', 'Review status', [
            'Planning',
            'InProgress',
            'Submitted',
            'ChangesRequested',
            'Approved',
            'Completed',
          ])}
          {files()}
        </>
      )}
      {action === 'exam' && (
        <>
          <div className="teacher-form-grid">
            {field('dueAt', 'Date & time', 'datetime-local', true)}
            {field('duration', 'Duration (minutes)', 'number', true)}
            {field('room', 'Room', 'text', true)}
          </div>
          {area('description', 'Exam information / notices')}
          <h3>Subject results (percentage)</h3>
          <label className="student-check">
            <input
              type="checkbox"
              checked={v.resultsPublished}
              onChange={(e) => set('resultsPublished', e.target.checked)}
            />
            Publish results to each student
          </label>
          {students.map((s: any) => (
            <label className="field" key={s.id}>
              {s.name}
              <Input
                type="number"
                min={0}
                max={100}
                value={
                  v.results.find((r: any) => r.studentId === s.id)?.mark ?? ''
                }
                onChange={(e) =>
                  set('results', [
                    ...v.results.filter((r: any) => r.studentId !== s.id),
                    ...(e.target.value !== ''
                      ? [{ studentId: s.id, mark: Number(e.target.value) }]
                      : []),
                  ])
                }
              />
            </label>
          ))}
        </>
      )}
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      <div className="detail-actions">
        <Button type="submit" disabled={busy || uploading}>
          {busy ? 'Saving…' : action === 'message' ? 'Send message' : 'Save'}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={close}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
