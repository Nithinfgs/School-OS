export const webSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const pagePath = (page: string) => `/${webSlug(page || 'home')}`;

export function navigateWebsite(path: string, replace = false) {
  if (typeof window === 'undefined') return;
  const target = path.startsWith('/') ? path : `/${path}`;
  if (replace) history.replaceState(null, '', target);
  else history.pushState(null, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function migrateLegacyHash() {
  if (typeof window === 'undefined' || !location.hash) return;
  const legacy = decodeURIComponent(location.hash.slice(1));
  if (!legacy) return;
  navigateWebsite(legacy === 'home' ? '/home' : `/${legacy}`, true);
}
