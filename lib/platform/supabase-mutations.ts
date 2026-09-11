import { RecordRegistry, trackedRecord } from '../tracking';
import { createDataPlatform } from './index';
import { resolveSupabaseMember } from './supabase-auth';
import { createSupabaseServerClient } from './supabase-adapter';

const actionPolicy:Record<string,string[]>={
  attendance:['Teacher','Admin'], studentRecord:['Teacher','Admin'], behaviorReport:['Teacher','Admin'],
  transportNotice:['Teacher','Transport Staff','Admin'], grade:['Teacher','Admin'],
  submit:['Student','Admin'], request:['Student','Teacher','Lab Assistant','Library Assistant','Admin'],
  calendarEvent:['Head of School','Admin'], inquiryUpdate:['Head of School','Admin','Teacher','Transport Staff','Library Assistant','Lab Assistant'],
  busArrival:['Transport Staff','Admin'], busDeparture:['Transport Staff','Admin'], transportNoticeUpdate:['Transport Staff','Admin'],
};
function recordTypeFor(action:string,payload:any) {
  if(action==='attendance') return payload.status==='Late'||payload.data?.status==='Late'?RecordRegistry.ATTENDANCE_LATE:RecordRegistry.ATTENDANCE_MARK;
  if(action==='behaviorReport') return RecordRegistry.STUDENT_BEHAVIOUR;
  if(action==='studentRecord') return String(payload.category||'').toLowerCase().includes('positive')?RecordRegistry.STUDENT_POSITIVE:'STUDENT_RECORD';
  if(action==='transportNotice') return RecordRegistry.TRANSPORT_NOTICE;
  if(action==='submit') return RecordRegistry.ASSIGNMENT_SUBMITTED;
  if(action==='grade') return RecordRegistry.ASSIGNMENT_GRADED;
  if(action==='request') return payload.type==='library'?RecordRegistry.ORDER_CREATED:RecordRegistry.LAB_REQUEST;
  if(action==='busArrival') return payload.status==='Late'||payload.data?.status==='Late'?RecordRegistry.BUS_LATE:RecordRegistry.BUS_ARRIVAL;
  if(action==='busDeparture') return payload.status==='LateDeparture'||payload.data?.status==='LateDeparture'?RecordRegistry.BUS_DEPARTURE_DELAY:RecordRegistry.BUS_DEPARTURE;
  if(action==='transportNoticeUpdate') return payload.status==='Resolved'||payload.data?.status==='Resolved'?RecordRegistry.TRANSPORT_NOTICE_RESOLVED:RecordRegistry.TRANSPORT_NOTICE_ACKNOWLEDGED;
  return 'SCHOOL_ACTION';
}
function moduleFor(action:string,payload:any):any { if(['transportNotice','busArrival','busDeparture','transportNoticeUpdate'].includes(action))return 'Transport'; if(['attendance','studentRecord','behaviorReport'].includes(action))return 'Classroom'; if(['submit','grade'].includes(action))return 'Academics'; return payload.type==='library'?'Library':'Lab'; }

