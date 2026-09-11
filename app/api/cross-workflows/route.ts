import { getChatGPTUser } from '@/app/chatgpt-auth';
import { backendConfig } from '@/lib/platform/config';
import {
  createParentRequest,
  createStaffLeave,
  createVisitor,
  listCrossWorkflowData,
  updateAdmission,
  updateParentRequest,
  updateProcurement,
  updateStaffLeave,
  updateTransportNotice,
  updateVisitor,
} from '@/lib/platform/cross-workflows';
import { resolveSupabaseMember } from '@/lib/platform/supabase-auth';
import {
  AdmissionTransitions,
  ProcurementTransitions,
  StaffLeaveTransitions,
  TransportNoticeTransitions,
  VisitorTransitions,
  assertWorkflowUpdate,
  parseParentRequest,
} from '@/lib/platform/schemas';
import { context, db, encode } from '@/lib/server';

async function demoParentRequest(body: { action?: string; data?: any }) {
  const { user, member, org } = await context();
  if (member.role !== 'Parent') throw new Error('FORBIDDEN');
  if (body.action !== 'parentRequest.create') throw new Error('DEMO_MODE');
  const rawInput = body.data || {};
  const validated = parseParentRequest({ ...rawInput, studentId: '00000000-0000-4000-8000-000000000000' });
  const input = { ...validated, studentId: String(rawInput.studentId || '') };
  if (input.studentId !== member.studentId) throw new Error('FORBIDDEN');
  const id = crypto.randomUUID();
  const kind = input.type === 'NotUsingBus' ? 'transportNotice' : 'parentRequest';
  const now = new Date().toISOString();
  const data = {
    ...input,
    id,
    studentId: input.studentId,
    parentId: user.userId,
    status: 'Submitted',
    createdAt: now,
    updatedAt: now,
    visibility: 'Operational',
  };
  await db()
    .prepare(
      'INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,?,0,?,?)'
    )
    .bind(`${org}:${id}`, org, kind, input.type, JSON.stringify(data), 0, user.userId, now)
    .run();
  return { ok: true, id, status: 'Submitted', kind };
}

async function member() {
  if (backendConfig.adapter !== 'supabase') throw new Error('DEMO_MODE');
  const user = await getChatGPTUser();
  if (!user || user.userId.startsWith('dev:')) throw new Error('UNAUTHORIZED');
  return resolveSupabaseMember({ id: user.userId, email: user.email });
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Request failed';
  const status =
    message === 'UNAUTHORIZED'
      ? 401
      : message === 'FORBIDDEN'
      ? 403
      : message === 'DEMO_MODE'
      ? 409
      : message.startsWith('VALIDATION_ERROR')
      ? 422
      : 400;
  return Response.json({ error: message }, { status });
}

export async function GET() {
  try {
    if (backendConfig.adapter !== 'supabase') {
      const { member, org } = await context();
      if (member.role !== 'Parent') throw new Error('FORBIDDEN');
      const rows = (
        await db()
          .prepare("SELECT * FROM records WHERE organizationId=? AND kind IN ('parentRequest','transportNotice') ORDER BY updatedAt DESC")
          .bind(org)
          .all<any>()
      ).results
        .map(encode)
        .filter((row: any) => row.data?.parentId === member.userId && row.data?.studentId === member.studentId);
      return Response.json(
        {
          children: [],
          parentRequests: rows
            .filter((row: any) => row.kind === 'parentRequest')
            .map((row: any) => ({
              id: row.id,
              request_type: row.data.type,
              student_id: row.data.studentId,
              request_date: row.data.date,
              requested_time: row.data.requestedTime,
              expected_time: row.data.expectedTime,
              status: row.data.status,
              metadata: row.data,
              updated_at: row.updatedAt,
              created_at: row.data.createdAt,
            })),
          transportNotices: rows
            .filter((row: any) => row.kind === 'transportNotice')
            .map((row: any) => ({
              id: row.id,
              student_id: row.data.studentId,
              notice_date: row.data.date,
              status: row.data.status,
              operational_note: row.data.operationalNote,
              submitted_at: row.data.createdAt,
            })),
          visitors: [],
          staffLeave: [],
          documentRequests: [],
        },
        { headers: { 'Cache-Control': 'private, no-store' } }
      );
    }
    return Response.json(await listCrossWorkflowData(await member()), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) throw new Error('FORBIDDEN');
    const body = (await request.json()) as { action?: string; data?: any };
    if (backendConfig.adapter !== 'supabase') return Response.json(await demoParentRequest(body));
    const current = await member();

    if (body.action === 'parentRequest.create') return Response.json(await createParentRequest(current, parseParentRequest(body.data)));
    if (body.action === 'parentRequest.update') {
      const data = assertWorkflowUpdate(body.data, ['Acknowledged', 'Approved', 'Rejected', 'Completed', 'Cancelled', 'Arrived', 'Received', 'Collected']);
      return Response.json(await updateParentRequest(current, String(data.id), String(data.status), data.operationalNote as string | undefined));
    }
    if (body.action === 'admission.update') {
      const data = assertWorkflowUpdate(body.data, Object.keys(AdmissionTransitions));
      return Response.json(await updateAdmission(current, data as any));
    }
    if (body.action === 'procurement.update') {
      const data = assertWorkflowUpdate(body.data, Object.keys(ProcurementTransitions));
      return Response.json(await updateProcurement(current, data as any));
    }
    if (body.action === 'transportNotice.update') {
      const data = assertWorkflowUpdate(body.data, Object.keys(TransportNoticeTransitions));
      return Response.json(await updateTransportNotice(current, data as any));
    }
    if (body.action === 'staffLeave.create') {
      return Response.json(await createStaffLeave(current, body.data));
    }
    if (body.action === 'staffLeave.update') {
      const data = assertWorkflowUpdate(body.data, Object.keys(StaffLeaveTransitions));
      return Response.json(await updateStaffLeave(current, String(data.id), String(data.status), data.notes as string | undefined));
    }
    if (body.action === 'visitor.create') {
      return Response.json(await createVisitor(current, body.data));
    }
    if (body.action === 'visitor.update') {
      const data = assertWorkflowUpdate(body.data, Object.keys(VisitorTransitions));
      return Response.json(await updateVisitor(current, String(data.id), String(data.status), data.badgeNumber as string | undefined, data.notes as string | undefined));
    }
    throw new Error('Unknown workflow action');
  } catch (error) {
    return errorResponse(error);
  }
}
