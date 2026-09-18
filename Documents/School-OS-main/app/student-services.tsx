'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  BookOpen,
  Bus,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  IdCard,
  MessageSquare,
  Package,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
  X,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Star,
  Award,
  Download,
  Check,
  ExternalLink,
  HelpCircle,
  Filter,
  Search,
  Building2,
  AlertOctagon,
  ArrowRight,
  ChevronRight,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';

export type ServiceTab =
  | 'Approvals'
  | 'Requests'
  | 'Announcements'
  | 'Forms'
  | 'ID Cards'
  | 'Library Suggestions'
  | 'Lab Purchases'
  | 'Policies'
  | 'Services'
  | 'Feedback'
  | 'Emergency Contacts';

export type Item = {
  id: string;
  title: string;
  type: string;
  student: string;
  module: string;
  status: string;
  priority?: string;
  date: string;
  detail: string;
  extraData?: Record<string, any>;
};

export type Announcement = {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  date: string;
  audience: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  content: string;
  category: string;
  acknowledged?: boolean;
};

const initialSeedItems: Item[] = [
  {
    id: 'APR-2048',
    title: 'Staff leave request',
    type: 'Staff Leave',
    student: '—',
    module: 'Administration',
    status: 'Awaiting Review',
    priority: 'High',
    date: '2026-09-09',
    detail: 'Sadahana · 14 Sep · Physics cover required for DP-2 Board Prep.',
    extraData: { teacher: 'Sadahana', substitute: 'Mr. David Clark', days: 2 }
  },
  {
    id: 'ABS-1048',
    title: 'Absence request',
    type: 'Absence',
    student: 'Nithin Selvaraj',
    module: 'Attendance',
    status: 'Approved',
    date: '2026-09-09',
    detail: '14 Sep · Full day · Medical appointment & orthodontic consultation.',
    extraData: { leaveType: 'Medical', emergencyContact: '+91 98765 10001' }
  },
  {
    id: 'LBS-0148',
    title: 'Introduction to Robotics & Autonomous Systems',
    type: 'Book Suggestion',
    student: 'Nithin Selvaraj',
    module: 'Library',
    status: 'Purchase Requested',
    date: '2026-09-08',
    detail: 'Requested for IB Computer Science Extended Essay and Robotics Lab.',
    extraData: { author: 'Dr. Russell Norvig', urgency: 'Normal' }
  },
  {
    id: 'LPR-0842',
    title: 'Digital multimeter × 5 & Concave Optical Sets',
    type: 'Lab Purchase',
    student: '—',
    module: 'Laboratory',
    status: 'Approved',
    priority: 'High',
    date: '2026-09-08',
    detail: 'Physics Lab · Required for Snell\'s Law & internal resistance practical.',
    extraData: { lab: 'physics', quantity: '5 sets', estimatedCost: '$120.00' }
  },
  {
    id: 'CMP-3921',
    title: 'National Robotics Olympiad 2026',
    type: 'Competition Registration',
    student: 'Nithin Selvaraj',
    module: 'Forms',
    status: 'Under Review',
    priority: 'High',
    date: '2026-09-10',
    detail: 'Senior Division · Supervising Teacher: Sadahana · Team SchoolOS Apex.',
    extraData: { mentor: 'Sadahana', teamMembers: 'Nithin S., Rohan V., Maya P.' }
  },
  {
    id: 'FDB-0422',
    title: 'Extended Library Hours during IB Mock Exam Week',
    type: 'Feedback',
    student: 'Nithin Selvaraj',
    module: 'Student Services',
    status: 'Reviewed',
    date: '2026-09-07',
    detail: 'Suggestion to keep silent study pod 2 open until 18:30 on weekdays.',
    extraData: { category: 'Library & Study Spaces', rating: 5 }
  }
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ANN-101',
    title: 'Grade 12 Senior Assembly & Hall Briefing',
    author: 'Head of School',
    authorRole: 'Head of School',
    date: 'Today, 10:42',
    audience: 'Grade 12',
    priority: 'Important',
    category: 'Assembly',
    content: 'Grade 12 students should report promptly to the auditorium during Period 2 for the DP Mock Examination briefing and university recommendation timeline.',
    acknowledged: false
  },
  {
    id: 'ANN-102',
    title: 'Library Hours & Digital Repository Update',
    author: 'School Office',
    authorRole: 'Librarian (Mrs. Vance)',
    date: '2026-09-09',
    audience: 'Entire School',
    priority: 'Normal',
    category: 'Facility',
    content: 'Normal borrowing, research carrels and returns are available until 4:00 PM today. Digital JSTOR and Oxford academic research passes remain accessible 24/7.',
    acknowledged: true
  },
  {
    id: 'ANN-103',
    title: 'Science Laboratories Safety Inspection Completed',
    author: 'Sadahana',
    authorRole: 'Science Coordinator',
    date: '2026-09-08',
    audience: 'All DP Students',
    priority: 'Normal',
    category: 'Laboratory',
    content: 'Chemistry & Physics practical prep benches have been replenished with fresh titration reagents and optical glassware. Requisitions can now be placed via Lab Services.',
    acknowledged: false
  }
];

const tabsByRole: Record<string, ServiceTab[]> = {
  Admin: ['Approvals', 'Announcements', 'Forms', 'ID Cards', 'Lab Purchases', 'Policies', 'Services', 'Feedback', 'Emergency Contacts'],
  'Head of School': ['Approvals', 'Announcements', 'Policies', 'Services', 'Feedback'],
  Student: ['Requests', 'Announcements', 'Forms', 'ID Cards', 'Library Suggestions', 'Policies', 'Services', 'Feedback', 'Emergency Contacts'],
  Teacher: ['Announcements', 'Forms', 'Lab Purchases', 'Policies', 'Services', 'Feedback']
};

