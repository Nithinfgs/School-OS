'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ClassLogDetail({ row }: any) {
  const d = row.data;
  return (
    <article className="class-log-entry">
      <p>
        {d.class} · {d.date} · {d.period || 'Daily'} · {d.teacher}
      </p>
      <h3>{row.name}</h3>
      <h4>Content covered</h4>
      <p className="log-text">{d.contentCovered}</p>
      {d.activities && (
        <>
          <h4>Activities</h4>
          <p className="log-text">{d.activities}</p>
        </>
      )}
      {d.notes && (
        <>
          <h4>Class notes</h4>
          <p className="log-text">{d.notes}</p>
        </>
      )}
      {d.homework && (
        <>
          <h4>Homework</h4>
          <p className="log-text">{d.homework}</p>
        </>
      )}
      {(d.resources || []).length > 0 && (
        <>
          <h4>Resources</h4>
          {(d.resources || []).map((url: string) => (
            <a
              className="resource-link"
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          ))}
        </>
      )}
      <small>Updated {new Date(row.updatedAt).toLocaleString()}</small>
    </article>
  );
}

export function ClassHistory({ ws, classId, initialDraft, period }: any) {
  const classes = ws.rows.filter((r: any) => r.kind === 'class');
  const [filter, setFilter] = useState(classId || '');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [draft, setDraft] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const logs = ws.rows
    .filter(
      (r: any) =>
        r.kind === 'classLog' &&
        (!(classId || filter) || r.data.classId === (classId || filter)) &&
        (!date || r.data.date === date) &&
        (r.name + ' ' + r.data.contentCovered + ' ' + r.data.homework)
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a: any, b: any) => b.data.date.localeCompare(a.data.date));
  const start = (row?: any) => {
    setError('');
    setSuccess('');
    setDraft(
      row
        ? {
            ...row.data,
            id: row.id,
            version: row.version,
            resources: row.data.resources.join('\n'),
          }
        : {
            classId: classId || filter || classes[0]?.id || '',
            date: new Date().toLocaleDateString('en-CA'),
            topic: '',
            contentCovered: '',
            notes: '',
            homework: '',
            resources: '',
            period: period || 'Daily',
            activities: '',
          },
    );
  };
  useEffect(() => {
    if (initialDraft) start();
  }, [initialDraft]);
  return (
    <section className="panel class-history">
      <div className="section-heading">
        <h2>Class history</h2>
        {ws.member.role === 'Teacher' && classes.length > 0 && (
          <Button onClick={() => start()}>Add class log</Button>
        )}
      </div>
      <p>Daily topics, lesson notes, homework and resources.</p>
      <div className="log-filters">
        {!classId && (
          <label>
            Class
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All my classes</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Search
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Topic, content or homework"
          />
        </label>
        <label>
          Date
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      {success && <p role="status">{success}</p>}
      {draft && (
        <form
          className="log-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              await ws.act({
                ...draft,
                action: 'classLog',
                resources: draft.resources
                  .split('\n')
                  .map((s: string) => s.trim())
                  .filter(Boolean),
              });
              setDraft(null);
              setSuccess('Class log saved to class history and calendar.');
            } catch (e: any) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>{draft.id ? 'Edit class log' : 'New class log'}</h3>
          <p>
            Everything in this log is visible to this class and school admins.
          </p>
          <label>
            Class
            <select
              required
              disabled={!!draft.id || busy}
              value={draft.classId}
              onChange={(e) => setDraft({ ...draft, classId: e.target.value })}
            >
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <Input
              required
              type="date"
              disabled={!!draft.id || busy}
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </label>
          <label>
            Period
            <Input
              required
              maxLength={40}
              disabled={!!draft.id || busy}
              value={draft.period || 'Daily'}
              onChange={(e) => setDraft({ ...draft, period: e.target.value })}
            />
          </label>
          {(
            [
              'topic',
              'contentCovered',
              'activities',
              'notes',
              'homework',
              'resources',
            ] as const
          ).map((key) => (
            <label key={key}>
              {
                {
                  topic: 'Topic',
                  contentCovered: 'Content covered',
                  activities: 'Activities (optional)',
                  notes: 'Class notes (optional)',
                  homework: 'Homework (optional)',
                  resources: 'Resource links (optional, one URL per line)',
                }[key]
              }
              {key === 'topic' ? (
                <Input
                  required
                  maxLength={200}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              ) : (
                <Textarea
                  required={key === 'contentCovered'}
                  maxLength={
                    key === 'resources'
                      ? 40000
                      : key === 'contentCovered'
                        ? 10000
                        : 5000
                  }
                  rows={3}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          <div className="detail-actions">
            <label>
              Attach an existing class resource
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    setDraft({
                      ...draft,
                      resources: [draft.resources, e.target.value]
                        .filter(Boolean)
                        .join('\n'),
                    });
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Choose a resource or uploaded file…</option>
                {ws.rows
                  .filter(
                    (r: any) =>
                      ['file', 'resource'].includes(r.kind) &&
                      r.data.class ===
                        classes.find((c: any) => c.id === draft.classId)
                          ?.name &&
                      r.data.audience === 'class',
                  )
                  .flatMap((r: any) =>
                    r.kind === 'file'
                      ? [
                          <option
                            key={r.id}
                            value={location.origin + '/api/files?id=' + r.id}
                          >
                            {r.name}
                          </option>,
                        ]
                      : (r.data.resources || []).map(
                          (url: string, i: number) => (
                            <option key={r.id + i} value={url}>
                              {r.name}
                            </option>
                          ),
                        ),
                  )}
              </select>
            </label>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save class log'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      {!logs.length && (
        <p className="info-box">No class logs match these filters.</p>
      )}
      {logs.map((r: any) => (
        <div key={r.id}>
          <ClassLogDetail row={r} />
          {ws.member.role === 'Teacher' && (
            <Button variant="outline" onClick={() => start(r)}>
              Edit log
            </Button>
          )}
        </div>
      ))}
      <h3>Attendance history</h3>
      {ws.rows
        .filter(
          (r: any) =>
            r.kind === 'attendance' &&
            (!(classId || filter) || r.data.classId === (classId || filter)) &&
            (!date || r.data.date === date) &&
            (r.name + ' ' + r.data.status + ' ' + r.data.notes)
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a: any, b: any) => b.data.date.localeCompare(a.data.date))
        .map((r: any) => (
          <div className="detail-note" key={r.id}>
            <b>
              {r.data.studentName} · {r.data.status}
            </b>
            <p>
              {r.data.class} · {r.data.date} · {r.data.period || 'Daily'}{' '}
              {r.data.arrivalTime ? '· Arrived ' + r.data.arrivalTime : ''}
            </p>
            <p>{r.data.reason || r.data.notes}</p>
          </div>
        ))}
    </section>
  );
}
