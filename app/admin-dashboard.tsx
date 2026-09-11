'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  RefreshCw,
  Search,
  Users,
  ClipboardList,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassLogDetail } from './class-logs';
import { AttendanceRegister } from './attendance-register';
import { navigateWebsite } from '@/lib/web-navigation';
import {
  emptyFilters,
  matchesFilters,
  moduleFor,
  moduleNames,
  relationships,
  recordDate,
  alertFor,
  parseSnapshot,
  type SchoolRow,
  type MasterFilters,
} from '@/lib/master-dashboard';

function Choice({ label, value, options, onChange }: any) {
  return (
    <label className="master-filter">
      <span>{label}</span>
      <Select
        value={value || 'All'}
        onValueChange={(v) => onChange(v === 'All' ? '' : v)}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All {label.toLowerCase()}</SelectItem>
          {options.map((o: any) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
const options = (values: string[]) =>
  [...new Set(values.filter(Boolean))]
    .sort()
    .map((v) => ({ value: v, label: v }));
const pretty = (key: string) =>
  key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase());
function DisplayValue({ value }: any) {
  if (value == null || value === '') return <span>—</span>;
  if (Array.isArray(value))
    return (
      <ul>
        {value.map((v, i) => (
          <li key={i}>
            <DisplayValue value={v} />
          </li>
        ))}
      </ul>
    );
  if (typeof value === 'object')
    return (
      <dl>
        {Object.entries(value)
          .filter(([k]) => !['key', 'organizationId'].includes(k))
          .map(([k, v]) => (
            <div key={k}>
              <dt>{pretty(k)}</dt>
              <dd>
                <DisplayValue value={v} />
              </dd>
            </div>
          ))}
      </dl>
    );
  if (typeof value === 'string' && /^https?:\/\//.test(value))
    return (
      <a
        className="resource-link"
        href={value}
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
      </a>
    );
  return <span className="log-text">{String(value)}</span>;
}
function eventRow(event: any, source: SchoolRow): SchoolRow {
  const after = parseSnapshot(event.after);
  const d = after.data || after;
  return {
    ...source,
    name: after.name || source.name,
    data: {
      ...source.data,
      ...d,
      ...d.lastTransaction,
      actorName: event.actorName,
    },
    updatedBy: event.actor,
  };
}
function eventDescription(event: any) {
  const a = parseSnapshot(event.after),
    d = a.data || a;
  const t = d.lastTransaction;
  const before = parseSnapshot(event.before);
  if (t && JSON.stringify(t) !== JSON.stringify(before.data?.lastTransaction))
    return `${t.type}: ${t.amount} · ${t.whoUsed || event.actorName} · ${t.class || 'No class recorded'}${t.studentName ? ' · ' + t.studentName : ''} · Stock ${t.previousQuantity} → ${t.newQuantity}`;
  return (
    [
      d.status,
      d.class,
      d.date,
      d.topic,
      d.contentCovered,
      d.homework,
      d.feedback,
    ]
      .filter(Boolean)
      .join(' · ') || event.action
  );
}
export function AdminMasterDashboard({ ws, navigate, select }: any) {
  const [filters, setFilters] = useState<MasterFilters>(emptyFilters);
  const [tab, setTab] = useState('Records');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [sort, setSort] = useState('Recent');
  const [recordType, setRecordType] = useState('');
  const [relatedLimit, setRelatedLimit] = useState(30);
  const rows: SchoolRow[] = ws.masterRows || [];
  const today = new Date().toLocaleDateString('en-CA');
  useEffect(() => {
    setPage(1);
  }, [filters, tab, sort, recordType]);
  useEffect(() => {
    setRelatedLimit(30);
  }, [selectedId]);
  useEffect(() => {
    const read = () => {
      setSelectedEvent(null);
      const match = location.pathname.match(/^\/admin\/record\/(.+)$/);
      if (match) {
        try {
          setSelectedId(decodeURIComponent(match[1]));
        } catch {
          setSelectedId('');
        }
      } else setSelectedId('');
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const open = (r: SchoolRow, event?: any) => {
    setSelectedId(r.id);
    setSelectedEvent(event || null);
    navigateWebsite('/admin/record/' + encodeURIComponent(r.id));
  };
  const change = (key: keyof MasterFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            (!recordType || r.kind === recordType) &&
            matchesFilters(r, rows, filters),
        )
        .sort((a, b) =>
          sort === 'Name'
            ? a.name.localeCompare(b.name)
            : (b.updatedAt || recordDate(b)).localeCompare(
                a.updatedAt || recordDate(a),
              ),
        ),
    [rows, filters, sort, recordType],
  );
  const alerts = filtered.filter((r) => alertFor(r, today));
  const activities = (ws.audit || []).flatMap((a: any) => {
    const source = rows.find((r) => r.id === a.sourceId);
    return source &&
      (!recordType || source.kind === recordType) &&
      matchesFilters(eventRow(a, source), rows, filters, a.timestamp)
      ? [{ ...a, source }]
      : [];
  });
  activities.sort((a: any, b: any) =>
    sort === 'Name'
      ? a.source.name.localeCompare(b.source.name)
      : b.timestamp.localeCompare(a.timestamp) || Number(b.id) - Number(a.id),
  );
  const selection = rows.find((r) => r.id === selectedId);
  const sourceModule: Record<string, string> = {
    inventory: 'Labs',
    request: 'Labs',
    book: 'Library',
    loan: 'Library',
    student: 'Students',
    record: 'Students',
    class: 'Academics',
    assignment: 'Academics',
    submission: 'Academics',
    classLog: 'Academics',
  };
  const related = selection
    ? rows.filter((r) => {
        if (r.id === selection.id) return false;
        const rel = relationships(r, rows);
        if (selection.kind === 'student') return rel.students.has(selection.id);
        if (selection.kind === 'class') return rel.classes.has(selection.name);
        if (['staff', 'teacher'].includes(selection.kind))
          return (
            rel.teachers.has(selection.id) || rel.teachers.has(selection.name)
          );
        if (selection.kind === 'department')
          return rel.departments.has(selection.name);
        return Object.values(r.data).includes(selection.id);
      })
    : [];
  const profileAudits = selection
    ? (ws.audit || []).filter((a: any) => {
        if (a.sourceId === selection.id) return true;
        const source = rows.find((r) => r.id === a.sourceId);
        if (!source) return false;
        const rel = relationships(eventRow(a, source), rows);
        return selection.kind === 'student'
          ? rel.students.has(selection.id)
          : selection.kind === 'class'
            ? rel.classes.has(selection.name)
            : ['staff', 'teacher'].includes(selection.kind)
              ? rel.teachers.has(selection.id) ||
                rel.teachers.has(selection.name)
              : selection.kind === 'department'
                ? rel.departments.has(selection.name)
                : false;
      })
    : [];
  const selectedRelations = selection ? relationships(selection, rows) : null;
  const linkedProfiles = selectedRelations
    ? rows.filter(
        (r) =>
          r.id !== selection?.id &&
          (r.kind === 'student'
            ? selectedRelations.students.has(r.id)
            : r.kind === 'class'
              ? selectedRelations.classes.has(r.name)
              : r.kind === 'staff'
                ? selectedRelations.teachers.has(r.id)
                : false),
      )
    : [];
  const attendanceDates = [
    ...new Set(
      filtered
        .filter((r) => r.kind === 'attendance')
        .map((r) => r.data.date as string),
    ),
  ]
    .sort()
    .reverse()
    .slice(0, 14);
  const list = tab === 'Alerts' ? alerts : filtered;
  const count = tab === 'Activity' ? activities.length : list.length;
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(1, Math.ceil(count / 30))));
  }, [count]);
  const size = 30;
  const roleOptions = (kind: string) =>
    rows
      .filter((r) => r.kind === kind)
      .map((r) => ({ value: r.id, label: r.name }));
  if (ws.loading)
    return (
      <div className="panel master-empty" role="status">
        Loading school dashboard…
      </div>
    );
  if (ws.member.role !== 'Admin') return null;
  return (
    <div className="master-dashboard" suppressHydrationWarning>
      <div className="page-heading">
        <div>
          <div className="eyebrow">SCHOOL OPERATIONS</div>
          <h1 suppressHydrationWarning>Admin master dashboard</h1>
          <p>
            Find a record, follow an update, or act on what needs attention.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('Teacher Inquiry')}>
            <Users size={16} /> Teacher Inquiry
          </Button>
          <Button variant="outline" onClick={() => navigate('Student Search')}>
            <Search size={16} /> Student Search
          </Button>
          <Button variant="outline" onClick={() => ws.refresh()}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>
      </div>
      <p className="master-sync" suppressHydrationWarning>
        <span className="live-dot" />{' '}
        {ws.error ? 'Updates interrupted' : 'Updates every 5 seconds'} ·{' '}
        <span suppressHydrationWarning>
          {ws.refreshedAt
            ? 'Last checked ' + new Date(ws.refreshedAt).toLocaleTimeString()
            : 'Connecting…'}
        </span>
      </p>
      {ws.error && (
        <div className="error-banner" role="alert">
          Could not refresh school data. Displayed records may be out of date.{' '}
          <Button variant="outline" onClick={() => ws.refresh()}>
            Retry
          </Button>
        </div>
      )}
      <section className="panel master-filters" aria-label="Dashboard filters">
        <label className="master-search">
          <Search size={18} />
          <Input
            aria-label="Search all school records"
            placeholder="Search anything across the school…"
            value={filters.search}
            onChange={(e) => change('search', e.target.value)}
          />
        </label>
        <div className="master-filter-grid">
          <label className="master-filter">
            <span>Date</span>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => change('date', e.target.value)}
            />
          </label>
          <Choice
            label="Students"
            value={filters.student}
            onChange={(v: string) => change('student', v)}
            options={roleOptions('student')}
          />
          <Choice
            label="Teachers / staff"
            value={filters.teacher}
            onChange={(v: string) => change('teacher', v)}
            options={roleOptions('staff')}
          />
          <Choice
            label="Classes"
            value={filters.class}
            onChange={(v: string) => change('class', v)}
            options={options(
              rows.filter((r) => r.kind === 'class').map((r) => r.name),
            )}
          />
          <Choice
            label="Grades"
            value={filters.grade}
            onChange={(v: string) => change('grade', v)}
            options={options(
              rows
                .filter((r) => r.kind === 'student')
                .map((r) => String(r.data.grade || '')),
            )}
          />
          <Choice
            label="Departments"
            value={filters.dept}
            onChange={(v: string) => change('dept', v)}
            options={options(
              rows.filter((r) => r.kind === 'department').map((r) => r.name),
            )}
          />
          <Choice
            label="Modules"
            value={filters.module}
            onChange={(v: string) => change('module', v)}
            options={options(moduleNames)}
          />
          <Choice
            label="Record types"
            value={recordType}
            onChange={setRecordType}
            options={[...new Set(rows.map((r) => r.kind))]
              .sort()
              .map((k) => ({ value: k, label: pretty(k) }))}
          />
        </div>
        <div className="master-filter-footer">
          <span>
            Filters apply to counts, records, alerts and activity. Date matches
            a record’s event date; activity uses the time of the change.
          </span>
          <Button
            variant="ghost"
            onClick={() => {
              setFilters(emptyFilters);
              setRecordType('');
              setTab('Records');
            }}
          >
            Clear filters
          </Button>
        </div>
      </section>
      <div className="stats master-stats">
        {[
          [
            Users,
            'Students',
            filtered.filter((r) => r.kind === 'student').length,
            () => {
              change('module', 'People');
              setRecordType('student');
              setTab('Records');
            },
          ],
          [
            ClipboardList,
            'Class logs',
            filtered.filter((r) => r.kind === 'classLog').length,
            () => {
              change('module', 'Teaching');
              setRecordType('classLog');
              setTab('Records');
            },
          ],
          [
            AlertTriangle,
            'Needs attention',
            alerts.length,
            () => setTab('Alerts'),
          ],
          [
            Activity,
            'Recorded changes',
            activities.length,
            () => setTab('Activity'),
          ],
        ].map(([Icon, label, value, action]: any) => (
          <button className="stat" key={label} onClick={action}>
            <div>
              {label}
              <Icon size={18} />
            </div>
            <strong>{value}</strong>
            <small>Open matching records →</small>
          </button>
        ))}
      </div>
      <div className="master-module-strip" aria-label="Browse modules">
        <button
          type="button"
          className={`master-module-pill ${!filters.module ? 'active' : ''}`}
          onClick={() => {
            change('module', '');
            setRecordType('');
            setTab('Records');
          }}
        >
          <span>All Modules</span>
          <span className="master-pill-badge">
            {rows.filter((r) => matchesFilters(r, rows, { ...filters, module: '' })).length}
          </span>
        </button>
        {moduleNames.map((name) => {
          const count = rows.filter(
            (r) =>
              moduleFor(r) === name &&
              matchesFilters(r, rows, { ...filters, module: '' }),
          ).length;
          const isSelected = filters.module === name;
          return (
            <button
              key={name}
              type="button"
              className={`master-module-pill ${isSelected ? 'active' : ''}`}
              onClick={() => {
                change('module', isSelected ? '' : name);
                setRecordType('');
                setTab('Records');
              }}
            >
              <span>{name}</span>
              <span className="master-pill-badge">{count}</span>
            </button>
          );
        })}
      </div>
      {attendanceDates.length > 0 && (
        <section className="panel master-records">
          <h2>Attendance trend</h2>
          <p>
            Latest 14 recorded days within these filters. Counts use saved
            registers.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  'Date',
                  'Present',
                  'Absent',
                  'Late',
                  'Excused',
                  'Present / marked',
                ].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceDates.map((date) => {
                const marked = filtered.filter(
                  (r) => r.kind === 'attendance' && r.data.date === date,
                );
                const counts = ['Present', 'Absent', 'Late', 'Excused'].map(
                  (s) => marked.filter((r) => r.data.status === s).length,
                );
                return (
                  <TableRow key={date}>
                    <TableCell>
                      <button
                        className="master-record-link"
                        onClick={() => {
                          setFilters((f) => ({
                            ...f,
                            date,
                            module: 'Attendance',
                          }));
                          setTab('Records');
                        }}
                      >
                        {date}
                      </button>
                    </TableCell>
                    {counts.map((n, i) => (
                      <TableCell key={i}>{n}</TableCell>
                    ))}
                    <TableCell>
                      {Math.round((counts[0] / marked.length) * 100)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}
      <section className="panel master-records">
        <div className="section-heading">
          <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
            <TabsList variant="line">
              {['Records', 'Activity', 'Alerts', 'Attendance register'].map(
                (t) => (
                  <TabsTrigger key={t} value={t}>
                    {t}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </Tabs>
          {tab !== 'Attendance register' && (
            <Choice
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: 'Recent', label: 'Most recent' },
                { value: 'Name', label: 'Name A–Z' },
              ]}
            />
          )}
        </div>
        {tab === 'Attendance register' ? (
          <AttendanceRegister
            ws={ws}
            classId={
              rows.find((r) => r.kind === 'class' && r.name === filters.class)
                ?.id
            }
          />
        ) : (
          <>
            <p className="master-count">
              {count} matching {tab.toLowerCase()}{' '}
              {filters.module ? '· ' + filters.module : ''}
            </p>
            {tab === 'Activity' ? (
              <div>
                {activities
                  .slice((page - 1) * size, page * size)
                  .map((a: any) => (
                    <button
                      className="master-activity"
                      key={a.id}
                      onClick={() => open(a.source, a)}
                    >
                      <span className="master-activity-icon">
                        <Activity size={17} />
                      </span>
                      <span>
                        <b>
                          {a.action} · {a.source.name}
                        </b>
                        <span className="master-activity-description">
                          {eventDescription(a)}
                        </span>
                        <small>
                          {a.actorName} ·{' '}
                          {new Date(a.timestamp).toLocaleString()} ·{' '}
                          {moduleFor(a.source)}
                        </small>
                      </span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Class / person</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.slice((page - 1) * size, page * size).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <button
                          className="master-record-link"
                          onClick={() => open(r)}
                        >
                          {r.name}
                          <ArrowUpRight size={14} />
                        </button>
                        <small>{pretty(r.kind)}</small>
                      </TableCell>
                      <TableCell>{moduleFor(r)}</TableCell>
                      <TableCell>
                        {r.data.class ||
                          r.data.studentName ||
                          r.data.teacher ||
                          r.data.department ||
                          '—'}
                      </TableCell>
                      <TableCell>{recordDate(r) || '—'}</TableCell>
                      <TableCell>
                        {alertFor(r, today) ||
                          r.data.status ||
                          (r.kind === 'inventory'
                            ? r.quantity + ' ' + (r.data.unit || 'units')
                            : '—')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!count && (
              <div className="master-empty">
                <BookOpen size={24} />
                <h3>No matching {tab.toLowerCase()}</h3>
                <p>
                  {filters.module
                    ? 'No ' +
                      filters.module.toLowerCase() +
                      ' records match these filters.'
                    : 'Adjust the filters or wait for a school record to be saved.'}
                </p>
              </div>
            )}
            {count > size && (
              <div className="master-pagination">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {Math.ceil(count / size)}
                </span>
                <Button
                  variant="outline"
                  disabled={page * size >= count}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
      <Sheet
        open={!!selectedId}
        onOpenChange={(v) => {
          if (!v) {
            setSelectedId('');
            setSelectedEvent(null);
            navigateWebsite('/admin', true);
          }
        }}
      >
        <SheetContent className="detail-sheet master-detail">
          <SheetHeader>
            <SheetTitle>{selection?.name || 'Record unavailable'}</SheetTitle>
            <SheetDescription>
              {selection
                ? moduleFor(selection) + ' · ' + pretty(selection.kind)
                : 'This record is no longer available within your access.'}
            </SheetDescription>
          </SheetHeader>
          {selection && (
            <div className="detail-body">
              {selectedEvent && (
                <section className="detail-note">
                  <h3>{selectedEvent.action}</h3>
                  <p>
                    {selectedEvent.actorName} ·{' '}
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </p>
                  <h4>Before</h4>
                  <DisplayValue value={parseSnapshot(selectedEvent.before)} />
                  <h4>After</h4>
                  <DisplayValue value={parseSnapshot(selectedEvent.after)} />
                </section>
              )}
              {selection.kind === 'classLog' ? (
                <ClassLogDetail row={selection} />
              ) : (
                <dl>
                  {Object.entries(selection.data)
                    .filter(
                      ([key]) => !['id', 'organizationId', 'key'].includes(key),
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{pretty(key)}</dt>
                        <dd>
                          <DisplayValue value={value} />
                        </dd>
                      </div>
                    ))}
                  {selection.kind === 'inventory' && (
                    <div>
                      <dt>Available quantity</dt>
                      <dd>
                        {selection.quantity} {selection.data.unit}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
              {selection.kind === 'file' && (
                <a
                  className="resource-link"
                  href={'/api/files?id=' + encodeURIComponent(selection.id)}
                >
                  Download file
                </a>
              )}
              {linkedProfiles.length > 0 && (
                <>
                  <h3 className="master-subheading">Linked people & classes</h3>
                  {linkedProfiles.map((r) => (
                    <button
                      className="master-related"
                      key={r.id}
                      onClick={() => open(r)}
                    >
                      <span>
                        {r.name} · {pretty(r.kind)}
                      </span>
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </>
              )}
              {sourceModule[selection.kind] && (
                <Button
                  variant="outline"
                  onClick={() => {
                    select(selection);
                    navigate(
                      selection.kind === 'request' &&
                        selection.data.type === 'library'
                        ? 'Library'
                        : sourceModule[selection.kind],
                    );
                  }}
                >
                  Open in {sourceModule[selection.kind]}{' '}
                  <ArrowUpRight size={16} />
                </Button>
              )}
              <h3 className="master-subheading">
                Related records & profiles · {related.length}
              </h3>
              {related.slice(0, relatedLimit).map((r) => (
                <button
                  key={r.id}
                  className="master-related"
                  onClick={() => open(r)}
                >
                  <span>
                    <b>{r.name}</b>
                    <small>
                      {moduleFor(r)} ·{' '}
                      {r.data.class || r.data.status || recordDate(r)}
                    </small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
              {related.length > relatedLimit && (
                <Button
                  variant="outline"
                  onClick={() => setRelatedLimit((n) => n + 30)}
                >
                  Show more related records
                </Button>
              )}
              {!related.length && <p>No linked records yet.</p>}
              <h3 className="master-subheading">
                Activity history · {profileAudits.length}
              </h3>
              {profileAudits.slice(0, relatedLimit).map((a: any) => (
                <button
                  key={a.id}
                  className="master-related"
                  onClick={() => {
                    const r = rows.find((r) => r.id === a.sourceId);
                    if (r) open(r, a);
                  }}
                >
                  <span>
                    <b>{a.action}</b>
                    <small>
                      {a.actorName} · {new Date(a.timestamp).toLocaleString()}
                    </small>
                    <span>{eventDescription(a)}</span>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
              {profileAudits.length > relatedLimit && (
                <Button
                  variant="outline"
                  onClick={() => setRelatedLimit((n) => n + 30)}
                >
                  Show more history
                </Button>
              )}
              {!profileAudits.length && <p>No recorded changes yet.</p>}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
