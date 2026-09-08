'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, UserRound, Users, CalendarDays, ArrowUpRight, ShieldCheck } from 'lucide-react';

type LookupKind = 'teacher' | 'student';
const teacherTabs = ['Overview', 'Classes', 'Teaching History', 'Class Logs', 'Attendance / Leave', 'Assignments', 'Grades / Feedback', 'Student Records', 'Resources', 'Labs', 'Projects / CAS', 'Transport', 'Inquiries', 'Activity History'];
const studentTabs = ['Overview', 'Academics', 'Attendance', 'Records', 'Reports / Damage', 'Library', 'Laboratory', 'Transport', 'CAS / Projects', 'Exams', 'House', 'Timeline'];
const blocked = /counsell?ing|medical|private.?message|restricted.?note|internal.?note/i;

function textOf(row: any) { return `${row?.name || ''} ${JSON.stringify(row?.data || {})}`; }
function dateOf(row: any) { return row?.updatedAt || row?.createdAt || row?.data?.dateTime || row?.data?.date || row?.data?.createdAt || ''; }
function modulesOf(row: any) { return `${row?.kind || ''} ${row?.data?.module || ''} ${row?.data?.type || ''} ${row?.data?.recordType || ''}`.toLowerCase(); }
function stripPrivate(data: any) { const result = { ...(data || {}) }; Object.keys(result).forEach((key) => { if (blocked.test(key)) delete result[key]; }); return result; }
function related(row: any, person: any, kind: LookupKind) {
  if (row?.id === person?.id) return true;
  const data = row?.data || {};
  const idKeys = kind === 'teacher' ? ['teacherId','staffId','createdBy','updatedBy','submittedBy','reportedBy','issuedBy','supervisorId','assigneeId'] : ['studentId','borrowerId','relatedStudentId','createdBy','updatedBy','reportedBy'];
  if (idKeys.some((key) => String(data[key] || row?.[key] || '') === String(person?.id))) return true;
  if (Object.values(data).some((value:any) => Array.isArray(value) && value.map(String).includes(String(person?.id)))) return true;
  const names = [person?.name, data.studentName, data.teacherName, data.reportedByName].filter(Boolean).map((v:string) => v.toLowerCase());
  return names.some((name:string) => textOf(row).toLowerCase().includes(name));
}
function category(row: any, kind: LookupKind) {
  const m = modulesOf(row);
  if (kind === 'teacher') {
    if (/classlog|lesson/.test(m)) return 'Class Logs'; if (/attendance|leave/.test(m)) return 'Attendance / Leave'; if (/assign/.test(m)) return 'Assignments'; if (/grade|submission|feedback/.test(m)) return 'Grades / Feedback'; if (/resource/.test(m)) return 'Resources'; if (/lab|inventory/.test(m)) return 'Labs'; if (/cas|project|ia|ee/.test(m)) return 'Projects / CAS'; if (/transport/.test(m)) return 'Transport'; if (/inquir/.test(m)) return 'Inquiries'; if (/record|behaviour|positive/.test(m)) return 'Student Records'; if (/class/.test(m)) return 'Classes'; return 'Teaching History';
  }
  if (/attendance|late/.test(m)) return 'Attendance'; if (/library|book|loan|borrow/.test(m)) return 'Library'; if (/lab|inventory/.test(m)) return 'Laboratory'; if (/transport/.test(m)) return 'Transport'; if (/cas|project|ia|ee/.test(m)) return 'CAS / Projects'; if (/exam/.test(m)) return 'Exams'; if (/house/.test(m)) return 'House'; if (/damage|behaviour|positive|incident|report/.test(m)) return 'Reports / Damage'; if (/assign|submission|grade|feedback|academic/.test(m)) return 'Academics'; return 'Records';
}

