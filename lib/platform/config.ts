import { dataMode, runtimeEnv } from './runtime';
const env = runtimeEnv();

// Server-only boundary protection: secrets are never exposed to client bundles.
const isServer = typeof window === 'undefined';

export const backendConfig = {
  adapter: dataMode(),
  apiBaseUrl: env.API_BASE_URL || '',
  databaseConfigured: Boolean(env.DATABASE_URL),
  storageConfigured: Boolean(env.STORAGE_ENDPOINT),
  emailConfigured: Boolean(env.EMAIL_PROVIDER_API_KEY),
};

export const supabaseConfig = {
  // Public URL is safe for browser access
  url: env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '',
  // Public anon key is safe for browser access
  publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || '',
  // Private secret keys are strictly bounded to the server environment
  secretKey: isServer ? (env.SUPABASE_SECRET_KEY || '') : '',
  jwksUrl: isServer ? (env.SUPABASE_JWKS_URL || '') : '',
};

export function assertSupabaseServerConfig() {
  if (!isServer) {
    throw new Error('SECURITY VIOLATION: Database secret configuration cannot be accessed in the browser.');
  }
  if (!supabaseConfig.url || !supabaseConfig.secretKey) {
    throw new Error('DATA_MODE=supabase requires SUPABASE_URL and SUPABASE_SECRET_KEY on the server.');
  }
}

