import { RecordRegistry, buildRecordTags } from '@/lib/tracking';
import { createSupabaseServerClient } from './supabase-adapter';
import {
  AdmissionTransitions,
  DocumentTransitions,
  ParentRequestTransitions,
  ProcurementTransitions,
  StaffLeaveTransitions,
  TransportNoticeTransitions,
  VisitorTransitions,
  assertTransition,
} from './schemas';

export type Member = { id: string; organizationId: string; role: string; roleCode: string; studentId?: string };

export type ParentRequestInput = {
  studentId: string;
  type: 'EarlyPickup' | 'LateDropOff' | 'LunchDropOff' | 'NotUsingBus';
  date: string;
  requestedTime?: string;
  expectedTime?: string;
  reason?: string;
  notes?: string;
  direction?: 'Morning' | 'Afternoon' | 'Both';
  itemType?: string;
  pickupPersonName?: string;
  pickupPersonRelationship?: string;
};

export type AdmissionsUpdate = {
  id: string;
  status?: string;
  nextAction?: string;
  assessment?: string;
  interview?: string;
  note?: string;
  enrolledStudentId?: string;
  admissionNumber?: string;
  classId?: string;
};

export type ProcurementUpdate = { id: string; status?: string; notes?: string };
export type TransportNoticeUpdate = { id: string; status?: string; operationalNote?: string };

export type StaffLeaveInput = {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
};

export type VisitorInput = {
  fullName: string;
  phone?: string;
  email?: string;
  company?: string;
  purpose: string;
  expectedArrival: string;
  badgeNumber?: string;
  notes?: string;
};

const adminRoles = new Set(['admin']);
const reviewRoles = new Set(['admin', 'head_of_school']);
const operationsRoles = new Set(['admin', 'staff', 'transport_staff']);
const staffRoles = new Set(['admin', 'head_of_school', 'teacher', 'staff', 'transport_staff', 'librarian', 'lab_assistant']);

function assertRole(member: Member, allowed: Set<string>) {
  if (!allowed.has(member.roleCode)) throw new Error('FORBIDDEN');
}

function now() {
  return new Date().toISOString();
}

async function writeEvent(
  member: Member,
  eventType: string,
  module: string,
  entityType: string,
  entityId: string,
  studentId?: string,
  metadata: Record<string, unknown> = {}
) {
  const client = createSupabaseServerClient();
  const tags = buildRecordTags({
    organizationId: member.organizationId,
    module,
    recordType: eventType,
    status: String(metadata.status || 'Recorded'),
    studentId,
  });

  await Promise.all([
    client.from('activity_events').insert({
      id: crypto.randomUUID(),
      organization_id: member.organizationId,
      event_type: eventType,
      module,
      actor_id: member.id,
      actor_role: member.role,
      subject_type: entityType,
      subject_id: entityId,
      related_student_id: studentId || null,
      entity_type: entityType,
      entity_id: entityId,
      tags,
      metadata,
      occurred_at: now(),
    }),
    client.from('audit_logs').insert({
      organization_id: member.organizationId,
      actor_id: member.id,
      actor_role: member.role,
      entity_type: entityType,
      entity_id: entityId,
      action: eventType,
      after: metadata,
      timestamp: now(),
    }),
  ]);
}

async function notifyRoles(
  organizationId: string,
  roles: string[],
  type: string,
  title: string,
  message: string,
  entityType: string,
  entityId: string
) {
  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from('user_roles')
    .select('user_id,roles!inner(code)')
    .eq('organization_id', organizationId)
    .in('roles.code', roles);

  if (error) throw error;
  const recipients = [...new Set((data || []).map((row: any) => row.user_id))];
  if (!recipients.length) return;

  const tags = buildRecordTags({ organizationId, module: 'Student Services', recordType: type, status: 'New' });
  const { error: insertError } = await client.from('notifications').insert(
    recipients.map((userId) => ({
      organization_id: organizationId,
      user_id: userId,
      type,
      title,
      message,
      source_module: 'Student Services',
      source_entity_type: entityType,
      source_entity_id: entityId,
      read: false,
      tags,
    }))
  );
  if (insertError) throw insertError;
}

