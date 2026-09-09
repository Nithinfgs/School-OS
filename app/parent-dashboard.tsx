'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bus, CheckCircle2, Clock3, Utensils, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RequestType = 'Early Pickup' | 'Late Drop-Off' | 'Lunch Drop-Off' | 'Not Using Bus';
type RequestStatus = 'Submitted' | 'Acknowledged' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled' | 'Arrived' | 'Received' | 'Collected' | 'Resolved';
type ParentRequest = { id: string; type: RequestType; studentId: string; student: string; date: string; time?: string; status: RequestStatus; response: string; updatedAt: string; metadata?: Record<string, string> };

const seedChildren = [
  { id: 'student-1', name: 'Nithin Selvaraj', className: 'DP-2', bus: 'M4' },
  { id: 'student-2', name: 'Anika Selvaraj', className: 'Grade 10A', bus: 'M7' },
];

const initialRequests: ParentRequest[] = [
  { id: 'pr-1', type: 'Not Using Bus', studentId: 'student-1', student: 'Nithin Selvaraj', date: '2026-09-09', time: '15:20', status: 'Acknowledged', response: 'Transport desk has acknowledged this notice.', updatedAt: '2026-09-09 08:10' },
  { id: 'pr-2', type: 'Lunch Drop-Off', studentId: 'student-2', student: 'Anika Selvaraj', date: '2026-09-09', time: '12:30', status: 'Received', response: 'Reception received the lunch bag.', updatedAt: '2026-09-09 12:34' },
];