export function RecordLookup({ ws, kind, navigate }: { ws:any; kind:LookupKind; navigate:(page:string)=>void }) {
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<any>(null); const [tab, setTab] = useState('Overview'); const [module, setModule] = useState('All modules'); const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const rows = ws.masterRows || ws.rows || [];
  const people = useMemo(() => {
    const candidates = kind === 'teacher' ? rows.filter((row:any) => row.kind === 'staff' && /teacher/i.test(`${row.data?.role || ''} ${row.data?.title || ''}`)) : rows.filter((row:any) => row.kind === 'student');
    const source = candidates.length ? candidates : kind === 'teacher' ? (ws.members || []).filter((member:any) => /teacher/i.test(member.role || '')) : [];
    return source.filter((person:any) => textOf(person).toLowerCase().includes(query.toLowerCase())).slice(0, 30);
  }, [kind, query, rows, ws.members]);
  useEffect(() => {
    const saved = sessionStorage.getItem('schoolos-record-lookup');
    if (!saved) return;
    try { const target = JSON.parse(saved); if (target.kind === kind) { const match = people.find((person:any) => person.id === target.id); if (match) setSelected(match); } } catch {}
    sessionStorage.removeItem('schoolos-record-lookup');
  }, [kind, people]);
  const history = useMemo(() => !selected ? [] : rows.filter((row:any) => !blocked.test(textOf(row)) && related(row, selected, kind)).filter((row:any) => module === 'All modules' || modulesOf(row).includes(module.toLowerCase())).filter((row:any) => { const date = dateOf(row).slice(0,10); return (!from || date >= from) && (!to || date <= to); }).sort((a:any,b:any) => String(dateOf(b)).localeCompare(String(dateOf(a)))), [rows, selected, kind, module, from, to]);
  const tabs = kind === 'teacher' ? teacherTabs : studentTabs;
  const shown = tab === 'Overview' ? history : history.filter((row:any) => category(row, kind) === tab);
  const title = kind === 'teacher' ? 'Teacher Inquiry' : 'Student Search';
  const label = kind === 'teacher' ? 'teacher' : 'student';
  return <section className="record-lookup">
    <div className="page-heading"><div><div className="eyebrow">AUTHORIZED RECORD LOOKUP</div><h1>{title}</h1><p>Search the organization’s shared SchoolOS records and open a permitted, chronological profile.</p></div><span className="record-scope"><ShieldCheck size={16}/> Organization scoped</span></div>
    <div className="record-lookup-grid">
      <aside className="record-directory panel"><div className="record-directory-head"><h2>{kind === 'teacher' ? 'Teacher directory' : 'Student directory'}</h2><span>{people.length} shown</span></div><label className="record-search"><Search size={17}/><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={`Search by name, ID, email, ${kind === 'teacher' ? 'department or class' : 'class, grade, house or route'}`} /></label><div className="record-person-list">{people.map((person:any) => <button key={person.id} className={selected?.id === person.id ? 'active' : ''} onClick={()=>{setSelected(person);setTab('Overview')}}><span className="record-avatar">{(person.name || '?').split(' ').map((part:string)=>part[0]).join('').slice(0,2)}</span><span><b>{person.name}</b><small>{kind === 'teacher' ? `${person.data?.employeeId || person.data?.email || person.data?.department || 'Teacher'} · ${person.data?.subject || person.data?.classes || ''}` : `${person.data?.studentId || person.data?.admissionNumber || person.data?.email || 'Student'} · ${person.data?.class || person.data?.grade || ''}`}</small></span><ArrowUpRight size={15}/></button>)}{!people.length && <div className="record-empty">No matching {label}s in this organization.</div>}</div></aside>
      <div className="record-detail panel">{!selected ? <div className="record-empty-detail"><Users size={28}/><h2>Select a {label}</h2><p>Use the directory to view an authorized, unified SchoolOS record.</p></div> : <><div className="record-person-heading"><span className="record-avatar large">{selected.name?.split(' ').map((part:string)=>part[0]).join('').slice(0,2)}</span><div><h2>{selected.name}</h2><p>{kind === 'teacher' ? `${selected.data?.role || 'Teacher'} · ${selected.data?.department || selected.data?.subject || 'Westbridge International'}` : `${selected.data?.class || selected.data?.grade || 'Student'} · ${selected.data?.house || 'Westbridge International'}`}</p></div><button className="secondary-button" onClick={()=>navigate(kind === 'teacher' ? 'Academics' : 'Students')}>Open source directory</button></div><div className="record-filters"><select value={module} onChange={(e)=>setModule(e.target.value)}><option>All modules</option><option>Academics</option><option>Library</option><option>Lab</option><option>Transport</option><option>Attendance</option></select><label>From <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)}/></label><label>To <input type="date" value={to} onChange={(e)=>setTo(e.target.value)}/></label></div><div className="record-tabs">{tabs.map((item)=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>{tab==='Overview' && <div className="record-overview"><div><span>Profile</span><b>{kind === 'teacher' ? selected.data?.email || 'School employee' : selected.data?.email || 'Enrolled student'}</b></div><div><span>Linked records</span><b>{history.length}</b></div><div><span>Current status</span><b>{selected.data?.status || 'Active'}</b></div></div>}<div className="record-history">{shown.slice(0,60).map((row:any)=><article key={row.id}><span className="record-kind">{category(row,kind)}</span><div><h3>{row.name || row.data?.title || row.data?.subject || row.kind}</h3><p>{Object.entries(stripPrivate(row.data)).filter(([key,value])=>typeof value==='string' || typeof value==='number').slice(0,4).map(([key,value])=>`${key.replace(/([A-Z])/g,' $1')}: ${value}`).join(' · ') || 'Shared SchoolOS record'}</p><small><CalendarDays size={13}/>{dateOf(row) ? new Date(dateOf(row)).toLocaleString() : 'Date not recorded'} · {row.kind}</small></div><button className="record-drill" onClick={()=>window.alert(`Source record: ${row.name || row.id}`)}>View source</button></article>)}{!shown.length && <div className="record-empty">No permitted records match these filters.</div>}</div></>}</div>
    </div>
  </section>;
}