export function StudentServices({
  ws,
  role,
  initialTab
}: {
  ws: any;
  role: string;
  initialTab?: ServiceTab;
}) {
  const tabs = tabsByRole[role] || ['Announcements', 'Policies', 'Services'];
  const [tab, setTab] = useState<ServiceTab>(
    initialTab && tabs.includes(initialTab) ? initialTab : tabs[0]
  );

  useEffect(() => {
    if (initialTab && tabs.includes(initialTab)) setTab(initialTab);
  }, [initialTab, tabs]);

  const [items, setItems] = useState<Item[]>(initialSeedItems);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  // Active Interactive Modal States
  const [activeFormType, setActiveFormType] = useState<string | null>(null);
  const [isNewRequestMenuOpen, setIsNewRequestMenuOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<Item | null>(null);
  const [selectedPolicyModal, setSelectedPolicyModal] = useState<string | null>(null);
  const [selectedServiceDeskModal, setSelectedServiceDeskModal] = useState<{ title: string; status: string; hours: string; lead: string; desc: string } | null>(null);

  // Cross-workflow sync
  useEffect(() => {
    let cancelled = false;
    fetch('/api/cross-workflows', { credentials: 'same-origin' })
      .then(async (response) => (response.ok ? response.json() : Promise.reject(await response.json())))
      .then((data: any) => {
        if (cancelled) return;
        const parentItems = (data.parentRequests || []).map(
          (request: any): Item => ({
            id: request.id,
            title: `${request.request_type.replace(/([A-Z])/g, ' $1').trim()} request`,
            type: 'Parent Request',
            student: request.student_id || ws?.member?.name || 'Student',
            module: 'Student Services',
            status: request.status,
            priority: 'Normal',
            date: request.request_date || new Date().toISOString().slice(0, 10),
            detail: request.reason || request.notes || 'Parent operational request.'
          })
        );
        const approvalItems = (data.approvals || []).map(
          (approval: any): Item => ({
            id: approval.id,
            title: approval.title,
            type: approval.source_type || 'Approval',
            student: approval.student_id || '—',
            module: approval.module || 'School Administration',
            status: approval.status || 'Pending',
            priority: approval.priority || 'Normal',
            date: approval.created_at?.slice(0, 10) || '',
            detail: approval.notes || 'Shared cross-workflow approval record.'
          })
        );
        if (parentItems.length || approvalItems.length) {
          setItems((current) => [
            ...parentItems,
            ...approvalItems,
            ...current.filter(
              (item) =>
                !parentItems.some((next: Item) => next.id === item.id) &&
                !approvalItems.some((next: Item) => next.id === item.id)
            )
          ]);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [ws?.member?.name]);

  const visible = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.type} ${item.student} ${item.module} ${item.status} ${item.detail}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query]
  );

  const act = (item: Item, status: string) => {
    setItems((all) => all.map((x) => (x.id === item.id ? { ...x, status } : x)));
    setMessage(`${item.id} has been marked as ${status}.`);
    if (item.type === 'Parent Request') {
      void fetch('/api/cross-workflows', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parentRequest.update', data: { id: item.id, status } })
      }).catch(() => undefined);
    }
  };

  const acknowledgeAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    setMessage('Announcement acknowledged.');
  };

  const handleCreateRecord = (newItem: Partial<Item>) => {
    const id = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const created: Item = {
      id,
      title: newItem.title || 'Service Request',
      type: newItem.type || 'General Request',
      student: ws?.member?.name || 'Nithin Selvaraj',
      module: newItem.module || 'Student Services',
      status: 'Submitted',
      priority: newItem.priority || 'Normal',
      date: new Date().toISOString().slice(0, 10),
      detail: newItem.detail || 'Submitted from SchoolOS Student Services.',
      extraData: newItem.extraData
    };

    setItems((all) => [created, ...all]);
    setActiveFormType(null);
    setIsNewRequestMenuOpen(false);
    setMessage(`✓ ${created.type} (${created.id}) submitted successfully.`);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}
  };

  const handlePublishAnnouncement = (ann: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      title: ann.title || 'New Announcement',
      author: ws?.member?.name || (role === 'Teacher' ? 'Sadahana' : 'School Administration'),
      authorRole: role === 'Teacher' ? 'Science Coordinator' : 'Administration',
      date: 'Just now',
      audience: ann.audience || 'Entire School',
      priority: ann.priority || 'Normal',
      category: ann.category || 'General Notice',
      content: ann.content || '',
      acknowledged: false
    };

    setAnnouncements((prev) => [newAnn, ...prev]);
    setIsAnnouncementModalOpen(false);
    setMessage(`✓ Announcement "${newAnn.title}" published to ${newAnn.audience}.`);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } catch (_) {}
  };

  return (
    <section className="services-page">
      {/* Page Header */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">SCHOOL SERVICES</div>
          <h1>{role === 'Admin' || role === 'Head of School' ? 'Approvals & services' : 'Student services'}</h1>
          <p>Requests, communications, forms and school support in one place.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewRequestMenuOpen(true)}>
            <Plus size={16} /> New request
          </Button>
        </div>
      </div>

      {message && (
        <div className="student-success flex items-center justify-between" role="status">
          <span>{message}</span>
          <button
            onClick={() => setMessage('')}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <nav className="services-tabs" aria-label="Student services sections">
        {tabs.map((name) => (
          <button
            key={name}
            className={tab === name ? 'active' : ''}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </nav>

      {/* Search Toolbar */}
      {['Approvals', 'Requests', 'Lab Purchases', 'Library Suggestions', 'Feedback', 'Forms', 'ID Cards', 'Emergency Contacts'].includes(tab) && (
        <div className="services-toolbar">
          <Input
            placeholder="Search requests, forms and records…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>{visible.length} records</span>
        </div>
      )}

      {/* Tab: Approvals / Requests / Lab Purchases / Library Suggestions / Feedback */}
      {['Approvals', 'Requests', 'Lab Purchases', 'Library Suggestions', 'Feedback'].includes(tab) && (
        <div className="services-grid">
          {visible
            .filter((item) =>
              tab === 'Approvals'
                ? true
                : tab === 'Requests'
                ? item.type.toLowerCase().includes('request') ||
                  ['Absence', 'Early Departure', 'Information Change', 'ID Replacement', 'General Request', 'Competition Registration'].includes(item.type)
                : tab === 'Lab Purchases'
                ? item.type === 'Lab Purchase'
                : tab === 'Library Suggestions'
                ? item.type === 'Book Suggestion'
                : item.type === 'Feedback'
            )
            .map((item) => (
              <article className="service-record panel" key={item.id}>
                <div className="service-record-top">
                  <span className="service-icon">
                    <ClipboardCheck size={17} />
                  </span>
                  <span>
                    <b>{item.title}</b>
                    <small>
                      {item.id} · {item.module} · {item.date}
                    </small>
                  </span>
                  <span className={`service-status ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                    {item.status}
                  </span>
                </div>
                <p>{item.detail}</p>
                {item.priority && (
                  <span className="service-priority">{item.priority} priority</span>
                )}
                <div className="service-actions">
                  {(role === 'Admin' || role === 'Head of School') && (
                    <>
                      <Button size="sm" onClick={() => act(item, 'Approved')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => act(item, 'Rejected')}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedItemForDetail(item)}
                  >
                    Open detail
                  </Button>
                </div>
              </article>
            ))}

          {tab === 'Lab Purchases' && (
            <div className="col-span-full pt-2">
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center gap-2 border-dashed border-[#2D7F9F]/40 hover:bg-[#E9F3F6]"
                onClick={() => setActiveFormType('Lab Purchase')}
              >
                <Package size={16} className="text-[#2D7F9F]" />
                <span className="font-bold text-[#1F3547]">+ Submit New Lab Equipment / Reagent Purchase Request</span>
              </Button>
            </div>
          )}

          {tab === 'Library Suggestions' && (
            <div className="col-span-full pt-2">
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center gap-2 border-dashed border-[#2D7F9F]/40 hover:bg-[#E9F3F6]"
                onClick={() => setActiveFormType('Book Suggestion')}
              >
                <BookOpen size={16} className="text-[#2D7F9F]" />
                <span className="font-bold text-[#1F3547]">+ Propose New Book for School Library Collection</span>
              </Button>
            </div>
          )}

          {tab === 'Feedback' && (
            <div className="col-span-full pt-2">
              <Button
                variant="outline"
                className="w-full py-3 flex items-center justify-center gap-2 border-dashed border-[#2D7F9F]/40 hover:bg-[#E9F3F6]"
                onClick={() => setActiveFormType('Feedback')}
              >
                <HeartHandshake size={16} className="text-[#2D7F9F]" />
                <span className="font-bold text-[#1F3547]">+ Submit Feedback, Suggestion or Concern</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Announcements */}
      {tab === 'Announcements' && (
        <div className="space-y-4">
          <div className="services-grid">
            {announcements.map((ann) => (
              <article
                className={`service-record panel ${ann.priority === 'Important' || ann.priority === 'Urgent' ? 'announcement-card' : ''}`}
                key={ann.id}
              >
                <div className="service-record-top">
                  <span className="service-icon">
                    <Bell size={17} />
                  </span>
                  <span>
                    <b>{ann.title}</b>
                    <small>
                      {ann.author} ({ann.authorRole}) · {ann.date} · {ann.audience}
                    </small>
                  </span>
                  {ann.priority !== 'Normal' && (
                    <span className={`service-status ${ann.priority === 'Urgent' ? 'rejected' : 'important'}`}>
                      {ann.priority}
                    </span>
                  )}
                </div>
                <p>{ann.content}</p>

                <div className="service-actions">
                  {ann.acknowledged ? (
                    <span className="text-xs font-bold text-[#28735a] flex items-center gap-1">
                      <CheckCircle2 size={14} /> Acknowledged
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => acknowledgeAnnouncement(ann.id)}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {(role === 'Admin' || role === 'Head of School' || role === 'Teacher') && (
            <div className="pt-2">
              <Button
                className="w-full sm:w-auto flex items-center justify-center gap-2"
                onClick={() => setIsAnnouncementModalOpen(true)}
              >
                <Send size={15} /> Publish announcement
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Forms */}
      {tab === 'Forms' && (
        <div className="services-grid">
          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <Award size={17} />
              </span>
              <span>
                <b>Competition & Olympiad Registration</b>
                <small>Open for Term 1 · Supervising teacher approval required</small>
              </span>
            </div>
            <p>Register for Mathematics Olympiads, Robocup, MUN, or Science Fair with your mentor.</p>
            <div className="service-actions">
              <Button size="sm" onClick={() => setActiveFormType('Competition Registration')}>
                Fill Registration Form
              </Button>
            </div>
          </article>

          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <FileText size={17} />
              </span>
              <span>
                <b>General School & Administrative Request</b>
                <small>Available to all students and staff members</small>
              </span>
            </div>
            <p>Submit structured administrative inquiries, locker keys, or IT equipment requests.</p>
            <div className="service-actions">
              <Button size="sm" onClick={() => setActiveFormType('General Request')}>
                Open Request Form
              </Button>
            </div>
          </article>

          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <Calendar size={17} />
              </span>
              <span>
                <b>Absence & Medical Leave Notification</b>
                <small>Attendance Office · Same-day and advance filing</small>
              </span>
            </div>
            <p>Notify your homeroom teacher and attendance desk of upcoming medical or family leave.</p>
            <div className="service-actions">
              <Button size="sm" onClick={() => setActiveFormType('Absence')}>
                File Leave Request
              </Button>
            </div>
          </article>

          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <Clock size={17} />
              </span>
              <span>
                <b>Early Gate Pass / Departure Permission</b>
                <small>Security Gate & Front Office Clearance</small>
              </span>
            </div>
            <p>Request authorized exit before 15:30 with verified guardian pickup details.</p>
            <div className="service-actions">
              <Button size="sm" onClick={() => setActiveFormType('Early Departure')}>
                Request Gate Pass
              </Button>
            </div>
          </article>
        </div>
      )}

      {/* Tab: ID Cards */}
      {tab === 'ID Cards' && (
        <div className="services-grid">
          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <IdCard size={17} />
              </span>
              <span>
                <b>School ID · {ws?.member?.name || 'Nithin Selvaraj'}</b>
                <small>Student ID: STU-001 · Grade 12 (DP-2) · 2026–27</small>
              </span>
              <span className="service-status approved">Active</span>
            </div>
            <p>
              Your physical NFC smartcard is linked to library checkout, science laboratory clearance, and campus gate attendance.
            </p>
            <div className="service-actions">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveFormType('ID Replacement')}
              >
                Request replacement card
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMessage('✓ Your card STU-001 has been temporarily locked for security. Submit replacement form to issue a new badge.');
                }}
              >
                Report lost / Freeze card
              </Button>
            </div>
          </article>
        </div>
      )}

      {/* Tab: Policies */}
      {tab === 'Policies' && (
        <div className="services-grid">
          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <ShieldCheck size={17} />
              </span>
              <span>
                <b>Library Borrowing & Digital Loan Policy</b>
                <small>Library Services · Version 2.4 · Effective 2026</small>
              </span>
            </div>
            <p>Borrowing limits (up to 4 items for 14 days), renewable loans, digital archives, and replacement guidelines.</p>
            <div className="service-actions">
              <Button size="sm" variant="outline" onClick={() => setSelectedPolicyModal('Library')}>
                Read Full Policy
              </Button>
            </div>
          </article>

          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <ShieldCheck size={17} />
              </span>
              <span>
                <b>Science Laboratory Safety & Protocol Handbook</b>
                <small>Science Department (Sadahana) · Version 3.1</small>
              </span>
            </div>
            <p>Mandatory PPE requirements, hazardous reagent handling, fume hood rules, and incident write-off reporting.</p>
            <div className="service-actions">
              <Button size="sm" variant="outline" onClick={() => setSelectedPolicyModal('Laboratory')}>
                Read Full Policy
              </Button>
            </div>
          </article>

          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <ShieldCheck size={17} />
              </span>
              <span>
                <b>Student Conduct & Academic Integrity Handbook</b>
                <small>Head of School · Updated August 2026</small>
              </span>
            </div>
            <p>Honor code standards, authentic authorship expectations, generative AI citation, and restorative pathways.</p>
            <div className="service-actions">
              <Button size="sm" variant="outline" onClick={() => setSelectedPolicyModal('Conduct')}>
                Read Full Policy
              </Button>
            </div>
          </article>

          <article className="service-record panel">
            <div className="service-record-top">
              <span className="service-icon">
                <ShieldCheck size={17} />
              </span>
              <span>
                <b>School Transport & Bus Safety Rules</b>
                <small>Transport Operations Desk · Version 1.9</small>
              </span>
            </div>
            <p>Boarding guidelines, GPS live tracking, stop change notification deadlines, and conduct on transit.</p>
            <div className="service-actions">
              <Button size="sm" variant="outline" onClick={() => setSelectedPolicyModal('Transport')}>
                Read Full Policy
              </Button>
            </div>
          </article>
        </div>
      )}

      {/* Tab: Services */}
      {tab === 'Services' && (
        <div className="service-status-grid">
          {[
            {
              title: 'Library & Learning Commons',
              status: 'Available',
              hours: 'Open Today 08:00 – 16:30',
              lead: 'Mrs. Eleanor Vance (Chief Librarian)',
              desc: 'Book checkout, silent research carrels, printing pods, and group study conference rooms.',
              Icon: BookOpen
            },
            {
              title: 'Science & Chemistry Laboratories',
              status: 'Active Lab Sessions',
              hours: 'Open 08:30 – 15:30',
              lead: 'Sadahana & Mr. Sharma',
              desc: 'Practical experiment benches, reagent requisitions, optics gear, and digital sensor balances.',
              Icon: Package
            },
            {
              title: 'Transport Operations Office',
              status: 'Available',
              hours: 'Open 07:30 – 17:00',
              lead: 'Mr. Rajesh Kumar (Transport Supervisor)',
              desc: 'Bus route tracking, GPS driver communications, stop change requests, and emergency transit dispatch.',
              Icon: Bus
            },
            {
              title: 'Student Affairs & Main School Office',
              status: 'Available',
              hours: 'Reception 08:00 – 16:30',
              lead: 'Registrar & Front Desk Operations',
              desc: 'Bonafide study certificates, fee receipts, locker assignments, lost & found, and parent appointments.',
              Icon: UserRound
            }
          ].map(({ title, status, hours, lead, desc, Icon }) => (
            <article className="service-record panel" key={title}>
              <div className="service-record-top">
                <span className="service-icon">
                  <Icon size={17} />
                </span>
                <span>
                  <b>{title}</b>
                  <small>{status} · {hours}</small>
                </span>
              </div>
              <p>{desc}</p>
              <div className="service-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedServiceDeskModal({ title, status, hours, lead, desc })}
                >
                  Access Service Desk
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tab: Emergency Contacts */}
      {tab === 'Emergency Contacts' && (
        <div className="service-record panel emergency-card">
          <div className="service-record-top">
            <span className="service-icon">
              <UserRound size={17} />
            </span>
            <span>
              <b>Verified Emergency Contacts for {ws?.member?.name || 'Nithin Selvaraj'}</b>
              <small>Accessible to authorized medical staff, principal and transport coordinators</small>
            </span>
          </div>
          <div className="space-y-2 my-4 text-xs">
            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#DBE4EA] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#1F3547]">Primary: Priya Selvaraj (Mother)</p>
                <p className="text-[#61728A]">Phone: +91 98765 10001 · Emergency Pickup Authorized</p>
              </div>
              <span className="text-[10px] bg-[#E9F3F6] text-[#2D7F9F] font-bold px-2 py-1 rounded">Primary</span>
            </div>

            <div className="p-3 bg-[#F7F9FB] rounded-xl border border-[#DBE4EA] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#1F3547]">Secondary: Arun Selvaraj (Father)</p>
                <p className="text-[#61728A]">Phone: +91 98765 10002 · Authorized Contact</p>
              </div>
              <span className="text-[10px] bg-[#F7F9FB] text-[#61728A] font-bold px-2 py-1 rounded">Secondary</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setActiveFormType('Emergency Contact Update')}>
            Request Contact Details Update
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NEW REQUEST MENU DIALOG                                                */}
      {/* ========================================================================= */}
      {isNewRequestMenuOpen && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#DBE4EA] overflow-hidden text-[#1F3547] font-sans">
              <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between bg-[#F7F9FB]">
                <div>
                  <h3 className="text-lg font-bold text-[#1F3547]">Create Service Request</h3>
                  <p className="text-xs text-[#61728A]">
                    Select the type of service or inquiry form you want to fill out.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewRequestMenuOpen(false)}
                  className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                {[
                  { type: 'Absence', title: 'Absence / Medical Leave', desc: 'File single or multi-day leave', Icon: Calendar },
                  { type: 'Early Departure', title: 'Early Gate Pass', desc: 'Authorized departure pass', Icon: Clock },
                  { type: 'Information Change', title: 'Information Change', desc: 'Update address, phone or guardian', Icon: FileText },
                  { type: 'Feedback', title: 'Feedback / Suggestion', desc: 'Share ideas or lodge concerns', Icon: MessageSquare },
                  { type: 'Book Suggestion', title: 'Suggest Library Book', desc: 'Propose textbook or fiction', Icon: BookOpen },
                  { type: 'Lab Purchase', title: 'Lab Purchase Requisition', desc: 'Order chemicals or equipment', Icon: Package },
                  { type: 'Competition Registration', title: 'Competition Entry', desc: 'Register for Olympiads & MUN', Icon: Award },
                  { type: 'General Request', title: 'General School Request', desc: 'Certificates, lockers, inquiries', Icon: HelpCircle }
                ].map(({ type, title, desc, Icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIsNewRequestMenuOpen(false);
                      setActiveFormType(type);
                    }}
                    className="p-4 rounded-2xl border border-[#DBE4EA] bg-[#F7F9FB] hover:bg-[#E9F3F6] hover:border-[#2D7F9F]/40 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="p-2 rounded-xl bg-white text-[#2D7F9F] shadow-xs group-hover:bg-[#2D7F9F] group-hover:text-white transition-colors">
                        <Icon size={16} />
                      </div>
                      <h4 className="text-xs font-bold text-[#1F3547]">{title}</h4>
                    </div>
                    <p className="text-[11px] text-[#61728A]">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================================= */}
      {/* 2. DYNAMIC FORM FILLING MODAL                                             */}
      {/* ========================================================================= */}
      {activeFormType && typeof document !== 'undefined' &&
        createPortal(
          <DynamicFormModal
            formType={activeFormType}
            studentName={ws?.member?.name || 'Nithin Selvaraj'}
            onClose={() => setActiveFormType(null)}
            onSubmit={handleCreateRecord}
          />,
          document.body
        )}

      {/* ========================================================================= */}
      {/* 3. PUBLISH ANNOUNCEMENT MODAL                                             */}
      {/* ========================================================================= */}
      {isAnnouncementModalOpen && typeof document !== 'undefined' &&
        createPortal(
          <PublishAnnouncementModal
            onClose={() => setIsAnnouncementModalOpen(false)}
            onPublish={handlePublishAnnouncement}
            currentUserRole={role}
          />,
          document.body
        )}

      {/* ========================================================================= */}
      {/* 4. RECORD DETAIL MODAL                                                    */}
      {/* ========================================================================= */}
      {selectedItemForDetail && typeof document !== 'undefined' &&
        createPortal(
          <ItemDetailModal
            item={selectedItemForDetail}
            onClose={() => setSelectedItemForDetail(null)}
            onStatusChange={(newStatus) => {
              act(selectedItemForDetail, newStatus);
              setSelectedItemForDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
            }}
            canManage={role === 'Admin' || role === 'Head of School'}
          />,
          document.body
        )}

      {/* ========================================================================= */}
      {/* 5. POLICY DOCUMENT VIEWER MODAL                                           */}
      {/* ========================================================================= */}
      {selectedPolicyModal && typeof document !== 'undefined' &&
        createPortal(
          <PolicyDocumentModal
            policyKey={selectedPolicyModal}
            onClose={() => setSelectedPolicyModal(null)}
          />,
          document.body
        )}

      {/* ========================================================================= */}
      {/* 6. SERVICE DESK ACCESS MODAL                                              */}
      {/* ========================================================================= */}
      {selectedServiceDeskModal && typeof document !== 'undefined' &&
        createPortal(
          <ServiceDeskModal
            service={selectedServiceDeskModal}
            studentName={ws?.member?.name || 'Nithin Selvaraj'}
            onClose={() => setSelectedServiceDeskModal(null)}
            onSubmitInquiry={(inquiry) => {
              handleCreateRecord({
                title: `${selectedServiceDeskModal.title}: ${inquiry.subject}`,
                type: 'Service Desk Inquiry',
                module: selectedServiceDeskModal.title,
                detail: inquiry.message,
                priority: inquiry.priority
              });
              setSelectedServiceDeskModal(null);
            }}
          />,
          document.body
        )}
    </section>
  );
}

/* ============================================================================= */
/* SUB-COMPONENTS & FORM MODALS                                                  */
/* ============================================================================= */

function DynamicFormModal({
  formType,
  studentName,
  onClose,
  onSubmit
}: {
  formType: string;
  studentName: string;
  onClose: () => void;
  onSubmit: (item: Partial<Item>) => void;
}) {
  // Absence State
  const [absenceType, setAbsenceType] = useState('Medical');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [doctorNote, setDoctorNote] = useState('');

  // Early Departure State
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState('13:30');
  const [pickupPerson, setPickupPerson] = useState('Priya Selvaraj (Mother)');
  const [earlyReason, setEarlyReason] = useState('Scheduled specialist doctor consultation.');

  // Info Change State
  const [fieldToChange, setFieldToChange] = useState('Home Residential Address');
  const [currentVal, setCurrentVal] = useState('14 Palm Grove Road, Koramangala');
  const [newVal, setNewVal] = useState('');
  const [changeReason, setChangeReason] = useState('Family relocation.');

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState('Library & Study Spaces');
  const [rating, setRating] = useState(5);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Book Suggestion State
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookGenre, setBookGenre] = useState('Computer Science');
  const [bookReason, setBookReason] = useState('');

  // Lab Purchase State
  const [labType, setLabType] = useState('chemistry');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('100 mL');
  const [urgency, setUrgency] = useState('Normal');
  const [practicalPurpose, setPracticalPurpose] = useState('');

  // Competition State
  const [competitionName, setCompetitionName] = useState('National Science Olympiad 2026');
  const [mentorTeacher, setMentorTeacher] = useState('Sadahana');
  const [teamType, setTeamType] = useState('Solo Entry');
  const [compNotes, setCompNotes] = useState('');

  // General Request State
  const [reqSubject, setReqSubject] = useState('');
  const [reqDepartment, setReqDepartment] = useState('Administration & Registrar');
  const [reqDetails, setReqDetails] = useState('');
  const [reqPriority, setReqPriority] = useState('Normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formType === 'Absence') {
      onSubmit({
        title: `${absenceType} leave request`,
        type: 'Absence',
        module: 'Attendance',
        detail: `${startDate} to ${endDate} · Reason: ${reason} ${doctorNote ? `· Note: ${doctorNote}` : ''}`,
        extraData: { absenceType, startDate, endDate, reason, doctorNote }
      });
    } else if (formType === 'Early Departure') {
      onSubmit({
        title: 'Early Gate Pass Permission',
        type: 'Early Departure',
        module: 'Security & Gate Pass',
        detail: `${departureDate} at ${departureTime} · Pickup: ${pickupPerson} · ${earlyReason}`,
        extraData: { departureDate, departureTime, pickupPerson, earlyReason }
      });
    } else if (formType === 'Information Change') {
      onSubmit({
        title: `Information update: ${fieldToChange}`,
        type: 'Information Change',
        module: 'Student Records',
        detail: `Update ${fieldToChange} to: "${newVal}". Reason: ${changeReason}`,
        extraData: { fieldToChange, currentVal, newVal, changeReason }
      });
    } else if (formType === 'Feedback') {
      onSubmit({
        title: feedbackTitle || `${feedbackCategory} Feedback`,
        type: 'Feedback',
        module: 'Student Services',
        student: isAnonymous ? 'Anonymous Student' : studentName,
        detail: `[${rating} Stars] ${feedbackBody}`,
        extraData: { category: feedbackCategory, rating, isAnonymous }
      });
    } else if (formType === 'Book Suggestion') {
      onSubmit({
        title: bookTitle,
        type: 'Book Suggestion',
        module: 'Library',
        detail: `By ${bookAuthor} (${bookGenre}) · ${bookReason}`,
        extraData: { bookTitle, bookAuthor, bookGenre, bookReason }
      });
    } else if (formType === 'Lab Purchase') {
      onSubmit({
        title: `${itemName} (${quantity})`,
        type: 'Lab Purchase',
        module: 'Laboratory',
        priority: urgency,
        detail: `${labType.toUpperCase()} Lab · ${practicalPurpose}`,
        extraData: { labType, itemName, quantity, urgency, practicalPurpose }
      });
    } else if (formType === 'Competition Registration') {
      onSubmit({
        title: competitionName,
        type: 'Competition Registration',
        module: 'Forms & Competitions',
        detail: `Mentor: ${mentorTeacher} · ${teamType} · ${compNotes}`,
        extraData: { competitionName, mentorTeacher, teamType, compNotes }
      });
    } else {
      onSubmit({
        title: reqSubject || 'General School Request',
        type: 'General Request',
        module: reqDepartment,
        priority: reqPriority,
        detail: reqDetails,
        extraData: { reqSubject, reqDepartment, reqDetails, reqPriority }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DBE4EA] text-[#1F3547] font-sans flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between bg-[#F7F9FB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2D7F9F] text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F3547]">{formType} Form</h3>
              <p className="text-xs text-[#61728A]">Applicant: {studentName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {formType === 'Absence' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Leave Category *</label>
                  <select
                    value={absenceType}
                    onChange={(e) => setAbsenceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Medical">Medical / Doctor Appointment</option>
                    <option value="Family">Family / Personal Emergency</option>
                    <option value="Academic">Academic Competition / Olympiad</option>
                    <option value="Sports">Official School Sports Tournament</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Emergency Phone *</label>
                  <input
                    type="text"
                    defaultValue="+91 98765 10001"
                    required
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">From Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">To Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Reason for Absence *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Scheduled dental surgery and orthodontic checkup."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Medical Certificate / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Hospital Ref #MED-9923 (or bring physical note to reception)"
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'Early Departure' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Departure Date *</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Expected Pickup Time *</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Pickup Person Name & Relationship *</label>
                <input
                  type="text"
                  value={pickupPerson}
                  onChange={(e) => setPickupPerson(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Reason for Early Departure *</label>
                <textarea
                  rows={2}
                  required
                  value={earlyReason}
                  onChange={(e) => setEarlyReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'Information Change' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Field to Update *</label>
                <select
                  value={fieldToChange}
                  onChange={(e) => setFieldToChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                >
                  <option value="Home Residential Address">Home Residential Address</option>
                  <option value="Guardian Phone Number">Guardian Phone Number</option>
                  <option value="Emergency Contact">Emergency Contact Details</option>
                  <option value="Student Email Address">Student Email Address</option>
                  <option value="Bus Route & Stop">Bus Route / Transit Stop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Current Stored Record</label>
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) => setCurrentVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EDF2F5] border border-[#DBE4EA] rounded-xl text-[#61728A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">New Requested Record / Value *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter the new updated information..."
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#2D7F9F] rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Reason for Modification</label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'Feedback' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Department / Facility *</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Library & Study Spaces">Library & Study Spaces</option>
                    <option value="Science Laboratories">Science Laboratories</option>
                    <option value="Canteen & Meal Services">Canteen & Meal Services</option>
                    <option value="School Bus & Transport">School Bus & Transport</option>
                    <option value="Sports & Recreation">Sports & Recreation</option>
                    <option value="Academic Support & Homework">Academic Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Overall Satisfaction</label>
                  <div className="flex items-center gap-1.5 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="cursor-pointer text-[#F59E0B]"
                      >
                        <Star size={18} className={star <= rating ? 'fill-[#F59E0B]' : 'text-[#DBE4EA]'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request to add more graphing calculators in Study Pod 2"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Detailed Suggestion / Experience *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Please describe what is working well and what can be improved..."
                  value={feedbackBody}
                  onChange={(e) => setFeedbackBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-[#2D7F9F] cursor-pointer"
                />
                <label htmlFor="anon" className="text-xs text-[#61728A] cursor-pointer">
                  Submit anonymously (omit student name from public reports)
                </label>
              </div>
            </>
          )}

          {formType === 'Book Suggestion' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxford IB Physics HL 2026 Edition"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Homer, Michael Bowen"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Subject / Category</label>
                  <select
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Fiction & Literature">Fiction & Literature</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Why should the library add this book? *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Required for Grade 12 Extended Essay research on quantum optics."
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'Lab Purchase' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Lab Department *</label>
                  <select
                    value={labType}
                    onChange={(e) => setLabType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="chemistry">Chemistry Lab</option>
                    <option value="physics">Physics Lab</option>
                    <option value="biology">Biology Lab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">Urgent (Needed this week)</option>
                    <option value="Low">Next Term</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Apparatus / Chemical Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Potassium Permanganate 0.02M"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Quantity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mL / 5 sets"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Practical Purpose / Board Experiment *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Grade 12 Redox titration assessment practicals."
                  value={practicalPurpose}
                  onChange={(e) => setPracticalPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'Competition Registration' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Competition / Event Name *</label>
                <input
                  type="text"
                  required
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Supervising Mentor Teacher *</label>
                  <input
                    type="text"
                    required
                    value={mentorTeacher}
                    onChange={(e) => setMentorTeacher(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Entry Category</label>
                  <select
                    value={teamType}
                    onChange={(e) => setTeamType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Solo Entry">Solo Entry (Individual)</option>
                    <option value="Team of 2">Team of 2</option>
                    <option value="Team of 4 (SchoolOS Apex)">Team of 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Supporting Notes / Project Outline</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Autonomous maze navigation robot programmed in Python with ultrasonic LiDAR."
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'General Request' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Target Department *</label>
                  <select
                    value={reqDepartment}
                    onChange={(e) => setReqDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Administration & Registrar">Administration & Registrar</option>
                    <option value="Academic Office">Academic Office</option>
                    <option value="IT & Campus Support">IT & Campus Support</option>
                    <option value="Facilities & Lockers">Facilities & Lockers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Priority</label>
                  <select
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Request Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for Bonafide Student Certificate for Passport"
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Details & Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide all necessary details for administrative verification..."
                  value={reqDetails}
                  onChange={(e) => setReqDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {formType === 'ID Replacement' && (
            <>
              <div className="p-3.5 bg-[#FAF1F0] border border-[#A65D57]/30 rounded-2xl text-xs text-[#A65D57]">
                <p className="font-bold">ID Replacement Fee: $10.00</p>
                <p className="text-[11px] mt-0.5">Replacement smartcards are printed and programmed within 24 hours.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Reason for Replacement *</label>
                <select className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl">
                  <option value="Card Lost">Card Lost</option>
                  <option value="Card Damaged / NFC Inactive">Card Physically Damaged / NFC Chip Inactive</option>
                  <option value="Name / Grade Correction">Name / Grade Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Pickup Point</label>
                <select className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl">
                  <option value="Front Reception">Front School Reception</option>
                  <option value="Student Affairs Pod">Student Affairs Helpdesk</option>
                </select>
              </div>
            </>
          )}

          {formType === 'Emergency Contact Update' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Primary Contact Name & Relation *</label>
                <input
                  type="text"
                  defaultValue="Priya Selvaraj (Mother)"
                  required
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Primary Phone Number *</label>
                  <input
                    type="text"
                    defaultValue="+91 98765 10001"
                    required
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F3547] mb-1">Secondary Phone Number</label>
                  <input
                    type="text"
                    defaultValue="+91 98765 10002"
                    className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F3547] mb-1">Emergency Medical Notes (Allergies, etc.)</label>
                <input
                  type="text"
                  placeholder="e.g. Mild penicillin allergy · Blood Group: O Positive"
                  className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-[#DBE4EA] flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-1.5">
              <Check size={16} /> Submit Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PublishAnnouncementModal({
  onClose,
  onPublish,
  currentUserRole
}: {
  onClose: () => void;
  onPublish: (ann: Partial<Announcement>) => void;
  currentUserRole: string;
}) {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('Entire School');
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Important');
  const [category, setCategory] = useState('Assembly');
  const [content, setContent] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onPublish({
      title: title.trim(),
      audience,
      priority,
      category,
      content: content.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#DBE4EA] overflow-hidden text-[#1F3547] font-sans">
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between bg-[#F7F9FB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2D7F9F] text-white">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F3547]">Publish Official Announcement</h3>
              <p className="text-xs text-[#61728A]">Post broadcasts to student, teacher, and staff dashboards.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePublish} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Grade 12 DP Chemistry IA Practical Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-bold text-[#1F3547]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">Target Audience *</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-medium"
              >
                <option value="Entire School">Entire School</option>
                <option value="Grade 12">Grade 12 Only</option>
                <option value="Grade 11">Grade 11 Only</option>
                <option value="All DP Students">All DP Students (11 & 12)</option>
                <option value="Faculty & Staff">Faculty & Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F3547] mb-1">Priority / Urgency *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl font-medium"
              >
                <option value="Normal">Normal Notice</option>
                <option value="Important">Important (Badge highlighted)</option>
                <option value="Urgent">Urgent (Red Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl"
            >
              <option value="Assembly">Assembly & Briefing</option>
              <option value="Academic">Academic Schedule & Exams</option>
              <option value="Laboratory">Laboratory & Science</option>
              <option value="Facility">Facility & Campus Schedule</option>
              <option value="General Notice">General Notice</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F3547] mb-1">Announcement Body / Instructions *</label>
            <textarea
              rows={4}
              required
              placeholder="Write the full instructions, venue, timing, and requirements for the students..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-[#DBE4EA] flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-1.5">
              <Send size={15} /> Publish Announcement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemDetailModal({
  item,
  onClose,
  onStatusChange,
  canManage
}: {
  item: Item;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  canManage: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#DBE4EA] overflow-hidden text-[#1F3547] font-sans">
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between bg-[#F7F9FB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2D7F9F] text-white">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#61728A]">{item.module}</span>
              <h3 className="text-base font-bold text-[#1F3547]">{item.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F7F9FB] rounded-2xl border border-[#DBE4EA]">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#61728A]">Tracking ID</p>
              <p className="font-mono font-bold text-[#1F3547]">{item.id}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#61728A]">Status</p>
              <span className={`service-status ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                {item.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#61728A]">Applicant</p>
              <p className="font-semibold text-[#1F3547]">{item.student}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#61728A]">Date Filed</p>
              <p className="font-semibold text-[#1F3547]">{item.date}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#1F3547] mb-1 uppercase tracking-wider text-[11px]">Request Details</h4>
            <p className="p-3 bg-[#F7F9FB] rounded-xl border border-[#DBE4EA] text-[#4C6073] leading-relaxed">
              {item.detail}
            </p>
          </div>

          {canManage && (
            <div className="p-3.5 bg-[#F7F9FB] rounded-2xl border border-[#DBE4EA] space-y-2">
              <p className="font-bold text-[#1F3547]">Administrative Actions</p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => onStatusChange('Approved')}>
                  Approve Request
                </Button>
                <Button size="sm" variant="outline" onClick={() => onStatusChange('Rejected')}>
                  Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onStatusChange('Under Review')}>
                  Mark In Review
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#DBE4EA] bg-[#F7F9FB] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function PolicyDocumentModal({
  policyKey,
  onClose
}: {
  policyKey: string;
  onClose: () => void;
}) {
  const [signed, setSigned] = useState(false);

  const policyData: Record<string, { title: string; version: string; clauses: { head: string; text: string }[] }> = {
    Library: {
      title: 'Library Borrowing & Resource Guidelines',
      version: 'Version 2.4 · Effective Aug 2026',
      clauses: [
        { head: '1. Borrowing Allocation', text: 'Grade 11 & 12 students are entitled to simultaneously borrow up to 4 academic textbooks and 2 fiction titles for a duration of 14 calendar days.' },
        { head: '2. Renewals & Extensions', text: 'Books with no active reserve queues can be renewed online up to 2 times via the SchoolOS Library Portal.' },
        { head: '3. Digital JSTOR & Oxford Passwords', text: 'Credentials for subscribed scientific journals are for personal academic research only and must not be shared externally.' },
        { head: '4. Damage & Loss Policy', text: 'Torn pages, binding breaks, or liquid spills must be reported immediately. Replacement costs will be assessed according to catalog list price.' }
      ]
    },
    Laboratory: {
      title: 'Science Laboratory Safety & PPE Regulations',
      version: 'Version 3.1 · Chemistry & Physics Depts (Sadahana)',
      clauses: [
        { head: '1. Personal Protective Equipment (PPE)', text: 'Nitrile safety gloves, splash goggles, and buttoned lab coats must be worn at all times when handling corrosive acids or volatile organic compounds.' },
        { head: '2. Reagent Requisitions', text: 'All practical chemicals must be requested through the SchoolOS Requisition Cart at least 24 hours prior to practical sessions.' },
        { head: '3. Fume Hood & Ventilation', text: 'Reactions generating nitrogen dioxide, sulfur dioxide, or bromine fumes must be carried out exclusively under working fume hoods.' },
        { head: '4. Disposal Protocols', text: 'Broken optical glassware must go into the red puncture-proof bin. Heavy metal residues must be deposited in designated neutralization waste bottles.' }
      ]
    },
    Conduct: {
      title: 'Student Honor Code & Academic Integrity Charter',
      version: 'Head of School Office · 2026–2027',
      clauses: [
        { head: '1. Authenticity of Work', text: 'All submitted internal assessments, Extended Essays, and lab reports must represent the student’s independent work and original analytical inquiry.' },
        { head: '2. Responsible AI Use', text: 'Generative AI tools may be used for brainstorming and literature discovery, provided all prompts and syntheses are explicitly cited in footnotes.' },
        { head: '3. Restorative Pathways', text: 'Minor infractions receive formative guidance and resubmission opportunities under academic mentorship.' }
      ]
    },
    Transport: {
      title: 'School Transport & Commute Safety Rules',
      version: 'Transport Desk · GPS Operations',
      clauses: [
        { head: '1. Punctuality & Boarding', text: 'Students must arrive at their assigned pickup coordinates 5 minutes before scheduled bus arrival.' },
        { head: '2. Route Change Notice', text: 'Requests to drop off at an alternate stop or friend’s house must be submitted by parents before 12:00 PM on the day of travel.' },
        { head: '3. In-Transit Safety', text: 'Seatbelts must remain buckled. Moving between seats while the vehicle is in transit is strictly prohibited.' }
      ]
    }
  };

  const active = policyData[policyKey] || policyData.Library;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DBE4EA] text-[#1F3547] font-sans flex flex-col">
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between bg-[#F7F9FB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2D7F9F] text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#61728A]">{active.version}</span>
              <h3 className="text-base font-bold text-[#1F3547]">{active.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 text-xs">
          {active.clauses.map((clause, idx) => (
            <div key={idx} className="p-4 bg-[#F7F9FB] rounded-2xl border border-[#DBE4EA] space-y-1">
              <h4 className="font-bold text-[#1F3547] text-xs">{clause.head}</h4>
              <p className="text-[#4C6073] leading-relaxed">{clause.text}</p>
            </div>
          ))}

          {signed ? (
            <div className="p-3 bg-[#EEF6F0] border border-[#28735A]/30 rounded-2xl text-[#28735A] font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Policy formally read and acknowledged by student on {new Date().toLocaleDateString()}.</span>
            </div>
          ) : (
            <Button
              className="w-full py-3 flex items-center justify-center gap-2"
              onClick={() => {
                setSigned(true);
                try {
                  confetti({ particleCount: 30, spread: 40 });
                } catch (_) {}
              }}
            >
              <Check size={16} />
              <span>Acknowledge & Accept Policy Terms</span>
            </Button>
          )}
        </div>

        <div className="p-4 border-t border-[#DBE4EA] bg-[#F7F9FB] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Policy Reader
          </Button>
        </div>
      </div>
    </div>
  );
}

function ServiceDeskModal({
  service,
  studentName,
  onClose,
  onSubmitInquiry
}: {
  service: { title: string; status: string; hours: string; lead: string; desc: string };
  studentName: string;
  onClose: () => void;
  onSubmitInquiry: (inquiry: { subject: string; message: string; priority: string }) => void;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    onSubmitInquiry({ subject, message, priority });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#253B53]/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DBE4EA] text-[#1F3547] font-sans flex flex-col">
        <div className="p-6 border-b border-[#DBE4EA] flex items-center justify-between bg-[#F7F9FB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2D7F9F] text-white">
              <Building2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D7F9F]">{service.status}</span>
              <h3 className="text-base font-bold text-[#1F3547]">{service.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#61728A] hover:text-[#1F3547] rounded-xl hover:bg-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 text-xs">
          <div className="p-4 bg-[#F7F9FB] rounded-2xl border border-[#DBE4EA] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#61728A]">Operational Timings:</span>
              <strong className="text-[#1F3547]">{service.hours}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#61728A]">Desk Supervisor / Lead:</span>
              <strong className="text-[#1F3547]">{service.lead}</strong>
            </div>
            <p className="text-[#4C6073] pt-1 border-t border-[#DBE4EA]">{service.desc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <h4 className="font-bold text-[#1F3547] text-xs">Submit Inquiry / Request to this Desk</h4>

            <div>
              <label className="block text-[11px] font-bold text-[#61728A] mb-1">Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Inquire about spectrometer availability for tomorrow"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#61728A] mb-1">Detailed Message *</label>
              <textarea
                rows={3}
                required
                placeholder="Write your request or question for the desk supervisor..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F9FB] border border-[#DBE4EA] rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex items-center gap-1.5">
                <Send size={14} /> Send Message to Desk
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

