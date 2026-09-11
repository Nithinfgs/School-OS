'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, Inbox, Plus, Search, Users, X } from 'lucide-react';

type HOSProps = { ws: any; navigate: (page: string) => void; page?: string; mode?: 'hos' | 'admin' };

const TODAY = new Date().toISOString().slice(0, 10);
const inDays = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
const seedEvents = [
  { id: 'hos-event-1', title: 'Leadership team meeting', date: TODAY, startTime: '09:00', endTime: '10:00', location: 'Leadership office', category: 'Leadership meeting', priority: 'High', visibility: 'Private' },
  { id: 'hos-event-2', title: 'Parent council appointments', date: TODAY, startTime: '14:00', endTime: '16:00', location: 'Meeting room 2', category: 'Parent meeting', priority: 'Normal', visibility: 'Shared' },
  { id: 'hos-event-3', title: 'Term 1 academic review', date: inDays(2), startTime: '11:00', endTime: '12:00', location: 'Boardroom', category: 'Deadline', priority: 'High', visibility: 'Shared' },
];
const seedInquiries = [
  { id: 'inq-1', senderName: 'Priya Mehta', senderType: 'Parent', relatedStudent: 'Aarav Mehta', category: 'Academics', subject: 'Subject selection meeting', message: 'Could we arrange a short meeting to discuss next year’s subject choices?', dateCreated: '2026-09-07T08:32:00', priority: 'High', status: 'AwaitingResponse', assignedTo: 'Dr. Aisha Rahman', replies: [] as any[], notes: [] as any[] },
  { id: 'inq-2', senderName: 'Nithin Selvaraj', senderType: 'Student', relatedStudent: 'Nithin Selvaraj', category: 'Facilities', subject: 'Study space request', message: 'The quiet study room has been unavailable after school this week.', dateCreated: '2026-09-06T15:10:00', priority: 'Normal', status: 'Open', assignedTo: '', replies: [] as any[], notes: [] as any[] },
  { id: 'inq-3', senderName: 'Rohan Iyer', senderType: 'Parent', relatedStudent: 'Mira Iyer', category: 'Transport', subject: 'Bus route question', message: 'Please confirm the revised pickup time for route 4.', dateCreated: '2026-09-05T10:20:00', priority: 'Normal', status: 'Resolved', assignedTo: 'Transport Staff', replies: [{ body: 'Transport has confirmed the new pickup time.', at: '2026-09-05T12:00:00', by: 'Transport Staff' }], notes: [] as any[] },
];

async function postAction(action: string, data: any) {
  const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, data }) });
  const body: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Could not save this change.');
  return body.data || body;
}

