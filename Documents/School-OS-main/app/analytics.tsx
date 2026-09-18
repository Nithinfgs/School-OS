'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
export default function Analytics({ rows }: any) {
  const subjects = Array.from(
    new Set(
      rows
        .filter((r: any) => r.kind === 'student')
        .map((r: any) => r.data.class),
    ),
  );
  const attendance = subjects.map((name: any) => {
    const students = rows.filter(
      (r: any) => r.kind === 'student' && r.data.class === name,
    );
    return {
      name: name.replace(' HL', ''),
      attendance: Math.round(
        students.reduce((n: number, r: any) => n + r.data.attendance, 0) /
          students.length,
      ),
    };
  });
  const records = rows.filter((r: any) => r.kind === 'record');
  const categories = Array.from(
    new Set(records.map((r: any) => r.data.category)),
  ).map((name: any) => ({
    name,
    count: records.filter((r: any) => r.data.category === name).length,
  }));
  return (
    <div className="help-grid mb-6">
      <section className="panel help-card">
        <h2>Attendance by class</h2>
        <p>Average of student attendance percentages.</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={attendance}
            margin={{ top: 20, right: 5, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#edf1f6"
            />
            <XAxis
              dataKey="name"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip />
            <Bar
              dataKey="attendance"
              name="Attendance %"
              fill="#7e9dc8"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel help-card">
        <h2>Student support & recognition</h2>
        <p>Records by category across your permitted students.</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={categories}
            margin={{ top: 20, right: 5, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#edf1f6"
            />
            <XAxis
              dataKey="name"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={10}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar
              dataKey="count"
              name="Records"
              fill="#88aa9b"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
