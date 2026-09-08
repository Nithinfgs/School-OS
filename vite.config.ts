import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync, readFileSync } from 'node:fs';

type LocalHostingConfig = { d1?: string; r2?: string };

// Codex supplies this local-only file for Cloudflare previews. It is ignored
// by Git and is intentionally absent from Netlify deploys.
const localHostingConfigPath = fileURLToPath(
  new URL('./.openai/hosting.json', import.meta.url),
);
const hostingConfig: LocalHostingConfig = existsSync(localHostingConfigPath)
  ? JSON.parse(readFileSync(localHostingConfigPath, 'utf8'))
  : {};

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  main: 'vinext/server/fetch-handler',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep generated development state away from deployable source files.
  // Application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= join(tmpdir(), 'schoolos-wrangler', 'logs');
  // Keep Miniflare's internal worker registry outside the source directory.
  // Browsers otherwise try to upload entries such as __vite_proxy_worker__
  // when the project folder is dropped onto a hosting provider.
  process.env.MINIFLARE_REGISTRY_PATH ??= join(
    tmpdir(),
    'schoolos-wrangler',
    'registry',
  );

  const isNetlify =
    process.env.NETLIFY === 'true' || process.env.NITRO_PRESET === 'netlify';

  if (isNetlify) {
    return {
      css: { postcss: { plugins: [tailwindcss()] } },
      resolve: {
        alias: {
          'cloudflare:workers': fileURLToPath(
            new URL('./lib/netlify-cloudflare-shim.ts', import.meta.url),
          ),
        },
      },
      plugins: [vinext(), nitro()],
    };
  }

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
