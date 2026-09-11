import type { BorrowedAssetTracking, DamageBrokenLog } from '../tracking';

const required = (data: any, keys: string[]) => {
  for (const key of keys) {
    if (data?.[key] === undefined || data[key] === '') throw new Error(`${key} is required`);
  }
  return data;
};

export const DamageRecordSchema = {
  parse: (data: any) =>
    required(data, [
      'id',
      'organizationId',
      'recordType',
      'module',
      'assetType',
      'assetName',
      'damageType',
      'severity',
      'description',
      'dateTime',
      'reportedBy',
      'status',
      'studentVisible',
    ]) as DamageBrokenLog,
};

export const BorrowTransactionSchema = {
  parse: (data: any) =>
    required(data, [
      'id',
      'organizationId',
      'assetId',
      'assetType',
      'borrowerType',
      'borrowerId',
      'issuedBy',
      'issuedAt',
      'status',
      'quantity',
    ]) as BorrowedAssetTracking,
};

export const AttendanceSchema = {
  parse: (data: any) => required(data, ['id', 'organizationId', 'studentId', 'classId', 'date', 'status']),
};

export const AssignmentSchema = {
  parse: (data: any) => required(data, ['id', 'organizationId', 'classId', 'title', 'status']),
};

export const InquirySchema = {
  parse: (data: any) => required(data, ['id', 'organizationId', 'createdBy', 'title', 'status']),
};

export const LabRequestSchema = {
  parse: (data: any) => required(data, ['id', 'organizationId', 'itemId', 'requestedBy', 'quantity', 'status']),
};

export type ApiErrorCode = 'VALIDATION_ERROR' | 'FORBIDDEN' | 'CONFLICT' | 'NOT_FOUND';

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const isDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export const isTime = (value: unknown): value is string =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const bounded = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim().length <= max;

export const ParentRequestTypes = ['EarlyPickup', 'LateDropOff', 'LunchDropOff', 'NotUsingBus'] as const;

export const ParentRequestTransitions: Record<string, readonly string[]> = {
  Submitted: ['Acknowledged', 'Approved', 'Rejected', 'Cancelled'],
  Acknowledged: ['Approved', 'Rejected', 'Completed', 'Cancelled', 'Arrived', 'Received'],
  Approved: ['Completed', 'Cancelled'],
  Received: ['Collected', 'Cancelled'],
  Arrived: [],
  Completed: [],
  Collected: [],
  Rejected: [],
  Cancelled: [],
  Resolved: [],
};

export const AdmissionTransitions: Record<string, readonly string[]> = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['UnderReview', 'DocumentsRequired', 'AssessmentRequired', 'Interview', 'Rejected', 'Cancelled'],
  UnderReview: ['AssessmentRequired', 'Interview', 'Offered', 'Waitlisted', 'Rejected'],
  DocumentsRequired: ['UnderReview', 'Rejected', 'Cancelled'],
  AssessmentRequired: ['Interview', 'Offered', 'Waitlisted', 'Rejected'],
  Interview: ['Offered', 'Waitlisted', 'Rejected'],
  Offered: ['Accepted', 'Rejected', 'Withdrawn'],
  Waitlisted: ['Offered', 'Rejected', 'Withdrawn'],
  Accepted: ['Enrolled', 'Withdrawn'],
  Enrolled: ['Withdrawn', 'Archived'],
  Rejected: ['Archived'],
  Withdrawn: ['Archived'],
  Archived: [],
};

export const ProcurementTransitions: Record<string, readonly string[]> = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['POCreated', 'Ordered', 'Cancelled'],
  POCreated: ['Ordered', 'Cancelled'],
  Ordered: ['Delivered', 'Cancelled'],
  Delivered: ['Received'],
  Received: [],
  Rejected: [],
  Cancelled: [],
};

export const StaffLeaveTransitions: Record<string, readonly string[]> = {
  Submitted: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Cancelled'],
  Rejected: [],
  Cancelled: [],
};

export const VisitorTransitions: Record<string, readonly string[]> = {
  Expected: ['CheckedIn', 'Cancelled'],
  CheckedIn: ['CheckedOut'],
  CheckedOut: [],
  Cancelled: [],
};

export const DocumentTransitions: Record<string, readonly string[]> = {
  Submitted: ['InReview', 'Processing', 'Completed', 'Rejected'],
  InReview: ['Processing', 'Completed', 'Rejected'],
  Processing: ['Completed', 'Rejected'],
  Completed: [],
  Rejected: [],
};

export const TransportNoticeTransitions: Record<string, readonly string[]> = {
  Submitted: ['Acknowledged', 'Resolved', 'Cancelled'],
  Acknowledged: ['Resolved', 'Cancelled'],
  Resolved: [],
  Cancelled: [],
};

export function parseParentRequest(value: unknown) {
  const data = value as Record<string, unknown>;
  if (!data || typeof data !== 'object' || !isUuid(data.studentId)) {
    throw new Error('VALIDATION_ERROR: valid studentId is required');
  }
  if (!ParentRequestTypes.includes(data.type as any)) {
    throw new Error('VALIDATION_ERROR: invalid request type');
  }
  if (!isDate(data.date)) {
    throw new Error('VALIDATION_ERROR: valid request date is required');
  }
  if (!bounded(data.reason ?? '', 500) || !bounded(data.notes ?? '', 2000)) {
    throw new Error('VALIDATION_ERROR: request details are too long');
  }
  if (data.type === 'EarlyPickup' && (!isTime(data.requestedTime) || typeof data.reason !== 'string' || data.reason.trim().length < 3)) {
    throw new Error('VALIDATION_ERROR: pickup time and reason are required');
  }
  if (data.type === 'LateDropOff' && !isTime(data.expectedTime)) {
    throw new Error('VALIDATION_ERROR: expected arrival time is required');
  }
  if (data.type === 'LunchDropOff' && data.itemType && !['Lunch', 'SchoolItem', 'Other'].includes(String(data.itemType))) {
    throw new Error('VALIDATION_ERROR: invalid lunch item type');
  }
  if (data.type === 'NotUsingBus' && !['Morning', 'Afternoon', 'Both'].includes(String(data.direction || ''))) {
    throw new Error('VALIDATION_ERROR: a transport direction is required');
  }
  return data as any;
}

export function assertTransition(current: string, next: string, transitions: Record<string, readonly string[]>) {
  if (current === next) return;
  if (!transitions[current]?.includes(next)) {
    throw new Error(`VALIDATION_ERROR: State transition from '${current}' to '${next}' is invalid.`);
  }
}

export function assertWorkflowUpdate(value: unknown, allowedStatuses: readonly string[]) {
  const data = value as Record<string, unknown>;
  if (!data || typeof data !== 'object' || !isUuid(data.id)) {
    throw new Error('VALIDATION_ERROR: valid id is required');
  }
  if (data.status !== undefined && !allowedStatuses.includes(String(data.status))) {
    throw new Error(`VALIDATION_ERROR: status '${data.status}' is not permitted.`);
  }
  if (!bounded(data.notes ?? '', 2000) || !bounded(data.operationalNote ?? '', 2000) || !bounded(data.note ?? '', 2000)) {
    throw new Error('VALIDATION_ERROR: text is too long');
  }
  return data;
}
