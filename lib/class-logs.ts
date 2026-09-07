import { db } from './server';

export async function classLogRows(org: string, member: any) {
  if (!['Admin', 'Teacher', 'Student'].includes(member.role)) return [];
  const result = await db()
    .prepare(`SELECT l.*, c.name AS className, m.name AS teacher
    FROM teacher_class_logs l JOIN records c ON c.id=l.classId AND c.organizationId=l.organizationId
    JOIN members m ON m.id=l.createdBy AND m.organizationId=l.organizationId
    WHERE l.organizationId=? AND c.kind='class'
    AND (?='Admin' OR instr('|' || ? || '|', '|' || c.name || '|')>0)
    ORDER BY l.date DESC, l.updatedAt DESC`)
    .bind(org, member.role, member.classes || '')
    .all<any>();
  return result.results.map((l) => ({
    id: l.id,
    kind: 'classLog',
    name: l.topic,
    version: l.version,
    updatedAt: l.updatedAt,
    data: {
      ...l,
      classId: l.classId.slice(org.length + 1),
      class: l.className,
      resources: safeJsonParse(l.resources, []),
    },
  }));
}

function safeJsonParse(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
