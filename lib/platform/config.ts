export const backendConfig = {
  adapter: process.env.DATA_MODE || process.env.SCHOOLOS_DATA_ADAPTER || 'demo',
  apiBaseUrl: process.env.API_BASE_URL || '',
  databaseConfigured: Boolean(process.env.DATABASE_URL),
  storageConfigured: Boolean(process.env.STORAGE_ENDPOINT),
  emailConfigured: Boolean(process.env.EMAIL_PROVIDER_API_KEY),
};
// Secrets are read on the server only. Client components receive repository results, never credentials.

export const supabaseConfig = {
  // Accept the existing public Supabase variable names as aliases. The server
  // adapter still requires SUPABASE_SECRET_KEY and never falls back to a
  // client-prefixed secret.
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  // Prefer the project public key used by the browser. Keep the server alias
  // as a fallback for existing deployments, but never let a stale duplicate
  // server variable override the valid public key.
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
  secretKey: process.env.SUPABASE_SECRET_KEY || '',
  jwksUrl: process.env.SUPABASE_JWKS_URL || '',
};

export function assertSupabaseServerConfig() {
  if (!supabaseConfig.url || !supabaseConfig.secretKey) {
    throw new Error('DATA_MODE=supabase requires SUPABASE_URL and SUPABASE_SECRET_KEY on the server.');
  }
}
