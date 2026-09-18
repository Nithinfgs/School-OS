/**
 * Prototype state may persist only in an explicit local-browser demo.  Production
 * origins receive a no-op store so operational/student data is never written to
 * browser localStorage.
 */
function localDemoStore(): Storage | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' ? window.localStorage : null;
}

export const demoStorage = {
  getItem(key: string): string | null {
    return localDemoStore()?.getItem(key) ?? null;
  },
  setItem(key: string, value: string): void {
    localDemoStore()?.setItem(key, value);
  },
  removeItem(key: string): void {
    localDemoStore()?.removeItem(key);
  },
};
