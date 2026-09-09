/**
 * Shared, backend-ready tracking contracts. UI code talks to these shapes;
 * the current mock workspace is merely one repository adapter.
 */
export const RecordRegistry = {
  LIBRARY_BORROW: 'LIBRARY_BORROW', LIBRARY_RETURN: 'LIBRARY_RETURN', LIBRARY_RENEW: 'LIBRARY_RENEW',
  LIBRARY_DAMAGE: 'LIBRARY_DAMAGE', LIBRARY_LOSS: 'LIBRARY_LOSS',
  LAB_REQUEST: 'LAB_REQUEST', LAB_APPROVAL: 'LAB_APPROVAL', LAB_REJECTION: 'LAB_REJECTION',
  LAB_ISSUE: 'LAB_ISSUE', LAB_RETURN: 'LAB_RETURN', LAB_USAGE: 'LAB_USAGE', LAB_DAMAGE: 'LAB_DAMAGE',
  LAB_STOCK_CHANGE: 'LAB_STOCK_CHANGE', LAB_ORDER: 'LAB_ORDER', LAB_ORDER_RECEIVED: 'LAB_ORDER_RECEIVED',
  INVENTORY_TRANSACTION: 'INVENTORY_TRANSACTION', ATTENDANCE_MARK: 'ATTENDANCE_MARK',
  ATTENDANCE_PRESENT: 'ATTENDANCE_PRESENT', ATTENDANCE_ABSENT: 'ATTENDANCE_ABSENT',
  ATTENDANCE_LATE: 'ATTENDANCE_LATE', ATTENDANCE_EXCUSED: 'ATTENDANCE_EXCUSED', LATE_ARRIVAL: 'LATE_ARRIVAL',
  STUDENT_BEHAVIOUR: 'STUDENT_BEHAVIOUR', STUDENT_POSITIVE: 'STUDENT_POSITIVE', STUDENT_DAMAGE_REPORT: 'STUDENT_DAMAGE_REPORT',
  TRANSPORT_NOTICE: 'TRANSPORT_NOTICE', MAINTENANCE_REPORT: 'MAINTENANCE_REPORT',
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED', ASSIGNMENT_SUBMITTED: 'ASSIGNMENT_SUBMITTED', ASSIGNMENT_GRADED: 'ASSIGNMENT_GRADED',
  ACADEMIC_ASSIGNMENT: 'ACADEMIC_ASSIGNMENT', ACADEMIC_SUBMISSION: 'ACADEMIC_SUBMISSION', ACADEMIC_GRADE: 'ACADEMIC_GRADE',
  INQUIRY_CREATED: 'INQUIRY_CREATED', PARENT_INQUIRY_CREATED: 'PARENT_INQUIRY_CREATED', PARENT_INQUIRY_STUDENT_MATCHED: 'PARENT_INQUIRY_STUDENT_MATCHED', PARENT_INQUIRY_MATCH_REQUIRED: 'PARENT_INQUIRY_MATCH_REQUIRED', INQUIRY_REPLY: 'INQUIRY_REPLY', INQUIRY: 'INQUIRY',
  ORDER_CREATED: 'ORDER_CREATED', EXPENSE_RECORDED: 'EXPENSE_RECORDED', ORDER: 'ORDER', EXPENSE: 'EXPENSE',
  DAMAGE_BROKEN_LOG: 'DAMAGE_BROKEN_LOG',
  CALENDAR_EVENT: 'CALENDAR_EVENT', INQUIRY_UPDATE: 'INQUIRY_UPDATE',
  BUS_ARRIVAL: 'BUS_ARRIVAL', BUS_LATE: 'BUS_LATE', BUS_DEPARTURE: 'BUS_DEPARTURE', BUS_DEPARTURE_DELAY: 'BUS_DEPARTURE_DELAY',
  TRANSPORT_NOTICE_ACKNOWLEDGED: 'TRANSPORT_NOTICE_ACKNOWLEDGED', TRANSPORT_NOTICE_RESOLVED: 'TRANSPORT_NOTICE_RESOLVED',
  REPORT_CYCLE_CREATED: 'REPORT_CYCLE_CREATED', REPORT_DRAFT: 'REPORT_DRAFT', REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  REPORT_RETURNED: 'REPORT_RETURNED', REPORT_APPROVED: 'REPORT_APPROVED', REPORT_PUBLISHED: 'REPORT_PUBLISHED',
  ADMISSION_APPLICATION_CREATED: 'ADMISSION_APPLICATION_CREATED', ADMISSION_SUBMITTED: 'ADMISSION_SUBMITTED',
  ADMISSION_DOCUMENT_REQUESTED: 'ADMISSION_DOCUMENT_REQUESTED', ADMISSION_ASSESSMENT_SCHEDULED: 'ADMISSION_ASSESSMENT_SCHEDULED',
  ADMISSION_INTERVIEW_SCHEDULED: 'ADMISSION_INTERVIEW_SCHEDULED', ADMISSION_OFFERED: 'ADMISSION_OFFERED',
  ADMISSION_WAITLISTED: 'ADMISSION_WAITLISTED', ADMISSION_REJECTED: 'ADMISSION_REJECTED', ADMISSION_ACCEPTED: 'ADMISSION_ACCEPTED',
  STUDENT_ENROLLED: 'STUDENT_ENROLLED', ADMISSION_WITHDRAWN: 'ADMISSION_WITHDRAWN',
  STAFF_LEAVE_SUBMITTED: 'STAFF_LEAVE_SUBMITTED', STAFF_LEAVE_APPROVED: 'STAFF_LEAVE_APPROVED', STAFF_LEAVE_REJECTED: 'STAFF_LEAVE_REJECTED',
  SUBSTITUTION_ASSIGNED: 'SUBSTITUTION_ASSIGNED', SUBSTITUTION_CONFIRMED: 'SUBSTITUTION_CONFIRMED', SUBSTITUTION_COMPLETED: 'SUBSTITUTION_COMPLETED',
  PROCUREMENT_REQUEST_CREATED: 'PROCUREMENT_REQUEST_CREATED', PROCUREMENT_SUBMITTED: 'PROCUREMENT_SUBMITTED', PROCUREMENT_APPROVED: 'PROCUREMENT_APPROVED',
  PROCUREMENT_REJECTED: 'PROCUREMENT_REJECTED', PURCHASE_ORDER_CREATED: 'PURCHASE_ORDER_CREATED', PURCHASE_ORDER_ISSUED: 'PURCHASE_ORDER_ISSUED', PROCUREMENT_RECEIVED: 'PROCUREMENT_RECEIVED',
  STUDENT_DOCUMENT_REQUESTED: 'STUDENT_DOCUMENT_REQUESTED', STUDENT_DOCUMENT_APPROVED: 'STUDENT_DOCUMENT_APPROVED', STUDENT_DOCUMENT_GENERATED: 'STUDENT_DOCUMENT_GENERATED', STUDENT_DOCUMENT_RELEASED: 'STUDENT_DOCUMENT_RELEASED',
  VISITOR_PROFILE_CREATED: 'VISITOR_PROFILE_CREATED', VISIT_EXPECTED: 'VISIT_EXPECTED', VISIT_CHECKED_IN: 'VISIT_CHECKED_IN', VISIT_CHECKED_OUT: 'VISIT_CHECKED_OUT', VISIT_CANCELLED: 'VISIT_CANCELLED',
} as const;
export type RecordType = typeof RecordRegistry[keyof typeof RecordRegistry];
export type TrackingModule = 'Lab'|'Library'|'Classroom'|'Facilities'|'Sports'|'Technology'|'Transport'|'Academics'|'Calendar'|'Inquiries'|'Admissions'|'Procurement'|'Documents'|'Visitors'|'Student Services'|'Staff Leave'|'Other';
export type DamageStatus = 'Reported'|'UnderReview'|'ActionRequired'|'Resolved'|'Closed';
export type Visibility = { studentVisible?: boolean; parentVisible?: boolean; teacherVisible?: boolean; adminVisible?: boolean; hosVisible?: boolean; restricted?: boolean };
export type BaseTrackedEntity = { id:string; organizationId:string; createdAt:string; updatedAt:string; createdBy:string; updatedBy?:string; sourceModule:TrackingModule; recordType:RecordType|string; status?:string; tags:string[]; labels:string[]; metadata:Record<string,unknown>; relatedEntityRefs:{type:string;id:string}[]; auditId?:string; visibility?:Visibility };
export type DamageBrokenLog = BaseTrackedEntity & { studentId?:string; staffId?:string; classId?:string; module:TrackingModule; assetType:string; assetId?:string; assetName:string; quantity?:number; conditionBefore?:string; conditionAfter?:string; damageType:string; severity:string; description:string; dateTime:string; location?:string; reportedBy:string; assignedTo?:string; status:DamageStatus; studentVisible:boolean; actionTaken?:string; costEstimate?:string; resolution?:string };
export type ActivityEvent = { id:string; organizationId:string; eventType:RecordType|string; module:TrackingModule; actorId:string; actorRole:string; subjectType:string; subjectId:string; relatedStudentId?:string; relatedTeacherId?:string; relatedClassId?:string; entityType:string; entityId:string; tags:string[]; metadata:Record<string,unknown>; occurredAt:string };
export type BorrowedAssetTracking = BaseTrackedEntity & { assetId:string; assetType:string; borrowerType:string; borrowerId:string; studentId?:string; teacherId?:string; classId?:string; issuedBy:string; issuedAt:string; dueAt?:string; returnedAt?:string; conditionOut?:string; conditionIn?:string; quantity:number };
export type AuditTrail = { actorId:string; actorRole:string; entityType:string; entityId:string; action:string; before?:unknown; after?:unknown; timestamp:string; organizationId:string };

