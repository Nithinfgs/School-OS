import SchoolPage from '../page';
import { getChatGPTUser } from '../chatgpt-auth';
import { notFound, redirect } from 'next/navigation';
import { backendConfig } from '@/lib/platform/config';
import { resolveSupabaseMember } from '@/lib/platform/supabase-auth';

export const dynamic = 'force-dynamic';

const knownPages = new Set([
  'home','labs','library','academics','students','directory','chat','messages','announcements','forms','policies','feedback','requests','school-services','reports','cas','services','approvals','id-cards','calendar','daily-calendar','notifications','inquiries','transport','teacher-inquiry','student-search','report-cards','admissions','staff-leave','procurement','documents','visitors','analytics','activity','settings','help-support',
]);

function devRole(userId: string) {
  const code = userId.replace('dev:', '');
  return code === 'hos' ? 'Head of School' : code === 'admin' ? 'Admin' : code === 'teacher' ? 'Teacher' : code === 'student' ? 'Student' : code === 'parent' ? 'Parent' : code === 'lab-assistant' ? 'Lab Assistant' : code === 'library-assistant' ? 'Library Assistant' : code === 'transport-staff' ? 'Transport Staff' : '';
}

function roleHome(role: string) {
  if (role === 'Admin') return '/admin';
  if (role === 'Head of School') return '/hos';
  return '/';
}

/** Server route boundary: role URL ownership is checked before the shared UI shell renders. */
export default async function CatchAllSchoolPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const [requested, nested] = path || [];
  // A route is invalid independently of whether its visitor is authenticated.
  // Resolve that first so malformed public URLs do not masquerade as a login
  // redirect.
  const scoped = requested === 'admin' || requested === 'hos';
  if (requested && ((scoped && nested && nested !== 'record' && !knownPages.has(nested)) || (!scoped && !knownPages.has(requested) && !['teacher', 'student', 'parent'].includes(requested)))) notFound();
  const user = await getChatGPTUser();
  if (!user) redirect('/');

  const role = user.userId.startsWith('dev:')
    ? devRole(user.userId)
    : backendConfig.adapter === 'supabase'
      ? (await resolveSupabaseMember({ id: user.userId, email: user.email }).catch(() => null))?.role || ''
      : '';

  if (!requested) redirect(roleHome(role));
  if (requested === 'admin' && role !== 'Admin') redirect(roleHome(role));
  if (requested === 'hos' && role !== 'Head of School') redirect(roleHome(role));

  return <SchoolPage />;
}
