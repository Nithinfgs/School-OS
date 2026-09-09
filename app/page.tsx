import SchoolOS from './schoolos';
import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
import { headers } from 'next/headers';
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
  const showDemoLogins = isLocal || isNetlify;
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
              <a href="/api/dev-login?role=admin&return_to=/" target="_top">
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
              <a href="/api/dev-login?role=hos&return_to=/" target="_top">
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
          {!isNetlify && (
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
              : isNetlify
                ? 'Hosted demonstration access.'
                : 'Secure school sign-in.'}
          </div>
          <footer>Learning, resources, and people. Together.</footer>
        </div>
      </main>
    );
  return <SchoolOS initialUser={user} />;
}
