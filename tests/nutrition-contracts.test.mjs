import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validateGoalWeight, GOAL_WEIGHT_GOALS } from '../src/lib/goal-validation.ts';
import { formatMicroKey, formatMicroValue } from '../src/lib/format-micros.ts';
import { addDaysStr, parseDateStr, DEFAULT_TIMEZONE } from '../src/lib/date.ts';

describe('Goal Weight Validation Contract (CF-203)', () => {
  it('identifies valid goal types that require weight validation', () => {
    assert.deepStrictEqual(GOAL_WEIGHT_GOALS, ['lose_weight', 'gain_weight', 'gain_muscle']);
  });

  it('allows null or undefined goal weights without error', () => {
    assert.strictEqual(validateGoalWeight('lose_weight', null, 80), null);
    assert.strictEqual(validateGoalWeight('lose_weight', undefined, 80), null);
    assert.strictEqual(validateGoalWeight(null, 70, 80), null);
    assert.strictEqual(validateGoalWeight('maintain', 75, 75), null);
  });

  it('enforces boundary limit (25 - 400 kg)', () => {
    assert.ok(validateGoalWeight('lose_weight', 24, 80)?.includes('25–400'));
    assert.ok(validateGoalWeight('lose_weight', 401, 80)?.includes('25–400'));
    assert.strictEqual(validateGoalWeight('lose_weight', 25, 80), null);
    assert.strictEqual(validateGoalWeight('gain_weight', 400, 80), null);
  });

  it('requires goal weight to be strictly below current weight for lose_weight', () => {
    assert.ok(validateGoalWeight('lose_weight', 85, 80)?.includes('below your current weight'));
    assert.ok(validateGoalWeight('lose_weight', 80, 80)?.includes('below your current weight'));
    assert.strictEqual(validateGoalWeight('lose_weight', 75, 80), null);
  });

  it('requires goal weight to be strictly above current weight for gain_weight and gain_muscle', () => {
    assert.ok(validateGoalWeight('gain_weight', 70, 80)?.includes('above your current weight'));
    assert.ok(validateGoalWeight('gain_weight', 80, 80)?.includes('above your current weight'));
    assert.strictEqual(validateGoalWeight('gain_weight', 85, 80), null);

    assert.ok(validateGoalWeight('gain_muscle', 75, 80)?.includes('above your current weight'));
    assert.ok(validateGoalWeight('gain_muscle', 80, 80)?.includes('above your current weight'));
    assert.strictEqual(validateGoalWeight('gain_muscle', 85, 80), null);
  });
});

describe('Micronutrient Formatting Contract (CF-203)', () => {
  it('formats micronutrient keys into human-readable label and unit', () => {
    assert.deepStrictEqual(formatMicroKey('vitamin_c_mg'), { label: 'Vitamin C', unit: 'mg' });
    assert.deepStrictEqual(formatMicroKey('vitamin_b12_mcg'), { label: 'Vitamin B12', unit: 'mcg' });
    assert.deepStrictEqual(formatMicroKey('iron_mg'), { label: 'Iron', unit: 'mg' });
    assert.deepStrictEqual(formatMicroKey('calcium_mg'), { label: 'Calcium', unit: 'mg' });
    assert.deepStrictEqual(formatMicroKey('potassium_mg'), { label: 'Potassium', unit: 'mg' });
  });

  it('formats micronutrient values cleanly', () => {
    assert.strictEqual(formatMicroValue(90), '90');
    assert.strictEqual(formatMicroValue(2.84), '2.8');
    assert.strictEqual(formatMicroValue(undefined), '—');
    assert.strictEqual(formatMicroValue('not-a-num'), 'not-a-num');
  });
});

describe('Calendar Arithmetic (CF-203)', () => {
  it('adds and subtracts days deterministically across month boundaries', () => {
    assert.strictEqual(addDaysStr('2026-11-10', 1), '2026-11-11');
    assert.strictEqual(addDaysStr('2026-11-10', -10), '2026-10-31');
    assert.strictEqual(addDaysStr('2026-12-31', 1), '2027-01-01');
    assert.strictEqual(addDaysStr('2024-02-28', 1), '2024-02-29'); // Leap year
    assert.strictEqual(addDaysStr('2024-02-29', 1), '2024-03-01');
  });

  it('parses YYYY-MM-DD as local midnight date', () => {
    const parsed = parseDateStr('2026-11-10');
    assert.strictEqual(parsed.getFullYear(), 2026);
    assert.strictEqual(parsed.getMonth(), 10); // 0-indexed November = 10
    assert.strictEqual(parsed.getDate(), 10);
  });

  it('defines UTC as the fallback DEFAULT_TIMEZONE', () => {
    assert.strictEqual(DEFAULT_TIMEZONE, 'UTC');
  });
});
