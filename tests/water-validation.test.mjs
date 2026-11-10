import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  WaterValidationError,
  isValidDateStr,
  validateWaterAmount,
  validateWaterDate,
  validateWaterDateRange,
} from '../src/lib/water-validation.ts';

import { toDateStr, isValidTimezone } from '../src/lib/date.ts';

describe('Water Validation: Amount Rules (CF-201)', () => {
  it('rejects missing or empty values with a 400 WaterValidationError', () => {
    assert.throws(() => validateWaterAmount(undefined), WaterValidationError);
    assert.throws(() => validateWaterAmount(null), WaterValidationError);
    assert.throws(() => validateWaterAmount(''), WaterValidationError);
  });

  it('rejects non-numeric and non-finite values', () => {
    assert.throws(() => validateWaterAmount('not-a-number'), WaterValidationError);
    assert.throws(() => validateWaterAmount(NaN), WaterValidationError);
    assert.throws(() => validateWaterAmount(Infinity), WaterValidationError);
    assert.throws(() => validateWaterAmount(-Infinity), WaterValidationError);
    assert.throws(() => validateWaterAmount(true), WaterValidationError);
    assert.throws(() => validateWaterAmount([]), WaterValidationError);
    assert.throws(() => validateWaterAmount({ amount: 500 }), WaterValidationError);
  });

  it('rejects zero and negative amounts', () => {
    assert.throws(() => validateWaterAmount(0), WaterValidationError);
    assert.throws(() => validateWaterAmount(-1), WaterValidationError);
    assert.throws(() => validateWaterAmount(-500), WaterValidationError);
  });

  it('rejects values exceeding the physiological maximum (10,000 ml / 10L)', () => {
    assert.throws(() => validateWaterAmount(10_001), WaterValidationError);
    assert.throws(() => validateWaterAmount(50_000), WaterValidationError);
    assert.throws(() => validateWaterAmount(1_000_000), WaterValidationError);
  });

  it('accepts valid amounts and rounds decimals', () => {
    assert.strictEqual(validateWaterAmount(1), 1);
    assert.strictEqual(validateWaterAmount(250), 250);
    assert.strictEqual(validateWaterAmount(500), 500);
    assert.strictEqual(validateWaterAmount(10_000), 10_000);
    assert.strictEqual(validateWaterAmount(249.6), 250);
    assert.strictEqual(validateWaterAmount('750'), 750);
  });
});

describe('Water Validation: Calendar Date Rules (CF-201)', () => {
  it('validates real YYYY-MM-DD calendar dates', () => {
    assert.strictEqual(isValidDateStr('2026-11-10'), true);
    assert.strictEqual(isValidDateStr('2024-02-29'), true); // 2024 is leap year
    assert.strictEqual(isValidDateStr('2026-01-01'), true);
    assert.strictEqual(isValidDateStr('2026-12-31'), true);
  });

  it('rejects invalid calendar days and non-existent leap days', () => {
    assert.strictEqual(isValidDateStr('2025-02-29'), false); // 2025 is not leap year
    assert.strictEqual(isValidDateStr('2026-02-30'), false);
    assert.strictEqual(isValidDateStr('2026-02-31'), false);
    assert.strictEqual(isValidDateStr('2026-04-31'), false); // April has 30 days
    assert.strictEqual(isValidDateStr('2026-06-31'), false); // June has 30 days
    assert.strictEqual(isValidDateStr('2026-13-01'), false); // Month 13
    assert.strictEqual(isValidDateStr('2026-00-10'), false); // Month 0
  });

  it('rejects malformed date strings', () => {
    assert.strictEqual(isValidDateStr('10-11-2026'), false);
    assert.strictEqual(isValidDateStr('2026/11/10'), false);
    assert.strictEqual(isValidDateStr('yesterday'), false);
    assert.strictEqual(isValidDateStr(''), false);
    assert.strictEqual(isValidDateStr(null), false);
    assert.strictEqual(isValidDateStr(undefined), false);
  });

  it('allows omitted date in validateWaterDate and returns undefined', () => {
    assert.strictEqual(validateWaterDate(undefined), undefined);
    assert.strictEqual(validateWaterDate(null), undefined);
    assert.strictEqual(validateWaterDate(''), undefined);
    assert.strictEqual(validateWaterDate('2026-11-10'), '2026-11-10');
  });
});

describe('Water Validation: Date Range Rules (CF-201)', () => {
  it('rejects unpaired start/end query inputs', () => {
    assert.throws(() => validateWaterDateRange('2026-11-01', undefined), WaterValidationError);
    assert.throws(() => validateWaterDateRange(undefined, '2026-11-10'), WaterValidationError);
    assert.throws(() => validateWaterDateRange('', '2026-11-10'), WaterValidationError);
    assert.throws(() => validateWaterDateRange('2026-11-01', ''), WaterValidationError);
  });

  it('rejects inverted date ranges where start > end', () => {
    assert.throws(() => validateWaterDateRange('2026-11-10', '2026-11-01'), WaterValidationError);
  });

  it('rejects date ranges exceeding the bounded query maximum (365 days)', () => {
    assert.throws(() => validateWaterDateRange('2025-01-01', '2026-01-03'), WaterValidationError); // > 365 days
  });

  it('accepts valid date ranges within 365 days', () => {
    const range = validateWaterDateRange('2026-11-01', '2026-11-10');
    assert.strictEqual(range.start, '2026-11-01');
    assert.strictEqual(range.end, '2026-11-10');

    // Single day range is valid
    const single = validateWaterDateRange('2026-11-10', '2026-11-10');
    assert.strictEqual(single.start, '2026-11-10');
    assert.strictEqual(single.end, '2026-11-10');
  });
});

describe('Timezone-Midnight Calendar Consistency (CF-201)', () => {
  it('correctly maps instant to local calendar date across UTC, Asia/Kolkata, and America/New_York', () => {
    // 2026-11-10 18:30:00 UTC is:
    // 2026-11-11 00:00:00 in Asia/Kolkata (+05:30)
    // 2026-11-10 13:30:00 in America/New_York (-05:00)
    const instant = new Date('2026-11-10T18:30:00.000Z');

    assert.strictEqual(toDateStr(instant, 'UTC'), '2026-11-10');
    assert.strictEqual(toDateStr(instant, 'Asia/Kolkata'), '2026-11-11');
    assert.strictEqual(toDateStr(instant, 'America/New_York'), '2026-11-10');
  });

  it('validates IANA timezones', () => {
    assert.strictEqual(isValidTimezone('Asia/Kolkata'), true);
    assert.strictEqual(isValidTimezone('America/New_York'), true);
    assert.strictEqual(isValidTimezone('Europe/London'), true);
    assert.strictEqual(isValidTimezone('UTC'), true);
    assert.strictEqual(isValidTimezone('Invalid/Timezone'), false);
    assert.strictEqual(isValidTimezone(''), false);
  });
});
