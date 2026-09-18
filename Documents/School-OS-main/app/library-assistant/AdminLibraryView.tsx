'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Eye, PackageCheck, Search, TriangleAlert } from 'lucide-react';
import { LibraryProvider, useLibrary } from './src/context/LibraryContext';

type Member = { role?: string; name?: string; email?: string };

function AdminLibraryContent({ sharedRows }: { sharedRows: any[] }) {
  const { books, loans, readingLogs, purchaseRequests, damageLogs, currentUser, loginAsStaff } = useLibrary();
  const [tab, setTab] = useState<'orders' | 'browsing' | 'overdue' | 'damage'>('orders');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'staff' && currentUser.email === 'admin.dev@schoolos.local') return;
    loginAsStaff('School Administrator', 'admin.dev@schoolos.local');
  }, [currentUser, loginAsStaff]);

  const matches = (value: string) => !query.trim() || value.toLowerCase().includes(query.toLowerCase());
  const overdue = loans.filter((loan) => loan.status !== 'returned' && new Date(loan.dueDate).getTime() < Date.now());
  const filteredOrders = purchaseRequests.filter((request) => matches(`${request.bookTitle} ${request.author} ${request.status} ${request.studentName}`));
  const filteredBrowsing = readingLogs.filter((log) => matches(`${log.bookTitle} ${log.studentName} ${log.studentEmail}`));
  const filteredOverdue = overdue.filter((loan) => matches(`${loan.bookTitle} ${loan.studentName} ${loan.studentEmail} ${loan.studentGrade}`));
  const filteredDamage = damageLogs.filter((log) => matches(`${log.bookTitle} ${log.condition} ${log.status} ${log.reportedBy}`));
  const sharedOrderCount = sharedRows.filter((row) => ['bookOrder', 'libraryOrder', 'order'].includes(row.kind)).length;

  const tabs = [
    ['orders', 'Books ordered', PackageCheck, filteredOrders.length + sharedOrderCount],
    ['browsing', 'Browsing log', Eye, filteredBrowsing.length],
    ['overdue', 'Not returned', BookOpen, filteredOverdue.length],
    ['damage', 'Damaged / destroyed', TriangleAlert, filteredDamage.length],
  ] as const;

  return <div className="admin-library-view">
    <div className="admin-library-hero"><div><div className="eyebrow">SCHOOL SERVICES · LIBRARY</div><h1>Library oversight</h1><p>Review book orders, browsing activity, unreturned loans, and damaged or destroyed books.</p></div><div className="admin-library-summary">{books.length} titles · {loans.filter((l) => l.status !== 'returned').length} on loan</div></div>
    <div className="admin-library-kpis"><div><span>Books ordered</span><b>{filteredOrders.length + sharedOrderCount}</b><small>purchase requests and orders</small></div><div><span>Browsing sessions</span><b>{readingLogs.length}</b><small>student reading activity</small></div><div><span>Not returned</span><b>{overdue.length}</b><small>past due loans</small></div><div><span>Damaged / destroyed</span><b>{damageLogs.length}</b><small>condition and loss records</small></div></div>
    <div className="admin-library-toolbar"><div className="admin-library-tabs">{tabs.map(([id, label, Icon, count]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={16} />{label}<span>{count}</span></button>)}</div><label className="admin-library-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search library records…" /></label></div>
    {tab === 'orders' && <section className="admin-library-panel"><h2>Books ordered</h2><p>Purchase requests and book orders submitted for the library.</p><div className="admin-library-table"><div className="admin-library-row head"><span>Book</span><span>Requested by</span><span>Status · date</span></div>{filteredOrders.map((request) => <div className="admin-library-row" key={request.id}><strong>{request.bookTitle}<small>{request.author}{request.isbn ? ` · ISBN ${request.isbn}` : ''}</small></strong><span>{request.studentName}<small>{request.reasonForPurchase}</small></span><b>{request.status}<small>{new Date(request.createdAt).toLocaleDateString()}</small></b></div>)}{!filteredOrders.length && <div className="admin-library-empty">No book orders match this search.</div>}</div></section>}
    {tab === 'browsing' && <section className="admin-library-panel"><h2>Browsing log</h2><p>Student reading and browsing activity from the shared reading tracker.</p><div className="admin-library-table"><div className="admin-library-row head"><span>Book</span><span>Student</span><span>Date · pages</span></div>{filteredBrowsing.map((log) => <div className="admin-library-row" key={log.id}><strong>{log.bookTitle}<small>{log.minutesRead} minutes read</small></strong><span>{log.studentName}<small>{log.studentEmail}</small></span><b>{new Date(log.date).toLocaleDateString()}<small>pp. {log.startPage}–{log.endPage}</small></b></div>)}</div></section>}
    {tab === 'overdue' && <section className="admin-library-panel"><h2>Books not returned</h2><p>Loans past their due date and still marked active.</p><div className="admin-library-table"><div className="admin-library-row head"><span>Book</span><span>Student</span><span>Due date</span></div>{filteredOverdue.map((loan) => <div className="admin-library-row" key={loan.id}><strong>{loan.bookTitle}<small>{loan.bookCategory}</small></strong><span>{loan.studentName}<small>{loan.studentGrade}</small></span><b className="danger">{new Date(loan.dueDate).toLocaleDateString()}<small>{loan.status}</small></b></div>)}</div></section>}
    {tab === 'damage' && <section className="admin-library-panel"><h2>Damaged or destroyed books</h2><p>Condition reports, losses, repair actions, and write-offs.</p><div className="admin-library-table"><div className="admin-library-row head"><span>Book</span><span>Condition · reported by</span><span>Action</span></div>{filteredDamage.map((log) => <div className="admin-library-row" key={log.id}><strong>{log.bookTitle}<small>{log.collection}</small></strong><span>{log.condition}<small>{log.reportedBy}</small></span><b className="danger">{log.status}<small>{log.actionTaken}</small></b></div>)}</div></section>}
  </div>;
}

export function AdminLibraryView({ member, sharedRows = [] }: { member: Member; sharedRows?: any[] }) {
  return <LibraryProvider sharedRows={sharedRows} embedded><AdminLibraryContent sharedRows={sharedRows} /></LibraryProvider>;
}
