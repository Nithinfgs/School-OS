import { createSupabaseServerClient } from './supabase-adapter';
import { resolveSupabaseMember } from './supabase-auth';

function kindFor(record:any) {
  if (String(record.record_type).startsWith('ATTENDANCE_')) return 'attendance';
  if (String(record.record_type).includes('DAMAGE')) return 'damageBrokenLog';
  if (String(record.record_type).startsWith('BUS_')) return 'transportActivity';
  if (record.source_module === 'Transport') return 'transportNotice';
  if (record.source_module === 'Library') return 'loan';
  if (record.source_module === 'Lab') return 'request';
  return 'record';
}

/** Adapts normalized Supabase rows to the existing workspace UI shape. */
export async function loadSupabaseWorkspace(user:{userId?:string;email?:string}) {
  const member=await resolveSupabaseMember({id:user.userId,email:user.email});
  const client=createSupabaseServerClient();
  const [studentsResult,classesResult,recordsResult,notificationsResult,membershipsResult]=await Promise.all([
    client.from('students').select('id,external_id,grade,house,profiles(display_name)').eq('organization_id',member.organizationId),
    client.from('classes').select('id,external_id,title,grade,subject').eq('organization_id',member.organizationId),
    client.from('tracked_records').select('*').eq('organization_id',member.organizationId).order('created_at',{ascending:false}),
    client.from('notifications').select('*').eq('organization_id',member.organizationId).eq('user_id',member.id).order('created_at',{ascending:false}),
    member.teacherId ? client.from('class_memberships').select('class_id').eq('organization_id',member.organizationId).eq('teacher_id',member.teacherId) : Promise.resolve({data:[],error:null}),
  ]);
  for (const result of [studentsResult,classesResult,recordsResult,notificationsResult,membershipsResult]) if(result.error) throw result.error;
  const permittedClassIds=new Set((membershipsResult.data||[]).map((m:any)=>m.class_id));
  const records=(recordsResult.data||[]).filter((record:any)=>{
    if(member.role==='Admin' || member.role==='Head of School') return true;
    if(member.role==='Student') return record.student_id===member.studentId && record.visibility?.studentVisible===true;
    if(member.role==='Teacher') return permittedClassIds.has(record.class_id) || record.teacher_id===member.teacherId;
    if(member.role==='Lab Assistant') return record.source_module==='Lab';
    if(member.role==='Library Assistant') return record.source_module==='Library';
    if(member.role==='Transport Staff') return record.source_module==='Transport';
    return false;
  });
  const rows:any[]=[
    ...(studentsResult.data||[]).map((s:any)=>({id:s.id,kind:'student',name:s.profiles?.display_name || s.external_id,quantity:1,data:{grade:s.grade,house:s.house}})),
    ...(classesResult.data||[]).map((c:any)=>({id:c.id,kind:'class',name:c.title,quantity:1,data:{class:c.title,grade:c.grade,subject:c.subject}})),
    ...records.map((r:any)=>({id:r.id,kind:kindFor(r),name:r.body?.title || r.labels?.[0] || r.record_type,quantity:1,data:{...r.body,id:r.id,organizationId:r.organization_id,recordType:r.record_type,sourceModule:r.source_module,status:r.status,tags:r.tags||[],labels:r.labels||[],metadata:r.metadata||{},relatedEntityRefs:r.related_entity_refs||[],visibility:r.visibility||{},studentId:r.student_id,classId:r.class_id,teacherId:r.teacher_id,assetId:r.asset_id,createdAt:r.created_at,updatedAt:r.updated_at,createdBy:r.created_by}})),
    ...(notificationsResult.data||[]).map((n:any)=>({id:n.id,kind:'notification',name:n.title,quantity:1,data:{description:n.message,read:n.read,type:n.type,sourceModule:n.source_module,createdAt:n.created_at,tags:n.tags||[]}})),
  ];
  return { rows, contacts:[], member, audit:[], members:(member.role==='Admin' || member.role==='Head of School')?[member]:[], masterRows:(member.role==='Admin' || member.role==='Head of School') ? rows : [], refreshedAt:new Date().toISOString() };
}
