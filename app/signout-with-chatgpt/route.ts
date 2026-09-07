import { DEV_AUTH_COOKIE } from '@/app/chatgpt-auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('return_to') || '/';
  const secure = url.protocol === 'https:' ? '; Secure' : '';

  const headers = new Headers({ Location: returnTo });
  headers.append(
    'Set-Cookie',
    `${DEV_AUTH_COOKIE}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure}`,
  );

  return new Response(null, { status: 302, headers });
}
