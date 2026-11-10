/**
 * Shared validation rules for water logging and water history queries.
 * Enforced across the REST API, MCP server, AI tool executor, and ChatGPT integration.
 */

export const MIN_WATER_ML = 1;
export const MAX_WATER_ML = 10_000; // 10 liters reasonable maximum per single log entry
export const MAX_WATER_RANGE_DAYS = 365; // 1 year bounded range for queries

export class WaterValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'WaterValidationError';
  }
}

/**
 * Validates that a string is a real calendar date in YYYY-MM-DD format.
 * Rejects invalid calendar days such as 2026-02-31, 2026-04-31, month 13, etc.
 */
export function isValidDateStr(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return false;

  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/**
 * Validates that a water amount is present, numeric, finite, strictly positive,
 * and within the reasonable physiological limit (1 - 10,000 ml).
 */
export function validateWaterAmount(amount: unknown): number {
  if (amount === undefined || amount === null || amount === '') {
    throw new WaterValidationError('Water amount is required');
  }

  const num = typeof amount === 'number' ? amount : Number(amount);
  if (typeof amount === 'boolean' || Array.isArray(amount) || !Number.isFinite(num) || Number.isNaN(num)) {
    throw new WaterValidationError('Water amount must be a finite number');
  }

  if (num <= 0) {
    throw new WaterValidationError('Water amount must be greater than zero');
  }

  if (num < MIN_WATER_ML) {
    throw new WaterValidationError(`Water amount must be at least ${MIN_WATER_ML} ml`);
  }

  if (num > MAX_WATER_ML) {
    throw new WaterValidationError(`Water amount cannot exceed ${MAX_WATER_ML} ml (10L) per log`);
  }

  return Math.round(num);
}

/**
 * Validates an optional calendar date in YYYY-MM-DD format.
 * If omitted, null, or empty string, returns undefined (caller can default to user's today).
 * If provided, strictly validates that it is a real calendar date.
 */
export function validateWaterDate(date?: unknown): string | undefined {
  if (date === undefined || date === null || date === '') {
    return undefined;
  }

  if (typeof date !== 'string' || !isValidDateStr(date)) {
    throw new WaterValidationError('Date must be a valid calendar date in YYYY-MM-DD format');
  }

  return date;
}

/**
 * Validates a paired date range (start and end).
 * Rejects unpaired inputs, non-calendar dates, inverted ranges (start > end),
 * and ranges exceeding the bounded query maximum (365 days).
 */
export function validateWaterDateRange(start?: unknown, end?: unknown): { start: string; end: string } {
  if (!start && !end) {
    throw new WaterValidationError('Both start and end dates are required for a date range query');
  }

  if (!start || !end) {
    throw new WaterValidationError('Both start and end dates must be provided together');
  }

  if (typeof start !== 'string' || !isValidDateStr(start)) {
    throw new WaterValidationError('Start date must be a valid calendar date in YYYY-MM-DD format');
  }

  if (typeof end !== 'string' || !isValidDateStr(end)) {
    throw new WaterValidationError('End date must be a valid calendar date in YYYY-MM-DD format');
  }

  if (start > end) {
    throw new WaterValidationError('Start date must be before or equal to end date');
  }

  const [y1, m1, d1] = start.split('-').map(Number);
  const [y2, m2, d2] = end.split('-').map(Number);
  const diffDays = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (86400 * 1000));

  if (diffDays > MAX_WATER_RANGE_DAYS) {
    throw new WaterValidationError(`Date range cannot exceed ${MAX_WATER_RANGE_DAYS} days`);
  }

  return { start, end };
}
