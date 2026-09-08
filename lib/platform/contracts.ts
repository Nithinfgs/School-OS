import type { ActivityEvent, AuditTrail, BaseTrackedEntity, BorrowedAssetTracking, DamageBrokenLog, TrackingModule } from '../tracking';

export type EntityId = string;
export interface EntityRef { type: string; id: EntityId }
export interface QueryFilters { module?: TrackingModule; recordType?: string; tags?: string[]; status?: string; dateRange?: { from?: string; to?: string }; studentId?: string; teacherId?: string; classId?: string; grade?: string; department?: string; assetId?: string; search?: string }
export interface NotificationEntity extends BaseTrackedEntity { userId: string; type: string; title: string; message: string; sourceEntityType: string; sourceEntityId: string; read: boolean }

export interface EntityRepository<T extends BaseTrackedEntity = BaseTrackedEntity> { get(id: EntityId): Promise<T | null>; list(filters?: QueryFilters): Promise<T[]>; save(entity: T): Promise<T>; update(id: EntityId, changes: Partial<T>): Promise<T>; }
export interface StudentRepository extends EntityRepository { reports(studentId: string, filters?: QueryFilters): Promise<BaseTrackedEntity[]> }
export interface TeacherRepository extends EntityRepository {}
export interface AttendanceRepository extends EntityRepository {}
export interface AssignmentRepository extends EntityRepository {}
export interface LibraryRepository extends EntityRepository { issue(record: BorrowedAssetTracking): Promise<BorrowedAssetTracking>; returnAsset(id: EntityId, conditionIn?: string): Promise<BorrowedAssetTracking> }
export interface LabRepository extends EntityRepository { usage(filters?: QueryFilters): Promise<BaseTrackedEntity[]> }
export interface DamageRepository extends EntityRepository<DamageBrokenLog> {}
export interface InquiryRepository extends EntityRepository {}
export interface CalendarRepository extends EntityRepository {}
export interface TransportRepository extends EntityRepository { arrivals(filters?: QueryFilters): Promise<BaseTrackedEntity[]>; departures(filters?: QueryFilters): Promise<BaseTrackedEntity[]>; notices(filters?: QueryFilters): Promise<BaseTrackedEntity[]>; }
export interface NotificationRepository extends EntityRepository<NotificationEntity> {}
export interface ReportCycleRepository extends EntityRepository { reports(cycleId: string, filters?: QueryFilters): Promise<BaseTrackedEntity[]>; }
export interface ActivityRepository { emit(event: ActivityEvent): Promise<void>; list(filters?: QueryFilters): Promise<ActivityEvent[]> }
export interface AuditRepository { append(entry: AuditTrail): Promise<void>; list(filters?: QueryFilters): Promise<AuditTrail[]> }
export type DataPlatform = { students: StudentRepository; teachers: TeacherRepository; attendance: AttendanceRepository; assignments: AssignmentRepository; library: LibraryRepository; labs: LabRepository; transport: TransportRepository; damage: DamageRepository; inquiries: InquiryRepository; calendar: CalendarRepository; notifications: NotificationRepository; activity: ActivityRepository; audit: AuditRepository; reportCards?: ReportCycleRepository };
