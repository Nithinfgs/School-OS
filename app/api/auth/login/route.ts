import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/platform/config';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    if (!supabaseConfig.url || !supabaseConfig.publishableKey) return NextResponse.json({ error: 'Supabase sign-in is not configured.' }, { status: 503 });

    const client = createClient(supabaseConfig.url, supabaseConfig.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) return NextResponse.json({ error: error?.message || 'Unable to sign in.' }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 8 };
    response.cookies.set('schoolos-supabase-access', data.session.access_token, options);
    response.cookies.set('schoolos-supabase-refresh', data.session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Sign-in request failed.' }, { status: 400 });
  }
}
