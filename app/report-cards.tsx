'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Download, FileText, Plus, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReportStatus = 'Draft' | 'Submitted' | 'Returned' | 'UnderReview' | 'Approved' | 'Published';
type CycleStatus = 'Draft' | 'Open' | 'TeacherSubmission' | 'Review' | 'Approved' | 'Published' | 'Archived';
type Report = { id: string; cycleId: string; studentId: string; studentName: string; className: string; subject: string; grade: string; comment: string; effort: string; status: ReportStatus; feedback?: string; updatedAt: string };
type Cycle = { id: string; name: string; term: string; year: string; start: string; end: string; deadline: string; publicationDate: string; status: CycleStatus; required: number };

const seedCycles: Cycle[] = [
  { id: 'cycle-term1-2026', name: 'Term 1 Progress Reports', term: 'Term 1', year: '2026–27', start: '2026-08-01', end: '2026-10-16', deadline: '2026-10-20', publicationDate: '2026-10-30', status: 'TeacherSubmission', required: 312 },
  { id: 'cycle-term3-2025', name: 'Term 3 Final Reports', term: 'Term 3', year: '2025–26', start: '2026-04-01', end: '2026-06-20', deadline: '2026-06-24', publicationDate: '2026-06-30', status: 'Published', required: 286 },
];
const seedReports: Report[] = [
  { id: 'report-001', cycleId: 'cycle-term1-2026', studentId: 'student-1', studentName: 'Nithin Selvaraj', className: 'DP-2', subject: 'Physics HL', grade: '6', comment: 'Nithin applies strong analytical thinking during practical work.', effort: 'Excellent', status: 'Submitted', updatedAt: '2026-09-08T09:15:00Z' },
  { id: 'report-002', cycleId: 'cycle-term1-2026', studentId: 'student-1', studentName: 'Nithin Selvaraj', className: 'DP-2', subject: 'Mathematics AA HL', grade: '6', comment: 'Consistent progress and thoughtful problem solving.', effort: 'Good', status: 'Draft', updatedAt: '2026-09-08T09:10:00Z' },
  { id: 'report-003', cycleId: 'cycle-term1-2026', studentId: 'student-2', studentName: 'Amelia Singh', className: 'DP-2', subject: 'Physics HL', grade: '7', comment: 'Excellent preparation and independent investigation skills.', effort: 'Excellent', status: 'UnderReview', updatedAt: '2026-09-07T13:20:00Z' },
  { id: 'report-004', cycleId: 'cycle-term3-2025', studentId: 'student-1', studentName: 'Nithin Selvaraj', className: 'DP-2', subject: 'Physics HL', grade: '6', comment: 'A positive contributor to lessons and practical projects.', effort: 'Good', status: 'Published', updatedAt: '2026-06-30T08:00:00Z' },
];

