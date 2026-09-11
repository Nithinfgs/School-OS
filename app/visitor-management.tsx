'use client';
import { useMemo, useState } from 'react';
import { CheckCircle2, LogIn, LogOut, Plus, Search, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type VisitStatus = 'Expected' | 'CheckedIn' | 'Waiting' | 'WithHost' | 'CheckedOut' | 'Cancelled';
type Visit = {
  id: string;
  visitorId: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  host: string;
  department: string;
  purpose: string;
  visitDate: string;
  arrivalTime?: string;
  expectedTime: string;
  departureTime?: string;
  status: VisitStatus;
  vehicle?: string;
  notes?: string;
};

const TODAY = new Date().toISOString().slice(0, 10);
const seed: Visit[] = [
  { id: 'VIS-2026-091', visitorId: 'visitor-priya', name: 'Priya Mehta', phone: '+91 98765 12001', email: 'priya.mehta@example.com', type: 'ParentGuardian', host: 'Dr. Aisha Rahman', department: 'Leadership', purpose: 'Subject selection meeting', visitDate: TODAY, arrivalTime: '08:35', expectedTime: '08:30', status: 'WithHost' },
  { id: 'VIS-2026-092', visitorId: 'visitor-edulab', name: 'Arun Menon', phone: '+91 98765 22001', email: 'orders@edulab.example', type: 'Vendor', host: 'Olivia Reed', department: 'Chemistry Lab', purpose: 'Equipment delivery', visitDate: TODAY, expectedTime: '10:00', status: 'Expected', vehicle: 'KA 01 AB 4521' },
  { id: 'VIS-2026-090', visitorId: 'visitor-daniel', name: 'Daniel Williams', phone: '+91 98765 12003', email: 'daniel.williams@example.com', type: 'ParentGuardian', host: 'Admissions Office', department: 'Administration', purpose: 'Admissions interview', visitDate: TODAY, arrivalTime: '07:55', expectedTime: '08:00', departureTime: '09:10', status: 'CheckedOut' },
];

const types = ['ParentGuardian', 'Vendor', 'Contractor', 'Guest', 'InterviewCandidate', 'Alumni', 'Delivery', 'Other'];

function Pill({ value }: { value: string }) {
  return <span className={`status-pill status-${value.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{value}</span>;
}

export function VisitorManagement({ ws }: { ws: any }) {
  const [tab, setTab] = useState('Today');
  const [visits, setVisits] = useState<Visit[]>(seed);
  const [selected, setSelected] = useState<Visit | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [message, setMessage] = useState('');

  // Controlled form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'Guest',
    host: 'Reception',
    department: 'Front office',
    purpose: 'General visit',
    expectedTime: '11:00',
  });

  const filtered = useMemo(
    () =>
      visits.filter(
        (v) =>
          (type === 'All' || v.type === type) &&
          `${v.name} ${v.phone} ${v.host} ${v.department} ${v.purpose}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [visits, type, query],
  );

  const update = (changes: Partial<Visit>) => {
    if (!selected) return;
    const next = { ...selected, ...changes };
    setSelected(next);
    setVisits((all) => all.map((v) => (v.id === next.id ? next : v)));
    setMessage('Visit updated');
  };

  const handleCheckInSubmit = () => {
    if (!form.name.trim()) {
      setMessage('Please enter a visitor name.');
      return;
    }
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const v: Visit = {
      id: `VIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      visitorId: `visitor-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      type: form.type,
      host: form.host.trim() || 'Reception',
      department: form.department.trim() || 'Front office',
      purpose: form.purpose.trim() || 'General visit',
      visitDate: TODAY,
      expectedTime: form.expectedTime || nowTime,
      arrivalTime: nowTime,
      status: 'Waiting',
    };
    setVisits((all) => [v, ...all]);
    setSelected(v);
    setTab('Today');
    setForm({
      name: '',
      phone: '',
      email: '',
      type: 'Guest',
      host: 'Reception',
      department: 'Front office',
      purpose: 'General visit',
      expectedTime: '11:00',
    });
    setMessage(`Visitor ${v.name} checked in successfully`);
  };

  const checkout = () => {
    update({
      status: 'CheckedOut',
      departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const today = visits.filter((v) => v.visitDate === TODAY);

  return (
    <section className="visitor-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION</div>
          <h1>Visitor Management</h1>
          <p>Welcome visitors safely and keep an accurate campus register.</p>
        </div>
        <Button onClick={() => setTab('Check in')}>
          <LogIn size={16} /> Check in visitor
        </Button>
      </div>
      {message && (
        <p className="student-success" role="status">
          {message}
        </p>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {['Today', 'Check in', 'Currently on campus', 'Expected visitors', 'History'].map((x) => (
            <TabsTrigger key={x} value={x}>
              {x}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="visitor-stats">
        <button onClick={() => setTab('Today')}>
          <strong>{today.length}</strong>
          <span>Visitors today</span>
        </button>
        <button onClick={() => setTab('Currently on campus')}>
          <strong>{today.filter((v) => ['CheckedIn', 'Waiting', 'WithHost'].includes(v.status)).length}</strong>
          <span>Currently on campus</span>
        </button>
        <button onClick={() => setTab('Expected visitors')}>
          <strong>{today.filter((v) => v.status === 'Expected').length}</strong>
          <span>Expected remaining</span>
        </button>
        <button>
          <strong>{today.filter((v) => v.type === 'ParentGuardian').length}</strong>
          <span>Parent visits</span>
        </button>
      </div>
      {tab === 'Check in' && (
        <div className="panel visitor-form">
          <h2>Check in a visitor</h2>
          <div className="visitor-form-grid">
            <label className="field">
              <span>Visitor name *</span>
              <Input
                placeholder="Full name of visitor"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <Input
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Visitor type</span>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v || 'Guest' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((x) => (
                    <SelectItem value={x} key={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="field">
              <span>Person visiting</span>
              <Input
                placeholder="Host or staff member"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Department</span>
              <Input
                placeholder="Department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Purpose</span>
              <Input
                placeholder="Purpose of visit"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Expected departure</span>
              <Input
                type="time"
                value={form.expectedTime}
                onChange={(e) => setForm({ ...form, expectedTime: e.target.value })}
              />
            </label>
          </div>
          <Button onClick={handleCheckInSubmit}>
            <LogIn size={16} /> Check in
          </Button>
        </div>
      )}
      {tab !== 'Check in' && (
        <>
          <div className="visitor-toolbar">
            <Input
              placeholder="Search visitor, host or purpose…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select value={type} onValueChange={(v) => setType(v || 'All')}>
              <SelectTrigger>
                <SelectValue placeholder="All visitor types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All visitor types</SelectItem>
                {types.map((x) => (
                  <SelectItem value={x} key={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="panel visitor-list">
            {filtered
              .filter(
                (v) =>
                  tab === 'Today' ||
                  (tab === 'Currently on campus' && ['CheckedIn', 'Waiting', 'WithHost'].includes(v.status)) ||
                  (tab === 'Expected visitors' && v.status === 'Expected') ||
                  (tab === 'History' && ['CheckedOut', 'Cancelled'].includes(v.status)),
              )
              .map((v) => (
                <button
                  className={`visitor-row ${selected?.id === v.id ? 'selected' : ''}`}
                  key={v.id}
                  onClick={() => setSelected(v)}
                >
                  <span>
                    <strong>{v.name}</strong>
                    <small>
                      {v.type} · {v.purpose}
                    </small>
                  </span>
                  <span>
                    <small>
                      {v.host} · {v.department}
                    </small>
                    <small>{v.arrivalTime ? `Arrived ${v.arrivalTime}` : `Expected ${v.expectedTime}`}</small>
                  </span>
                  <Pill value={v.status} />
                </button>
              ))}
            {!filtered.length && <p className="empty-state">No visitors match these filters.</p>}
          </div>
        </>
      )}
      {selected && (
        <div className="panel visitor-detail">
          <div className="admission-detail-head">
            <div>
              <div className="eyebrow">{selected.id}</div>
              <h2>{selected.name}</h2>
              <p>
                {selected.type} · <Pill value={selected.status} />
              </p>
            </div>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              <X size={16} />
            </Button>
          </div>
          <div className="visitor-facts">
            <div>
              <b>Host</b>
              <span>
                {selected.host} · {selected.department}
              </span>
            </div>
            <div>
              <b>Purpose</b>
              <span>{selected.purpose}</span>
            </div>
            <div>
              <b>Contact</b>
              <span>
                {selected.phone} · {selected.email || '—'}
              </span>
            </div>
            <div>
              <b>Time</b>
              <span>
                {selected.arrivalTime || 'Not arrived'} → {selected.departureTime || selected.expectedTime}
              </span>
            </div>
          </div>
          <div className="visitor-actions">
            {['Expected', 'CheckedIn'].includes(selected.status) && (
              <Button
                onClick={() =>
                  update({
                    status: 'Waiting',
                    arrivalTime:
                      selected.arrivalTime ||
                      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  })
                }
              >
                <CheckCircle2 size={16} /> Mark arrived
              </Button>
            )}
            {['Waiting', 'CheckedIn'].includes(selected.status) && (
              <Button onClick={() => update({ status: 'WithHost' })}>With host</Button>
            )}
            {['Waiting', 'WithHost', 'CheckedIn'].includes(selected.status) && (
              <Button variant="outline" onClick={checkout}>
                <LogOut size={16} /> Check out
              </Button>
            )}
            {selected.status === 'Expected' && (
              <Button variant="outline" onClick={() => update({ status: 'Cancelled' })}>
                Cancel visit
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

