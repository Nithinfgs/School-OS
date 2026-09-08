import { RecordRegistry, activityEvent, trackedRecord, type BaseTrackedEntity, type BorrowedAssetTracking, type DamageBrokenLog } from '../tracking';
import { canViewTrackedRecord } from './permissions';
import type { DataPlatform, QueryFilters } from './contracts';

export class StudentService { constructor(private data: DataPlatform) {} async getReports(studentId:string, filters?:QueryFilters) { const rows = await this.data.students.reports(studentId, filters); return rows.filter((row) => canViewTrackedRecord(row, { role:'Student', studentId })); } }
export class TeacherService { constructor(private data:DataPlatform) {} get(id:string){return this.data.teachers.get(id);} list(filters?:QueryFilters){return this.data.teachers.list(filters);} }
export class AttendanceService { constructor(private data:DataPlatform) {} async markAttendance(input:Record<string,any>, actor:{id:string;role:string}) { const entity=trackedRecord(input,{actorId:actor.id,module:'Classroom',recordType:input.status==='Late'?RecordRegistry.ATTENDANCE_LATE:RecordRegistry.ATTENDANCE_MARK,studentId:input.studentId,classId:input.classId,visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true}}); const saved=await this.data.attendance.save(entity); await this.data.activity.emit(activityEvent(saved,{actorId:actor.id,actorRole:actor.role,studentId:input.studentId,classId:input.classId})); return saved; } }
export class AssignmentService { constructor(private data:DataPlatform) {} save(entity:BaseTrackedEntity){return this.data.assignments.save(entity);} list(filters?:QueryFilters){return this.data.assignments.list(filters);} }
export class LibraryService { constructor(private data:DataPlatform) {} issueBook(record:BorrowedAssetTracking){return this.data.library.issue(record);} returnBook(id:string,conditionIn?:string){return this.data.library.returnAsset(id,conditionIn);} }
export class LabService { constructor(private data:DataPlatform) {} getUsage(filters?:QueryFilters){return this.data.labs.usage(filters);} save(entity:BaseTrackedEntity){return this.data.labs.save(entity);} }
export class TransportService { constructor(private data:DataPlatform) {} arrivals(filters?:QueryFilters){return this.data.transport.arrivals(filters);} departures(filters?:QueryFilters){return this.data.transport.departures(filters);} notices(filters?:QueryFilters){return this.data.transport.notices(filters);} save(entity:BaseTrackedEntity){return this.data.transport.save(entity);} }
export class InquiryService { constructor(private data:DataPlatform) {} async reply(inquiryId:string,data:Record<string,unknown>){const current=await this.data.inquiries.get(inquiryId);if(!current)throw new Error(`Inquiry ${inquiryId} was not found`);return this.data.inquiries.update(inquiryId,{metadata:{...current.metadata,replies:[...((current.metadata.replies as unknown[])||[]),data]},updatedAt:new Date().toISOString()});} }
export class DamageService { constructor(private data:DataPlatform) {} async report(input:Partial<DamageBrokenLog>, actor:{id:string;role:string}) { const entity = trackedRecord(input as any, { actorId:actor.id, module:input.module, recordType:input.recordType, studentId:input.studentId, assetId:input.assetId, status:input.status, visibility:{ studentVisible:input.studentVisible, teacherVisible:true, adminVisible:true, hosVisible:true } }) as DamageBrokenLog; const saved = await this.data.damage.save(entity); await this.data.activity.emit(activityEvent(saved, { actorId:actor.id, actorRole:actor.role, studentId:saved.studentId, classId:saved.classId })); await this.data.audit.append({ actorId:actor.id, actorRole:actor.role, entityType:'DamageRecord', entityId:saved.id, action:'create', after:saved, timestamp:saved.createdAt, organizationId:saved.organizationId }); return saved; } }
export class TrackingQueryService { constructor(private data:DataPlatform) {} search(filters:QueryFilters) { return this.data.students.list(filters); } }
/** Organization-scoped aggregation entry points.  Their repositories can be swapped
 * for targeted Supabase queries without changing record lookup screens. */
export class TeacherRecordService {
  constructor(private data:DataPlatform) {}
  async getFullRecord(teacherId:string, filters:QueryFilters = {}) {
    const [teacher, activity, audit] = await Promise.all([this.data.teachers.get(teacherId), this.data.activity.list({...filters, teacherId}), this.data.audit.list({...filters, teacherId})]);
    return { teacher, activity, audit };
  }
  search(filters:QueryFilters = {}) { return this.data.teachers.list(filters); }
}
export class StudentRecordService {
  constructor(private data:DataPlatform) {}
  async getFullRecord(studentId:string, filters:QueryFilters = {}) {
    const [student, reports, activity, audit] = await Promise.all([this.data.students.get(studentId), this.data.students.reports(studentId, filters), this.data.activity.list({...filters, studentId}), this.data.audit.list({...filters, studentId})]);
    return { student, reports, activity, audit };
  }
  search(filters:QueryFilters = {}) { return this.data.students.list(filters); }
}
export function createDomainServices(data:DataPlatform) { return { students:new StudentService(data), teachers:new TeacherService(data), teacherRecords:new TeacherRecordService(data), studentRecords:new StudentRecordService(data), attendance:new AttendanceService(data), assignments:new AssignmentService(data), library:new LibraryService(data), labs:new LabService(data), transport:new TransportService(data), inquiries:new InquiryService(data), damage:new DamageService(data), tracking:new TrackingQueryService(data) }; }
