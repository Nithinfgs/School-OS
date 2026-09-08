'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function SupabaseLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      window.location.assign('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      setLoading(false);
    }
  }

  return <form className="supabase-login-form" onSubmit={submit}>
    <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    {error && <p className="supabase-login-error" role="alert">{error}</p>}
    <button className="login-button" type="submit" disabled={loading}>{loading ? <Loader2 size={17} className="spin" /> : <ArrowRight size={17} />} {loading ? 'Signing in…' : 'Sign in'}</button>
  </form>;
}
