import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const clearOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 0 };
  response.cookies.set('schoolos-supabase-access', '', clearOpts);
  response.cookies.set('schoolos-supabase-refresh', '', clearOpts);
  response.cookies.set('schoolos-dev-user', '', clearOpts);
  return response;
}
