'use client';
import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import {
  FlaskConical,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  LayoutGrid,
  List,
  Package,
  AlertTriangle,
  Clock,
  Check,
  ChevronRight,
  Download,
  SlidersHorizontal,
  ArrowDownUp,
  Microscope,
  Atom,
  Beaker,
  CalendarDays,
  FileText,
  ShieldCheck,
  Mail,
  RefreshCw,
  LogOut,
  User,
  Wrench,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { classes } from '@/lib/seed';
import { getMockWorkspaceData, handleMockMutation } from '@/lib/mock-workspace';
import { ClassHistory, ClassLogDetail } from './class-logs';
import { AttendanceRegister } from './attendance-register';
import { MessageThread } from './message-thread';
import { calendarEvents } from '@/lib/teaching';
import { navigateWebsite } from '@/lib/web-navigation';
const Analytics = lazy(() => import('./analytics'));
export function Pick({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v || '')}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((x) => (
          <SelectItem key={x} value={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function useWorkspace(initialUser?: any) {
  const requestNumber = useRef(0);
  const [state, setState] = useState<any>(() => {
    return getMockWorkspaceData(initialUser);
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function refresh() {
    const request = ++requestNumber.current;
    try {
      const r = await fetch('/api/workspace', { cache: 'no-store' });
      if (r.ok) {
        const d: any = await r.json();
        if (request !== requestNumber.current) return;
        if (d && (d.rows?.length || d.member)) {
          setState(d);
          setError('');
          return;
        }
      }
      const failure: any = await r.json().catch(() => null);
      if (r.status === 401 && initialUser && !String(initialUser.userId || '').startsWith('dev:')) {
        const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' }).catch(() => null);
        if (refreshed?.ok) return refresh();
      }
      if (failure?.mode === 'supabase') {
        if (request !== requestNumber.current) return;
        setError(failure.error || 'School data could not be loaded.');
        return;
      }
      // The rich mock workspace is deliberately retained for demo mode only.
      const mockData = getMockWorkspaceData(initialUser || state.member);
      if (request !== requestNumber.current) return;
      setState(mockData);
      setError('');
    } catch {
      // A real signed-in Supabase user must see a recoverable error instead of
      // a fabricated school dataset. Dev profiles remain fully functional.
      if (request !== requestNumber.current) return;
      if (initialUser && !String(initialUser.userId || '').startsWith('dev:')) {
        setError('School data could not be loaded. Check your connection and try again.');
        return;
      }
      const mockData = getMockWorkspaceData(initialUser || state.member);
      setState(mockData);
      setError('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Never flash demo records for a real Supabase session while its workspace
    // is loading. Demo profiles intentionally keep their complete seed data.
    if (initialUser && !String(initialUser.userId || '').startsWith('dev:')) {
      setState({ rows: [], contacts: [], audit: [], members: [], masterRows: [], member: { name: initialUser.displayName || initialUser.email, role: '' } });
    } else {
      setState(getMockWorkspaceData(initialUser));
    }
    refresh();
    const update = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const timer = setInterval(update, 10000);
    window.addEventListener('focus', update);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', update);
      requestNumber.current++;
    };
  }, [initialUser?.userId, initialUser?.role]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 4500);
      return () => clearTimeout(t);
    }
  }, [message]);

  async function act(payload: any) {
    try {
      const r = await fetch(
        payload.student
          ? '/api/student'
          : payload.teaching
            ? '/api/teaching'
            : payload.action === 'classLog'
              ? '/api/class-logs'
              : '/api/workspace',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (r.ok) {
        const d: any = await r.json();
        await refresh();
        setMessage('Saved successfully');
        return d;
      }
    } catch {}

    // Fallback: Apply mutation to in-memory mock store
    const result = handleMockMutation(payload, state.member);
    const updatedMock = getMockWorkspaceData(state.member);
    setState(updatedMock);
    setMessage('Saved successfully');
    return result;
  }

  return { ...state, error, loading, refresh, act, message };
}
const allowed: Record<string, string[]> = {
  Admin: ['inventory', 'book', 'assignment', 'record', 'loan'],
  Teacher: ['assignment', 'record'],
  'Lab Assistant': ['inventory'],
  Librarian: ['book', 'loan'],
  'Library Assistant': ['book', 'loan'],
  'Department Head': ['assignment', 'record'],
  Student: [],
};
const tabMap: Record<string, string[]> = {
  Labs: ['Overview', 'Chemistry', 'Physics', 'Biology', 'Requests', 'Activity'],
  Library: ['Overview', 'Browse', 'Borrowing', 'Requests', 'History'],
  Academics: [
    'Overview',
    'Classes',
    'Class history',
    'Assignments',
    'Calendar',
    'Grades',
    'Resources',
  ],
  Students: ['Overview', 'Students', 'Reports', 'Attendance', 'Records'],
  Settings: ['Profile', 'Workspace', 'Members', 'Permissions', 'Audit log'],
};
export function GlobalSearch({
  open,
  setOpen,
  rows,
  navigate,
  select,
  adminOpen,
  role,
}: any) {
  const destinations = [
    'Home',
    'Labs',
    'Library',
    'Academics',
    'Students',
    ...(['Admin', 'Head of School'].includes(role) ? ['Teacher Inquiry', 'Student Search'] : []),
    ...(role === 'Student' ? ['Directory'] : []),
    'Calendar',
    'Notifications',
    'Settings',
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="search-dialog">
        <DialogTitle className="sr-only">Search SchoolOS</DialogTitle>
        <DialogDescription className="sr-only">
          Find items, books, students and assignments.
        </DialogDescription>
        <Command>
          <CommandInput placeholder="Search your entire school…" />
          <CommandList>
            <CommandEmpty>No matching results.</CommandEmpty>
            <CommandGroup heading="Go to">
              {destinations.map((p) => (
                <CommandItem
                  key={p}
                  onSelect={() => {
                    navigate(p);
                    setOpen(false);
                  }}
                >
                  {p}
                  <ArrowUpRight className="ml-auto" size={14} />
                </CommandItem>
              ))}
            </CommandGroup>
            {['Admin', 'Head of School'].includes(role) && (
              <CommandGroup heading="Open unified record">
                {rows.filter((r: any) => r.kind === 'student' || (r.kind === 'staff' && /teacher/i.test(`${r.data?.role || ''} ${r.data?.title || ''}`))).slice(0, 40).map((r: any) => {
                  const isTeacher = r.kind === 'staff'; const target = isTeacher ? 'Teacher Inquiry' : 'Student Search';
                  return <CommandItem key={`lookup-${r.id}`} value={`${isTeacher ? 'teacher' : 'student'} ${r.name} ${JSON.stringify(r.data)}`} onSelect={() => { sessionStorage.setItem('schoolos-record-lookup', JSON.stringify({ kind: isTeacher ? 'teacher' : 'student', id: r.id })); navigate(target); setOpen(false); }}>
                    {isTeacher ? 'Teacher' : 'Student'}: {r.name}<ArrowUpRight className="ml-auto" size={14} />
                  </CommandItem>;
                })}
              </CommandGroup>
            )}
            {[...new Set<string>(rows.map((r: any) => r.kind))].map((kind) => (
              <CommandGroup
                key={kind}
                heading={kind === 'inventory' ? 'Lab inventory' : kind + 's'}
              >
                {rows
                  .filter((r: any) => r.kind === kind)
                  .map((r: any) => (
                    <CommandItem
                      key={r.id}
                      value={r.name + ' ' + JSON.stringify(r.data)}
                      onSelect={() => {
                        if (adminOpen) {
                          adminOpen(r);
                          setOpen(false);
                          return;
                        }
                        navigate(
                          (
                            {
                              inventory: 'Labs',
                              book: 'Library',
                              student: 'Students',
                              class: 'Academics',
                              assignment: 'Academics',
                              classLog: 'Academics',
                              attendance: 'Students',
                              staff: 'Settings',
                            } as any
                          )[r.kind] || 'Academics',
                        );
                        select(r);
                        setOpen(false);
                      }}
                    >
                      {r.name}
                      <span className="ml-auto text-xs text-slate-400">
                        {r.data.lab || r.data.class || r.data.author}
                      </span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
export function Modules({ page, ws, navigate, selected, setSelected }: any) {
  const { rows, member, audit, act, loading, error } = ws;
  const [tab, setTab] = useState('Overview'),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All categories'),
    [availability, setAvailability] = useState('Any availability'),
    [sort, setSort] = useState('Name A–Z'),
    [view, setView] = useState('grid'),
    [pagination, setPagination] = useState(1),
    [form, setForm] = useState<any>(null);
  useEffect(() => {
    setTab(page === 'Settings' ? 'Profile' : 'Overview');
    setQuery('');
    setFilter('All categories');
    setAvailability('Any availability');
    setPagination(1);
  }, [page]);
  useEffect(() => setPagination(1), [tab, query, filter, availability, sort]);
  const can = (k: string) => allowed[member.role]?.includes(k);
  const kinds = (k: string) => rows.filter((r: any) => r.kind === k);
  let kind =
    page === 'Labs'
      ? 'inventory'
      : page === 'Library'
        ? 'book'
        : page === 'Academics'
          ? tab === 'Classes'
            ? 'class'
            : tab === 'Grades'
              ? 'submission'
              : 'assignment'
          : page === 'Students'
            ? tab === 'Records' || tab === 'Reports'
              ? 'record'
              : 'student'
            : 'notification';
  let list = kinds(kind);
  if (page === 'Labs' && ['Chemistry', 'Physics', 'Biology'].includes(tab))
    list = list.filter((r: any) => r.data.lab === tab);
  if (tab === 'Requests')
    list = kinds('request').filter(
      (r: any) => r.data.type === (page === 'Labs' ? 'lab' : 'library'),
    );
  if (page === 'Library' && ['Borrowing', 'History'].includes(tab))
    list = kinds('loan').filter((r: any) =>
      tab === 'History'
        ? r.data.status === 'Returned'
        : r.data.status === 'Borrowed',
    );
  if (tab === 'Activity')
    list = audit.map((a: any) => ({
      id: a.id,
      name: a.action,
      kind: 'audit',
      data: a,
    }));
  list = list.filter((r: any) =>
    (r.name + ' ' + Object.values(r.data).join(' '))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (filter !== 'All categories')
    list = list.filter(
      (r: any) =>
        (r.data.category || r.data.subject || r.data.class) === filter,
    );
  if (availability !== 'Any availability')
    list = list.filter((r: any) =>
      availability === 'Available'
        ? r.quantity > 0
        : availability === 'Unavailable'
          ? r.quantity === 0
          : r.quantity <= r.data.minimumQuantity,
    );
  list.sort((a: any, b: any) =>
    sort === 'Name A–Z'
      ? a.name.localeCompare(b.name)
      : sort === 'Availability'
        ? b.quantity - a.quantity
        : (b.updatedAt || '').localeCompare(a.updatedAt || ''),
  );
  const count = list.length;
  const shown = list.slice((pagination - 1) * 12, pagination * 12);
  const iconFor = (r: any) =>
    r.kind === 'book'
      ? BookOpen
      : r.kind === 'student'
        ? Users
        : r.kind === 'assignment' || r.kind === 'class'
          ? GraduationCap
          : r.data.lab === 'Biology'
            ? Microscope
            : r.data.lab === 'Physics'
              ? Atom
              : Beaker;
  const open = (r: any) => {
    if (member.role === 'Teacher' && rows.some((x: any) => x.id === r.id)) {
      navigate('Home');
      navigateWebsite(
        '/teacher/' +
          (r.kind === 'class' ? 'class' : 'record') +
          '/' +
          encodeURIComponent(r.id),
      );
    } else setSelected(r);
  };
  const mutate = (type: string, r: any) => {
    setSelected(null);
    setForm({ type, row: r });
  };
  const title: any = {
    Labs: ['Labs', 'More discovery. Less searching.'],
    Library: ['Library', 'Find your next read. Keep every copy accounted for.'],
    Academics: ['Academics', 'A clear view of teaching and learning.'],
    Students: ['Student management', 'Every student, seen and supported.'],
    Calendar: ['School calendar', 'Classes and deadlines, all in view.'],
    Notifications: ['Notifications', 'Stay connected to what matters.'],
    Settings: ['Settings', 'Your account and school workspace.'],
    'Help & support': [
      'How can we help?',
      'A little guidance for a more connected school.',
    ],
  };
  const exportCsv = () => {
    const csv = [
      'Name,Type,Quantity,Details',
      ...list.map((r: any) =>
        [r.name, r.kind, r.quantity ?? '', JSON.stringify(r.data)]
          .map((x) => '"' + String(x).replaceAll('"', '""') + '"')
          .join(','),
      ),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'schoolos-' + page.toLowerCase() + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <div className="page-heading module-heading">
        <div>
          <div className="eyebrow">WESTBRIDGE INTERNATIONAL</div>
          <h1>{title[page]?.[0] || page}</h1>
          <p>{title[page]?.[1]}</p>
        </div>
        <div className="button-row">
          {['Labs', 'Library', 'Students', 'Academics'].includes(page) && (
            <Button variant="outline" onClick={exportCsv}>
              <Download size={15} /> Export
            </Button>
          )}
          {can(kind) &&
            ['inventory', 'book', 'assignment', 'record'].includes(kind) && (
              <Button onClick={() => setForm({ type: 'save', kind })}>
                <Plus size={16} /> Add {kind === 'inventory' ? 'item' : kind}
              </Button>
            )}
        </div>
      </div>
      {error && (
        <div className="error-banner" role="alert">
          {error === 'UNAUTHORIZED' ? (
            <a href="/signin-with-chatgpt?return_to=/" target="_top">
              Sign in to open your school workspace →
            </a>
          ) : (
            <>
              Could not load your workspace.{' '}
              <Button variant="outline" onClick={ws.refresh}>
                Retry
              </Button>
            </>
          )}
        </div>
      )}
      {loading ? (
        <div className="stats">
          {[1, 2, 3, 4].map((x) => (
            <Skeleton key={x} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          {tabMap[page] && (
            <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
              <TabsList variant="line" className="module-tabs">
                {tabMap[page].map((t) => (
                  <TabsTrigger value={t} key={t}>
                    {t}
                    {t === 'Requests' && (
                      <span className="count">
                        {
                          kinds('request').filter(
                            (r: any) =>
                              r.data.status === 'Pending' &&
                              r.data.type ===
                                (page === 'Labs' ? 'lab' : 'library'),
                          ).length
                        }
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          {['Labs', 'Library', 'Students', 'Academics'].includes(page) &&
            tab === 'Overview' && (
              <>
                <div className="stats module-stats">
                  {(page === 'Labs'
                    ? [
                        [
                          'Inventory items',
                          kinds('inventory').length,
                          'Across three laboratories',
                        ],
                        [
                          'Low stock',
                          kinds('inventory').filter(
                            (r: any) =>
                              r.quantity <= r.data.minimumQuantity &&
                              r.quantity > 0,
                          ).length,
                          'Time to plan a restock',
                        ],
                        [
                          'Unavailable',
                          kinds('inventory').filter((r: any) => !r.quantity)
                            .length,
                          'Request what you need',
                        ],
                        [
                          'Pending requests',
                          kinds('request').filter(
                            (r: any) =>
                              r.data.type === 'lab' &&
                              r.data.status === 'Pending',
                          ).length,
                          'Awaiting review',
                        ],
                      ]
                    : page === 'Library'
                      ? [
                          [
                            'Book titles',
                            kinds('book').length,
                            'Your school collection',
                          ],
                          [
                            'Available copies',
                            kinds('book').reduce(
                              (n: number, r: any) => n + r.quantity,
                              0,
                            ),
                            'Ready to borrow',
                          ],
                          [
                            'On loan',
                            kinds('loan').filter(
                              (r: any) => r.data.status === 'Borrowed',
                            ).length,
                            'Across the school',
                          ],
                          [
                            'Requests',
                            kinds('request').filter(
                              (r: any) => r.data.type === 'library',
                            ).length,
                            'Reading starts here',
                          ],
                        ]
                      : page === 'Academics'
                        ? [
                            ['Active classes', kinds('class').length, 'Term 1'],
                            [
                              'Assignments',
                              kinds('assignment').length,
                              'Published coursework',
                            ],
                            [
                              'Submissions',
                              kinds('submission').length,
                              'Ready to review',
                            ],
                            [
                              'Graded',
                              kinds('submission').filter(
                                (r: any) => r.data.status === 'Graded',
                              ).length,
                              'Feedback delivered',
                            ],
                          ]
                        : [
                            [
                              'Enrolled students',
                              kinds('student').length,
                              'Grades 11 and 12',
                            ],
                            ['Homerooms', 2, '11A and 12B'],
                            [
                              'Student records',
                              kinds('record').length,
                              'Support and recognition',
                            ],
                            [
                              'Positive recognition',
                              kinds('record').filter(
                                (r: any) =>
                                  r.data.category === 'Positive behaviour',
                              ).length,
                              'Celebrating progress',
                            ],
                          ]
                  ).map(([label, note, sub]) => (
                    <div className="stat" key={label}>
                      <div>
                        {label}
                        <Package size={16} />
                      </div>
                      <strong>{note}</strong>
                      <small>{sub}</small>
                    </div>
                  ))}
                </div>
                {page === 'Labs' && (
                  <div className="lab-shortcuts">
                    {['Chemistry', 'Physics', 'Biology'].map((lab, i) => {
                      const Icon = [FlaskConical, Atom, Microscope][i];
                      return (
                        <button onClick={() => setTab(lab)} key={lab}>
                          <span
                            className={
                              'app-icon ' + ['blue', 'purple', 'green'][i]
                            }
                          >
                            <Icon size={22} />
                          </span>
                          <div>
                            <b>{lab} laboratory</b>
                            <small>
                              {
                                kinds('inventory').filter(
                                  (r: any) => r.data.lab === lab,
                                ).length
                              }{' '}
                              items · Explore inventory
                            </small>
                          </div>
                          <ArrowRight size={16} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          {page === 'Settings' ? (
            <div className="settings-panel panel">
              {tab === 'Profile' ? (
                <div className="settings-profile-section">
                  <div className="settings-profile-card">
                    <span className="avatar large">
                      {member.name?.slice(0, 2).toUpperCase() || 'SC'}
                    </span>
                    <div className="settings-profile-meta">
                      <h2>{member.name || 'User'}</h2>
                      <div className="settings-profile-role-row">
                        <span className={`role-pill ${(member.role || 'student').toLowerCase()}`}>
                          {member.role || 'Student'}
                        </span>
                        <span className="school-tag">Westbridge International</span>
                      </div>
                      <p className="settings-profile-email">{member.email || 'dev.user@schoolos.local'}</p>
                    </div>
                  </div>

                  <div className="settings-dev-switchers">
                    <div className="settings-switch-heading">
                      <h3>Switch test profile</h3>
                      <p>Instant role switching for local and preview testing.</p>
                    </div>
                    <div className="settings-switch-grid">
                      {[
                        {
                          role: 'admin',
                          name: 'Nithin Selvaraj',
                          title: 'School Administrator',
                          badge: 'Admin',
                          icon: Wrench,
                        },
                        {
                          role: 'teacher',
                          name: 'Maya Iyer',
                          title: 'Physics & Math HL Teacher',
                          badge: 'Teacher',
                          icon: Users,
                        },
                        {
                          role: 'student',
                          name: 'Nithin Selvaraj',
                          title: 'DP-2 Student (IBDP)',
                          badge: 'Student',
                          icon: User,
                        },
                        {
                          role: 'lab-assistant',
                          name: 'Olivia Reed',
                          title: 'Science Lab Assistant',
                          badge: 'Lab Assistant',
                          icon: FlaskConical,
                        },
                        {
                          role: 'library-assistant',
                          name: 'Daniel Moore',
                          title: 'Library Assistant',
                          badge: 'Library Assistant',
                          icon: BookOpen,
                        },
                      ].map((p) => {
                        const isActive = (member.role || '').toLowerCase().replace(/\s+/g, '-') === p.role;
                        const Icon = p.icon;
                        return (
                          <a
                            key={p.role}
                            href={`/api/dev-login?role=${p.role}&return_to=/`}
                            className={`settings-switch-card ${isActive ? 'active' : ''}`}
                          >
                            <span className={`profile-switch-avatar ${p.role}`}>
                              <Icon size={16} />
                            </span>
                            <div className="settings-switch-card-info">
                              <b>{p.name}</b>
                              <small>{p.title}</small>
                            </div>
                            {isActive ? (
                              <span className="current-badge">Active</span>
                            ) : (
                              <ChevronRight size={15} className="settings-switch-arrow" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  <div className="settings-auth-actions">
                    <p>
                      Your identity is verified through platform session sign-in. School
                      permissions are enforced on every server request.
                    </p>
                    <a
                      className="settings-signout-btn"
                      href="/api/dev-login?role=clear&return_to=/"
                      target="_top"
                    >
                      <LogOut size={16} />
                      <span>Sign out of profile</span>
                    </a>
                  </div>
                </div>
              ) : tab === 'Members' ? (
                <>
                  <div className="section-heading">
                    <h2>School members</h2>
                    {member.role === 'Admin' && (
                      <Button onClick={() => setForm({ type: 'member' })}>
                        <Plus size={15} /> Grant access
                      </Button>
                    )}
                  </div>
                  <DataTable
                    headers={['Name', 'Role', 'Email', 'Classes']}
                    rows={(ws.members || []).map((m: any) => [
                      m.name,
                      m.role,
                      m.email || 'Signed-in owner',
                      m.classes || 'All permitted',
                    ])}
                  />
                  <p>
                    Access grants take effect when the person signs in with the
                    matching email. No email is sent.
                  </p>
                </>
              ) : tab === 'Workspace' ? (
                <>
                  <h2>Westbridge International</h2>
                  <p>Academic year 2026–27 · Term 1</p>
                  <p>
                    This private demo school belongs to your signed-in account.
                    Records persist across sessions and are isolated from other
                    accounts.
                  </p>
                  <div className="info-box">
                    Grant school access in Members. Password and Google sign-in
                    and district provisioning need a separate production
                    integration.
                  </div>
                </>
              ) : tab === 'Permissions' ? (
                <>
                  <h2>Role permissions</h2>
                  <DataTable
                    headers={['Role', 'Manage']}
                    rows={Object.entries(allowed).map(([role, p]) => [
                      role,
                      p.join(', ') || 'Own submissions and requests',
                    ])}
                  />
                  <p>
                    Only assigned roles grant access. A client cannot select a
                    role or organization to elevate privileges.
                  </p>
                </>
              ) : (
                <AuditList audit={audit} />
              )}
            </div>
          ) : page === 'Help & support' ? (
            <div className="help-grid">
              {[
                [
                  'Find a lab item',
                  'Open Labs, choose a laboratory, then search by name or filter by category. The stock badge shows the current available quantity.',
                ],
                [
                  'Request equipment or a book',
                  'Open the item and choose Request. Add the quantity, purpose and date. Track progress in the Requests tab.',
                ],
                [
                  'Keep stock trustworthy',
                  'Use Record usage or Add stock in an item detail. Review the resulting stock, then confirm. Every change is recorded in the audit trail.',
                ],
                [
                  'Manage library borrowing',
                  'Open a book, choose Issue book, select a student and due date. Return it from Borrowing to make the copy available again.',
                ],
                [
                  'Support a student',
                  'Open Students, select a profile, and add a record. Include both academic concerns and positive recognition.',
                ],
                [
                  'Find anything faster',
                  'Press Command K or Control K to search students, books, lab inventory, classes and assignments.',
                ],
              ].map(([h, p]) => (
                <section className="panel help-card" key={h}>
                  <h2>{h}</h2>
                  <p>{p}</p>
                </section>
              ))}
            </div>
          ) : page === 'Academics' && tab === 'Class history' ? (
            <ClassHistory ws={ws} />
          ) : page === 'Calendar' ||
            (page === 'Academics' && tab === 'Calendar') ? (
            <Calendar rows={rows} open={open} />
          ) : page === 'Notifications' ? (
            <section className="panel">
              <div className="notification-panel-heading">
                <div>
                  <h2>Notifications</h2>
                  <p>{kinds('notification').filter((r: any) => !r.data.read).length} unread</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!kinds('notification').some((r: any) => !r.data.read)}
                  onClick={() => void act({ action: 'notificationsReadAll' })}
                >
                  Mark all as read
                </Button>
              </div>
              {kinds('notification').map((r: any) => (
                <div
                  className={'notification-row ' + (r.data.read ? 'is-read' : 'is-unread')}
                  key={r.id}
                >
                  <span
                    className={'read-dot ' + (r.data.read ? 'is-read' : '')}
                  />
                  <button
                    className="notification-row-content"
                    onClick={async () => {
                      await act({ action: 'notificationRead', id: r.id, read: true });
                      if (r.data.target) navigate(r.data.target);
                    }}
                  >
                    <b>{r.name}</b>
                    <p>{r.data.description}</p>
                    <small>
                      {r.data.date} · {r.data.target || 'SchoolOS'}
                    </small>
                  </button>
                  <button
                    className="notification-read-toggle"
                    onClick={() => void act({ action: 'notificationRead', id: r.id, read: !r.data.read })}
                  >
                    {r.data.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <ChevronRight size={16} />
                </div>
              ))}
            </section>
          ) : page === 'Academics' && tab === 'Resources' ? (
            <div className="help-grid">
              {kinds('file').map((f: any) => (
                <section className="panel help-card" key={f.id}>
                  <FileText className="text-blue-500" />
                  <h2>{f.name}</h2>
                  <p>
                    {f.data.class} · {Math.ceil(f.data.size / 1024)} KB
                  </p>
                  <a
                    className="resource-link"
                    href={'/api/files?id=' + encodeURIComponent(f.id)}
                  >
                    Download attachment <Download size={14} />
                  </a>
                </section>
              ))}
              {classes.map((c, i) => (
                <section className="panel help-card" key={c}>
                  <FileText className="text-blue-500" />
                  <h2>{c} · Study resources</h2>
                  <p>
                    Open-access reference materials for independent learning.
                  </p>
                  <a
                    href={
                      [
                        'https://openstax.org/subjects/science',
                        'https://openstax.org/details/books/chemistry-2e',
                        'https://openstax.org/details/books/biology-2e',
                        'https://openstax.org/subjects/math',
                        'https://www.gutenberg.org/',
                        'https://openstax.org/subjects/social-sciences',
                      ][i]
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="resource-link"
                  >
                    Browse resources <ArrowUpRight size={14} />
                  </a>
                </section>
              ))}
            </div>
          ) : tab === 'Activity' ? (
            <AuditList audit={audit} />
          ) : (
            <>
              {page === 'Students' && tab === 'Reports' && (
                <Suspense fallback={<Skeleton className="h-60" />}>
                  <Analytics rows={rows} />
                </Suspense>
              )}
              <div className="section-heading">
                <h2>
                  {tab === 'Requests'
                    ? 'Requests'
                    : tab === 'Borrowing'
                      ? 'Current loans'
                      : tab === 'History'
                        ? 'Borrowing history'
                        : page === 'Labs'
                          ? 'Explore inventory'
                          : page === 'Library'
                            ? 'Discover your next read'
                            : page === 'Students'
                              ? kind === 'record'
                                ? 'Student records'
                                : 'Student directory'
                              : tab === 'Grades'
                                ? 'Grades & feedback'
                                : kind === 'class'
                                  ? 'Your classes'
                                  : 'Assignments'}
                </h2>
                <span>{count} results</span>
              </div>
              <div className="filter-bar">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    aria-label="Search this view"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      page === 'Labs'
                        ? 'Search inventory…'
                        : page === 'Library'
                          ? 'Search title, author or ISBN…'
                          : 'Search…'
                    }
                  />
                </div>
                {!['Requests', 'Borrowing', 'History', 'Grades'].includes(
                  tab,
                ) && (
                  <Pick
                    label="Category"
                    value={filter}
                    onChange={setFilter}
                    options={[
                      'All categories',
                      ...(Array.from(
                        new Set(
                          kinds(kind)
                            .map(
                              (r: any) =>
                                r.data.category ||
                                r.data.subject ||
                                r.data.class,
                            )
                            .filter(Boolean),
                        ),
                      ) as string[]),
                    ]}
                  />
                )}
                {['inventory', 'book'].includes(kind) &&
                  !['Requests', 'Borrowing', 'History'].includes(tab) && (
                    <Pick
                      label="Availability"
                      value={availability}
                      onChange={setAvailability}
                      options={[
                        'Any availability',
                        'Available',
                        'Low stock',
                        'Unavailable',
                      ]}
                    />
                  )}
                <Pick
                  label="Sort results"
                  value={sort}
                  onChange={setSort}
                  options={['Name A–Z', 'Recently updated', 'Availability']}
                />
                <div className="view-switch">
                  <Button
                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    aria-label="Grid view"
                    onClick={() => setView('grid')}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                  <Button
                    variant={view === 'table' ? 'secondary' : 'ghost'}
                    size="icon"
                    aria-label="Table view"
                    onClick={() => setView('table')}
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
              {count === 0 ? (
                <div className="empty-state">
                  <Search />
                  <h3>{query ? 'No matching results' : 'Nothing here yet'}</h3>
                  <p>
                    {query
                      ? 'Try a different search or clear your filters.'
                      : 'New activity will appear here as your school gets to work.'}
                  </p>
                  {query && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery('');
                        setFilter('All categories');
                        setAvailability('Any availability');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : ['Requests', 'Borrowing', 'History', 'Grades'].includes(
                  tab,
                ) ||
                view === 'table' ||
                page === 'Students' ? (
                <div className="table-panel">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[
                          'Name',
                          tab === 'Requests'
                            ? 'Purpose'
                            : page === 'Students'
                              ? 'Class / category'
                              : page === 'Library'
                                ? 'Student / author'
                                : 'Laboratory / class',
                          tab === 'Requests'
                            ? 'Date'
                            : page === 'Students'
                              ? 'Attendance / date'
                              : 'Quantity / due',
                          'Status',
                          '',
                        ].map((h, i) => (
                          <TableHead key={i}>{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shown.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <button
                              className="table-name"
                              onClick={() => open(r)}
                            >
                              {r.kind === 'student' && (
                                <span className="avatar small">
                                  {r.name
                                    .split(' ')
                                    .map((s: string) => s[0])
                                    .join('')}
                                </span>
                              )}
                              {r.name}
                            </button>
                          </TableCell>
                          <TableCell>
                            {r.data.purpose ||
                              r.data.class ||
                              r.data.studentName ||
                              r.data.author ||
                              r.data.lab ||
                              r.data.category}
                          </TableCell>
                          <TableCell>
                            {r.data.desiredDate ||
                              r.data.dueAt?.slice(0, 10) ||
                              r.data.occurredAt ||
                              (r.data.attendance
                                ? r.data.attendance + '%'
                                : r.quantity + ' ' + (r.data.unit || 'copies'))}
                          </TableCell>
                          <TableCell>
                            <Status r={r} />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => open(r)}
                            >
                              View <ChevronRight size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="catalog">
                  {shown.map((r: any) => {
                    const Icon = iconFor(r);
                    return (
                      <button
                        key={r.id}
                        className="catalog-card"
                        onClick={() => open(r)}
                      >
                        <div
                          className={
                            'catalog-visual ' +
                            (r.kind === 'book'
                              ? 'book-tile'
                              : r.data.lab === 'Biology'
                                ? 'green'
                                : r.data.lab === 'Physics'
                                  ? 'purple'
                                  : 'blue')
                          }
                        >
                          {r.kind === 'book' ? (
                            <>
                              <BookOpen size={35} />
                              <span>{r.data.subject}</span>
                            </>
                          ) : (
                            <Icon size={38} strokeWidth={1.3} />
                          )}
                          <span className="catalog-category">
                            {r.data.category ||
                              r.data.class ||
                              r.data.subject ||
                              'CLASS'}
                          </span>
                        </div>
                        <div className="catalog-copy">
                          <h3>{r.name}</h3>
                          <p>
                            {r.data.author ||
                              r.data.location ||
                              r.data.teacher ||
                              r.data.instructions}
                          </p>
                          <div className="catalog-stock">
                            <Status r={r} />
                            <span>
                              {r.kind === 'book' || r.kind === 'inventory'
                                ? r.quantity + ' ' + (r.data.unit || 'copies')
                                : r.data.dueAt?.slice(5, 10) || r.data.time}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {count > 12 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    {Array.from({ length: Math.ceil(count / 12) }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href={'?page=' + (i + 1)}
                          isActive={pagination === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setPagination(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </>
      )}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="detail-sheet">
          <SheetHeader>
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>
              {selected?.data.lab ||
                selected?.data.author ||
                selected?.data.class ||
                'Westbridge International'}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <Detail
              ws={ws}
              row={rows.find((r: any) => r.id === selected.id) || selected}
              rows={rows}
              audit={audit}
              mutate={mutate}
              can={can}
              role={member.role}
            />
          )}
        </SheetContent>
      </Sheet>
      <Workflow
        key={form?.row?.id + '-' + form?.type + '-' + form?.kind}
        form={form}
        close={() => setForm(null)}
        act={act}
        rows={rows}
      />
    </>
  );
}
function Status({ r }: any) {
  const status =
    r.kind === 'inventory' || r.kind === 'book'
      ? r.quantity === 0
        ? 'Unavailable'
        : r.quantity <= (r.data.minimumQuantity || 0)
          ? 'Low stock'
          : 'Available'
      : r.data.status || 'Active';
  return (
    <span
      className={
        'status ' +
        (['Unavailable', 'Rejected', 'Late'].includes(status)
          ? 'bad'
          : ['Low stock', 'Pending', 'Borrowed'].includes(status)
            ? 'warn'
            : 'good')
      }
    >
      <span />
      {status}
    </span>
  );
}
function DataTable({ headers, rows }: any) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h: string) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row: any[], i: number) => (
          <TableRow key={i}>
            {row.map((c: any, j: number) => (
              <TableCell key={j}>{c}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
function AuditList({ audit }: any) {
  return (
    <div className="panel audit-panel">
      <h2>Activity & audit trail</h2>
      <p>Stock and sensitive changes are recorded automatically.</p>
      {!audit.length ? (
        <div className="empty-state">
          <ShieldCheck />
          <h3>No changes recorded yet</h3>
          <p>Complete a stock or record update to see its history.</p>
        </div>
      ) : (
        audit.map((a: any) => {
          const before = JSON.parse(a.before || '{}'),
            after = JSON.parse(a.after || '{}');
          return (
            <div className="audit-row" key={a.id}>
              <span className="app-icon blue">
                <RefreshCw size={16} />
              </span>
              <div>
                <b>{after.data?.lastTransaction?.type || a.action}</b>
                <p>
                  {a.entityId.split(':').pop()}{' '}
                  {before.quantity !== after.quantity && (
                    <>
                      · Stock {before.quantity} → {after.quantity}
                    </>
                  )}
                </p>
                <small>
                  {new Date(a.timestamp).toLocaleString()} · Verified account
                </small>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
function Calendar({ rows, open }: any) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-`;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <div className="calendar-panel panel">
      <div className="section-heading">
        <Button
          variant="outline"
          aria-label="Previous month"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          ←
        </Button>
        <h2 suppressHydrationWarning>
          {month.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <Button
          variant="outline"
          aria-label="Next month"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          →
        </Button>
      </div>
      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((x) => (
          <div className="weekday" key={x}>
            {x}
          </div>
        ))}
        {Array.from({ length: (month.getDay() + 6) % 7 }, (_, i) => (
          <div key={'blank' + i} className="calendar-day muted" />
        ))}
        {Array.from({ length: days }, (_, i) => (
          <div
            className={
              'calendar-day ' +
              (prefix + String(i + 1).padStart(2, '0') ===
              new Date().toLocaleDateString('en-CA')
                ? 'today'
                : '')
            }
            key={i}
          >
            <span>{i + 1}</span>
            {calendarEvents(rows, prefix + String(i + 1).padStart(2, '0')).map(
              (r: any) => (
                <button key={r.eventId || r.id} onClick={() => open(r)}>
                  {r.kind === 'classLog' ? 'Lesson · ' : ''}
                  {r.name}
                </button>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function Detail({ row: r, rows, audit, mutate, can, role, ws }: any) {
  const d = r.data;
  const [tab, setTab] = useState('Overview');
  if (r.kind === 'message')
    return (
      <div className="detail-body">
        <MessageThread row={r} ws={ws} />
      </div>
    );
  if (r.kind === 'classLog')
    return (
      <div className="detail-body">
        <ClassLogDetail row={r} />
      </div>
    );
  return (
    <div className="detail-body">
      {r.kind === 'class' && <ClassHistory key={r.id} ws={ws} classId={r.id} />}
      {r.kind === 'class' && (
        <AttendanceRegister key={'attendance-' + r.id} ws={ws} classId={r.id} />
      )}
      <div className="detail-status">
        <Status r={r} />
        <span>
          {r.kind === 'inventory' || r.kind === 'book'
            ? r.quantity + ' ' + (d.unit || 'copies') + ' available'
            : r.id}
        </span>
      </div>
      {r.kind === 'student' && (
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList variant="line" className="detail-tabs">
            {[
              'Overview',
              'Academics',
              'Attendance',
              'Behaviour',
              'Library',
              'Lab',
              'Notes',
            ].map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      {r.kind === 'student' ? (
        <>
          {tab === 'Overview' || tab === 'Attendance' ? (
            <>
              <div className="detail-metrics">
                <div>
                  <strong>
                    {d.attendance == null ? '—' : d.attendance + '%'}
                  </strong>
                  <span>Attendance</span>
                </div>
                <div>
                  <strong>{d.average}%</strong>
                  <span>Academic average</span>
                </div>
              </div>
              <dl>
                {Object.entries({
                  Grade: d.grade,
                  Homeroom: d.homeroom,
                  'Student ID': d.studentId,
                  Class: d.class,
                }).map(([k, v]: any) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <div>
              {rows
                .filter(
                  (x: any) =>
                    (
                      ({
                        Academics: ['submission'],
                        Behaviour: ['record'],
                        Notes: ['record'],
                        Library: ['loan'],
                        Lab: ['request'],
                      }) as any
                    )[tab]?.includes(x.kind) && x.data.studentId === r.id,
                )
                .map((x: any) => (
                  <section key={x.id} className="detail-note">
                    <b>{x.name}</b>
                    <p>
                      {x.data.description || x.data.feedback || x.data.status}
                    </p>
                  </section>
                ))}
            </div>
          )}
          {can('record') && (
            <Button onClick={() => mutate('record', r)}>
              <Plus size={16} /> Add student record
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="description">
            {d.description ||
              d.instructions ||
              d.purpose ||
              d.text ||
              'Review the details and choose your next action below.'}
          </p>
          <dl>
            {Object.entries(d)
              .filter(
                ([k, v]) =>
                  [
                    'category',
                    'lab',
                    'location',
                    'condition',
                    'minimumQuantity',
                    'chemicalFormula',
                    'safetyInformation',
                    'isbn',
                    'publisher',
                    'publicationYear',
                    'language',
                    'total',
                    'dueAt',
                    'maximumMarks',
                    'class',
                    'teacher',
                    'studentName',
                    'desiredDate',
                    'quantity',
                    'notes',
                    'feedback',
                    'grade',
                    'submittedAt',
                    'occurredAt',
                    'actionTaken',
                  ].includes(k) && v,
              )
              .map(([k, v]: any) => (
                <div key={k}>
                  <dt>{k.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd>{String(v)}</dd>
                </div>
              ))}
          </dl>
        </>
      )}
      {Array.isArray(d.attachments) && d.attachments.length > 0 && (
        <section className="detail-note">
          <h3>Attachments</h3>
          {d.attachments.map((f: any) => (
            <a
              key={f.id}
              href={'/api/files?id=' + encodeURIComponent(f.id)}
              className="resource-link"
            >
              <FileText size={15} />
              {f.name}
              <Download size={14} />
            </a>
          ))}
        </section>
      )}
      <div className="detail-actions">
        {['inventory', 'book'].includes(r.kind) && (
          <Button onClick={() => mutate('request', r)}>
            Request {r.kind === 'book' ? 'book' : 'item'}
          </Button>
        )}
        {r.kind === 'inventory' && (
          <>
            <Button variant="outline" onClick={() => mutate('problem', r)}>
              Report problem
            </Button>
            {can('inventory') && (
              <>
                <Button variant="outline" onClick={() => mutate('stock', r)}>
                  Record usage / stock
                </Button>
                <Button variant="outline" onClick={() => mutate('save', r)}>
                  Edit item
                </Button>
              </>
            )}
          </>
        )}
        {r.kind === 'book' && can('book') && (
          <>
            <Button
              variant="outline"
              disabled={!r.quantity}
              onClick={() => mutate('issue', r)}
            >
              Issue book
            </Button>
            <Button variant="outline" onClick={() => mutate('save', r)}>
              Edit book
            </Button>
          </>
        )}
        {r.kind === 'loan' && d.status === 'Borrowed' && can('loan') && (
          <Button onClick={() => mutate('return', r)}>Return book</Button>
        )}
        {r.kind === 'request' &&
          ['Admin', 'Lab Assistant', 'Librarian'].includes(role) &&
          !['Completed', 'Rejected'].includes(d.status) && (
            <Button onClick={() => mutate('requestStatus', r)}>
              Review request
            </Button>
          )}
        {r.kind === 'assignment' && (
          <>
            {['Admin', 'Student'].includes(role) && (
              <Button onClick={() => mutate('submit', r)}>
                Submit response
              </Button>
            )}
            {can('assignment') && (
              <Button variant="outline" onClick={() => mutate('save', r)}>
                Edit assignment
              </Button>
            )}
          </>
        )}
        {r.kind === 'submission' && can('assignment') && (
          <Button onClick={() => mutate('grade', r)}>
            Grade & give feedback
          </Button>
        )}
      </div>
      {r.kind === 'inventory' && can('inventory') && (
        <AuditList
          audit={audit.filter((a: any) => a.entityId.endsWith(':' + r.id))}
        />
      )}
    </div>
  );
}
function Workflow({ form, close, act, rows }: any) {
  const r = form?.row;
  let type = form?.type,
    kind = form?.kind || r?.kind;
  if (type === 'record') kind = 'record';
  const previousWork =
    type === 'submit'
      ? rows
          .filter(
            (x: any) =>
              x.kind === 'submission' && x.data.assignmentId === r?.id,
          )
          .sort((a: any, b: any) =>
            (b.updatedAt || '').localeCompare(a.updatedAt || ''),
          )[0]
      : null;
  const [values, setValues] = useState<any>({
      name: r?.name || '',
      ...(r?.data || {}),
      ...(previousWork
        ? {
            text: previousWork.data.text,
            attachments: previousWork.data.attachments,
          }
        : {}),
      quantity: r?.quantity || 1,
      amount: 1,
      type: 'Used',
      class: r?.data.class || classes[0],
      lab: r?.data.lab || 'Chemistry',
      category:
        r?.data.category ||
        (type === 'record' ? 'Positive behaviour' : 'General'),
      unit: r?.data.unit || 'pcs',
      minimumQuantity: r?.data.minimumQuantity || 3,
      condition: 'Good',
      desiredDate: '2026-09-09',
      dueAt: r?.data.dueAt || '2026-09-20',
      studentId: type === 'record' ? r.id : '',
      status:
        r?.data.status === 'Approved'
          ? 'Ordered'
          : r?.data.status === 'Ordered'
            ? 'Available'
            : r?.data.status === 'Available'
              ? 'Completed'
              : 'Approved',
      studentVisible: r?.data.studentVisible ?? true,
      severity: 'Low',
      role: 'Teacher',
      classes: classes[0],
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [confirm, setConfirm] = useState(false);
  const set = (k: string, v: any) => setValues((s: any) => ({ ...s, [k]: v }));
  const field = (
    name: string,
    label: string,
    inputType = 'text',
    required = true,
  ) => (
    <label className="field" key={name}>
      <span>{label}</span>
      <Input
        type={inputType}
        required={required}
        min={inputType === 'number' ? 0 : undefined}
        value={values[name] ?? ''}
        onChange={(e) => set(name, e.target.value)}
      />
    </label>
  );
  const area = (name: string, label: string, required = false) => (
    <label className="field">
      <span>{label}</span>
      <Textarea
        required={required}
        value={values[name] ?? ''}
        onChange={(e) => set(name, e.target.value)}
        rows={3}
      />
    </label>
  );
  const pick = (name: string, label: string, options: string[]) => (
    <label className="field">
      <span>{label}</span>
      <Pick
        value={values[name] || options[0]}
        label={label}
        options={options}
        onChange={(v) => set(name, v)}
      />
    </label>
  );
  async function submit(e: any) {
    e.preventDefault();
    setError('');
    if (['stock', 'return'].includes(type) && !confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    try {
      let payload: any = {
        ...values,
        action: type,
        id: r?.id,
        version: r?.version,
      };
      if (type === 'save' || type === 'record')
        payload = {
          action: 'save',
          kind,
          id: type === 'record' ? undefined : r?.id,
          name: kind === 'record' ? values.category : values.name,
          quantity: values.quantity,
          data: {
            ...values,
            studentName: rows.find((x: any) => x.id === values.studentId)?.name,
            studentVisible: values.studentVisible,
            occurredAt: new Date().toISOString().slice(0, 10),
          },
        };
      if (type === 'submit') {
        const prior = rows
          .filter(
            (x: any) => x.kind === 'submission' && x.data.assignmentId === r.id,
          )
          .sort((a: any, b: any) =>
            (b.updatedAt || '').localeCompare(a.updatedAt || ''),
          )[0];
        payload = {
          teaching: true,
          action: 'submitWork',
          assignmentId: r.id,
          text: values.text,
          attachments: (values.attachments || []).map((f: any) => f.id),
          draft: e.nativeEvent?.submitter?.value === 'draft',
          version: prior?.version,
        };
      }
      await act(payload);
      close();
    } catch (e: any) {
      setError(e.message);
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }
  const studentPicker = (
    <label className="field">
      <span>Student</span>
      <Select
        value={values.studentId}
        onValueChange={(v) => set('studentId', v)}
      >
        <SelectTrigger aria-label="Student">
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {rows
            .filter((x: any) => x.kind === 'student')
            .map((x: any) => (
              <SelectItem key={x.id} value={x.id}>
                {x.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </label>
  );
  const stock =
    values.type === 'Adjusted'
      ? Number(values.amount)
      : r?.quantity +
        (['Used', 'Removed', 'Damaged'].includes(values.type) ? -1 : 1) *
          Number(values.amount);
  return (
    <Dialog open={!!form} onOpenChange={(v) => !v && !busy && close()}>
      <DialogContent className="workflow-dialog">
        <DialogHeader>
          <DialogTitle>
            {
              (
                {
                  save: 'Save ' + (kind === 'inventory' ? 'item' : kind),
                  stock: 'Record inventory transaction',
                  request: 'Request ' + (kind === 'book' ? 'book' : 'item'),
                  problem: 'Report a problem',
                  issue: 'Issue library book',
                  return: 'Return library book',
                  requestStatus: 'Review request',
                  submit: 'Submit assignment',
                  grade: 'Grade submission',
                  record: 'Add student record',
                  member: 'Grant school access',
                } as any
              )[type]
            }
          </DialogTitle>
          <DialogDescription>
            {r?.name || 'Add a new record to your school workspace.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="workflow-form">
          {confirm ? (
            <div className="info-box">
              <b>
                Confirm {type === 'return' ? 'book return' : 'stock update'}
              </b>
              <p>
                {type === 'return'
                  ? 'This will close the loan and make the copy available to borrow.'
                  : `Stock will change from ${r.quantity} to ${stock} ${r.data.unit}. This transaction will be recorded in the audit trail.`}
              </p>
            </div>
          ) : (
            <>
              {type === 'member' && (
                <>
                  {field('name', 'Full name')}
                  {field('email', 'School email', 'email')}
                  {pick('role', 'Role', [
                    'Teacher',
                    'Student',
                    'Lab Assistant',
                    'Librarian',
                    'Library Assistant',
                    'Admin',
                    'Department Head',
                  ])}
                  {field(
                    'classes',
                    'Assigned classes (separate multiple with |)',
                  )}
                  {values.role === 'Student' && studentPicker}
                  <div className="info-box">
                    The person can access this school when signing in with the
                    matching verified email. Their role and class assignments
                    control what they can see and change.
                  </div>
                </>
              )}
              {(type === 'save' || type === 'record') && (
                <>
                  {kind !== 'record' && field('name', 'Name')}
                  {kind === 'inventory' ? (
                    <>
                      <div className="field-grid">
                        {pick('lab', 'Laboratory', [
                          'Chemistry',
                          'Physics',
                          'Biology',
                        ])}
                        {field('category', 'Category')}
                        {!r && field('quantity', 'Opening quantity', 'number')}
                        {field('unit', 'Unit')}
                        {field('minimumQuantity', 'Minimum quantity', 'number')}
                        {field('location', 'Location')}
                        {pick('condition', 'Condition', [
                          'Good',
                          'Fair',
                          'Damaged',
                          'Maintenance',
                        ])}
                      </div>
                      {area('description', 'Description')}
                      {area('safetyInformation', 'Safety information')}
                    </>
                  ) : kind === 'book' ? (
                    <>
                      <div className="field-grid">
                        {field('author', 'Author')}
                        {field('isbn', 'ISBN')}
                        {field('subject', 'Subject')}
                        {field('publicationYear', 'Publication year', 'number')}
                        {!r && field('quantity', 'Available copies', 'number')}
                        {field('location', 'Shelf location')}
                      </div>
                      {area('description', 'Description')}
                    </>
                  ) : kind === 'assignment' ? (
                    <>
                      {pick('class', 'Class', classes)}
                      <div className="field-grid">
                        {field('dueAt', 'Due date', 'datetime-local')}
                        {field('maximumMarks', 'Maximum marks', 'number')}
                      </div>
                      {area('instructions', 'Instructions', true)}
                    </>
                  ) : (
                    <>
                      {studentPicker}
                      {pick('category', 'Category', [
                        'Positive behaviour',
                        'Achievement',
                        'Late',
                        'Uniform',
                        'Missing homework',
                        'Disruption',
                        'Academic concern',
                        'Unauthorized device',
                        'Behaviour concern',
                        'Teacher concern',
                        'Other',
                      ])}
                      {pick('severity', 'Severity', ['Low', 'Medium', 'High'])}
                      {area('description', 'What happened?', true)}
                      {area('actionTaken', 'Action taken')}
                      {area('internalNotes', 'Internal staff notes')}
                      <label className="flex items-center justify-between text-xs">
                        Visible to student
                        <Switch
                          checked={values.studentVisible}
                          onCheckedChange={(v) => set('studentVisible', v)}
                        />
                      </label>
                    </>
                  )}
                </>
              )}
              {type === 'stock' && (
                <>
                  <div className="info-box">
                    Current stock:{' '}
                    <b>
                      {r.quantity} {r.data.unit}
                    </b>
                  </div>
                  {pick('type', 'Transaction type', [
                    'Used',
                    'Added',
                    'Restocked',
                    'Returned',
                    'Damaged',
                    'Removed',
                    'Adjusted',
                  ])}
                  {field(
                    'amount',
                    values.type === 'Adjusted' ? 'Set stock to' : 'Quantity',
                    'number',
                  )}
                  {pick('class', 'Class', classes)}
                  {field('experimentName', 'Experiment', 'text', false)}
                  {studentPicker}
                  <p className="text-sm">
                    Optional student attribution. If omitted, usage is
                    attributed to your staff account.
                  </p>
                  {area('notes', 'Notes / reason', true)}
                  <div
                    className={'info-box ' + (stock < 0 ? 'error-banner' : '')}
                  >
                    Resulting stock:{' '}
                    <b>
                      {stock} {r.data.unit}
                    </b>
                  </div>
                </>
              )}
              {type === 'request' && (
                <>
                  <div className="field-grid">
                    {field('quantity', 'Quantity', 'number')}
                    {field('desiredDate', 'Desired date', 'date')}
                  </div>
                  {pick('class', 'Class', classes)}
                  {field('teacher', 'Teacher', 'text', false)}
                  {area('purpose', 'Purpose', true)}
                  {area('notes', 'Additional notes')}
                </>
              )}
              {type === 'problem' &&
                area('notes', 'Describe the problem', true)}
              {type === 'issue' && (
                <>
                  {studentPicker}
                  {field('dueAt', 'Return due date', 'date')}
                </>
              )}
              {type === 'return' && (
                <div className="info-box">
                  Borrowed by {r.data.studentName}. Confirm the book has been
                  received.
                </div>
              )}
              {type === 'requestStatus' && (
                <>
                  {pick(
                    'status',
                    'Decision',
                    (
                      {
                        Pending: ['Approved', 'Rejected'],
                        Approved: ['Ordered', 'Available', 'Completed'],
                        Ordered: ['Available'],
                        Available: ['Completed'],
                      } as any
                    )[r.data.status] || ['Completed'],
                  )}
                  {area('notes', 'Comment')}
                </>
              )}
              {type === 'submit' &&
                area(
                  'text',
                  'Your written response',
                  r.data.submissionType !== 'file' &&
                    r.data.submissionType !== 'either',
                )}
              {(type === 'submit' ||
                (type === 'save' && kind === 'assignment')) && (
                <label className="field">
                  <span>Attachments · maximum 10 MB each</span>
                  <Input
                    type="file"
                    disabled={busy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setBusy(true);
                      setError('');
                      try {
                        const data = new FormData();
                        data.append('file', file);
                        data.append('class', values.class);
                        const response = await fetch('/api/files', {
                          method: 'POST',
                          body: data,
                        });
                        const uploaded: any = await response.json();
                        if (!response.ok) throw Error(uploaded.error);
                        set('attachments', [
                          ...(values.attachments || []),
                          uploaded,
                        ]);
                      } catch (e: any) {
                        setError(e.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  {(values.attachments || []).map((f: any) => (
                    <span key={f.id} className="text-xs text-blue-600">
                      {f.name}
                    </span>
                  ))}
                </label>
              )}
              {type === 'grade' && (
                <>
                  {field('grade', 'Marks awarded', 'number')}
                  {area('feedback', 'Feedback', true)}
                </>
              )}
            </>
          )}
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          <div className="form-footer">
            {type === 'submit' && (
              <Button
                type="submit"
                value="draft"
                variant="outline"
                disabled={busy}
              >
                Save draft
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => (confirm ? setConfirm(false) : close())}
            >
              {confirm ? 'Back' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={busy || (type === 'stock' && stock < 0)}
            >
              {busy
                ? 'Saving…'
                : confirm
                  ? 'Confirm'
                  : type === 'stock' || type === 'return'
                    ? 'Review & confirm'
                    : 'Save ' + (type === 'request' ? 'request' : '')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
