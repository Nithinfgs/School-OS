/** Runtime configuration read through globalThis so server deployment variables are not inlined at build time. */
export type DataMode = 'demo' | 'supabase';
type Env = Record<string, string | undefined>;
export const runtimeEnv = (): Env => ({
  ...(globalThis as unknown as { process?: { env?: Env } }).process?.env,
  ...(import.meta.env as unknown as Env),
});

export function dataMode(): DataMode {
  const env = runtimeEnv();
  const value = env.DATA_MODE || env.SCHOOLOS_DATA_ADAPTER || 'demo';
  if (value === 'demo' || value === 'supabase') return value;
  throw new Error(`Invalid DATA_MODE '${value}'. Use demo or supabase.`);
}

/** Development profiles enabled by default unless explicitly set to false */
export function demoLoginEnabled(): boolean {
  const env = runtimeEnv();
  return env.ENABLE_DEMO_LOGIN !== 'false';
}

export function schoolTimeZone(): string {
  const env = runtimeEnv();
  return env.SCHOOL_TIMEZONE || env.NEXT_PUBLIC_SCHOOL_TIMEZONE || 'Asia/Kolkata';
}

export function assertProductionEnvironment(): void {
  const env = runtimeEnv();
  if (dataMode() !== 'supabase') return;
  const missing = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'ENCRYPTION_SECRET'].filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
}
