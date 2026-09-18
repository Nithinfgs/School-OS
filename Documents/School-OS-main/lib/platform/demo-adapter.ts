import type { ActivityEvent, AuditTrail, BaseTrackedEntity, BorrowedAssetTracking, DamageBrokenLog } from '../tracking';
import { demoTrackedEntities } from './demo-data';
import type { ActivityRepository, AuditRepository, DataPlatform, EntityRepository, NotificationEntity, QueryFilters, StudentRepository } from './contracts';

const matches = (row: any, f: QueryFilters = {}) => {
  const haystack = `${row.title || ''} ${row.description || ''} ${(row.labels || []).join(' ')}`.toLowerCase();
  const when = row.dateTime || row.occurredAt || row.createdAt;
  return (!f.module || row.sourceModule === f.module || row.module === f.module)
    && (!f.recordType || row.recordType === f.recordType)
    && (!f.status || row.status === f.status)
    && (!f.studentId || row.studentId === f.studentId || row.metadata?.studentId === f.studentId)
    && (!f.teacherId || row.teacherId === f.teacherId || row.staffId === f.teacherId)
    && (!f.classId || row.classId === f.classId || row.metadata?.classId === f.classId)
    && (!f.assetId || row.assetId === f.assetId)
    && (!f.tags?.length || f.tags.every((tag) => row.tags?.includes(tag)))
    && (!f.search || haystack.includes(f.search.toLowerCase()))
    && (!f.dateRange?.from || String(when) >= f.dateRange.from)
    && (!f.dateRange?.to || String(when) <= f.dateRange.to);
};

class MemoryRepository<T extends BaseTrackedEntity = BaseTrackedEntity> implements EntityRepository<T> {
  constructor(protected rows: T[]) {}
  async get(id:string) { return this.rows.find((row) => row.id === id) || null; }
  async list(filters?:QueryFilters) { return this.rows.filter((row) => matches(row, filters)); }
  async save(entity:T) { const index=this.rows.findIndex((row)=>row.id===entity.id); if(index>=0)this.rows[index]=entity; else this.rows.unshift(entity); return entity; }
  async update(id:string, changes:Partial<T>) { const row=await this.get(id); if(!row) throw new Error(`Record ${id} was not found`); return this.save({...row,...changes,updatedAt:new Date().toISOString()} as T); }
}
class MemoryStudentRepository extends MemoryRepository implements StudentRepository {
  async reports(studentId:string, filters?:QueryFilters) { return this.rows.filter((row:any) => (row.studentId===studentId || row.metadata?.studentId===studentId) && matches(row,{...filters,studentId})); }
}
class MemoryLibraryRepository extends MemoryRepository {
  async issue(record:BorrowedAssetTracking) { await this.save(record); return record; }
  async returnAsset(id:string, conditionIn?:string) { const row=await this.get(id) as BorrowedAssetTracking|null; if(!row) throw new Error(`Borrowed asset ${id} was not found`); return this.update(id,{status:'Returned',returnedAt:new Date().toISOString(),conditionIn} as any) as Promise<BorrowedAssetTracking>; }
}
class MemoryLabRepository extends MemoryRepository { usage(filters?:QueryFilters) { return this.list({...filters,module:'Lab'}); } }
class MemoryTransportRepository extends MemoryRepository { arrivals(filters?:QueryFilters) { return this.list({...filters,module:'Transport',recordType:'BUS_ARRIVAL'}); } departures(filters?:QueryFilters) { return this.list({...filters,module:'Transport',recordType:'BUS_DEPARTURE'}); } notices(filters?:QueryFilters) { return this.list({...filters,module:'Transport',recordType:'TRANSPORT_NOTICE'}); } }
class MemoryActivityRepository implements ActivityRepository { constructor(private rows:ActivityEvent[]=[]){} async emit(e:ActivityEvent){this.rows.unshift(e);} async list(){return [...this.rows];} }
class MemoryAuditRepository implements AuditRepository { constructor(private rows:AuditTrail[]=[]){} async append(e:AuditTrail){this.rows.unshift(e);} async list(){return [...this.rows];} }

/** Dependency injection boundary. Replace this factory with an API/database adapter later. */
export function createDemoDataPlatform(): DataPlatform {
  const rows=demoTrackedEntities();
  return {
    students:new MemoryStudentRepository(rows), teachers:new MemoryRepository(rows), attendance:new MemoryRepository(rows), assignments:new MemoryRepository(rows),
    library:new MemoryLibraryRepository(rows), labs:new MemoryLabRepository(rows), transport:new MemoryTransportRepository(rows),
    damage:new MemoryRepository(rows.filter((row:any)=>row.assetType) as DamageBrokenLog[]),
    inquiries:new MemoryRepository(rows), calendar:new MemoryRepository(rows), notifications:new MemoryRepository<NotificationEntity>([]),
    activity:new MemoryActivityRepository(), audit:new MemoryAuditRepository(),
  };
}
