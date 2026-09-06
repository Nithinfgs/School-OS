import SchoolOS from './schoolos';
import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await getChatGPTUser();
  if (!user)
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
          <h1>
            Your entire school.
            <br />
            One platform.
          </h1>
          <p>
            Welcome to your connected school workspace.
            <br />
            Sign in to pick up where you left off.
          </p>
          <a
            className="login-button"
            href={chatGPTSignInPath('/')}
            target="_top"
          >
            Continue with ChatGPT <ArrowRight size={17} />
          </a>
          <div className="dev-login-grid" aria-label="Development logins">
            <a href="/api/dev-login?role=student&return_to=/" target="_top">
              <User size={16} />
              Dev student
            </a>
            <a href="/api/dev-login?role=teacher&return_to=/" target="_top">
              <Users size={16} />
              Dev teacher
            </a>
            <a href="/api/dev-login?role=admin&return_to=/" target="_top">
              <Wrench size={16} />
              Dev admin
            </a>
          </div>
          <div className="login-note">
            <ShieldCheck size={16} /> Use the account connected to your school.
          </div>
          <footer>Learning, resources, and people. Together.</footer>
        </div>
      </main>
    );
  return <SchoolOS />;
}
