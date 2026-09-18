import assert from 'assert';
import { workspaceMutationMode } from '../../lib/workspace-routing';

export async function runWorkspaceRoutingTests() {
  console.log('  ▶ Testing workspace mutation routing...');

  assert.strictEqual(
    workspaceMutationMode({ userId: 'dev:admin' }, 'database'),
    'mock',
    'Demo users must mutate the same mock workspace returned by GET',
  );
  assert.strictEqual(
    workspaceMutationMode({ userId: 'member-1' }, 'supabase'),
    'supabase',
  );
  assert.strictEqual(
    workspaceMutationMode({ userId: 'member-1' }, 'database'),
    'database',
  );

  console.log('  ✔ Workspace mutation routing verified.');
}
