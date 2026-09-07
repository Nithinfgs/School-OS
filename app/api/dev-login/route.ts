import { DEV_AUTH_COOKIE } from '@/app/chatgpt-auth';

const roles = new Set(['student', 'teacher', 'admin']);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const netlifyDemo = Boolean(process.env.SITE_ID || process.env.URL);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const isLocal =
    process.env.NODE_ENV !== 'production' ||
    netlifyDemo ||
    ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local');

  if (!isLocal)
    return new Response('Not found', { status: 404 });
  const role = url.searchParams.get('role') || '';
  const returnTo = safeReturnTo(url.searchParams.get('return_to') || '/');
  const secure = url.protocol === 'https:' ? '; Secure' : '';

  const headers = new Headers({ Location: returnTo });
  if (role === 'clear' || role === 'signout' || role === 'logout') {
    headers.append(
      'Set-Cookie',
      `${DEV_AUTH_COOKIE}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${secure}`,
    );
    return new Response(null, { status: 302, headers });
  }

  if (!roles.has(role))
    return Response.json({ error: 'Unknown dev role' }, { status: 400 });

  headers.append(
    'Set-Cookie',
    `${DEV_AUTH_COOKIE}=${btoa(JSON.stringify({ role }))}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${secure}`,
  );

  return new Response(null, { status: 302, headers });
}

function safeReturnTo(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'https://schoolos.local');
    if (url.origin !== 'https://schoolos.local') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}
