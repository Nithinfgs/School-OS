import { createSupabaseServerClient } from './supabase-adapter';
import { resolveSupabaseMember } from './supabase-auth';

type Member = Awaited<ReturnType<typeof resolveSupabaseMember>>;
type Row = Record<string, any>;

function kindFor(record: Row) {
  if (String(record.record_type).startsWith('ATTENDANCE_')) return 'attendance';
  if (String(record.record_type).includes('DAMAGE')) return 'damageBrokenLog';
  if (String(record.record_type).startsWith('BUS_')) return 'transportActivity';
  if (record.source_module === 'Calendar') return 'calendarEvent';
  if (record.source_module === 'Inquiries') return 'inquiry';
  if (record.source_module === 'Transport') return 'transportNotice';
  if (record.source_module === 'Library') return 'loan';
  if (record.source_module === 'Lab') return 'request';
  return 'record';
}

const managers = new Set(['Admin', 'Head of School']);

/**
 * Applies mandatory server-side relationship scoping before a service-role
 * Supabase client returns data. RLS is intentionally not relied upon here
 * because service credentials bypass it.
 */
async function loadScope(client: ReturnType<typeof createSupabaseServerClient>, member: Member) {
  if (managers.has(member.role)) return { studentIds: null as Set<string> | null, classIds: null as Set<string> | null };
  if (member.role === 'Student') return { studentIds: new Set(member.studentId ? [member.studentId] : []), classIds: new Set<string>() };

  if (member.role === 'Parent') {
    const { data, error } = await client.from('parent_student_links')
      .select('student_id').eq('organization_id', member.organizationId).eq('parent_profile_id', member.id);
    if (error) throw error;
    return { studentIds: new Set((data || []).map((row: Row) => row.student_id)), classIds: new Set<string>() };
  }

  if (member.role === 'Teacher') {
    const { data, error } = await client.from('class_memberships')
      .select('class_id').eq('organization_id', member.organizationId).eq('teacher_id', member.teacherId);
    if (error) throw error;
    return { studentIds: new Set<string>(), classIds: new Set((data || []).map((row: Row) => row.class_id)) };
  }

  // Operational roles receive only the records required by their module; they
  // do not receive a student/class directory.
  return { studentIds: new Set<string>(), classIds: new Set<string>() };
}

function recordAllowed(record: Row, member: Member, scope: { studentIds: Set<string> | null; classIds: Set<string> | null }) {
  if (managers.has(member.role)) return true;
  if (member.role === 'Student') return scope.studentIds?.has(record.student_id) && record.visibility?.studentVisible === true;
  if (member.role === 'Parent') return scope.studentIds?.has(record.student_id) && record.visibility?.parentVisible === true;
  if (member.role === 'Teacher') return scope.classIds?.has(record.class_id) || record.teacher_id === member.teacherId;
  if (member.role === 'Lab Assistant') return record.source_module === 'Lab';
  if (member.role === 'Library Assistant') return record.source_module === 'Library';
  if (member.role === 'Transport Staff') return record.source_module === 'Transport';
  return false;
}

/** Adapts normalized Supabase rows to the existing workspace UI shape. */
export async function loadSupabaseWorkspace(user: { userId?: string; email?: string }) {
  const member = await resolveSupabaseMember({ id: user.userId, email: user.email });
  const client = createSupabaseServerClient();
  const scope = await loadScope(client, member);
  const org = member.organizationId;

  let studentsQuery = client.from('students').select('id,external_id,grade,house,profiles(display_name)').eq('organization_id', org);
  let classesQuery = client.from('classes').select('id,external_id,title,grade,subject').eq('organization_id', org);
  let recordsQuery = client.from('tracked_records').select('*').eq('organization_id', org).order('created_at', { ascending: false });

  if (scope.studentIds !== null) {
    const studentIds = [...scope.studentIds];
    studentsQuery = studentIds.length ? studentsQuery.in('id', studentIds) : studentsQuery.in('id', ['00000000-0000-0000-0000-000000000000']);
  }
  if (scope.classIds !== null) {
    const classIds = [...scope.classIds];
    classesQuery = classIds.length ? classesQuery.in('id', classIds) : classesQuery.in('id', ['00000000-0000-0000-0000-000000000000']);
  }
  // Narrow records before transfer when a stable relationship scope exists.
  if (member.role === 'Student' || member.role === 'Parent') {
    const ids = [...(scope.studentIds || [])];
    recordsQuery = ids.length ? recordsQuery.in('student_id', ids) : recordsQuery.in('student_id', ['00000000-0000-0000-0000-000000000000']);
  } else if (member.role === 'Teacher') {
    const classIds = [...(scope.classIds || [])];
    recordsQuery = classIds.length
      ? recordsQuery.or(`class_id.in.(${classIds.join(',')}),teacher_id.eq.${member.teacherId}`)
      : recordsQuery.eq('teacher_id', member.teacherId);
  } else if (member.role === 'Lab Assistant') recordsQuery = recordsQuery.eq('source_module', 'Lab');
  else if (member.role === 'Library Assistant') recordsQuery = recordsQuery.eq('source_module', 'Library');
  else if (member.role === 'Transport Staff') recordsQuery = recordsQuery.eq('source_module', 'Transport');

  const [studentsResult, classesResult, recordsResult, notificationsResult] = await Promise.all([
    studentsQuery,
    classesQuery,
    recordsQuery,
    client.from('notifications').select('*').eq('organization_id', org).eq('user_id', member.id).order('created_at', { ascending: false }),
  ]);
  for (const result of [studentsResult, classesResult, recordsResult, notificationsResult]) if (result.error) throw result.error;

  const records = (recordsResult.data || []).filter((record: Row) => recordAllowed(record, member, scope));
  const rows: Row[] = [
    ...(studentsResult.data || []).map((student: Row) => ({ id: student.id, kind: 'student', name: student.profiles?.display_name || student.external_id, quantity: 1, data: { grade: student.grade, house: student.house } })),
    ...(classesResult.data || []).map((schoolClass: Row) => ({ id: schoolClass.id, kind: 'class', name: schoolClass.title, quantity: 1, data: { class: schoolClass.title, grade: schoolClass.grade, subject: schoolClass.subject } })),
    ...records.map((record: Row) => ({ id: record.id, kind: kindFor(record), name: record.body?.title || record.labels?.[0] || record.record_type, quantity: 1, data: { ...record.body, id: record.id, organizationId: record.organization_id, recordType: record.record_type, sourceModule: record.source_module, status: record.status, tags: record.tags || [], labels: record.labels || [], metadata: record.metadata || {}, relatedEntityRefs: record.related_entity_refs || [], visibility: record.visibility || {}, studentId: record.student_id, classId: record.class_id, teacherId: record.teacher_id, assetId: record.asset_id, createdAt: record.created_at, updatedAt: record.updated_at, createdBy: record.created_by } })),
    ...(notificationsResult.data || []).map((notification: Row) => ({ id: notification.id, kind: 'notification', name: notification.title, quantity: 1, data: { description: notification.message, read: notification.read, type: notification.type, sourceModule: notification.source_module, createdAt: notification.created_at, tags: notification.tags || [] } })),
  ];
  return { rows, contacts: [], member, audit: [], members: managers.has(member.role) ? [member] : [], masterRows: managers.has(member.role) ? rows : [], refreshedAt: new Date().toISOString() };
}
