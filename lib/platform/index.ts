import { backendConfig } from './config';
import { createDemoDataPlatform } from './demo-adapter';
import { createSupabaseDataPlatform } from './supabase-adapter';

export * from './contracts';
export * from './entities';
export * from './permissions';
export * from './schemas';
export * from './services';

export function createDataPlatform() {
  if (backendConfig.adapter === 'demo') return createDemoDataPlatform();
  if (backendConfig.adapter === 'supabase') return createSupabaseDataPlatform();
  throw new Error(`Unknown data adapter '${backendConfig.adapter}'. Use demo or supabase.`);
}
