import { getChatGPTUser } from '@/app/chatgpt-auth';
import { backendConfig } from '@/lib/platform/config';
import { createParentRequest, listCrossWorkflowData, updateAdmission, updateParentRequest, updateProcurement, updateTransportNotice } from '@/lib/platform/cross-workflows';
import { resolveSupabaseMember } from '@/lib/platform/supabase-auth';

async function member() {
  if (backendConfig.adapter !== 'supabase') throw new Error('DEMO_MODE');
  const user=await getChatGPTUser();
  if (!user || user.userId.startsWith('dev:')) throw new Error('UNAUTHORIZED');
  return resolveSupabaseMember({id:user.userId,email:user.email});
}
function errorResponse(error:unknown) {
  const message=error instanceof Error ? error.message : 'Request failed';
  const status=message==='UNAUTHORIZED'?401:message==='FORBIDDEN'?403:message==='DEMO_MODE'?409:400;
  return Response.json({error:message},{status});
}
export async function GET() {
  try { return Response.json(await listCrossWorkflowData(await member()),{headers:{'Cache-Control':'private, no-store'}}); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request:Request) {
  try {
    const origin=request.headers.get('origin');
    if (origin && origin!==new URL(request.url).origin) throw new Error('FORBIDDEN');
    const body=await request.json() as {action?:string;data?:any};
    const current=await member();
    if (body.action==='parentRequest.create') return Response.json(await createParentRequest(current,body.data));
    if (body.action==='parentRequest.update') return Response.json(await updateParentRequest(current,body.data.id,body.data.status,body.data.operationalNote));
    if (body.action==='admission.update') return Response.json(await updateAdmission(current,body.data));
    if (body.action==='procurement.update') return Response.json(await updateProcurement(current,body.data));
    if (body.action==='transportNotice.update') return Response.json(await updateTransportNotice(current,body.data));
    throw new Error('Unknown workflow action');
  } catch (error) { return errorResponse(error); }
}