export function ParentDashboard({ ws }: { ws: any }) {
  const [requests, setRequests] = useState<ParentRequest[]>(initialRequests);
  const [children, setChildren] = useState(seedChildren);
  const [selectedChild, setSelectedChild] = useState(seedChildren[0].id);
  const [openType, setOpenType] = useState<RequestType | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ParentRequest | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '2026-09-09', time: '', reason: '', notes: '', direction: 'Both', itemType: 'Lunch', pickupPersonName: '', pickupPersonRelationship: '' });
  const child = children.find((item) => item.id === selectedChild) || children[0];
  const today = requests.filter((request) => request.date === form.date);
  const pending = useMemo(() => requests.filter((request) => ['Submitted', 'Acknowledged'].includes(request.status)).length, [requests]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cross-workflows', { credentials: 'same-origin' })
      .then(async (response) => response.ok ? response.json() : Promise.reject(await response.json()))
      .then((data:any) => {
        if (cancelled) return;
        const linkedChildren = (data.children || []).map((link: any) => ({
          id: link.student_id,
          name: link.students?.profiles?.display_name || link.students?.external_id || 'Student',
          className: link.students?.grade || 'Student',
          bus: '',
        }));
        if (linkedChildren.length) {
          setChildren(linkedChildren);
          setSelectedChild((current) => linkedChildren.some((item: typeof seedChildren[number]) => item.id === current) ? current : linkedChildren[0].id);
        }
        const persisted = (data.parentRequests || []).map((item: any) => ({
          id: item.id, type: item.request_type === 'EarlyPickup' ? 'Early Pickup' : item.request_type === 'LateDropOff' ? 'Late Drop-Off' : 'Lunch Drop-Off',
          studentId: item.student_id, student: linkedChildren.find((c: any) => c.id === item.student_id)?.name || 'Student', date: item.request_date,
          time: item.requested_time || item.expected_time || undefined, status: item.status, response: item.metadata?.operationalNote || 'Submitted to the school team for review.', updatedAt: item.updated_at || item.created_at,
        } as ParentRequest));
        const notices = (data.transportNotices || []).map((item: any) => ({
          id: item.id, type: 'Not Using Bus', studentId: item.student_id, student: linkedChildren.find((c: any) => c.id === item.student_id)?.name || 'Student', date: item.notice_date,
          time: undefined, status: item.status, response: item.operational_note || 'Submitted to the Transport team.', updatedAt: item.submitted_at,
        } as ParentRequest));
        persisted.push(...notices);
        if (persisted.length) setRequests(persisted);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  async function submit() {
    if (!openType || !selectedChild) return;
    if ((openType === 'Early Pickup' || openType === 'Late Drop-Off') && !form.time) { setMessage('Please choose a time.'); return; }
    const now = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const request: ParentRequest = {
      id: `parent-request-${Date.now()}`,
      type: openType,
      studentId: child.id,
      student: child.name,
      date: form.date,
      time: form.time || undefined,
      status: 'Submitted',
      response: 'Submitted to the school team for review.',
      updatedAt: now,
      metadata: { reason: form.reason, notes: form.notes, direction: form.direction, itemType: form.itemType, pickupPersonName: form.pickupPersonName, pickupPersonRelationship: form.pickupPersonRelationship },
    };
    setSaving(true);
    try {
      const apiType = openType === 'Early Pickup' ? 'EarlyPickup' : openType === 'Late Drop-Off' ? 'LateDropOff' : openType === 'Lunch Drop-Off' ? 'LunchDropOff' : 'NotUsingBus';
      const response = await fetch('/api/cross-workflows', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'parentRequest.create', data: { studentId: child.id, type: apiType, date: form.date, requestedTime: openType === 'Early Pickup' ? form.time : undefined, expectedTime: openType === 'Late Drop-Off' ? form.time : undefined, reason: form.reason, notes: form.notes, direction: form.direction, itemType: form.itemType, pickupPersonName: form.pickupPersonName, pickupPersonRelationship: form.pickupPersonRelationship } }) });
      if (response.ok) {
        const saved:any = await response.json();
        request.id = saved.id || request.id;
        request.status = saved.status || request.status;
        request.response = saved.kind === 'transportNotice' ? 'Submitted to the Transport team.' : request.response;
      } else if (response.status !== 409 && response.status !== 401) {
        const problem:any = await response.json().catch(() => ({}));
        throw new Error(problem.error || 'The request could not be saved.');
      }
      setRequests((current) => [request, ...current]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The request could not be saved.');
      return;
    } finally { setSaving(false); }
    setOpenType(null);
    setForm((current) => ({ ...current, time: '', reason: '', notes: '', pickupPersonName: '', pickupPersonRelationship: '' }));
    setMessage(`${openType} request submitted for ${child.name}.`);
  }

  return <section className="parent-dashboard">
    <div className="page-heading"><div><div className="eyebrow">PARENT / GUARDIAN</div><h1>Family home</h1><p>Keep the school informed about today’s arrangements.</p></div><div className="parent-child-picker"><UserRound size={16}/><select value={selectedChild} onChange={(event) => setSelectedChild(event.target.value)} aria-label="Select child">{children.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.className}</option>)}</select></div></div>
    {message && <p className="student-success" role="status">{message}</p>}
    <section className="parent-quick panel"><div className="parent-section-heading"><div><h2>Quick Requests</h2><p>Requests are sent to the school team for acknowledgement.</p></div><span className="parent-pending"><Clock3 size={14}/> {pending} pending</span></div><div className="parent-request-actions">
      <button onClick={() => setOpenType('Early Pickup')}><Clock3/><b>Early Pickup</b><small>Request an early departure</small></button>
      <button onClick={() => setOpenType('Late Drop-Off')}><Clock3/><b>Late Drop-Off</b><small>Tell school your arrival time</small></button>
      <button onClick={() => setOpenType('Lunch Drop-Off')}><Utensils/><b>Lunch Drop-Off</b><small>Notify reception</small></button>
      <button onClick={() => setOpenType('Not Using Bus')}><Bus/><b>Not Using Bus</b><small>Send a transport notice</small></button>
    </div></section>
    <section className="parent-requests panel"><div className="parent-section-heading"><div><h2>My Requests</h2><p>Recent requests for your authorized children.</p></div><span>{today.length} today</span></div>{requests.map((request) => <button className="parent-request-row" key={request.id} onClick={() => setSelectedRequest(request)}><span className="parent-request-icon"><CheckCircle2 size={17}/></span><span><b>{request.type}</b><small>{request.student} · {request.date}{request.time ? ` · ${request.time}` : ''}</small></span><span className={`parent-status ${request.status.toLowerCase()}`}>{request.status}</span><small className="parent-request-updated">Updated {request.updatedAt}</small></button>)}<button className="parent-view-all" onClick={() => setMessage(`${requests.length} requests shown`)}>View All Requests →</button></section>
    {openType && <div className="parent-request-dialog" role="dialog" aria-modal="true"><div className="parent-request-modal"><div className="parent-section-heading"><div><div className="eyebrow">{openType.toUpperCase()}</div><h2>{openType}</h2><p>For {child.name} · {child.className}</p></div><Button variant="ghost" onClick={() => setOpenType(null)} aria-label="Close"><X size={17}/></Button></div><div className="parent-form-grid"><label><span>Child</span><select value={selectedChild} onChange={(event) => setSelectedChild(event.target.value)}>{children.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>Date</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })}/></label>{openType !== 'Lunch Drop-Off' && <label><span>{openType === 'Early Pickup' ? 'Pickup time' : 'Expected arrival'}</span><input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })}/></label>}{openType === 'Not Using Bus' && <label><span>Direction</span><select value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value })}><option>Morning</option><option>Afternoon</option><option>Both</option></select></label>}{openType === 'Lunch Drop-Off' && <label><span>Item type</span><select value={form.itemType} onChange={(event) => setForm({ ...form, itemType: event.target.value })}><option>Lunch</option><option>School Item</option><option>Other</option></select></label>}{openType === 'Early Pickup' && <><label><span>Pickup person</span><input value={form.pickupPersonName} onChange={(event) => setForm({ ...form, pickupPersonName: event.target.value })} placeholder="Optional"/></label><label><span>Relationship</span><input value={form.pickupPersonRelationship} onChange={(event) => setForm({ ...form, pickupPersonRelationship: event.target.value })} placeholder="Optional"/></label></>}</div><label className="parent-form-wide"><span>{openType === 'Not Using Bus' ? 'Reason' : 'Reason / notes'}</span><textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Add details for the school team"/></label><div className="parent-modal-actions"><Button variant="outline" onClick={() => setOpenType(null)}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? 'Submitting…' : 'Submit request'}</Button></div></div></div>}
    {selectedRequest && <div className="parent-request-dialog" role="dialog" aria-modal="true"><div className="parent-request-modal"><div className="parent-section-heading"><div><div className="eyebrow">REQUEST DETAIL</div><h2>{selectedRequest.type}</h2><p>{selectedRequest.student} · {selectedRequest.date}</p></div><Button variant="ghost" onClick={() => setSelectedRequest(null)} aria-label="Close"><X size={17}/></Button></div><div className="parent-request-detail"><b>Status</b><span className={`parent-status ${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span><b>School response</b><p>{selectedRequest.response}</p><b>Last updated</b><p>{selectedRequest.updatedAt}</p></div></div></div>}
  </section>;
}