/** Server-side demo-compatible mutation bridge for the major workspace actions. */
export async function handleSupabaseWorkspaceMutation(payload:any,user:{userId?:string;email?:string}) {
  const member=await resolveSupabaseMember({id:user.userId,email:user.email});
  const allowed=actionPolicy[payload.action];
  if(allowed && !allowed.includes(member.role)) throw new Error('FORBIDDEN');
  if (payload.action === 'notificationRead' || payload.action === 'read') {
    const client=createSupabaseServerClient();
    const { error } = await client.from('notifications').update({ read: payload.read !== false }).eq('id', payload.id).eq('organization_id', member.organizationId).eq('user_id', member.id);
    if (error) throw error;
    return { ok: true, id: payload.id };
  }
  if (payload.action === 'notificationsReadAll') {
    const client=createSupabaseServerClient();
    const { error } = await client.from('notifications').update({ read: true }).eq('organization_id', member.organizationId).eq('user_id', member.id).eq('read', false);
    if (error) throw error;
    return { ok: true };
  }
  const platform=createDataPlatform();
  if (payload.action === 'calendarEvent') {
    if (payload.data?.status === 'Deleted' && payload.data?.id) {
      const existing = await platform.calendar.get(payload.data.id);
      if (!existing) throw new Error('Calendar event was not found');
      const saved = await platform.calendar.update(existing.id, { status: 'Deleted', updatedBy: member.id } as any);
      await platform.audit.append({ organizationId: member.organizationId, actorId: member.id, actorRole: member.role, entityType: 'calendar_event', entityId: saved.id, action: 'delete', before: existing, after: saved, timestamp: saved.updatedAt });
      return { ok: true, id: saved.id };
    }
    const item = trackedRecord({ id: payload.data?.id || crypto.randomUUID(), ...payload.data, title: payload.data?.title || 'HOS event', sourceModule: 'Calendar', createdBy: member.id }, { organizationId: member.organizationId, actorId: member.id, module: 'Calendar', recordType: 'CALENDAR_EVENT', status: 'Scheduled', labels: ['Calendar event'], visibility: { adminVisible: true, hosVisible: true, teacherVisible: payload.data?.visibility === 'Shared' } });
    const saved = await platform.calendar.save(item);
    await platform.activity.emit({ id: crypto.randomUUID(), organizationId: member.organizationId, eventType: 'CALENDAR_EVENT', module: 'Calendar', actorId: member.id, actorRole: member.role, subjectType: 'calendar_event', subjectId: saved.id, entityType: 'tracked_record', entityId: saved.id, tags: saved.tags, metadata: saved.metadata, occurredAt: saved.updatedAt });
    await platform.audit.append({ organizationId: member.organizationId, actorId: member.id, actorRole: member.role, entityType: 'calendar_event', entityId: saved.id, action: 'create', after: saved, timestamp: saved.updatedAt });
    return { ok: true, id: saved.id, item: saved };
  }
  if (payload.action === 'inquiryUpdate') {
    const inquiry = await platform.inquiries.get(payload.data?.id);
    if (!inquiry) throw new Error('Inquiry was not found');
    const saved = await platform.inquiries.update(inquiry.id, { metadata: { ...inquiry.metadata, ...payload.data }, status: payload.data?.status || inquiry.status, updatedBy: member.id, updatedAt: new Date().toISOString() } as any);
    await platform.activity.emit({ id: crypto.randomUUID(), organizationId: member.organizationId, eventType: 'INQUIRY_UPDATE', module: 'Inquiries', actorId: member.id, actorRole: member.role, subjectType: 'inquiry', subjectId: saved.id, entityType: 'tracked_record', entityId: saved.id, tags: saved.tags, metadata: saved.metadata, occurredAt: saved.updatedAt });
    await platform.audit.append({ organizationId: member.organizationId, actorId: member.id, actorRole: member.role, entityType: 'inquiry', entityId: saved.id, action: 'update', after: saved, timestamp: saved.updatedAt });
    return { ok: true, id: saved.id, item: saved };
  }
  const recordType=recordTypeFor(payload.action,payload);
  const module=moduleFor(payload.action,payload);
  const entity=trackedRecord({id:crypto.randomUUID(),...payload.data,...payload,studentId:payload.studentId||payload.data?.studentId||member.studentId||undefined,classId:payload.classId||payload.class||payload.data?.classId||payload.data?.class||undefined,title:payload.name||payload.title||payload.category||'SchoolOS action',description:payload.description||payload.whatHappened||payload.data?.description||'',createdBy:member.id},{organizationId:member.organizationId,actorId:member.id,module,recordType,status:payload.status||payload.data?.status||'Recorded',studentId:payload.studentId||payload.data?.studentId||member.studentId, classId:payload.classId||payload.class||payload.data?.classId, labels:[module,recordType], visibility:{studentVisible:payload.studentVisible===true || payload.action==='attendance' || payload.action==='submit',teacherVisible:true,adminVisible:true,hosVisible:true}});
  const repository=module==='Lab'?platform.labs:module==='Library'?platform.library:module==='Transport'?platform.transport:module==='Academics'?platform.assignments:module==='Classroom'?platform.attendance:platform.students;
  const saved=await repository.save(entity);
  await platform.activity.emit({id:crypto.randomUUID(),organizationId:member.organizationId,eventType:recordType,module,actorId:member.id,actorRole:member.role,subjectType:'record',subjectId:saved.id,relatedStudentId:(saved as any).studentId,relatedClassId:(saved as any).classId,entityType:'tracked_record',entityId:saved.id,tags:saved.tags,metadata:saved.metadata,occurredAt:saved.updatedAt});
  await platform.audit.append({organizationId:member.organizationId,actorId:member.id,actorRole:member.role,entityType:'tracked_record',entityId:saved.id,action:`Created ${recordType}`,after:saved,timestamp:saved.updatedAt});
  return {ok:true,id:saved.id,item:saved};
}
