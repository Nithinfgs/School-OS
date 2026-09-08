'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, ClipboardList, Package, Search, ShoppingCart } from 'lucide-react';
import { LabProvider, useLab } from './src/context/LabContext';

type Member = { role?: string; name?: string; email?: string };

const demoOrders = [
  { id: 'order-chem-001', item: 'Borosilicate glass beakers 250 mL', lab: 'Chemistry', quantity: '48 pcs', supplier: 'Apex Scientific', status: 'Submitted', date: '2026-09-05' },
  { id: 'order-phys-002', item: 'Digital multimeters', lab: 'Physics', quantity: '12 pcs', supplier: 'OptiTech Education', status: 'Approved', date: '2026-09-03' },
  { id: 'order-bio-003', item: 'Prepared microscope slides', lab: 'Biology', quantity: '20 boxes', supplier: 'BioChem Central', status: 'PartiallyReceived', date: '2026-08-29' },
];

function AdminLabContent({ sharedRows }: { sharedRows: any[] }) {
  const { usageLogs, breakageLogs, items, currentUser, loginAsStaff } = useLab();
  const [tab, setTab] = useState<'materials' | 'log' | 'broken' | 'orders'>('materials');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'staff' && currentUser.email === 'admin.dev@schoolos.local') return;
    loginAsStaff('School Administrator', 'admin.dev@schoolos.local');
  }, [currentUser, loginAsStaff]);

  const filteredUsage = usageLogs.filter((log) => {
    const text = `${log.itemName} ${log.labType} ${log.experimentName} ${log.conductedBy}`.toLowerCase();
    return !query.trim() || text.includes(query.toLowerCase());
  });
  const filteredBreakage = breakageLogs.filter((log) => {
    const text = `${log.itemName} ${log.labType} ${log.status} ${log.reportedBy}`.toLowerCase();
    return !query.trim() || text.includes(query.toLowerCase());
  });
  const orders = useMemo(() => {
    const rows = sharedRows
      .filter((row) => ['labOrder', 'order'].includes(row.kind))
      .map((row) => {
        const data = row.data || {};
        return {
          id: row.id,
          item: data.item || data.itemName || row.name,
          lab: data.lab || data.labType || 'Science labs',
          quantity: `${data.qty || data.quantity || row.quantity || 0} ${data.unit || 'pcs'}`,
          supplier: data.supplier || 'School procurement',
          status: data.status || 'Submitted',
          date: data.date || data.requestedAt || row.updatedAt || '—',
        };
      });
    return rows.length ? rows : demoOrders;
  }, [sharedRows]);
  const groupedMaterials = useMemo(() => {
    const map = new Map<string, { name: string; lab: string; unit: string; quantity: number }>();
    filteredUsage.forEach((log) => {
      const key = `${log.itemId}-${log.labType}`;
      const previous = map.get(key);
      map.set(key, {
        name: log.itemName,
        lab: log.labType,
        unit: log.unit,
        quantity: (previous?.quantity || 0) + Number(log.quantityUsed || 0),
      });
    });
    return [...map.values()].sort((a, b) => b.quantity - a.quantity);
  }, [filteredUsage]);

  const tabs = [
    ['materials', 'Materials used', Package, groupedMaterials.length],
    ['log', 'Usage log', ClipboardList, filteredUsage.length],
    ['broken', 'Broken equipment', AlertOctagon, filteredBreakage.length],
    ['orders', 'Equipment orders', ShoppingCart, orders.length],
  ] as const;

  return (
    <div className="admin-lab-view">
      <div className="admin-lab-hero">
        <div>
          <div className="eyebrow">SCHOOL SERVICES · LABORATORY</div>
          <h1>Laboratory oversight</h1>
          <p>Review material usage, operational logs, equipment damage, and supply orders.</p>
        </div>
        <div className="admin-lab-summary">{items.length} tracked materials</div>
      </div>

      <div className="admin-lab-kpis">
        <div><span>Materials used</span><b>{groupedMaterials.length}</b><small>items with recorded usage</small></div>
        <div><span>Usage entries</span><b>{usageLogs.length}</b><small>practical activity records</small></div>
        <div><span>Broken equipment</span><b>{breakageLogs.length}</b><small>damage and repair records</small></div>
        <div><span>Orders</span><b>{orders.length}</b><small>equipment and supply orders</small></div>
      </div>

      <div className="admin-lab-toolbar">
        <div className="admin-lab-tabs">
          {tabs.map(([id, label, Icon, count]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              <Icon size={16} /> {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <label className="admin-lab-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search laboratory records…" /></label>
      </div>

      {tab === 'materials' && (
        <section className="admin-lab-panel"><h2>Materials used</h2><p>Aggregated quantities consumed across Chemistry, Physics, and Biology.</p>
          <div className="admin-lab-table"><div className="admin-lab-row head"><span>Material</span><span>Lab</span><span>Quantity used</span></div>
            {groupedMaterials.map((entry) => <div className="admin-lab-row" key={`${entry.name}-${entry.lab}`}><strong>{entry.name}</strong><span>{entry.lab}</span><b>{entry.quantity} {entry.unit}</b></div>)}
            {!groupedMaterials.length && <div className="admin-lab-empty">No material usage matches this search.</div>}
          </div>
        </section>
      )}
      {tab === 'log' && <section className="admin-lab-panel"><h2>Usage log</h2><p>Every recorded practical session and material transaction.</p><div className="admin-lab-table"><div className="admin-lab-row head"><span>Material / activity</span><span>Lab · user</span><span>Date · quantity</span></div>{filteredUsage.map((log) => <div className="admin-lab-row" key={log.id}><strong>{log.itemName}<small>{log.experimentName}</small></strong><span>{log.labType} · {log.conductedBy || '—'}</span><b>{log.quantityUsed} {log.unit}<small>{new Date(log.timestamp).toLocaleDateString()}</small></b></div>)}</div></section>}
      {tab === 'broken' && <section className="admin-lab-panel"><h2>Broken equipment</h2><p>Damage, repair, replacement, and write-off records.</p><div className="admin-lab-table"><div className="admin-lab-row head"><span>Equipment</span><span>Reported by</span><span>Status</span></div>{filteredBreakage.map((log) => <div className="admin-lab-row" key={log.id}><strong>{log.itemName}<small>{log.incidentDetails}</small></strong><span>{log.reportedBy} · {log.labType}</span><b className="danger">{log.status}<small>{log.quantityBroken} {log.unit}</small></b></div>)}</div></section>}
      {tab === 'orders' && <section className="admin-lab-panel"><h2>Equipment orders</h2><p>Supply orders submitted by the laboratory team.</p><div className="admin-lab-table"><div className="admin-lab-row head"><span>Item</span><span>Supplier · lab</span><span>Status · date</span></div>{orders.filter((order) => `${order.item} ${order.supplier} ${order.lab} ${order.status}`.toLowerCase().includes(query.toLowerCase())).map((order) => <div className="admin-lab-row" key={order.id}><strong>{order.item}<small>{order.quantity}</small></strong><span>{order.supplier} · {order.lab}</span><b>{order.status}<small>{order.date}</small></b></div>)}</div></section>}
    </div>
  );
}

export function AdminLabView({ member, sharedRows = [] }: { member: Member; sharedRows?: any[] }) {
  return <LabProvider sharedRows={sharedRows}><AdminLabContent sharedRows={sharedRows} /></LabProvider>;
}
