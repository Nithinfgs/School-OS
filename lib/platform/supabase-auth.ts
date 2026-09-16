import { createSupabaseServerClient } from './supabase-adapter';

const roleLabels: Record<string,string> = { student:'Student', teacher:'Teacher', lab_assistant:'Lab Assistant', librarian:'Library Assistant', transport_staff:'Transport Staff', parent:'Parent', guardian:'Parent', staff:'Staff', admin:'Admin', head_of_school:'Head of School' };
const firstRelated = (value:any) => Array.isArray(value) ? value[0] : value;

const DEV_PROFILES: Record<string, { role: string; roleCode: string; name: string; email: string }> = {
  'dev:admin': { role: 'Admin', roleCode: 'admin', name: 'Nithin Selvaraj', email: 'admin.dev@schoolos.local' },
  'dev:hos': { role: 'Head of School', roleCode: 'head_of_school', name: 'Dr. Aisha Rahman', email: 'hos.dev@schoolos.local' },
  'dev:teacher': { role: 'Teacher', roleCode: 'teacher', name: 'Maya Iyer', email: 'teacher.dev@schoolos.local' },
  'dev:student': { role: 'Student', roleCode: 'student', name: 'Nithin Selvaraj', email: 'nithin.selvaraj@schoolos.local' },
  'dev:parent': { role: 'Parent', roleCode: 'parent', name: 'Nithin Selvaraj', email: 'parent.dev@schoolos.local' },
  'dev:transport-staff': { role: 'Transport Staff', roleCode: 'transport_staff', name: 'Leena Joseph', email: 'transport.dev@schoolos.local' },
  'dev:lab-assistant': { role: 'Lab Assistant', roleCode: 'lab_assistant', name: 'Olivia Reed', email: 'lab.assistant.dev@schoolos.local' },
  'dev:library-assistant': { role: 'Library Assistant', roleCode: 'librarian', name: 'Daniel Moore', email: 'library.assistant.dev@schoolos.local' },
};

/** Resolves role and organization on the server; handles both real Supabase sessions and dev test roles. */
export async function resolveSupabaseMember(input:{id?:string;email?:string}) {
  const client = createSupabaseServerClient();
  const devKey = input.id && input.id.startsWith('dev:') ? input.id : Object.keys(DEV_PROFILES).find(k => DEV_PROFILES[k].email === input.email?.toLowerCase());

  if (devKey && DEV_PROFILES[devKey]) {
    const dev = DEV_PROFILES[devKey];
    // Find active organization
    const { data: orgData } = await client.from('organizations').select('id').limit(1).maybeSingle();
    const organizationId = orgData?.id || process.env.DEFAULT_ORGANIZATION_ID || '074251d9-f040-43fb-b180-a03a687c9e51';

    let studentId = '';
    let teacherId = '';

    if (dev.roleCode === 'student' || dev.roleCode === 'parent') {
      const { data: studentData } = await client.from('students').select('id').eq('organization_id', organizationId).limit(1).maybeSingle();
      studentId = studentData?.id || '00000000-0000-0000-0000-000000000001';
    }
    if (dev.roleCode === 'teacher') {
      const { data: teacherData } = await client.from('teachers').select('id').eq('organization_id', organizationId).limit(1).maybeSingle();
      teacherId = teacherData?.id || '00000000-0000-0000-0000-000000000002';
    }

    const devId = `dev-${dev.roleCode}-user`;
    return {
      id: devId,
      userId: devId,
      organizationId,
      role: dev.role,
      roleCode: dev.roleCode,
      name: dev.name,
      email: dev.email,
      studentId,
      teacherId,
      classes: '',
      department: '',
    };
  }

  let profileQuery = client.from('profiles').select('id,organization_id,display_name,email,students(id),teachers(id),user_roles(roles(code,label))');
  profileQuery = input.id ? profileQuery.eq('id', input.id) : profileQuery.eq('email', String(input.email || '').toLowerCase());
  const { data, error } = await profileQuery.maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No SchoolOS Supabase profile is linked to this authenticated account.');
  const roleCode = (data.user_roles as any[] || [])[0]?.roles?.code || 'student';
  return {
    id: data.id,
    userId: data.id,
    organizationId: data.organization_id,
    role: roleLabels[roleCode] || 'Student',
    roleCode,
    name: data.display_name,
    email: data.email,
    studentId: firstRelated(data.students)?.id || '',
    teacherId: firstRelated(data.teachers)?.id || '',
    classes: '',
    department: '',
  };
}

export async function resolveSupabaseBearer(token:string) {
  const client=createSupabaseServerClient();
  const {data,error}=await client.auth.getUser(token);
  if(error || !data.user) throw new Error('UNAUTHORIZED');
  return resolveSupabaseMember({id:data.user.id,email:data.user.email});
}
