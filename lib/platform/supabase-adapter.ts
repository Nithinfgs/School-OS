import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { activityEvent, type ActivityEvent, type AuditTrail, type BaseTrackedEntity, type BorrowedAssetTracking, type DamageBrokenLog } from '../tracking';
import { assertSupabaseServerConfig, supabaseConfig } from './config';
import type { ActivityRepository, AuditRepository, DataPlatform, EntityRepository, NotificationEntity, QueryFilters, StudentRepository } from './contracts';

type StoredRecord = {
  id:string; organization_id:string; entity_type:string; record_type:string; source_module:string; status?:string;
  tags:string[]; labels:string[]; metadata:Record<string,unknown>; related_entity_refs:{type:string;id:string}[];
  visibility:Record<string,unknown>; body:Record<string,unknown>; student_id?:string; teacher_id?:string; class_id?:string; asset_id?:string;
  created_at:string; updated_at:string; created_by:string; updated_by?:string; audit_id?:string;
};

function toDomain(row:StoredRecord):BaseTrackedEntity {
  return {...row.body, id:row.id, organizationId:row.organization_id, recordType:row.record_type, sourceModule:row.source_module as BaseTrackedEntity['sourceModule'], status:row.status, tags:row.tags||[], labels:row.labels||[], metadata:row.metadata||{}, relatedEntityRefs:row.related_entity_refs||[], visibility:row.visibility, createdAt:row.created_at, updatedAt:row.updated_at, createdBy:row.created_by, updatedBy:row.updated_by, auditId:row.audit_id} as BaseTrackedEntity;
}
function toStored(entity:BaseTrackedEntity, entityType='tracked_record') {
  const body={...entity}; delete (body as any).organizationId; delete (body as any).recordType; delete (body as any).sourceModule; delete (body as any).tags; delete (body as any).labels; delete (body as any).metadata; delete (body as any).relatedEntityRefs; delete (body as any).visibility;
  return {id:entity.id,organization_id:entity.organizationId,entity_type:entityType,record_type:entity.recordType,source_module:entity.sourceModule,status:entity.status||null,tags:entity.tags,labels:entity.labels,metadata:entity.metadata,related_entity_refs:entity.relatedEntityRefs,visibility:entity.visibility||{},body,student_id:(entity as any).studentId || entity.metadata.studentId || null,teacher_id:(entity as any).teacherId || (entity as any).staffId || null,class_id:(entity as any).classId || entity.metadata.classId || null,asset_id:(entity as any).assetId || null,created_by:entity.createdBy,updated_by:entity.updatedBy||null,audit_id:entity.auditId||null};
}
function applyFilters(query:any, filters:QueryFilters={}) {
  if(filters.module) query=query.eq('source_module',filters.module);
  if(filters.recordType) query=query.eq('record_type',filters.recordType);
  if(filters.status) query=query.eq('status',filters.status);
  if(filters.studentId) query=query.eq('student_id',filters.studentId);
  if(filters.teacherId) query=query.eq('teacher_id',filters.teacherId);
  if(filters.classId) query=query.eq('class_id',filters.classId);
  if(filters.assetId) query=query.eq('asset_id',filters.assetId);
  if(filters.tags?.length) query=query.contains('tags',filters.tags);
  if(filters.dateRange?.from) query=query.gte('created_at',filters.dateRange.from);
  if(filters.dateRange?.to) query=query.lte('created_at',filters.dateRange.to);
  if(filters.search) query=query.or(`body->>title.ilike.%${filters.search}%,body->>description.ilike.%${filters.search}%`);
  return query;
}

