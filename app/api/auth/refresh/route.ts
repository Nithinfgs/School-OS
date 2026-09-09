import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/platform/config';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/** Refreshes the short-lived server session without exposing either token to JS. */
export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const refresh = cookie.match(/(?:^|;\s*)schoolos-supabase-refresh=([^;]+)/)?.[1];
  if (!refresh || !supabaseConfig.url || !supabaseConfig.publishableKey) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const client = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.refreshSession({ refresh_token: decodeURIComponent(refresh) });
  if (error || !data.session) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('schoolos-supabase-access', data.session.access_token, { ...cookieOptions, maxAge: 60 * 60 * 8 });
  response.cookies.set('schoolos-supabase-refresh', data.session.refresh_token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
  return response;
}
