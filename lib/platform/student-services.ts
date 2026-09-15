import { createSupabaseServerClient } from './supabase-adapter';

export type ParentStudentRequest = { id?: string; organizationId: string; parentGuardianId?: string; studentId: string; requestType: 'EarlyPickup'|'LateDropOff'|'LunchDropOff'; requestDate: string; requestedTime?: string; expectedTime?: string; reason?: string; notes?: string; status?: string; metadata?: Record<string, unknown>; assignedTo?: string };
export type ApprovalItem = { id?: string; organizationId: string; sourceType: string; sourceId: string; title: string; requesterId?: string; studentId?: string; module: string; priority?: string; status?: string; assignedTo?: string; dueAt?: string; metadata?: Record<string, unknown> };
type ApprovalFilters = { organizationId?: string; status?: string; module?: string; priority?: string };
type TimelineFilters = { organizationId?: string; module?: string; from?: string; to?: string };

export interface StudentServicesRepository {
  createParentRequest(input: ParentStudentRequest): Promise<ParentStudentRequest>;
  listParentRequests(studentIds: string[], organizationId?: string): Promise<ParentStudentRequest[]>;
  listApprovals(filters?: ApprovalFilters): Promise<ApprovalItem[]>;
  updateApproval(id: string, changes: Partial<ApprovalItem>, organizationId?: string): Promise<ApprovalItem>;
  timeline(studentId: string, filters?: TimelineFilters): Promise<any[]>;
}

const toParent = (row: any): ParentStudentRequest => ({ id: row.id, organizationId: row.organization_id, parentGuardianId: row.parent_guardian_id, studentId: row.student_id, requestType: row.request_type, requestDate: row.request_date, requestedTime: row.requested_time, expectedTime: row.expected_time, reason: row.reason, notes: row.notes, status: row.status, metadata: row.metadata || {}, assignedTo: row.assigned_to });
const toApproval = (row: any): ApprovalItem => ({ id: row.id, organizationId: row.organization_id, sourceType: row.source_type, sourceId: row.source_id, title: row.title, requesterId: row.requester_id, studentId: row.student_id, module: row.module, priority: row.priority, status: row.status, assignedTo: row.assigned_to, dueAt: row.due_at, metadata: row.metadata || {} });

export class SupabaseStudentServicesRepository implements StudentServicesRepository {
  constructor(private client = createSupabaseServerClient()) {}
  async createParentRequest(input: ParentStudentRequest) { const { data, error } = await this.client.from('parent_student_requests').insert({ organization_id: input.organizationId, parent_guardian_id: input.parentGuardianId || null, student_id: input.studentId, request_type: input.requestType, request_date: input.requestDate, requested_time: input.requestedTime || null, expected_time: input.expectedTime || null, reason: input.reason || null, notes: input.notes || null, status: input.status || 'Submitted', metadata: input.metadata || {}, assigned_to: input.assignedTo || null }).select().single(); if (error) throw error; return toParent(data); }
  async listParentRequests(studentIds: string[], organizationId?: string) { if (!studentIds.length) return []; let q = this.client.from('parent_student_requests').select('*').in('student_id', studentIds); if (organizationId) q = q.eq('organization_id', organizationId); const { data, error } = await q.order('created_at', { ascending: false }); if (error) throw error; return (data || []).map(toParent); }
  async listApprovals(filters: ApprovalFilters = {}) { let query: any = this.client.from('approvals').select('*').order('created_at', { ascending: false }); if (filters.organizationId) query = query.eq('organization_id', filters.organizationId); if (filters.status) query = query.eq('status', filters.status); if (filters.module) query = query.eq('module', filters.module); if (filters.priority) query = query.eq('priority', filters.priority); const { data, error } = await query; if (error) throw error; return (data || []).map(toApproval); }
  async updateApproval(id: string, changes: Partial<ApprovalItem>, organizationId?: string) { const payload: any = {}; if (changes.status) payload.status = changes.status; if (changes.assignedTo !== undefined) payload.assigned_to = changes.assignedTo; if (changes.priority) payload.priority = changes.priority; if (changes.metadata) payload.metadata = changes.metadata; let query = this.client.from('approvals').update(payload).eq('id', id); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.select().single(); if (error) throw error; return toApproval(data); }
  async timeline(studentId: string, filters: TimelineFilters = {}) { let query: any = this.client.from('activity_events').select('*').eq('related_student_id', studentId).order('occurred_at', { ascending: false }); if (filters.organizationId) query = query.eq('organization_id', filters.organizationId); if (filters.module) query = query.eq('module', filters.module); if (filters.from) query = query.gte('occurred_at', filters.from); if (filters.to) query = query.lte('occurred_at', filters.to); const { data, error } = await query; if (error) throw error; return data || []; }
}

export class DemoStudentServicesRepository implements StudentServicesRepository {
  private requests: ParentStudentRequest[] = [];
  private approvals: ApprovalItem[] = [{ id: 'APR-2048', organizationId: 'schoolos-dev', sourceType: 'STAFF_LEAVE', sourceId: 'leave-1', title: 'Staff leave request', module: 'Staff Leave', priority: 'High', status: 'Awaiting Action' }];
  async createParentRequest(input: ParentStudentRequest) { const saved = { ...input, id: input.id || `REQ-${Date.now()}`, status: input.status || 'Submitted' }; this.requests = [saved, ...this.requests]; return saved; }
  async listParentRequests(studentIds: string[]) { return this.requests.filter((item) => studentIds.includes(item.studentId)); }
  async listApprovals(filters: ApprovalFilters = {}) { return this.approvals.filter((item) => (!filters.status || item.status === filters.status) && (!filters.module || item.module === filters.module) && (!filters.priority || item.priority === filters.priority)); }
  async updateApproval(id: string, changes: Partial<ApprovalItem>) { const current = this.approvals.find((item) => item.id === id); if (!current) throw new Error('Approval not found'); Object.assign(current, changes); return current; }
  async timeline() { return []; }
}

export function createStudentServicesRepository(): StudentServicesRepository { return (process.env.DATA_MODE || 'demo') === 'supabase' ? new SupabaseStudentServicesRepository() : new DemoStudentServicesRepository(); }