function Status({ value }: { value: string }) { return <span className={`status-pill status-${value.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{value}</span>; }
function Stat({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) { return <button className="report-stat" onClick={onClick}><strong>{value}</strong><span>{label}</span></button>; }

export function ReportCards({ ws, role, navigate }: { ws: any; role: string; navigate?: (page: string) => void }) {
  const isStudent = role === 'Student';
  const isTeacher = role === 'Teacher';
  const [tab, setTab] = useState(isStudent ? 'Published reports' : isTeacher ? 'My reports' : 'Report cycles');
  const [cycles, setCycles] = useState(seedCycles);
  const [reports, setReports] = useState(seedReports);
  const [selected, setSelected] = useState<Report | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const member = ws?.member || {};
  const visibleReports = useMemo(() => reports.filter((r) => {
    if (isStudent && r.studentId !== member.studentId && r.studentId !== 'student-1') return false;
    if (isTeacher && !['Physics HL', 'Chemistry HL', 'Math AA HL', 'Mathematics AA HL'].includes(r.subject)) return false;
    return `${r.studentName} ${r.subject} ${r.className} ${r.status}`.toLowerCase().includes(query.toLowerCase());
  }), [reports, query, isStudent, isTeacher, member.studentId]);
  const activeCycle = cycles.find((c) => c.status !== 'Published' && c.status !== 'Archived') || cycles[0];
  const cycleReports = reports.filter((r) => r.cycleId === activeCycle.id);
  const submitted = cycleReports.filter((r) => ['Submitted', 'UnderReview', 'Approved', 'Published'].includes(r.status)).length;
  const updateReport = (changes: Partial<Report>) => {
    if (!selected) return;
    setReports((all) => all.map((r) => r.id === selected.id ? { ...r, ...changes, updatedAt: new Date().toISOString() } : r));
    setSelected((r) => r ? { ...r, ...changes } : r);
    setMessage('Report saved successfully');
  };
  const createCycle = () => {
    const cycle: Cycle = { id: `cycle-${Date.now()}`, name: 'New reporting cycle', term: 'Term 2', year: '2026–27', start: '2026-11-01', end: '2027-01-31', deadline: '2027-02-05', publicationDate: '2027-02-12', status: 'Draft', required: 0 };
    setCycles((all) => [cycle, ...all]); setTab('Report cycles'); setMessage('Draft cycle created');
  };
  const downloadReport = (r: Report) => {
    const body = `SchoolOS Report Card\n${r.studentName} · ${r.className}\n${r.subject} · Grade ${r.grade}\n\n${r.comment}`;
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([body], { type: 'text/plain' })); link.download = `${r.studentName}-${r.subject}-report.txt`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <section className="report-cards-page">
    <div className="page-heading"><div><div className="eyebrow">ACADEMIC REPORTING</div><h1>Report Cards</h1><p>{isStudent ? 'Your published academic reports.' : isTeacher ? 'Complete and submit reports for your assigned students.' : 'Create cycles, monitor completion and publish official reports.'}</p></div>{!isStudent && <Button onClick={createCycle}><Plus size={16} /> Create cycle</Button>}</div>
    {message && <p className="student-success" role="status">{message}</p>}
    {!isStudent && <div className="report-stats"><Stat label="Overall completion" value={`${submitted}/${activeCycle.required || 312}`} onClick={() => setTab('Completion')} /><Stat label="Teachers not submitted" value="4" onClick={() => setTab('Completion')} /><Stat label="Awaiting review" value={cycleReports.filter((r) => r.status === 'UnderReview').length} onClick={() => setTab('Review')} /><Stat label="Ready to publish" value="18" /></div>}
    <Tabs value={tab} onValueChange={setTab}><TabsList>{(isStudent ? ['Published reports'] : isTeacher ? ['My reports', 'Status'] : ['Report cycles', 'Completion', 'Review', 'Published reports', 'Templates']).map((x) => <TabsTrigger key={x} value={x}>{x}</TabsTrigger>)}</TabsList></Tabs>
    {tab === 'Report cycles' && <div className="panel report-panel"><div className="report-toolbar"><h2>Reporting cycles</h2><Input placeholder="Search cycles…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="report-list">{cycles.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).map((c) => <button className="report-row" key={c.id} onClick={() => { setTab(c.status === 'Published' ? 'Published reports' : 'Completion'); }}><span><strong>{c.name}</strong><small>{c.year} · {c.term} · Deadline {c.deadline}</small></span><Status value={c.status} /><span className="report-arrow">View →</span></button>)}</div></div>}
    {tab === 'Completion' && <div className="panel report-panel"><h2>Completion · {activeCycle.name}</h2><p className="muted">Click a line to review the underlying reports.</p><div className="completion-grid"><div><strong>Overall</strong><b>{submitted}/{activeCycle.required || 312}</b><div className="progress-track"><i style={{ width: `${Math.min(100, submitted / (activeCycle.required || 312) * 100)}%` }} /></div></div>{['Physics HL', 'Chemistry HL', 'Mathematics AA HL'].map((subject, i) => <button className="completion-line" key={subject} onClick={() => { setQuery(subject); setTab('Review'); }}><span>{subject}</span><b>{[18, 23, 20][i]}/{[20, 24, 20][i]}</b></button>)}</div><div className="report-callouts"><span>Teachers not submitted: <b>4</b></span><span>Students incomplete: <b>26</b></span><span>Returned for changes: <b>3</b></span></div></div>}
    {(tab === 'Review' || tab === 'Published reports' || tab === 'My reports') && <div className="panel report-panel"><div className="report-toolbar"><div><h2>{tab}</h2><p className="muted">{tab === 'Review' ? 'Review submitted entries before approval.' : 'Select a report to view details.'}</p></div><Input placeholder="Search student, class or subject…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="report-list">{visibleReports.filter((r) => tab !== 'Published reports' || r.status === 'Published').map((r) => <button className="report-row" key={r.id} onClick={() => setSelected(r)}><span><strong>{r.studentName} · {r.subject}</strong><small>{r.className} · Updated {new Date(r.updatedAt).toLocaleDateString()}</small></span><Status value={r.status} /><span className="report-arrow">Open →</span></button>)}{!visibleReports.length && <p className="empty-state">No reports match your search.</p>}</div></div>}
    {tab === 'Status' && <div className="panel report-panel"><h2>Submission status</h2><div className="report-callouts"><span>Draft: <b>{visibleReports.filter((r) => r.status === 'Draft').length}</b></span><span>Submitted: <b>{visibleReports.filter((r) => r.status === 'Submitted').length}</b></span><span>Returned: <b>{visibleReports.filter((r) => r.status === 'Returned').length}</b></span></div></div>}
    {tab === 'Templates' && <div className="panel report-panel"><h2>Report templates</h2><p className="muted">Configure the presentation of published reports without changing report data.</p><div className="template-card"><FileText size={24} /><div><strong>Westbridge International · Standard report</strong><small>Student details · subject table · attendance · signatures · grading legend</small></div><Button variant="outline">Edit template</Button></div></div>}
    {selected && <div className="report-detail panel"><div className="report-detail-head"><div><div className="eyebrow">{selected.subject}</div><h2>{selected.studentName}</h2><p>{selected.className} · {activeCycle.name}</p></div><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button></div><div className="report-detail-grid"><label className="field"><span>Subject grade</span><Select value={selected.grade} onValueChange={(v) => updateReport({ grade: v || '' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['7', '6', '5', '4', '3'].map((v) => <SelectItem value={v} key={v}>{v}</SelectItem>)}</SelectContent></Select></label><label className="field"><span>Effort</span><Select value={selected.effort} onValueChange={(v) => updateReport({ effort: v || '' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Excellent', 'Good', 'Developing', 'Needs support'].map((v) => <SelectItem value={v} key={v}>{v}</SelectItem>)}</SelectContent></Select></label></div><label className="field"><span>Teacher comment</span><Textarea value={selected.comment} onChange={(e) => updateReport({ comment: e.target.value })} /></label>{selected.feedback && <p className="review-feedback"><RotateCcw size={16} /> Reviewer feedback: {selected.feedback}</p>}<div className="report-actions"><Status value={selected.status} />{isStudent ? <Button onClick={() => downloadReport(selected)}><Download size={16} /> Download report</Button> : isTeacher ? <><Button variant="outline" onClick={() => updateReport({ status: 'Draft' })}>Save draft</Button><Button onClick={() => updateReport({ status: 'Submitted' })}><Send size={16} /> Submit</Button></> : <><Button variant="outline" onClick={() => updateReport({ status: 'Returned', feedback: 'Please add a specific improvement target.' })}>Return for changes</Button><Button onClick={() => updateReport({ status: 'Approved' })}><CheckCircle2 size={16} /> Approve</Button><Button onClick={() => updateReport({ status: 'Published' })}><ClipboardList size={16} /> Publish</Button></>}</div></div>}
  </section>;
}
