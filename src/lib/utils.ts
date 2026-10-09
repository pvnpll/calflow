import { parseDateStr, toDateStr } from "./date"
export { cn } from "cn"

export function formatNumber(n: number, decimals?: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  });
}

export function formatDate(date: Date | string): string {
  // 'YYYY-MM-DD' strings are calendar dates: parse as local so they don't shift a day west of UTC.
  const d = typeof date === 'string' && /^d{4}-d{2}-d{2}$/.test(date) ? parseDateStr(date) : new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 'YYYY-MM-DD' for a Date in the browser's local timezone (not UTC). */
export function toISODate(date: Date): string {
  return toDateStr(date);
}

export function getDateRange(period: '7d' | '30d' | '90d' | 'all'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case 'all':
      start.setFullYear(2000); // Or appropriate start date
      break;
  }
  return { start, end };
}

export function estimateConfidenceLabel(confidence: string): string {
  switch (confidence) {
    case 'high': return 'High Confidence';
    case 'medium': return 'Medium Confidence';
    case 'low': return 'Low Confidence';
    default: return 'Unknown Confidence';
  }
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/**
 * Turn a raw enum / snake_case DB value into a human-readable label.
 * e.g. "moderately_active" -> "Moderately Active", "lose_weight" -> "Lose Weight".
 * Never returns underscores; returns "" for null/undefined/empty.
 */
export function humanizeLabel(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  if (!s) return '';
  return s
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const SEX_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extremely_active: 'Extremely Active',
};

export const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  maintain_weight: 'Maintain Weight',
  gain_weight: 'Gain Weight',
  gain_muscle: 'Gain Muscle',
  general_health: 'General Health',
};

export const GOAL_RATE_LABELS: Record<string, string> = {
  slow: 'Slow (~0.25 kg/week)',
  moderate: 'Moderate (~0.5 kg/week)',
  fast: 'Fast (~0.75 kg/week)',
};

export const DIET_LABELS: Record<string, string> = {
  omnivore: 'Omnivore',
  pescatarian: 'Pescatarian',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  keto: 'Keto',
  paleo: 'Paleo',
};

/**
 * Look up a display label for a raw value.
 * Falls back to a humanized version of the raw value (no underscores),
 * and finally to `fallback` when the value is empty.
 */
export function enumLabel(
  map: Record<string, string>,
  value: unknown,
  fallback = 'Not set',
): string {
  if (value === null || value === undefined || String(value).trim() === '') return fallback;
  return map[String(value)] ?? humanizeLabel(value) ?? fallback;
}

/** Keep only values present in `allowed`; otherwise return `fallback`. */
export function coerceEnum(value: unknown, allowed: string[], fallback: string): string {
  const s = String(value ?? '').trim();
  return allowed.includes(s) ? s : fallback;
}
