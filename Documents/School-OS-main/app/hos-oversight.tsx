'use client';

import { AlertTriangle, BookOpen, Box, FlaskConical, TrendingUp } from 'lucide-react';

export function HOSLabSummary({ sharedRows = [] }: { sharedRows?: any[] }) {
  const inventory = sharedRows.filter((r) => r.kind === 'inventory');
  const damage = sharedRows.filter((r) => r.kind === 'damage' || r.data?.type === 'damage');
  return <div className="module-page">
    <div className="page-heading"><div><div className="eyebrow">HEAD OF SCHOOL · SCHOOL OVERSIGHT</div><h1>Laboratory Summary</h1><p>High-level laboratory health, significant issues and spending.</p></div></div>
    <div className="stats">
      {[['Active lab requests', sharedRows.filter((r) => r.kind === 'request').length, FlaskConical], ['Critical low-stock items', inventory.filter((r) => Number(r.data?.quantity ?? r.data?.stock ?? 99) < 3).length, AlertTriangle], ['Damaged equipment', damage.length, Box], ['Lab transactions this week', sharedRows.filter((r) => ['usage','issue','inventory'].includes(r.kind)).length, TrendingUp]].map(([label, value, Icon]: any) => <div className="stat" key={label}><div>{label}<Icon size={17} /></div><strong>{value}</strong><small>Leadership view</small></div>)}
    </div>
    <div className="bottom-grid">
      <section className="panel"><div className="section-heading"><h2>Laboratory health</h2></div><div className="attention-row"><span className="app-icon green"><FlaskConical size={19}/></span><span><b>Physics</b><small>Healthy operations</small></span><b className="status-pill">Healthy</b></div><div className="attention-row"><span className="app-icon orange"><FlaskConical size={19}/></span><span><b>Chemistry</b><small>{inventory.length ? 'Review stock levels' : 'No current issues'}</small></span><b className="status-pill">Monitor</b></div><div className="attention-row"><span className="app-icon purple"><FlaskConical size={19}/></span><span><b>Biology</b><small>{damage.length ? `${damage.length} damaged item${damage.length === 1 ? '' : 's'}` : 'No damage reported'}</small></span><b className="status-pill">{damage.length ? 'Review' : 'Healthy'}</b></div></section>
      <section className="panel"><div className="section-heading"><h2>Important issues</h2></div>{damage.slice(0, 4).map((r: any) => <div className="attention-row" key={r.id}><AlertTriangle size={18}/><span><b>{r.data?.name || r.data?.assetName || 'Equipment issue'}</b><small>{r.data?.description || 'Damage report requires review'}</small></span></div>)}{damage.length === 0 && <p className="muted">No significant laboratory issues.</p>}</section>
    </div>
  </div>;
}

export function HOSLibrarySummary({ sharedRows = [] }: { sharedRows?: any[] }) {
  const books = sharedRows.filter((r) => r.kind === 'book');
  const loans = sharedRows.filter((r) => r.kind === 'loan');
  const overdue = loans.filter((r) => ['Overdue','Late'].includes(r.data?.status));
  const damaged = sharedRows.filter((r) => r.kind === 'damage' && r.data?.module === 'Library');
  return <div className="module-page">
    <div className="page-heading"><div><div className="eyebrow">HEAD OF SCHOOL · SCHOOL OVERSIGHT</div><h1>Library Summary</h1><p>Condensed library health, usage and significant issues.</p></div></div>
    <div className="stats">{[['Books borrowed', loans.length, BookOpen], ['Significant overdue', overdue.length, AlertTriangle], ['Lost / damaged books', damaged.length, Box], ['Catalog titles', books.length, TrendingUp]].map(([label, value, Icon]: any) => <div className="stat" key={label}><div>{label}<Icon size={17}/></div><strong>{value}</strong><small>Leadership view</small></div>)}</div>
    <div className="bottom-grid"><section className="panel"><div className="section-heading"><h2>Important library issues</h2></div>{overdue.slice(0, 5).map((r: any) => <div className="attention-row" key={r.id}><AlertTriangle size={18}/><span><b>{r.data?.bookTitle || 'Overdue book'}</b><small>{r.data?.studentName || 'Student'} · follow-up required</small></span></div>)}{overdue.length === 0 && <p className="muted">No significant overdue issues.</p>}</section><section className="panel"><div className="section-heading"><h2>Library usage</h2></div><div className="attention-row"><BookOpen size={19}/><span><b>This period</b><small>{loans.length} recorded loans across the school</small></span></div><div className="attention-row"><TrendingUp size={19}/><span><b>Purchasing</b><small>Open purchase requests are reviewed by Administration</small></span></div></section></div>
  </div>;
}
