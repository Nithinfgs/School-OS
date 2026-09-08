import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveSupabaseBearer } from '@/lib/platform/supabase-auth';

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = 'oai-authenticated-user-id';
const USER_EMAIL_HEADER = 'oai-authenticated-user-email';
const USER_FULL_NAME_HEADER = 'oai-authenticated-user-full-name';
const USER_FULL_NAME_ENCODING_HEADER =
  'oai-authenticated-user-full-name-encoding';
const PERCENT_ENCODED_UTF8 = 'percent-encoded-utf-8';
const SIGN_IN_PATH = '/signin-with-chatgpt';
const SIGN_OUT_PATH = '/signout-with-chatgpt';
const CALLBACK_PATH = '/callback';
export const DEV_AUTH_COOKIE = 'schoolos-dev-user';

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const devUser = await getDevUser();
  if (devUser) return devUser;

  if (process.env.DATA_MODE === 'supabase') {
    const store = await cookies();
    const accessToken = store.get('schoolos-supabase-access')?.value;
    if (accessToken) {
      try {
        const member = await resolveSupabaseBearer(accessToken);
        return {
          userId: member.id,
          displayName: member.name || member.email,
          email: member.email,
          fullName: member.name || null,
        };
      } catch {
        return null;
      }
    }
  }

  const requestHeaders = await headers();
  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!userId || !email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    userId,
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

async function getDevUser(): Promise<ChatGPTUser | null> {
  // Development profiles are intentionally available on the hosted demo so
  // presenters can open each role without provisioning accounts.
  const requestHeaders = await headers();
  const hostHeader = requestHeaders.get('host') || requestHeaders.get('x-forwarded-host') || '';
  const hostname = hostHeader.split(':')[0];
  const cleanHost = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const isLocal =
    process.env.NODE_ENV !== 'production' ||
    Boolean(process.env.SITE_ID || process.env.URL) ||
    !cleanHost ||
    ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(cleanHost) ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.local');

  if (!isLocal) return null;
  const store = await cookies();
  const raw = store.get(DEV_AUTH_COOKIE)?.value;
  if (!raw) return null;

  let parsed: any = null;
  try {
    parsed = JSON.parse(atob(raw));
  } catch {
    try {
      parsed = JSON.parse(atob(decodeURIComponent(raw)));
    } catch {
      try {
        parsed = JSON.parse(decodeURIComponent(raw));
      } catch {
        try {
          parsed = JSON.parse(raw);
        } catch {
          return null;
        }
      }
    }
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('role' in parsed)
  )
    return null;

  const role = String(parsed.role).toLowerCase();
  const profiles: Record<string, ChatGPTUser> = {
    student: {
      userId: 'dev:student',
      displayName: 'Nithin Selvaraj',
      email: 'nithin.selvaraj@schoolos.local',
      fullName: 'Nithin Selvaraj',
    },
    teacher: {
      userId: 'dev:teacher',
      displayName: 'Maya Iyer',
      email: 'teacher.dev@schoolos.local',
      fullName: 'Maya Iyer',
    },
    admin: {
      userId: 'dev:admin',
      displayName: 'Nithin Selvaraj',
      email: 'admin.dev@schoolos.local',
      fullName: 'Nithin Selvaraj',
    },
    'lab-assistant': {
      userId: 'dev:lab-assistant',
      displayName: 'Olivia Reed',
      email: 'lab.assistant.dev@schoolos.local',
      fullName: 'Olivia Reed',
    },
    'library-assistant': {
      userId: 'dev:library-assistant',
      displayName: 'Daniel Moore',
      email: 'library.assistant.dev@schoolos.local',
      fullName: 'Daniel Moore',
    },
    hos: {
      userId: 'dev:hos',
      displayName: 'Dr. Aisha Rahman',
      email: 'hos.dev@schoolos.local',
      fullName: 'Dr. Aisha Rahman',
    },
    'transport-staff': {
      userId: 'dev:transport-staff',
      displayName: 'Leena Joseph',
      email: 'transport.dev@schoolos.local',
      fullName: 'Leena Joseph',
    },
  };

  return profiles[role] || null;
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = '/'): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/';

  let url: URL;
  try {
    url = new URL(value, 'https://app.local');
  } catch {
    return '/';
  }
  if (url.origin !== 'https://app.local') return '/';
  if (isReservedAuthPath(url.pathname)) return '/';

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
