import type { BorrowedAssetTracking, DamageBrokenLog } from '../tracking';
const required = (data: any, keys: string[]) => { for (const key of keys) if (data?.[key] === undefined || data[key] === '') throw new Error(`${key} is required`); return data; };
export const DamageRecordSchema = { parse: (data: any) => required(data, ['id','organizationId','recordType','module','assetType','assetName','damageType','severity','description','dateTime','reportedBy','status','studentVisible']) as DamageBrokenLog };
export const BorrowTransactionSchema = { parse: (data: any) => required(data, ['id','organizationId','assetId','assetType','borrowerType','borrowerId','issuedBy','issuedAt','status','quantity']) as BorrowedAssetTracking };
export const AttendanceSchema = { parse: (data: any) => required(data, ['id','organizationId','studentId','classId','date','status']) };
export const AssignmentSchema = { parse: (data: any) => required(data, ['id','organizationId','classId','title','status']) };
export const InquirySchema = { parse: (data: any) => required(data, ['id','organizationId','createdBy','title','status']) };
export const LabRequestSchema = { parse: (data: any) => required(data, ['id','organizationId','itemId','requestedBy','quantity','status']) };
