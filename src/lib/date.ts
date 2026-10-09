/**
 * Calendar-date helpers. App dates are plain 'YYYY-MM-DD' strings in the *user's* timezone —
 * never derive them with toISOString() (that is UTC and shifts the day for most of the world).
 *
 * Works on both client and server:
 *  - client: omit `timeZone` and the browser's local zone is used.
 *  - server: pass the user's stored IANA zone (see services/user-time.ts).
 */

export const DEFAULT_TIMEZONE = 'UTC';

export function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The browser's IANA timezone (e.g. 'Asia/Kolkata'). */
export function getBrowserTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimezone(tz) ? tz : null;
  } catch {
    return null;
  }
}

/** 'YYYY-MM-DD' for an instant, as seen in `timeZone` (default: runtime-local zone). */
export function toDateStr(date: Date = new Date(), timeZone?: string): string {
  // The en-CA locale formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone && isValidTimezone(timeZone) ? timeZone : undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Today's date string in `timeZone` (default: runtime-local zone). */
export function todayStr(timeZone?: string): string {
  return toDateStr(new Date(), timeZone);
}

/** Pure calendar arithmetic on a 'YYYY-MM-DD' string (no timezone involved). */
export function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Parse 'YYYY-MM-DD' as local midnight (new Date('YYYY-MM-DD') is UTC and displays as the previous day west of UTC). */
export function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Wall-clock time string in `timeZone`, for prompts. */
export function nowTimeStr(timeZone?: string): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: timeZone && isValidTimezone(timeZone) ? timeZone : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}
