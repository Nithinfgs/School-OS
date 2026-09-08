'use client';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Modules, GlobalSearch, useWorkspace } from './modules';
import { AdminMasterDashboard } from './admin-dashboard';
import { TeacherDashboard } from './teacher-dashboard';
import { StudentDashboard } from './student-dashboard';
import { ChatRoomView } from './chat-room';
import { LabAssistantWorkspace } from './lab-assistant/LabAssistantWorkspace';
import { AdminLabView } from './lab-assistant/AdminLabView';
import { LibraryAssistantWorkspace } from './library-assistant/LibraryAssistantWorkspace';
import { AdminLibraryView } from './library-assistant/AdminLibraryView';
import { HOSDashboard } from './hos-dashboard';
import { TransportDashboard } from './transport-dashboard';
import { RecordLookup } from './record-lookup';
import { ReportCards } from './report-cards';
import { AdmissionsDashboard } from './admissions-dashboard';
import { StaffLeaveDashboard } from './staff-leave-dashboard';
import { ProcurementDashboard } from './procurement-dashboard';
import { personalNotifications, studentSections } from '@/lib/student';
import {
  migrateLegacyHash,
  navigateWebsite,
  pagePath,
  webSlug,
} from '@/lib/web-navigation';
import {
  GraduationCap,
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
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  User,
  Wrench,
  Check,
  Sun,
  FileText,
  Inbox,
  BusFront,
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

let persistedSidebarScrollTop = 0;

// Embedded assistants historically used hash routes for their standalone
// builds. Resolve those legacy paths back to their host SchoolOS module so a
// stale browser URL cannot strand navigation on the Home dashboard.
const embeddedRouteModule: Record<string, string> = {
  'staff-dashboard': 'Library',
  'student-hub': 'Library',
  'book-store': 'Library',
  'reading-tracker': 'Library',
  'my-loans': 'Library',
  'lab-store': 'Labs',
};

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
export default function SchoolOS({ initialUser }: { initialUser?: any } = {}) {
  const [page, setPage] = useState('Home');
  const ws = useWorkspace(initialUser);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const sidebarProfileRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sidebar = document.querySelector<HTMLElement>(
      "[data-slot='sidebar-content']",
    );
    if (!sidebar) return;

    sidebar.scrollTop = persistedSidebarScrollTop;
    const rememberScroll = () => {
      persistedSidebarScrollTop = sidebar.scrollTop;
    };
    sidebar.addEventListener('scroll', rememberScroll, { passive: true });
    return () => sidebar.removeEventListener('scroll', rememberScroll);
  }, []);

  const preserveSidebarScroll = (action: () => void) => {
    const sidebar = document.querySelector<HTMLElement>(
      "[data-slot='sidebar-content']",
    );
    const scrollTop = sidebar?.scrollTop ?? null;
    const restore = () => {
      const currentSidebar = document.querySelector<HTMLElement>(
        "[data-slot='sidebar-content']",
      );
      if (currentSidebar && scrollTop !== null) {
        currentSidebar.scrollTop = scrollTop;
      }
    };
    action();
    restore();
    requestAnimationFrame(restore);
  };

  const navigate = (p: string) => {
    preserveSidebarScroll(() => {
      setPage(p);
      navigateWebsite(pagePath(p), true);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  };
  useEffect(() => {
    migrateLegacyHash();
    const p = decodeURIComponent(location.pathname.slice(1));
    const studentPage = p.startsWith('student/page/')
      ? studentSections.find((name) => webSlug(name) === p.slice('student/page/'.length))
      : undefined;
    if (studentPage) setPage(studentPage);
    else if (
      p.startsWith('admin/record/') ||
      p.startsWith('teacher/') ||
      p.startsWith('student/')
    )
      setPage('Home');
    const match = [
      'Home',
      'Labs',
      'Library',
      'Academics',
      'Students',
      'Directory',
      'Chat',
      'Calendar',
      'Notifications',
      'Inquiries',
      'Transport',
      'Teacher Inquiry',
      'Student Search',
      'Report Cards',
      'Admissions',
      'Staff Leave',
      'Procurement',
      'Settings',
      'Help & support',
    ].find((x) => webSlug(x) === p);
    if (match) setPage(match);
    else if (embeddedRouteModule[p]) setPage(embeddedRouteModule[p]);
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((x) => !x);
      }
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setSidebarProfileOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener('keydown', h);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        sidebarProfileRef.current &&
        !sidebarProfileRef.current.contains(e.target as Node)
      ) {
        setSidebarProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const route = () => {
      const currentPath = decodeURIComponent(location.pathname.slice(1));
      const studentPage = currentPath.startsWith('student/page/')
        ? studentSections.find((name) => webSlug(name) === currentPath.slice('student/page/'.length))
        : undefined;
      if (studentPage) setPage(studentPage);
      else if (
        location.pathname.startsWith('/admin/record/') ||
        location.pathname.startsWith('/teacher/') ||
        location.pathname.startsWith('/student/')
      )
        setPage('Home');
      else {
        const current = location.pathname.slice(1);
        const next = [
          'Home',
          'Labs',
          'Library',
          'Academics',
          'Students',
          'Directory',
          'Chat',
          'Calendar',
          'Notifications',
          'Inquiries',
          'Transport',
          'Teacher Inquiry',
          'Student Search',
          'Report Cards',
          'Admissions',
          'Staff Leave',
          'Procurement',
          'Settings',
          'Help & support',
        ].find((name) => webSlug(name) === current);
        if (next) setPage(next);
        else if (embeddedRouteModule[current])
          setPage(embeddedRouteModule[current]);
      }
    };
    window.addEventListener('popstate', route);
    return () => {
      window.removeEventListener('keydown', h);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('popstate', route);
    };
  }, []);
  const role = ws.member.role || 'Student';
  const initials = (ws.member.name || 'Alex Carter')
    .split(/\s+/)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const visibleClasses = ws.rows
    .filter((row: any) => row.kind === 'class')
    .slice(0, 6);
  const navGroups =
    ['Lab Assistant', 'Library Assistant', 'Transport Staff'].includes(role)
      ? [
          {
            label: role === 'Library Assistant' ? 'LIBRARY OPERATIONS' : role === 'Transport Staff' ? 'TRANSPORT OPERATIONS' : 'LAB OPERATIONS',
            items: role === 'Library Assistant'
              ? [['Library', BookOpen]]
              : role === 'Transport Staff' ? [['Transport', BusFront]] : [['Labs', FlaskConical]],
          },
        ]
      : [
          {
            label: '',
            items: [
              ['Calendar', CalendarDays],
              ['Notifications', Bell],
              ...(['Head of School', 'Admin'].includes(role) ? [['Inquiries', Inbox]] : []),
            ],
          },
          {
            label: 'LEARNING',
            items: [
              ['Academics', GraduationCap],
              ['Students', Users],
              ...(['Head of School', 'Admin'].includes(role) ? [['Teacher Inquiry', Users], ['Student Search', Search]] : []),
              ...(role === 'Student' ? [['Reports', FileText]] : []),
              ...(role === 'Student' ? [['Report Cards', FileText]] : []),
              ...(['Admin', 'Head of School', 'Teacher'].includes(role) ? [['Report Cards', FileText]] : []),
              ...(role === 'Admin' ? [['Admissions', ClipboardList]] : []),
              ...(role === 'Admin' ? [['Staff Leave', CalendarDays]] : []),
              ...(role === 'Admin' ? [['Procurement', ClipboardList]] : []),
              ['Library', BookOpen],
            ],
          },
          {
            label: 'COMMUNICATION',
            items: [['Chat', MessageSquare]],
          },
          {
            label: 'SCHOOL SERVICES',
            items:
              role === 'Student'
                ? [
                    ['Directory', Users],
                    ['Labs', FlaskConical],
                  ]
                : [...(['Admin', 'Head of School'].includes(role) ? [['Transport', BusFront]] : []), ['Labs', FlaskConical]],
          },
        ];
  const quickActions =
    role === 'Lab Assistant'
      ? [
          ['Open laboratory', '/labs'],
          ['Review lab requests', '/labs'],
        ]
      : role === 'Library Assistant'
        ? [
            ['Open library', '/library'],
            ['Review overdue books', '/library'],
          ]
      : role === 'Transport Staff'
      ? [
          ['Open transport dashboard', '/transport'],
          ['Review student notices', '/transport'],
        ]
      : role === 'Teacher'
      ? [
          ['Take attendance', '/teacher/action/attendance'],
          ['Log lesson', '/teacher/action/lesson'],
          ['Create assignment', '/teacher/action/assignment'],
          ['Add student record', '/teacher/action/studentRecord'],
          ['Message class', '/teacher/action/message'],
          ['Upload resource', '/teacher/action/resource'],
          ['Report cards', '/report-cards'],
        ]
      : role === 'Head of School'
        ? [
            ['Open inquiry inbox', '/inquiries'],
            ['Teacher inquiry', '/teacher-inquiry'],
            ['Student search', '/student-search'],
            ['Review school calendar', '/calendar'],
            ['Open student directory', '/students'],
            ['Review transport status', '/transport'],
          ]
      : role === 'Admin'
        ? [
            ['Open student directory', '/students'],
            ['Review classes', '/academics'],
            ['Review lab requests', '/labs'],
            ['Review transport status', '/transport'],
            ['Open inquiry inbox', '/inquiries'],
            ['Teacher inquiry', '/teacher-inquiry'],
            ['Student search', '/student-search'],
            ['Post announcement', '/notifications'],
            ['Manage report cards', '/report-cards'],
          ]
        : [
            ['View academics & work', '/student/page/academics'],
            ['Open calendar', '/student/page/calendar'],
            ['Add CAS reflection', '/student/page/cas'],
            ['Message a teacher', '/student/page/messages'],
          ];
  const runQuickAction = (path: string) => {
    setQuickOpen(false);
    navigateWebsite(path);
    if (!path.startsWith('/teacher/') && !path.startsWith('/student/')) {
      const next = path.slice(1);
      const name = [
        'Home',
        'Labs',
        'Library',
        'Academics',
        'Reports',
        'Students',
        'Calendar',
        'Notifications',
        'Inquiries',
        'Transport',
        'Teacher Inquiry',
        'Student Search',
      ].find((item) => webSlug(item) === next);
      if (name) setPage(name);
    }
  };
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
          'Reports',
                  'Students',
                  'Calendar',
                  'Notifications',
                  'Inquiries',
                  'Transport',
                  'Teacher Inquiry',
                  'Student Search',
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
                  'Inquiries',
                  'Transport',
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
          <div className="brand-row">
            <button className="brand" onClick={() => navigate('Home')}>
              <span className="logo">
                <GraduationCap size={23} />
              </span>
              School<span className="brand-os">OS</span>
            </button>
            <SidebarTrigger />
          </div>
          <button className="school" onClick={() => navigate('Home')}>
            <span className="school-mark">W</span>
            <div>
              <b>Westbridge International</b>
              <small>IB World School · 2026–27</small>
            </div>
            <ChevronDown size={14} />
          </button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={page === 'Home'}
                onClick={() => navigate('Home')}
              >
                <LayoutDashboard />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {navGroups.map((group) => (
            <SidebarMenu key={group.label || 'primary'}>
              {group.label && <p className="nav-label">{group.label}</p>}
              {group.items.map(([name, Icon]: any) => (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton
                    isActive={page === name}
                    onClick={() => navigate(name)}
                  >
                    <Icon />
                    <span>
                      {name === 'Students' && role === 'Student'
                        ? 'My profile'
                        : name}
                    </span>
                    {name === 'Notifications' && (
                      <em>
                        {role === 'Student'
                          ? personalNotifications(
                              ws.rows,
                              ws.member.studentId,
                            ).filter((n) => !n.read).length
                          : ws.rows.filter(
                              (r: any) =>
                                r.kind === 'notification' && !r.data.read,
                            ).length}
                      </em>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ))}
          {visibleClasses.length > 0 && !['Admin', 'Lab Assistant', 'Library Assistant'].includes(role) && (
            <SidebarMenu className="class-shortcuts">
              <p className="nav-label">MY CLASSES</p>
              {visibleClasses.map((classRow: any, index: number) => (
                <SidebarMenuItem key={classRow.id}>
                  <SidebarMenuButton
                    onClick={() =>
                      preserveSidebarScroll(() => navigateWebsite(
                        role === 'Teacher'
                          ? `/teacher/class/${classRow.id}`
                          : `/student/class/${classRow.id}`,
                      ))
                    }
                  >
                    <span className={`class-dot dot-${(index % 5) + 1}`} />
                    <span>{classRow.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('Academics')}>
                  <span className="class-dot dot-all" />
                  <span>See all classes</span>
                  <ChevronRight className="nav-chevron" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarContent>
        <SidebarFooter>
          {[
            ['Settings', Settings],
            ['Help & support', LifeBuoy],
          ].map(([name, Icon]: any) => (
            <SidebarMenuButton key={name} onClick={() => navigate(name)}>
              <Icon />
              <span>{name}</span>
            </SidebarMenuButton>
          ))}
          <div className="profile-wrap sidebar-profile-wrap" ref={sidebarProfileRef}>
            <button
              className="profile"
              onClick={() => setSidebarProfileOpen((open) => !open)}
              aria-expanded={sidebarProfileOpen}
              aria-label="Open profile and switch account"
            >
              <span className="avatar">{initials}</span>
              <span>
                <b>{ws.member.name || 'Alex Carter'}</b>
                <small>{role} · Term 1</small>
              </span>
              <ChevronRight size={15} />
            </button>
            {sidebarProfileOpen && (
              <ProfileMenu
                ws={ws}
                navigate={navigate}
                onClose={() => setSidebarProfileOpen(false)}
                align="sidebar"
              />
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="workspace" suppressHydrationWarning>
        <header className="topbar">
          <div className="crumb">
            <SidebarTrigger className="topbar-toggle" />
            <span>Westbridge International</span>
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
            <div className="quick-add-wrap">
              <button
                className="quick-add"
                onClick={() => setQuickOpen((open) => !open)}
                aria-expanded={quickOpen}
              >
                <Plus size={16} /> Quick add <ChevronDown size={14} />
              </button>
              {quickOpen && (
                <div className="quick-add-menu" role="menu">
                  <div className="quick-add-title">
                    <span>CREATE OR OPEN</span>
                    <small>{role} tools</small>
                  </div>
                  {quickActions.map(([label, path]) => (
                    <button
                      key={label}
                      role="menuitem"
                      onClick={() => runQuickAction(path)}
                    >
                      <Plus size={14} />
                      <span>{label}</span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              aria-label="Notifications"
              onClick={() => navigate('Notifications')}
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="profile-wrap" ref={profileRef}>
              <button
                className="avatar small"
                aria-label="Open profile settings and switch account"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
              >
                {initials}
              </button>
              {profileOpen && (
                <ProfileMenu
                  ws={ws}
                  navigate={navigate}
                  onClose={() => setProfileOpen(false)}
                  align="top"
                />
              )}
            </div>
          </div>
        </header>
        <main className="page" suppressHydrationWarning>
          {ws.loading && !ws.member.role ? (
            <div className="workspace-loader">
              <div className="loader-spinner" />
            </div>
          ) : ['Chat', 'Messages'].includes(page) ? (
            <ChatRoomView ws={ws} />
          ) : role === 'Head of School' && page === 'Transport' ? (
            <TransportDashboard ws={ws} mode="oversight" />
          ) : role === 'Admin' && page === 'Transport' ? (
            <TransportDashboard ws={ws} mode="oversight" />
          ) : role === 'Transport Staff' && !['Settings', 'Help & support'].includes(page) ? (
            <TransportDashboard ws={ws} />
          ) : ['Admin', 'Head of School'].includes(role) && page === 'Teacher Inquiry' ? (
            <RecordLookup ws={ws} kind="teacher" navigate={navigate} />
          ) : ['Admin', 'Head of School'].includes(role) && page === 'Student Search' ? (
            <RecordLookup ws={ws} kind="student" navigate={navigate} />
          ) : page === 'Report Cards' && ['Admin', 'Head of School', 'Teacher', 'Student'].includes(role) ? (
            <ReportCards ws={ws} role={role} navigate={navigate} />
          ) : page === 'Admissions' && role === 'Admin' ? (
            <AdmissionsDashboard ws={ws} />
          ) : page === 'Staff Leave' && role === 'Admin' ? (
            <StaffLeaveDashboard ws={ws} />
          ) : page === 'Procurement' && role === 'Admin' ? (
            <ProcurementDashboard ws={ws} />
          ) : ['Teacher Inquiry', 'Student Search'].includes(page) ? (
            <section className="panel master-empty"><h1>Access restricted</h1><p>This organization-wide record lookup is available only to authorized Admin and Head of School roles.</p></section>
          ) : role === 'Head of School' && ['Home', 'Calendar', 'Inquiries'].includes(page) ? (
            <HOSDashboard ws={ws} navigate={navigate} page={page} />
          ) : role === 'Admin' && page === 'Inquiries' ? (
            <HOSDashboard ws={ws} navigate={navigate} page={page} mode="admin" />
          ) : role === 'Admin' && page === 'Labs' ? (
            <AdminLabView
              member={ws.member}
              sharedRows={ws.masterRows || ws.rows || []}
            />
          ) : role === 'Admin' && page === 'Library' ? (
            <AdminLibraryView
              member={ws.member}
              sharedRows={ws.masterRows || ws.rows || []}
            />
          ) : role === 'Lab Assistant' &&
          !['Settings', 'Help & support'].includes(page) ? (
            <LabAssistantWorkspace
              member={ws.member}
              sharedRows={ws.rows || []}
            />
          ) : page === 'Labs' ? (
            <LabAssistantWorkspace
              member={ws.member}
              sharedRows={ws.rows || []}
            />
          ) : role === 'Library Assistant' &&
          !['Settings', 'Help & support'].includes(page) ? (
            <LibraryAssistantWorkspace
              member={ws.member}
              sharedRows={ws.rows || []}
            />
          ) : page === 'Library' ? (
            <LibraryAssistantWorkspace
              member={ws.member}
              sharedRows={ws.member.role === 'Admin' ? ws.masterRows || [] : ws.rows || []}
            />
          ) : ws.member.role === 'Student' &&
          !['Settings', 'Help & support'].includes(page) ? (
            <StudentDashboard ws={ws} page={page} />
          ) : page !== 'Home' ? (
            <Modules
              page={page}
              ws={ws}
              navigate={navigate}
              selected={selected}
              setSelected={setSelected}
            />
          ) : ws.member.role === 'Admin' ? (
            <AdminMasterDashboard
              ws={ws}
              navigate={navigate}
              select={setSelected}
            />
          ) : ws.member.role === 'Teacher' ? (
            <TeacherDashboard ws={ws} />
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR SCHOOL, CONNECTED</div>
                  <h1>
                    Welcome back, {ws.member.name?.split(' ')[0] || 'Alex'}{' '}
                    <Sun size={20} className="inline-block text-amber-500 ml-1 align-sub" />
                  </h1>
                  <p>Here’s what’s happening at Westbridge today.</p>
                </div>
                <div className="date-label" suppressHydrationWarning>
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
            rows={['Admin', 'Head of School'].includes(ws.member.role) ? ws.masterRows || [] : ws.rows}
            role={ws.member.role}
            adminOpen={
              ws.member.role === 'Admin'
                ? (r: any) => {
                    navigate('Home');
                    navigateWebsite(
                      '/admin/record/' + encodeURIComponent(r.id),
                    );
                  }
                : ws.member.role === 'Teacher'
                  ? (r: any) => {
                      navigate('Home');
                      navigateWebsite(
                        '/teacher/' +
                          (r.kind === 'class' ? 'class' : 'record') +
                          '/' +
                          encodeURIComponent(r.id),
                      );
                    }
                  : ws.member.role === 'Student'
                    ? (r: any) => {
                        navigate('Home');
                        navigateWebsite(
                          '/student/' +
                            (r.kind === 'class' ? 'class' : 'record') +
                            '/' +
                            encodeURIComponent(r.id),
                        );
                      }
                    : undefined
            }
            navigate={navigate}
            select={setSelected}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}

export function ProfileMenu({
  ws,
  navigate,
  onClose,
  align = 'top',
}: {
  ws: any;
  navigate: (page: string) => void;
  onClose: () => void;
  align?: 'top' | 'sidebar';
}) {
  const member = ws.member || {};
  const currentRole = (member.role || 'Student').toLowerCase().replace(/\s+/g, '-');
  const initials = (member.name || 'Alex Carter')
    .split(/\s+/)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const devProfiles = [
    {
      role: 'head-of-school',
      authRole: 'hos',
      name: 'Dr. Aisha Rahman',
      title: 'Head of School',
      badge: 'HOS',
      email: 'hos.dev@schoolos.local',
      icon: GraduationCap,
      landing: '/home',
    },
    {
      role: 'admin',
      name: 'Nithin Selvaraj',
      title: 'School Administrator',
      badge: 'Admin',
      email: 'admin.dev@schoolos.local',
      icon: Wrench,
    },
    {
      role: 'teacher',
      name: 'Maya Iyer',
      title: 'Physics & Math Teacher',
      badge: 'Teacher',
      email: 'teacher.dev@schoolos.local',
      icon: Users,
    },
    {
      role: 'student',
      name: 'Nithin Selvaraj',
      title: 'DP-2 Student (IBDP)',
      badge: 'Student',
      email: 'student.dev@schoolos.local',
      icon: User,
    },
    {
      role: 'lab-assistant',
      name: 'Olivia Reed',
      title: 'Science Lab Assistant',
      badge: 'Lab Assistant',
      email: 'lab.assistant.dev@schoolos.local',
      icon: FlaskConical,
    },
    {
      role: 'library-assistant',
      name: 'Daniel Moore',
      title: 'Library Assistant',
      badge: 'Library Assistant',
      email: 'library.assistant.dev@schoolos.local',
      icon: BookOpen,
    },
    {
      role: 'transport-staff',
      name: 'Leena Joseph',
      title: 'Transport Operations',
      badge: 'Transport Staff',
      email: 'transport.dev@schoolos.local',
      icon: BusFront,
      landing: '/transport',
    },
  ];

  return (
    <div
      className={`profile-menu ${align === 'sidebar' ? 'profile-menu-sidebar' : 'profile-menu-topbar'}`}
      role="menu"
      aria-label="User profile and account switcher"
    >
      <div className="profile-menu-header">
        <span className="avatar">{initials}</span>
        <div className="profile-menu-info">
          <b>{member.name || 'Alex Carter'}</b>
          <div className="profile-menu-meta-row">
            <span className={`role-pill ${currentRole}`}>{member.role || 'Student'}</span>
            <small className="profile-menu-email">{member.email || 'Signed in'}</small>
          </div>
        </div>
      </div>

      <div className="profile-menu-section-title">
        <span>SWITCH PROFILE</span>
        <small>Development accounts</small>
      </div>

      <div className="profile-menu-profiles">
        {devProfiles.map((p) => {
          const isActive = currentRole === p.role;
          const Icon = p.icon;
          return (
            <a
              key={p.role}
              href={`/api/dev-login?role=${(p as any).authRole || p.role}&return_to=${encodeURIComponent((p as any).landing || '/')}`}
              className={`profile-switch-item ${isActive ? 'active' : ''}`}
            >
              <span className={`profile-switch-avatar ${p.role}`}>
                <Icon size={14} />
              </span>
              <div className="profile-switch-meta">
                <div className="profile-switch-name-row">
                  <b>{p.name}</b>
                  <span className={`role-pill ${p.role}`}>{p.badge}</span>
                </div>
                <small>{p.title}</small>
              </div>
              {isActive ? (
                <Check size={14} className="profile-switch-check" />
              ) : (
                <ChevronRight size={13} className="profile-switch-arrow" />
              )}
            </a>
          );
        })}
      </div>

      <div className="profile-menu-footer">
        <button
          className="profile-menu-action"
          onClick={() => {
            onClose();
            navigate('Settings');
          }}
        >
          <Settings size={14} />
          <span>Profile & settings</span>
        </button>
        <a
          href="/api/dev-login?role=clear&return_to=/"
          className="profile-menu-signout"
          target="_top"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </a>
      </div>
    </div>
  );
}