/** Server-only repository adapter. React components must use services, never this client. */
class SupabaseEntityRepository<T extends BaseTrackedEntity=BaseTrackedEntity> implements EntityRepository<T> {
  constructor(protected client:SupabaseClient, private entityType='tracked_record') {}
  async get(id:string){const {data,error}=await this.client.from('tracked_records').select('*').eq('id',id).single();if(error && error.code!=='PGRST116')throw error;return data?toDomain(data as StoredRecord) as T:null;}
  async list(filters?:QueryFilters){const {data,error}=await applyFilters(this.client.from('tracked_records').select('*').eq('entity_type',this.entityType),filters).order('created_at',{ascending:false});if(error)throw error;return (data||[]).map((row:unknown)=>toDomain(row as StoredRecord) as T);}
  async save(entity:T){const {data,error}=await this.client.from('tracked_records').upsert(toStored(entity,this.entityType)).select().single();if(error)throw error;return toDomain(data as StoredRecord) as T;}
  async update(id:string,changes:Partial<T>){const current=await this.get(id);if(!current)throw new Error(`Record ${id} was not found`);return this.save({...current,...changes,updatedAt:new Date().toISOString()} as T);}
}
class SupabaseStudentRepository extends SupabaseEntityRepository implements StudentRepository { async reports(studentId:string,filters?:QueryFilters){return this.list({...filters,studentId});} }
class SupabaseLibraryRepository extends SupabaseEntityRepository { async issue(record:BorrowedAssetTracking){const saved=await this.save(record);const {error}=await this.client.from('borrowed_assets').upsert({id:record.id,organization_id:record.organizationId,asset_id:record.assetId,asset_type:record.assetType,borrower_type:record.borrowerType,borrower_id:record.borrowerId,student_id:record.studentId||null,teacher_id:record.teacherId||null,class_id:record.classId||null,issued_by:record.issuedBy,issued_at:record.issuedAt,due_at:record.dueAt||null,returned_at:record.returnedAt||null,status:record.status,condition_out:record.conditionOut||null,condition_in:record.conditionIn||null,quantity:record.quantity,tags:record.tags});if(error)throw error;return saved as BorrowedAssetTracking;} async returnAsset(id:string,conditionIn?:string){const saved=await this.update(id,{status:'Returned',returnedAt:new Date().toISOString(),conditionIn} as any) as BorrowedAssetTracking;const {error}=await this.client.from('borrowed_assets').update({status:'Returned',returned_at:saved.returnedAt,condition_in:conditionIn||null}).eq('id',id);if(error)throw error;return saved;} }
class SupabaseLabRepository extends SupabaseEntityRepository { usage(filters?:QueryFilters){return this.list({...filters,module:'Lab'});} }
class SupabaseTransportRepository extends SupabaseEntityRepository {
  arrivals(filters?:QueryFilters){return this.list({...filters,module:'Transport',recordType:'BUS_ARRIVAL'});}
  departures(filters?:QueryFilters){return this.list({...filters,module:'Transport',recordType:'BUS_DEPARTURE'});}
  notices(filters?:QueryFilters){return this.list({...filters,module:'Transport',recordType:'TRANSPORT_NOTICE'});}
  async save(entity:any) {
    const saved=await super.save(entity);
    const details:any=entity;
    if(['BUS_ARRIVAL','BUS_LATE'].includes(entity.recordType) && details.busId) {
      const {error}=await this.client.from('bus_arrival_records').upsert({organization_id:entity.organizationId,bus_id:details.busId,arrival_date:details.date,scheduled_arrival_time:details.scheduledArrivalTime||null,actual_arrival_time:details.actualTime||null,arrival_status:details.status,late_minutes:details.lateMinutes||null,late_reason:details.lateReason||null,notes:details.notes||null,recorded_by:entity.createdBy,tracked_record_id:entity.id},{onConflict:'organization_id,bus_id,arrival_date'}); if(error) throw error;
      await this.client.from('transport_activity').insert({organization_id:entity.organizationId,activity_type:entity.recordType,bus_id:details.busId,actor_id:entity.createdBy,details:{status:details.status,time:details.actualTime,lateMinutes:details.lateMinutes,reason:details.lateReason},tracked_record_id:entity.id});
    } else if(['BUS_DEPARTURE','BUS_DEPARTURE_DELAY'].includes(entity.recordType) && details.busId) {
      const {error}=await this.client.from('bus_departure_records').upsert({organization_id:entity.organizationId,bus_id:details.busId,departure_date:details.date,scheduled_departure_time:details.scheduledDepartureTime||null,actual_departure_time:details.actualTime||null,departure_status:details.status,delay_minutes:details.delayMinutes||null,delay_reason:details.delayReason||null,notes:details.notes||null,recorded_by:entity.createdBy,tracked_record_id:entity.id},{onConflict:'organization_id,bus_id,departure_date'}); if(error) throw error;
      await this.client.from('transport_activity').insert({organization_id:entity.organizationId,activity_type:entity.recordType,bus_id:details.busId,actor_id:entity.createdBy,details:{status:details.status,time:details.actualTime,delayMinutes:details.delayMinutes,reason:details.delayReason},tracked_record_id:entity.id});
    } else if(entity.recordType==='TRANSPORT_NOTICE' && details.studentId) {
      const {error}=await this.client.from('transport_notices').upsert({id:entity.id,organization_id:entity.organizationId,student_id:details.studentId,notice_date:details.date,route:details.route||null,bus:details.bus||details.busId||null,change_type:details.changeType,reason:details.reason||null,pickup:details.pickup||null,dropoff:details.dropoff||null,notes:details.notes||null,status:details.status||'Submitted',submitted_by:entity.createdBy,submitted_at:details.submittedAt||entity.createdAt,student_visible:entity.visibility?.studentVisible !== false,tracked_record_id:entity.id},{onConflict:'organization_id,student_id,notice_date,change_type'}); if(error) throw error;
    } else if(['TRANSPORT_NOTICE_ACKNOWLEDGED','TRANSPORT_NOTICE_RESOLVED'].includes(entity.recordType) && details.noticeId) {
      const {error}=await this.client.from('transport_notices').update({status:details.status,operational_note:details.operationalNote||null}).eq('id',details.noticeId).eq('organization_id',entity.organizationId); if(error) throw error;
    }
    return saved;
  }
}
class SupabaseActivityRepository implements ActivityRepository { constructor(private client:SupabaseClient){} async emit(event:ActivityEvent){const {error}=await this.client.from('activity_events').upsert({id:event.id,organization_id:event.organizationId,event_type:event.eventType,module:event.module,actor_id:event.actorId,actor_role:event.actorRole,subject_type:event.subjectType,subject_id:event.subjectId,related_student_id:event.relatedStudentId||null,related_teacher_id:event.relatedTeacherId||null,related_class_id:event.relatedClassId||null,entity_type:event.entityType,entity_id:event.entityId,tags:event.tags,metadata:event.metadata,occurred_at:event.occurredAt});if(error)throw error;} async list(filters?:QueryFilters){let q=this.client.from('activity_events').select('*').order('occurred_at',{ascending:false});if(filters?.module)q=q.eq('module',filters.module);if(filters?.studentId)q=q.eq('related_student_id',filters.studentId);const {data,error}=await q;if(error)throw error;return (data||[]).map((row:any)=>({id:row.id,organizationId:row.organization_id,eventType:row.event_type,module:row.module,actorId:row.actor_id,actorRole:row.actor_role,subjectType:row.subject_type,subjectId:row.subject_id,relatedStudentId:row.related_student_id,relatedTeacherId:row.related_teacher_id,relatedClassId:row.related_class_id,entityType:row.entity_type,entityId:row.entity_id,tags:row.tags||[],metadata:row.metadata||{},occurredAt:row.occurred_at}));} }
class SupabaseAuditRepository implements AuditRepository { constructor(private client:SupabaseClient){} async append(entry:AuditTrail){const {error}=await this.client.from('audit_logs').insert({organization_id:entry.organizationId,actor_id:entry.actorId,actor_role:entry.actorRole,entity_type:entry.entityType,entity_id:entry.entityId,action:entry.action,before:entry.before||null,after:entry.after||null,timestamp:entry.timestamp});if(error)throw error;} async list(){const {data,error}=await this.client.from('audit_logs').select('*').order('timestamp',{ascending:false});if(error)throw error;return (data||[]).map((r:any)=>({id:r.id,organizationId:r.organization_id,actorId:r.actor_id,actorRole:r.actor_role,entityType:r.entity_type,entityId:r.entity_id,action:r.action,before:r.before,after:r.after,timestamp:r.timestamp}));} }

export function createSupabaseServerClient(){assertSupabaseServerConfig();return createClient(supabaseConfig.url,supabaseConfig.secretKey,{auth:{autoRefreshToken:false,persistSession:false}});}
export function createSupabaseDataPlatform(client=createSupabaseServerClient()):DataPlatform { return {students:new SupabaseStudentRepository(client,'student_record'),teachers:new SupabaseEntityRepository(client,'teacher'),attendance:new SupabaseEntityRepository(client,'attendance'),assignments:new SupabaseEntityRepository(client,'assignment'),library:new SupabaseLibraryRepository(client,'library'),labs:new SupabaseLabRepository(client,'lab'),transport:new SupabaseTransportRepository(client,'transport'),damage:new SupabaseEntityRepository<DamageBrokenLog>(client,'damage'),inquiries:new SupabaseEntityRepository(client,'inquiry'),calendar:new SupabaseEntityRepository(client,'calendar'),notifications:new SupabaseEntityRepository<NotificationEntity>(client,'notification'),activity:new SupabaseActivityRepository(client),audit:new SupabaseAuditRepository(client)}; }
