import SchoolPage from '../page';
import { getChatGPTUser } from '../chatgpt-auth';
import { redirect } from 'next/navigation';
import { backendConfig } from '@/lib/platform/config';
import { resolveSupabaseMember } from '@/lib/platform/supabase-auth';

export const dynamic = 'force-dynamic';

// Every browser route renders the same authenticated SchoolOS website shell.
// This makes direct links and refreshes work on a production host.
export default async function CatchAllSchoolPage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const requested = path?.[0];
  const user = await getChatGPTUser();
  // Dev Login remains deliberately available for the hosted product demo.
  // Its privileged routes are still canonical and cannot render under the
  // other privileged role's URL.
  if (user?.userId === 'dev:admin' && requested === 'hos') redirect(`/admin/${path.slice(1).join('/')}`.replace(/\/$/, ''));
  if (user?.userId === 'dev:hos' && requested === 'admin') redirect(`/hos/${path.slice(1).join('/')}`.replace(/\/$/, ''));
  if (user && !user.userId.startsWith('dev:') && backendConfig.adapter === 'supabase' && (requested === 'admin' || requested === 'hos')) {
    const member = await resolveSupabaseMember({ id: user.userId, email: user.email }).catch(() => null);
    const expected = member?.role === 'Admin' ? 'admin' : member?.role === 'Head of School' ? 'hos' : null;
    if (expected && requested !== expected) redirect(`/${expected}/${path.slice(1).join('/')}`.replace(/\/$/, ''));
  }
  return <SchoolPage />;
}
