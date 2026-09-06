import SchoolOS from './schoolos';
import { getChatGPTUser, chatGPTSignInPath } from './chatgpt-auth';
import { GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
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
          <div className="login-note">
            <ShieldCheck size={16} /> Use the account connected to your school.
          </div>
          <footer>Learning, resources, and people. Together.</footer>
        </div>
      </main>
    );
  return <SchoolOS />;
}
