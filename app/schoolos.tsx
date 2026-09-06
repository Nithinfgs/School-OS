'use client';
import { useState, useEffect } from 'react';
import { Modules, GlobalSearch, useWorkspace } from './modules';
import {
  GraduationCap,
  House,
  FlaskConical,
  BookOpen,
  Users,
  CalendarDays,
  Bell,
  Settings,
  LifeBuoy,
  Search,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Microscope,
  ClipboardList,
  PanelLeft,
  Command,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
const apps = [
  {
    name: 'Labs',
    desc: 'Everything you need for your next discovery.',
    icon: FlaskConical,
    color: 'blue',
    stat: '60 inventory items',
    note: 'Review requests',
  },
  {
    name: 'Library',
    desc: 'A world of knowledge, within reach.',
    icon: BookOpen,
    color: 'purple',
    stat: '50 books in your catalog',
    note: 'Manage borrowing',
  },
  {
    name: 'Academics',
    desc: 'Keep teaching and learning in sync.',
    icon: GraduationCap,
    color: 'green',
    stat: '6 active classes',
    note: '15 assignments',
  },
  {
    name: 'Students',
    desc: 'See the whole student. Support their growth.',
    icon: Users,
    color: 'orange',
    stat: '30 students enrolled',
    note: 'View directory',
  },
];
export default function SchoolOS() {
  const [page, setPage] = useState('Home');
  const ws = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const navigate = (p: string) => {
    setPage(p);
    history.replaceState(null, '', '#' + p.toLowerCase().replaceAll(' ', '-'));
  };
  useEffect(() => {
    const p = decodeURIComponent(location.hash.slice(1));
    const match = [
      'Home',
      'Labs',
      'Library',
      'Academics',
      'Students',
      'Calendar',
      'Notifications',
      'Settings',
      'Help & support',
    ].find((x) => x.toLowerCase().replaceAll(' ', '-') === p);
    if (match) setPage(match);
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((x) => !x);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => {
    const ctx = (document as any).modelContext;
    if (!ctx?.registerTool) return;
    const controller = new AbortController();
    Promise.resolve(
      ctx.registerTool(
        {
          name: 'navigate_schoolos',
          description:
            'Navigate to a SchoolOS module. Does not modify records.',
          inputSchema: {
            type: 'object',
            properties: {
              module: {
                type: 'string',
                enum: [
                  'Home',
                  'Labs',
                  'Library',
                  'Academics',
                  'Students',
                  'Calendar',
                  'Notifications',
                  'Settings',
                ],
              },
            },
            required: ['module'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: ({ module }: any) => {
            if (
              ![
                'Home',
                'Labs',
                'Library',
                'Academics',
                'Students',
                'Calendar',
                'Notifications',
                'Settings',
              ].includes(module)
            )
              throw Error('Unknown module');
            navigate(module);
            return { module };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '238px' } as React.CSSProperties}
    >
      <Sidebar>
        <SidebarHeader>
          <div className="brand">
            <span className="logo">
              <GraduationCap size={23} />
            </span>
            School<span className="brand-os">OS</span>
          </div>
          <div className="school">
            <span className="school-mark">W</span>
            <div>
              <b>Westbridge International</b>
              <small>School workspace</small>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {[
              ['Home', House],
              ['Labs', FlaskConical],
              ['Library', BookOpen],
              ['Academics', GraduationCap],
              ['Students', Users],
              ['Calendar', CalendarDays],
              ['Notifications', Bell],
            ].map(([name, Icon]: any, i) => (
              <SidebarMenuItem key={name}>
                {i === 1 && <p className="nav-label">WORKSPACE</p>}
                {i === 5 && <div className="nav-divider" />}
                <SidebarMenuButton
                  isActive={page === name}
                  onClick={() => navigate(name)}
                >
                  <Icon />
                  <span>{name}</span>
                  {name === 'Notifications' && <em>10</em>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="term-card">
            <span className="live-dot" /> Academic year 2026–27
            <small>Term 1 · A fresh start</small>
          </div>
          {[
            ['Settings', Settings],
            ['Help & support', LifeBuoy],
          ].map(([name, Icon]: any) => (
            <SidebarMenuButton key={name} onClick={() => navigate(name)}>
              <Icon />
              <span>{name}</span>
            </SidebarMenuButton>
          ))}
          <button className="profile" onClick={() => navigate('Settings')}>
            <span className="avatar">AC</span>
            <span>
              <b>{ws.member.name || 'Alex Carter'}</b>
              <small>{ws.member.role}</small>
            </span>
            <ChevronRight size={15} />
          </button>
        </SidebarFooter>
      </Sidebar>
      <div className="workspace">
        <header className="topbar">
          <div className="crumb">
            <SidebarTrigger />
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <button
              className="global-search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} /> Search anything… <kbd>⌘ K</kbd>
            </button>
            <button
              aria-label="Notifications"
              onClick={() => navigate('Notifications')}
            >
              <Bell size={19} />
              <i />
            </button>
            <span className="avatar small">AC</span>
          </div>
        </header>
        <main className="page">
          {page !== 'Home' ? (
            <Modules
              page={page}
              ws={ws}
              navigate={navigate}
              selected={selected}
              setSelected={setSelected}
            />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR SCHOOL, CONNECTED</div>
                  <h1>
                    Welcome back, {ws.member.name?.split(' ')[0] || 'Alex'}{' '}
                    <span className="sun">☀</span>
                  </h1>
                  <p>Here’s what’s happening at Westbridge today.</p>
                </div>
                <div className="date-label">
                  <CalendarDays size={16} /> Sunday, 6 September 2026
                </div>
              </div>
              {ws.error && (
                <div className="error-banner">
                  <a href="/signin-with-chatgpt?return_to=/" target="_top">
                    {ws.error === 'UNAUTHORIZED'
                      ? 'Sign in to access your school workspace →'
                      : 'Workspace is unavailable. Open a module to retry.'}
                  </a>
                </div>
              )}
              <div className="welcome-strip">
                <span className="welcome-icon">
                  <GraduationCap />
                </span>
                <div>
                  <b>A new term. A world of possibilities.</b>
                  <p>Your people, resources, and learning. All in one place.</p>
                </div>
                <span className="term-badge">
                  Term 1 <span>2026–27</span>
                </span>
              </div>
              <div className="section-heading">
                <h2>School at a glance</h2>
                <span>
                  Live across your school <span className="live-dot" />
                </span>
              </div>
              <div className="stats">
                {(ws.member.role === 'Student'
                  ? [
                      [
                        'My classes',
                        String(
                          ws.rows.filter((r: any) => r.kind === 'class').length,
                        ),
                        'Your learning this term',
                        GraduationCap,
                      ],
                      [
                        'Assignments',
                        String(
                          ws.rows.filter((r: any) => r.kind === 'assignment')
                            .length,
                        ),
                        'Plan your next steps',
                        ClipboardList,
                      ],
                      [
                        'My requests',
                        String(
                          ws.rows.filter((r: any) => r.kind === 'request')
                            .length,
                        ),
                        'Track your equipment',
                        FlaskConical,
                      ],
                      [
                        'My books',
                        String(
                          ws.rows.filter(
                            (r: any) =>
                              r.kind === 'loan' && r.data.status === 'Borrowed',
                          ).length,
                        ),
                        'Your current loans',
                        BookOpen,
                      ],
                    ]
                  : [
                      [
                        'Total students',
                        String(
                          ws.rows.filter((r: any) => r.kind === 'student')
                            .length,
                        ),
                        'Across 6 classes',
                        Users,
                      ],
                      [
                        'Active teachers',
                        String(
                          ws.rows.filter(
                            (r: any) =>
                              r.kind === 'staff' && r.data.role === 'Teacher',
                          ).length,
                        ),
                        'Teaching, connected',
                        GraduationCap,
                      ],
                      [
                        'Pending lab requests',
                        String(
                          ws.rows.filter(
                            (r: any) =>
                              r.kind === 'request' &&
                              r.data.type === 'lab' &&
                              r.data.status === 'Pending',
                          ).length,
                        ),
                        'Ready for your review',
                        FlaskConical,
                      ],
                      [
                        'Books on loan',
                        String(
                          ws.rows.filter(
                            (r: any) =>
                              r.kind === 'loan' && r.data.status === 'Borrowed',
                          ).length,
                        ),
                        '2 due this week',
                        BookOpen,
                      ],
                    ]
                ).map(([label, value, sub, Icon]: any) => (
                  <div className="stat" key={label}>
                    <div>
                      {label}
                      <Icon size={17} />
                    </div>
                    <strong>{value}</strong>
                    <small>{sub}</small>
                  </div>
                ))}
              </div>
              <div className="section-heading">
                <h2>Your apps</h2>
                <span>One workspace. Every part of school.</span>
              </div>
              <div className="apps">
                {apps.map((a) => (
                  <button
                    className="app-card"
                    key={a.name}
                    onClick={() => navigate(a.name)}
                  >
                    <div className="app-top">
                      <span className={'app-icon ' + a.color}>
                        <a.icon size={24} />
                      </span>
                      <ArrowUpRight size={18} />
                    </div>
                    <h3>{a.name}</h3>
                    <p>{a.desc}</p>
                    <div className="app-bottom">
                      <span>
                        {a.name === 'Labs'
                          ? ws.rows.filter((r: any) => r.kind === 'inventory')
                              .length + ' inventory items'
                          : a.name === 'Library'
                            ? ws.rows.filter((r: any) => r.kind === 'book')
                                .length + ' book titles'
                            : a.name === 'Academics'
                              ? ws.rows.filter((r: any) => r.kind === 'class')
                                  .length + ' active classes'
                              : ws.rows.filter((r: any) => r.kind === 'student')
                                  .length + ' student profiles'}
                      </span>
                      <ArrowRight size={15} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="bottom-grid">
                <section className="panel">
                  <div className="section-heading">
                    <h2>
                      Needs your attention <span className="count">3</span>
                    </h2>
                    <button onClick={() => navigate('Labs')}>
                      View all <ArrowRight size={14} />
                    </button>
                  </div>
                  {[
                    [
                      'blue',
                      'Review your lab requests',
                      'Equipment and materials for your next practical',
                      'Labs',
                    ],
                    [
                      'orange',
                      'Keep track of library books',
                      'View current loans and return dates',
                      'Library',
                    ],
                    [
                      'purple',
                      'Assignments ready to review',
                      'Explore upcoming work across your classes',
                      'Academics',
                    ],
                  ].map(([color, title, sub, target]) => (
                    <button
                      className="attention-row"
                      key={title}
                      onClick={() => navigate(target)}
                    >
                      <span className={'app-icon ' + color}>
                        <ClipboardList size={19} />
                      </span>
                      <span>
                        <b>{title}</b>
                        <small>{sub}</small>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </section>
                <section className="panel">
                  <div className="section-heading">
                    <h2>School notices</h2>
                    <span className="tag">THIS WEEK</span>
                  </div>
                  <div className="notice">
                    <span className="notice-date">
                      SEP<b>08</b>
                    </span>
                    <div>
                      <b>Welcome to the new academic year</b>
                      <p>
                        Our first whole-school assembly takes place in the main
                        auditorium at 8:30 AM.
                      </p>
                      <small>School office · All students & staff</small>
                    </div>
                  </div>
                  <div className="notice-footer">
                    <span className="live-dot" /> A little more connected, every
                    day.
                  </div>
                </section>
              </div>
              <footer className="page-footer">
                Westbridge International School{' '}
                <span>SchoolOS · Your entire school. One platform.</span>
              </footer>
            </>
          )}
          {ws.message && (
            <div className="toast" role="status">
              <CheckCircle2 size={17} />
              {ws.message}
            </div>
          )}
          <GlobalSearch
            open={searchOpen}
            setOpen={setSearchOpen}
            rows={ws.rows}
            navigate={navigate}
            select={setSelected}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
