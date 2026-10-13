/**
 * Post-login redirect targets must be same-site paths. Anything else (absolute URLs, protocol-relative
 * "//evil.com", backslash tricks) falls back, so a crafted ?next= can't send people off-site.
 */
export function safeNextPath(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  return next;
}

/** Read ?next= or ?return_to= from the current URL (client only). */
export function getNextFromLocation(): string {
  if (typeof window === 'undefined') return '/dashboard';
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || params.get('return_to');
  return safeNextPath(next, '/dashboard');
}
