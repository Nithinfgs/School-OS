import type { BaseTrackedEntity } from '../tracking';
export function canViewTrackedRecord(entity: BaseTrackedEntity, actor: { role: string; studentId?: string }) {
  const visibility = entity.visibility || {};
  if (visibility.restricted) return actor.role === 'Admin' && visibility.adminVisible === true;
  if (actor.role === 'Student') return visibility.studentVisible === true && (entity.metadata?.studentId === actor.studentId || entity.tags.includes(`student:${actor.studentId}`));
  if (actor.role === 'Parent') return visibility.parentVisible === true;
  if (actor.role === 'Teacher') return visibility.teacherVisible !== false;
  if (actor.role === 'HeadOfSchool' || actor.role === 'Head of School') return visibility.hosVisible !== false;
  return visibility.adminVisible !== false;
}
