import SchoolOS from './schoolos';
import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
import { headers } from 'next/headers';
import { demoLoginEnabled } from '@/lib/platform/runtime';
import SupabaseLogin from './supabase-login';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  Wrench,
  UserRound,
} from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const requestHeaders = await headers();
  const hostname = (requestHeaders.get('host') || '').split(':')[0];
  const isLocal = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
  const isNetlify = Boolean(process.env.SITE_ID || process.env.URL);
  const showDemoLogins = demoLoginEnabled();
  const user = await getChatGPTUser();
  if (!user || user.email === 'seedy@sites.test')
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="brand">
            <span className="logo">
              <GraduationCap size={24} />
            </span>
            School<span className="brand-os">OS</span>
          </div>
          <div className="eyebrow">WESTBRIDGE INTERNATIONAL</div>
          <h1>{showDemoLogins ? 'Dev Mode' : 'SchoolOS sign in'}</h1>
          <p>
            {showDemoLogins
              ? 'Choose a test account to open the SchoolOS website.'
              : 'Sign in to open your school workspace.'}
          </p>
          {showDemoLogins && (
            <div className="dev-login-grid" aria-label="Development logins">
              <a href="/api/dev-login?role=admin&return_to=/admin" target="_top">
                <Wrench size={16} />
                Dev admin
              </a>
              <a href="/api/dev-login?role=student&return_to=/" target="_top">
                <User size={16} />
                Dev student
              </a>
              <a href="/api/dev-login?role=teacher&return_to=/" target="_top">
                <Users size={16} />
                Dev teacher
              </a>
              <a href="/api/dev-login?role=hos&return_to=/hos" target="_top">
                <GraduationCap size={16} />
                Dev HOS
              </a>
              <a href="/api/dev-login?role=transport-staff&return_to=/" target="_top">
                <Users size={16} />
                Dev transport
              </a>
              <a href="/api/dev-login?role=parent&return_to=/" target="_top">
                <UserRound size={16} />
                Dev parent
              </a>
            </div>
          )}
          {process.env.DATA_MODE === 'supabase' && <SupabaseLogin />}
          {(!isNetlify || !showDemoLogins) && (
            <a
              className="login-button login-button-secondary"
              href={chatGPTSignInPath('/')}
              target="_top"
            >
              Continue with ChatGPT <ArrowRight size={17} />
            </a>
          )}
          <div className="login-note">
            <ShieldCheck size={16} />{' '}
            {isLocal
              ? 'Localhost test access.'
              : 'Secure school sign-in.'}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a href="/privacy" className="hover:text-emerald-700 font-semibold underline underline-offset-2 transition-colors">
                Privacy Policy
              </a>
              <span>·</span>
              <a href="/licensing" className="hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors">
                Licensing & IP
              </a>
              <span>·</span>
              <a href="/terms" className="hover:text-amber-700 font-semibold underline underline-offset-2 transition-colors">
                Terms of Service
              </a>
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              A Product of Dev Studios and its Founding Members · © 2026 Dev Studios · Zero Liability
            </div>
          </div>
        </div>
      </main>
    );
  return <SchoolOS initialUser={user} />;
}
