import { createSupabaseServerClient } from './supabase-adapter';

const roleLabels: Record<string,string> = { student:'Student', teacher:'Teacher', lab_assistant:'Lab Assistant', librarian:'Library Assistant', transport_staff:'Transport Staff', staff:'Staff', admin:'Admin', head_of_school:'Head of School' };
const firstRelated = (value:any) => Array.isArray(value) ? value[0] : value;

/** Resolves role and organization on the server; never accepts a client role. */
export async function resolveSupabaseMember(input:{id?:string;email?:string}) {
  const client=createSupabaseServerClient();
  let profileQuery=client.from('profiles').select('id,organization_id,display_name,email,students(id),teachers(id),user_roles(roles(code,label))');
  profileQuery=input.id ? profileQuery.eq('id',input.id) : profileQuery.eq('email',String(input.email||'').toLowerCase());
  const {data,error}=await profileQuery.maybeSingle();
  if(error) throw error;
  if(!data) throw new Error('No SchoolOS Supabase profile is linked to this authenticated account.');
  const roleCode=(data.user_roles as any[]||[])[0]?.roles?.code || 'student';
  return { id:data.id, userId:data.id, organizationId:data.organization_id, role:roleLabels[roleCode] || 'Student', roleCode, name:data.display_name, email:data.email, studentId:firstRelated(data.students)?.id || '', teacherId:firstRelated(data.teachers)?.id || '', classes:'', department:'' };
}

export async function resolveSupabaseBearer(token:string) {
  const client=createSupabaseServerClient();
  const {data,error}=await client.auth.getUser(token);
  if(error || !data.user) throw new Error('UNAUTHORIZED');
  return resolveSupabaseMember({id:data.user.id,email:data.user.email});
}