const slug = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function buildRecordTags(context: Record<string, any>) {
  const pairs: [string, any][] = [['organization',context.organizationId],['module',context.module||context.sourceModule],['type',context.recordType||context.type],['status',context.status],['student',context.studentId],['teacher',context.teacherId||context.staffId],['class',context.classId||context.class],['grade',context.grade],['department',context.department],['asset',context.assetId||context.assetName],['item',context.itemId||context.itemName],['category',context.category],['school-year',context.schoolYear]];
  return [...new Set(pairs.filter(([,value]) => value !== undefined && value !== null && value !== '').map(([key,value]) => `${key}:${slug(value)}`))];
}
export function trackedRecord<T extends Record<string, any>>(entity:T, context:Record<string,any> = {}): T & BaseTrackedEntity {
  const now = new Date().toISOString(); const organizationId = entity.organizationId || context.organizationId || 'schoolos-dev';
  const tags = [...new Set([...(entity.tags||[]), ...buildRecordTags({...context,...entity,organizationId})])];
  return {...entity, id: entity.id || context.id || `record-${Date.now()}`, organizationId, createdAt:entity.createdAt||now, updatedAt:now, createdBy:entity.createdBy||context.actorId||'system', sourceModule:entity.sourceModule||context.module||'Other', recordType:entity.recordType||context.recordType||'OTHER', status:entity.status||context.status, tags, labels:entity.labels||context.labels||[], metadata:{...(context.metadata||{}),...(entity.metadata||{})}, relatedEntityRefs:entity.relatedEntityRefs||context.relatedEntityRefs||[], visibility:{adminVisible:true,...(context.visibility||{}),...(entity.visibility||{})}} as T & BaseTrackedEntity;
}
export function activityEvent(entity: BaseTrackedEntity, context:Record<string,any> = {}): ActivityEvent { return { id:`event-${crypto.randomUUID?.()||Date.now()}`, organizationId:entity.organizationId, eventType:entity.recordType, module:entity.sourceModule, actorId:context.actorId||entity.createdBy, actorRole:context.actorRole||'System', subjectType:context.subjectType||'record', subjectId:context.subjectId||entity.id, relatedStudentId:context.studentId || (entity.metadata.studentId as string | undefined), relatedClassId:context.classId, entityType:context.entityType||'record', entityId:entity.id, tags:entity.tags, metadata:entity.metadata, occurredAt:context.occurredAt||entity.updatedAt }; }
export interface TrackingRepository { save(entity:BaseTrackedEntity):Promise<BaseTrackedEntity>; emit(event:ActivityEvent):Promise<void>; audit(entry:AuditTrail):Promise<void>; search(filters:Partial<Pick<BaseTrackedEntity,'recordType'|'status'|'tags'>> & {module?:TrackingModule; studentId?:string}):Promise<BaseTrackedEntity[]>; }
/** Adapter seam: replace this with the backend adapter when credentials exist. */
export class MockTrackingRepository implements TrackingRepository { constructor(private rows:any[], private events:any[], private audits:any[]) {} async save(entity:BaseTrackedEntity){this.rows.unshift(entity);return entity;} async emit(event:ActivityEvent){this.events.unshift(event);} async audit(entry:AuditTrail){this.audits.unshift(entry);} async search(filters:any){return this.rows.filter((row)=> (!filters.recordType||row.recordType===filters.recordType)&&(!filters.status||row.status===filters.status)&&(!filters.module||row.sourceModule===filters.module)&&(!filters.studentId||row.studentId===filters.studentId||row.metadata?.studentId===filters.studentId)&&(!filters.tags||filters.tags.every((tag:string)=>(row.tags||[]).includes(tag))));} }
