'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export function AttendanceRegister({ ws, classId }: any) {
  const classes = ws.rows.filter((r: any) => r.kind === 'class');
  const [choice, setChoice] = useState(classId || classes[0]?.id || '');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('Present');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setStudentId('');
    setError('');
    setMessage('');
  }, [classId]);
  const cls = classes.find((r: any) => r.id === (classId || choice));
  const students = ws.rows.filter(
    (r: any) => r.kind === 'student' && r.data.class === cls?.name,
  );
  const attendance = ws.rows.filter(
    (r: any) =>
      r.kind === 'attendance' &&
      r.data.classId === cls?.id &&
      r.data.date === date,
  );
  const existing = attendance.find((r: any) => r.data.studentId === studentId);
  if (!['Admin', 'Teacher'].includes(ws.member.role)) return null;
  return (
    <section className="attendance-register">
      <h3>Class attendance</h3>
      <p>
        Daily register. Corrections require a reason and are kept in activity
        history.
      </p>
      <form
        className="log-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          setMessage('');
          try {
            await ws.act({
              action: 'attendance',
              classId: cls?.id,
              studentId,
              date,
              status,
              notes,
              version: existing?.version,
            });
            setMessage('Attendance saved.');
            setNotes('');
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {!classId && (
          <label>
            Class
            <Select
              value={choice}
              onValueChange={(v) => {
                setChoice(v || '');
                setStudentId('');
              }}
            >
              <SelectTrigger aria-label="Attendance class">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
        <label>
          Date
          <Input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Student
          <Select
            value={studentId}
            onValueChange={(v) => setStudentId(v || '')}
          >
            <SelectTrigger aria-label="Attendance student">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((r: any) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label>
          Status
          <Select
            value={status}
            onValueChange={(v) => setStatus(v || 'Present')}
          >
            <SelectTrigger aria-label="Attendance status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Present', 'Absent', 'Late', 'Excused'].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label>
          {existing ? 'Reason for correction' : 'Reason / notes'}
          <Textarea
            required={!!existing}
            value={notes}
            maxLength={2000}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        {existing && <p>Currently recorded: {existing.data.status}</p>}
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <Button disabled={busy || !studentId} type="submit">
          {busy ? 'Saving…' : existing ? 'Save correction' : 'Save attendance'}
        </Button>
      </form>
      <p>
        {attendance.filter((r: any) => r.data.status === 'Present').length}{' '}
        present ·{' '}
        {attendance.filter((r: any) => r.data.status === 'Absent').length}{' '}
        absent ·{' '}
        {attendance.filter((r: any) => r.data.status === 'Late').length} late ·{' '}
        {attendance.filter((r: any) => r.data.status === 'Excused').length}{' '}
        excused · {students.length - attendance.length} unmarked
      </p>
      {students.map((s: any) => (
        <button
          className="master-related"
          key={s.id}
          onClick={() => {
            setStudentId(s.id);
            setStatus(
              attendance.find((r: any) => r.data.studentId === s.id)?.data
                .status || 'Present',
            );
          }}
        >
          <span>{s.name}</span>
          <span>
            {attendance.find((r: any) => r.data.studentId === s.id)?.data
              .status || 'Unmarked'}
          </span>
        </button>
      ))}
    </section>
  );
}