export async function listCrossWorkflowData(member: Member) {
  const client = createSupabaseServerClient();
  const isParent = member.roleCode === 'parent';
  const isStaff = staffRoles.has(member.roleCode);

  const linksResult = isParent
    ? await client
        .from('parent_student_links')
        .select('student_id,students(id,external_id,grade,profiles(display_name))')
        .eq('organization_id', member.organizationId)
        .eq('parent_profile_id', member.id)
    : ({ data: [], error: null } as any);

  if (linksResult.error) throw linksResult.error;
  const childIds = (linksResult.data || []).map((link: any) => link.student_id);
  const maySeeTransport = isParent || ['admin', 'head_of_school', 'transport_staff'].includes(member.roleCode);

  const [
    parentResult,
    transportResult,
    admissionsResult,
    procurementResult,
    approvalsResult,
    visitorsResult,
    staffLeaveResult,
    documentRequestsResult,
  ] = await Promise.all([
    isParent
      ? client
          .from('parent_student_requests')
          .select('*')
          .eq('organization_id', member.organizationId)
          .eq('parent_guardian_id', member.id)
          .order('created_at', { ascending: false })
      : client
          .from('parent_student_requests')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('created_at', { ascending: false })
          .limit(100),
    isParent && childIds.length
      ? client
          .from('transport_notices')
          .select('*')
          .eq('organization_id', member.organizationId)
          .in('student_id', childIds)
          .order('submitted_at', { ascending: false })
      : maySeeTransport
      ? client
          .from('transport_notices')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('submitted_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
    reviewRoles.has(member.roleCode)
      ? client
          .from('admission_applications')
          .select('*,admission_timeline(*)')
          .eq('organization_id', member.organizationId)
          .order('created_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
    reviewRoles.has(member.roleCode)
      ? client
          .from('procurement_requests')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('created_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
    reviewRoles.has(member.roleCode)
      ? client
          .from('approvals')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('created_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
    isStaff
      ? client
          .from('visitors')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('expected_arrival', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
    isStaff
      ? client
          .from('staff_leave_requests')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('start_date', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
    isParent && childIds.length
      ? client
          .from('student_document_requests')
          .select('*')
          .eq('organization_id', member.organizationId)
          .in('student_id', childIds)
          .order('created_at', { ascending: false })
      : reviewRoles.has(member.roleCode)
      ? client
          .from('student_document_requests')
          .select('*')
          .eq('organization_id', member.organizationId)
          .order('created_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  for (const result of [
    parentResult,
    transportResult,
    admissionsResult,
    procurementResult,
    approvalsResult,
    visitorsResult,
    staffLeaveResult,
    documentRequestsResult,
  ]) {
    if (result.error) throw result.error;
  }

  return {
    children: linksResult.data || [],
    parentRequests: parentResult.data || [],
    transportNotices: transportResult.data || [],
    admissions: admissionsResult.data || [],
    procurement: procurementResult.data || [],
    approvals: approvalsResult.data || [],
    visitors: visitorsResult.data || [],
    staffLeave: staffLeaveResult.data || [],
    documentRequests: documentRequestsResult.data || [],
  };
}

export async function createParentRequest(member: Member, input: ParentRequestInput) {
  assertRole(member, new Set(['parent']));
  const client = createSupabaseServerClient();
  const { data: link, error: linkError } = await client
    .from('parent_student_links')
    .select('student_id')
    .eq('organization_id', member.organizationId)
    .eq('parent_profile_id', member.id)
    .eq('student_id', input.studentId)
    .maybeSingle();

  if (linkError) throw linkError;
  if (!link) throw new Error('FORBIDDEN');

  const metadata = {
    direction: input.direction || null,
    itemType: input.itemType || null,
    pickupPersonName: input.pickupPersonName || null,
    pickupPersonRelationship: input.pickupPersonRelationship || null,
  };

  if (input.type === 'NotUsingBus') {
    const changeType =
      input.direction === 'Morning' ? 'NotComingByBus' : input.direction === 'Afternoon' ? 'NotGoingByBus' : 'NotUsingBusBoth';
    const { data, error } = await client
      .from('transport_notices')
      .insert({
        organization_id: member.organizationId,
        student_id: input.studentId,
        notice_date: input.date,
        change_type: changeType,
        reason: input.reason || null,
        notes: input.notes || null,
        status: 'Submitted',
        submitted_by: member.id,
        student_visible: true,
      })
      .select()
      .single();

    if (error) throw error;
    await writeEvent(member, RecordRegistry.TRANSPORT_NOTICE, 'Transport', 'transport_notice', data.id, input.studentId, {
      ...metadata,
      status: 'Submitted',
      parentInitiated: true,
    });
    await notifyRoles(
      member.organizationId,
      ['transport_staff', 'admin'],
      'TRANSPORT_NOTICE',
      'New parent transport notice',
      'A parent reported a student transport change.',
      'transport_notice',
      data.id
    );
    return { ...data, kind: 'transportNotice' };
  }

  const { data, error } = await client
    .from('parent_student_requests')
    .insert({
      organization_id: member.organizationId,
      parent_guardian_id: member.id,
      student_id: input.studentId,
      request_type: input.type,
      request_date: input.date,
      requested_time: input.requestedTime || null,
      expected_time: input.expectedTime || null,
      reason: input.reason || null,
      notes: input.notes || null,
      status: 'Submitted',
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  const event =
    input.type === 'EarlyPickup'
      ? 'PARENT_EARLY_PICKUP_REQUESTED'
      : input.type === 'LateDropOff'
      ? 'PARENT_LATE_DROPOFF_REPORTED'
      : 'PARENT_LUNCH_DROPOFF_REPORTED';

  await writeEvent(member, event, 'Student Services', 'parent_student_request', data.id, input.studentId, {
    ...metadata,
    status: 'Submitted',
  });
  await notifyRoles(
    member.organizationId,
    ['admin', 'staff'],
    'PARENT_REQUEST',
    'New parent request',
    `${input.type} requires school acknowledgement.`,
    'parent_student_request',
    data.id
  );
  return { ...data, kind: 'parentRequest' };
}

export async function updateParentRequest(member: Member, id: string, status: string, operationalNote?: string) {
  assertRole(member, operationsRoles);
  const client = createSupabaseServerClient();
  const { data: before, error: beforeError } = await client
    .from('parent_student_requests')
    .select('student_id,metadata')
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .single();

  if (beforeError) throw beforeError;
  const { data: current, error: currentError } = await client
    .from('parent_student_requests')
    .select('status')
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .single();

  if (currentError) throw currentError;
  assertTransition(current.status, status, ParentRequestTransitions);

  const { data, error } = await client
    .from('parent_student_requests')
    .update({
      status,
      assigned_to: member.id,
      metadata: { ...before.metadata, operationalNote: operationalNote || null, lastUpdatedBy: member.id },
    })
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await writeEvent(member, `PARENT_REQUEST_${status.toUpperCase()}`, 'Student Services', 'parent_student_request', id, before.student_id, {
    status,
    operationalNote: operationalNote || null,
  });

  const { data: requester } = await client
    .from('parent_student_requests')
    .select('parent_guardian_id')
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .single();

  if (requester?.parent_guardian_id) {
    await client.from('notifications').insert({
      organization_id: member.organizationId,
      user_id: requester.parent_guardian_id,
      type: 'PARENT_REQUEST_UPDATED',
      title: 'Your school request was updated',
      message: `Status: ${status}.`,
      source_module: 'Student Services',
      source_entity_type: 'parent_student_request',
      source_entity_id: id,
      read: false,
      tags: buildRecordTags({ organizationId: member.organizationId, module: 'Student Services', recordType: 'PARENT_REQUEST_UPDATED', status }),
    });
  }

  return data;
}

export async function updateAdmission(member: Member, input: AdmissionsUpdate) {
  assertRole(member, adminRoles);
  const client = createSupabaseServerClient();
  const { data: current, error: currentError } = await client
    .from('admission_applications')
    .select('*')
    .eq('organization_id', member.organizationId)
    .eq('id', input.id)
    .single();

  if (currentError) throw currentError;
  if (input.status) assertTransition(current.status, input.status, AdmissionTransitions);

  let enrolledStudentId = input.enrolledStudentId || current.enrolled_student_id;
  if (input.status === 'Enrolled' && !enrolledStudentId) {
    const { data: studentId, error: enrollmentError } = await client.rpc('schoolos_enroll_admission', {
      p_application_id: input.id,
      p_actor_id: member.id,
      p_admission_number: input.admissionNumber || null,
      p_class_id: input.classId || null,
    });
    if (enrollmentError) throw enrollmentError;
    enrolledStudentId = studentId;
  }

  const { data, error } = await client
    .from('admission_applications')
    .update({
      status: input.status || current.status,
      notes: input.note ? [current.notes, input.note].filter(Boolean).join('\n') : current.notes,
      updated_at: now(),
      enrolled_student_id: enrolledStudentId || null,
    })
    .eq('organization_id', member.organizationId)
    .eq('id', input.id)
    .select()
    .single();

  if (error) throw error;
  const event =
    input.status === 'Enrolled'
      ? RecordRegistry.STUDENT_ENROLLED
      : input.status === 'Accepted'
      ? RecordRegistry.ADMISSION_ACCEPTED
      : input.status === 'Offered'
      ? RecordRegistry.ADMISSION_OFFERED
      : input.status === 'Rejected'
      ? RecordRegistry.ADMISSION_REJECTED
      : RecordRegistry.ADMISSION_SUBMITTED;

  if (input.status !== 'Enrolled') {
    await client.from('admission_timeline').insert({
      organization_id: member.organizationId,
      application_id: data.id,
      action: input.status ? `Status updated to ${input.status}` : 'Application updated',
      actor_id: member.id,
      details: { nextAction: input.nextAction || null, note: input.note || null },
    });
    await writeEvent(member, event, 'Admissions', 'admission_application', data.id, undefined, {
      status: data.status,
      nextAction: input.nextAction || null,
    });
  }

  return data;
}

export async function updateProcurement(member: Member, input: ProcurementUpdate) {
  assertRole(member, adminRoles);
  const client = createSupabaseServerClient();
  const { data: current, error: currentError } = await client
    .from('procurement_requests')
    .select('status')
    .eq('organization_id', member.organizationId)
    .eq('id', input.id)
    .single();

  if (currentError) throw currentError;
  if (input.status) assertTransition(current.status, input.status, ProcurementTransitions);

  const { data, error } = await client
    .from('procurement_requests')
    .update({ status: input.status, notes: input.notes, updated_at: now() })
    .eq('organization_id', member.organizationId)
    .eq('id', input.id)
    .select()
    .single();

  if (error) throw error;
  const event =
    input.status === 'Approved'
      ? RecordRegistry.PROCUREMENT_APPROVED
      : input.status === 'Rejected'
      ? RecordRegistry.PROCUREMENT_REJECTED
      : input.status === 'Ordered'
      ? RecordRegistry.PURCHASE_ORDER_CREATED
      : RecordRegistry.PROCUREMENT_SUBMITTED;

  await writeEvent(member, event, 'Procurement', 'procurement_request', data.id, undefined, {
    status: data.status,
    requestNumber: data.request_number,
  });
  return data;
}

export async function updateTransportNotice(member: Member, input: TransportNoticeUpdate) {
  assertRole(member, new Set(['admin', 'transport_staff']));
  const client = createSupabaseServerClient();
  const { data: current, error: currentError } = await client
    .from('transport_notices')
    .select('student_id,status')
    .eq('organization_id', member.organizationId)
    .eq('id', input.id)
    .single();

  if (currentError) throw currentError;
  if (input.status) assertTransition(current.status, input.status, TransportNoticeTransitions);

  const { data, error } = await client
    .from('transport_notices')
    .update({ status: input.status || current.status, operational_note: input.operationalNote || null })
    .eq('organization_id', member.organizationId)
    .eq('id', input.id)
    .select()
    .single();

  if (error) throw error;
  const event = input.status === 'Resolved' ? RecordRegistry.TRANSPORT_NOTICE_RESOLVED : RecordRegistry.TRANSPORT_NOTICE_ACKNOWLEDGED;
  await writeEvent(member, event, 'Transport', 'transport_notice', data.id, current.student_id, {
    status: data.status,
    operationalNote: input.operationalNote || null,
  });
  return data;
}

export async function createStaffLeave(member: Member, input: StaffLeaveInput) {
  assertRole(member, staffRoles);
  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from('staff_leave_requests')
    .insert({
      organization_id: member.organizationId,
      staff_id: member.id,
      leave_type: input.leaveType,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason || null,
      status: 'Submitted',
    })
    .select()
    .single();

  if (error) throw error;
  await writeEvent(member, 'STAFF_LEAVE_SUBMITTED', 'Staff', 'staff_leave_request', data.id, undefined, {
    leaveType: input.leaveType,
    startDate: input.startDate,
    endDate: input.endDate,
  });
  await notifyRoles(member.organizationId, ['admin', 'head_of_school'], 'STAFF_LEAVE', 'Staff Leave Request', 'A new leave request was submitted.', 'staff_leave_request', data.id);
  return data;
}

export async function updateStaffLeave(member: Member, id: string, status: string, notes?: string) {
  const client = createSupabaseServerClient();
  const { data: current, error: currentError } = await client
    .from('staff_leave_requests')
    .select('status,staff_id')
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .single();

  if (currentError) throw currentError;
  assertTransition(current.status, status, StaffLeaveTransitions);

  if (status === 'Cancelled') {
    if (current.staff_id !== member.id && !adminRoles.has(member.roleCode)) throw new Error('FORBIDDEN');
  } else {
    assertRole(member, reviewRoles);
  }

  const { data, error } = await client
    .from('staff_leave_requests')
    .update({
      status,
      reviewed_by: member.id,
      reviewed_at: now(),
      notes: notes || null,
      updated_at: now(),
    })
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await writeEvent(member, `STAFF_LEAVE_${status.toUpperCase()}`, 'Staff', 'staff_leave_request', id, undefined, { status, notes });
  return data;
}

export async function createVisitor(member: Member, input: VisitorInput) {
  assertRole(member, staffRoles);
  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from('visitors')
    .insert({
      organization_id: member.organizationId,
      full_name: input.fullName,
      phone: input.phone || null,
      email: input.email || null,
      company: input.company || null,
      purpose: input.purpose,
      expected_arrival: input.expectedArrival,
      host_staff_id: member.id,
      status: 'Expected',
      badge_number: input.badgeNumber || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  await writeEvent(member, 'VISITOR_REGISTERED', 'Operations', 'visitor', data.id, undefined, {
    fullName: input.fullName,
    purpose: input.purpose,
  });
  return data;
}

export async function updateVisitor(member: Member, id: string, status: string, badgeNumber?: string, notes?: string) {
  assertRole(member, operationsRoles);
  const client = createSupabaseServerClient();
  const { data: current, error: currentError } = await client
    .from('visitors')
    .select('status')
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .single();

  if (currentError) throw currentError;
  assertTransition(current.status, status, VisitorTransitions);

  const updates: Record<string, unknown> = {
    status,
    notes: notes || null,
    updated_at: now(),
  };
  if (badgeNumber) updates.badge_number = badgeNumber;
  if (status === 'CheckedIn') updates.check_in_time = now();
  if (status === 'CheckedOut') updates.check_out_time = now();

  const { data, error } = await client
    .from('visitors')
    .update(updates)
    .eq('organization_id', member.organizationId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await writeEvent(member, `VISITOR_${status.toUpperCase()}`, 'Operations', 'visitor', id, undefined, { status, badgeNumber });
  return data;
}
