export type WorkspaceMutationMode = 'mock' | 'supabase' | 'database';

export function workspaceMutationMode(
  user: { userId?: string } | null,
  adapter: string,
): WorkspaceMutationMode {
  if (user?.userId?.startsWith('dev:')) return 'mock';
  return adapter === 'supabase' ? 'supabase' : 'database';
}