export function HOSDashboard({ ws, navigate, page, mode = 'hos' }: HOSProps) {
  const [tab, setTab] = useState<'Home' | 'Calendar' | 'Inquiries'>(page === 'Calendar' || page === 'Daily Calendar' ? 'Calendar' : page === 'Inquiries' ? 'Inquiries' : 'Home');
  useEffect(() => { if (page === 'Calendar' || page === 'Daily Calendar') setTab('Calendar'); else if (page === 'Inquiries' || page === 'Home') setTab(page); }, [page]);
  const [events, setEvents] = useState(seedEvents);
  const [inquiries, setInquiries] = useState(seedInquiries);
  useEffect(() => {
    const persistedEvents = (ws.rows || []).filter((row: any) => row.kind === 'calendarEvent' && row.data.status !== 'Deleted').map((row: any) => ({
      id: row.id, title: row.name, date: row.data.date || row.data.dateTime?.slice(0, 10) || '', startTime: row.data.startTime || '', endTime: row.data.endTime || '', location: row.data.location || '', category: row.data.category || 'Other', priority: row.data.priority || 'Normal', visibility: row.data.visibility || 'Private',
    })).filter((event: any) => event.date);
    if (persistedEvents.length) setEvents(persistedEvents);
  }, [ws.rows]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [calendarView, setCalendarView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [eventDraft, setEventDraft] = useState({ title: '', date: TODAY, startTime: '10:00', endTime: '11:00', location: '', category: 'Other', priority: 'Normal', visibility: 'Private' });
  const openTab = (next: 'Home' | 'Calendar' | 'Inquiries') => { setTab(next); navigate(next); };

  const todayEvents = events.filter((e) => e.date === TODAY).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const visibleCalendarEvents = useMemo(() => {
    const reference = new Date(`${TODAY}T00:00:00`);
    const eventDate = (value: string) => new Date(`${value}T00:00:00`);
    let filtered = events;
    if (calendarView === 'Day') {
      filtered = events.filter((event) => event.date === TODAY);
    } else if (calendarView === 'Week') {
      const start = new Date(reference);
      const day = start.getDay();
      start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      filtered = events.filter((event) => {
        const date = eventDate(event.date);
        return date >= start && date <= end;
      });
    } else {
      filtered = events.filter((event) => event.date.slice(0, 7) === TODAY.slice(0, 7));
    }
    return [...filtered].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }, [events, calendarView]);
  const filteredInquiries = useMemo(() => inquiries.filter((i) => (status === 'All' || i.status === status) && `${i.subject} ${i.senderName} ${i.category} ${i.relatedStudent}`.toLowerCase().includes(query.toLowerCase())), [inquiries, query, status]);
  const updateInquiry = async (changes: any) => {
    if (!selectedInquiry) return;
    try {
      const updated = await postAction('inquiryUpdate', { id: selectedInquiry.id, ...changes });
      setSelectedInquiry((current: any) => current ? { ...current, ...updated } : current);
      setInquiries((rows) => rows.map((row) => row.id === selectedInquiry.id ? { ...row, ...updated } : row));
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not save inquiry.'); }
  };
  const addEvent = async () => {
    if (!eventDraft.title.trim()) { setSaveError('An event title is required.'); return; }
    setSaveError('');
    try {
      const saved = await postAction('calendarEvent', editingEvent ? { ...eventDraft, id: editingEvent } : eventDraft);
      const event = { ...eventDraft, ...saved, id: saved.id };
      setEvents((rows) => editingEvent ? rows.map((row) => row.id === editingEvent ? event : row) : [...rows, event]);
      setShowEventForm(false); setEditingEvent(null); setEventDraft({ ...eventDraft, title: '', location: '' });
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not save event.'); }
  };
  const editEvent = (event: any) => { setSaveError(''); setEventDraft({ title: event.title, date: event.date, startTime: event.startTime, endTime: event.endTime, location: event.location || '', category: event.category, priority: event.priority, visibility: event.visibility }); setEditingEvent(event.id); setShowEventForm(true); };
  const deleteEvent = async (id: string) => { try { await postAction('calendarEvent', { id, status: 'Deleted', title: 'Deleted event', date: TODAY, startTime: '00:00', endTime: '00:01' }); setEvents((rows) => rows.filter((row) => row.id !== id)); } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not delete event.'); } };

  return <div className="hos-dashboard">
    <div className="hos-header">
      <div><div className="eyebrow">{mode === 'admin' ? 'ADMINISTRATION' : 'HEAD OF SCHOOL'}</div><h1>{tab === 'Home' ? (mode === 'admin' ? 'School operations overview' : 'Good morning, Dr. Rahman') : tab}</h1><p>{mode === 'admin' ? 'Central inquiry management and school-wide follow-up.' : 'School-wide oversight, leadership planning and follow-up.'}</p></div>
      <div className="hos-header-actions"><button className="secondary-button" onClick={() => navigate('Teacher Inquiry')}><Users size={16} /> Teacher Inquiry</button><button className="secondary-button" onClick={() => navigate('Student Search')}><Search size={16} /> Student Search</button><button className="secondary-button" onClick={() => openTab('Calendar')}><CalendarDays size={16} /> Calendar</button><button className="primary-button" onClick={() => openTab('Inquiries')}><Inbox size={16} /> Inquiry inbox</button></div>
    </div>
    <div className="hos-tabs" role="tablist">{(['Home', 'Calendar', 'Inquiries'] as const).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => openTab(item)}>{item}</button>)}</div>

    {tab === 'Home' && <>
      <div className="hos-kpis">
        <button onClick={() => openTab('Inquiries')}><span>New inquiries</span><b>{inquiries.filter((i) => i.status === 'Open' || i.status === 'New').length}</b><small>Open inbox →</small></button>
        <button onClick={() => openTab('Inquiries')}><span>Awaiting reply</span><b>{inquiries.filter((i) => i.status === 'AwaitingResponse').length}</b><small>Needs response →</small></button>
        <button onClick={() => openTab('Calendar')}><span>Today’s meetings</span><b>{todayEvents.length}</b><small>View schedule →</small></button>
        <button onClick={() => navigate('Notifications')}><span>School alerts</span><b>3</b><small>Review alerts →</small></button>
      </div>
      <div className="hos-home-grid">
        <section className="hos-panel"><div className="hos-panel-heading"><h2>Today’s schedule</h2><button onClick={() => openTab('Calendar')}>View calendar <ChevronRight size={15} /></button></div>{todayEvents.map((event) => <div className="hos-schedule-row" key={event.id}><strong>{event.startTime}</strong><div><b>{event.title}</b><small>{event.endTime} · {event.location} · {event.category}</small></div></div>)}</section>
        <section className="hos-panel"><div className="hos-panel-heading"><h2>Important follow-ups</h2><button onClick={() => openTab('Inquiries')}>Open inbox <ChevronRight size={15} /></button></div>{inquiries.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').map((inquiry) => <button className="hos-inquiry-row" key={inquiry.id} onClick={() => { setSelectedInquiry(inquiry); openTab('Inquiries'); }}><span className={`hos-priority ${inquiry.priority.toLowerCase()}`} /> <div><b>{inquiry.subject}</b><small>{inquiry.senderName} · {inquiry.category}</small></div><ChevronRight size={15} /></button>)}</section>
      </div>
      <div className="hos-schoolwide"><h2>Leadership overview</h2><p>Review the calendar, escalated inquiries and significant school alerts from the sections above.</p><div className="hos-leadership-cards"><button onClick={() => navigate('Labs')}><b>Laboratory</b><small>Important issues and health</small></button><button onClick={() => navigate('Library')}><b>Library</b><small>Usage and significant overdue items</small></button><button onClick={() => navigate('Transport')}><b>Transport</b><small>Late buses and school notices</small></button></div></div>
    </>}

    {saveError && <p className="student-error" role="alert">{saveError}</p>}
    {tab === 'Calendar' && <section className="hos-panel hos-calendar"><div className="hos-panel-heading"><div><h2>{mode === 'admin' ? 'School daily calendar' : 'Daily calendar'}</h2><p>{mode === 'admin' ? 'Add or update school meetings and timetable events for the HOS.' : 'View and manage your meetings and daily timetable. Private events stay visible only to you until shared.'}</p></div><button className="primary-button" onClick={() => { setEditingEvent(null); setShowEventForm(true); }}><Plus size={16} /> Add event</button></div><div className="hos-calendar-toolbar"><div>{(['Day', 'Week', 'Month'] as const).map((item) => <button key={item} className={calendarView === item ? 'active' : ''} onClick={() => setCalendarView(item)}>{item === 'Day' ? 'Daily' : item}</button>)}</div><span>{new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(`${TODAY}T12:00:00Z`))}</span></div>{showEventForm && <div className="hos-event-form"><input placeholder="Event title" value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} /><input type="date" value={eventDraft.date} onChange={(e) => setEventDraft({ ...eventDraft, date: e.target.value })} /><input type="time" value={eventDraft.startTime} onChange={(e) => setEventDraft({ ...eventDraft, startTime: e.target.value })} /><input type="time" value={eventDraft.endTime} onChange={(e) => setEventDraft({ ...eventDraft, endTime: e.target.value })} /><input placeholder="Location" value={eventDraft.location} onChange={(e) => setEventDraft({ ...eventDraft, location: e.target.value })} /><select value={eventDraft.category} onChange={(e) => setEventDraft({ ...eventDraft, category: e.target.value })}><option>Other</option><option>Leadership meeting</option><option>Parent meeting</option><option>Staff meeting</option><option>School event</option><option>Deadline</option></select><select value={eventDraft.visibility} onChange={(e) => setEventDraft({ ...eventDraft, visibility: e.target.value })}><option>Private</option><option>Shared</option></select><button className="primary-button" onClick={() => void addEvent()}>{editingEvent ? 'Update event' : 'Save event'}</button><button className="secondary-button" onClick={() => setShowEventForm(false)}>Cancel</button></div>}<div className="hos-event-list">{visibleCalendarEvents.length ? visibleCalendarEvents.map((event) => <div className="hos-event-card" key={event.id}><div className="hos-event-date"><b>{event.date.slice(8)}</b><small>{new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(`${event.date}T00:00:00`)).toUpperCase()}</small></div><div><b>{event.title}</b><p><Clock3 size={14} /> {event.startTime}–{event.endTime} · {event.location || 'No location'} · {event.category}</p></div><span className={event.visibility === 'Private' ? 'private-badge' : 'shared-badge'}>{event.visibility}</span><button className="hos-event-action" onClick={() => editEvent(event)}>Edit</button><button className="hos-event-action danger" onClick={() => void deleteEvent(event.id)}>Delete</button></div>) : <p className="muted" style={{ padding: '24px 22px' }}>No events scheduled for this {calendarView === 'Day' ? 'day' : calendarView.toLowerCase()}.</p>}</div></section>}

    {tab === 'Inquiries' && <section className="hos-inquiries"><div className="hos-inquiry-list hos-panel"><div className="hos-panel-heading"><div><h2>Inquiry inbox</h2><p>Parent and student conversations with private staff notes.</p></div><span>{filteredInquiries.length} shown</span></div><div className="hos-inquiry-filters"><label><Search size={15} /><input placeholder="Search inquiries" value={query} onChange={(e) => setQuery(e.target.value)} /></label><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>New</option><option>Open</option><option>AwaitingResponse</option><option>Resolved</option><option>Closed</option></select></div>{filteredInquiries.map((inquiry) => <button className={`hos-inquiry-item ${selectedInquiry?.id === inquiry.id ? 'selected' : ''}`} key={inquiry.id} onClick={() => setSelectedInquiry(inquiry)}><span className={`hos-priority ${inquiry.priority.toLowerCase()}`} /><div><b>{inquiry.subject}</b><small>{inquiry.senderName} · {inquiry.category} · {new Date(inquiry.dateCreated).toLocaleDateString()}</small></div><span className="hos-status">{inquiry.status}</span></button>)}</div>{selectedInquiry ? <div className="hos-inquiry-detail hos-panel"><div className="hos-panel-heading"><div><h2>{selectedInquiry.subject}</h2><p>{selectedInquiry.senderName} · {selectedInquiry.senderType} · {selectedInquiry.relatedStudent}</p></div><button aria-label="Close inquiry" onClick={() => setSelectedInquiry(null)}><X size={17} /></button></div><div className="hos-message original"><b>Original message</b><p>{selectedInquiry.message}</p><small>{new Date(selectedInquiry.dateCreated).toLocaleString()}</small></div>{selectedInquiry.replies.map((item: any, index: number) => <div className="hos-message" key={index}><b>{item.by}</b><p>{item.body}</p><small>{new Date(item.at).toLocaleString()}</small></div>)}<div className="hos-detail-actions"><select value={selectedInquiry.status} onChange={(e) => void updateInquiry({ status: e.target.value })}><option>New</option><option>Open</option><option>AwaitingResponse</option><option>AwaitingParentStudent</option><option>Resolved</option><option>Closed</option></select><select value={selectedInquiry.assignedTo || ''} onChange={(e) => void updateInquiry({ assignedTo: e.target.value })}><option value="">Unassigned</option><option>Dr. Aisha Rahman</option><option>Transport Staff</option><option>Library Assistant</option><option>Lab Assistant</option></select></div><div className="hos-compose"><textarea placeholder="Reply to parent or student" value={reply} onChange={(e) => setReply(e.target.value)} /><button className="primary-button" onClick={() => { if (!reply.trim()) return; void updateInquiry({ replies: [...selectedInquiry.replies, { body: reply, by: 'Dr. Aisha Rahman', at: new Date().toISOString() }], status: 'AwaitingParentStudent' }); setReply(''); }}>Reply</button></div><div className="hos-notes"><b>Internal notes</b>{selectedInquiry.notes.map((item: any, index: number) => <p key={index}>{item.body}</p>)}<div><input placeholder="Add a private staff note" value={note} onChange={(e) => setNote(e.target.value)} /><button onClick={() => { if (!note.trim()) return; void updateInquiry({ notes: [...selectedInquiry.notes, { body: note, by: 'Dr. Aisha Rahman', at: new Date().toISOString() }] }); setNote(''); }}>Add note</button></div></div></div> : <div className="hos-panel hos-empty-detail"><Inbox size={24} /><h3>Select an inquiry</h3><p>Choose a conversation to review, assign, reply or resolve it.</p></div>}</section>}
  </div>;
}
