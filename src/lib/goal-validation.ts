/**
 * Goal-weight rules shared by onboarding, the Goals form and the profile service (so the MCP tool
 * and API are covered too). A goal weight is optional and only applies to weight-change goals.
 */
export const GOAL_WEIGHT_GOALS = ['lose_weight', 'gain_weight', 'gain_muscle'];

export class GoalValidationError extends Error {}

/** Returns an error message, or null if the goal weight is acceptable (or not applicable). */
export function validateGoalWeight(
  goal: string | null | undefined,
  goalWeightKg: number | null | undefined,
  currentWeightKg: number | null | undefined,
): string | null {
  if (!goal || !GOAL_WEIGHT_GOALS.includes(goal)) return null;
  if (goalWeightKg === null || goalWeightKg === undefined || Number.isNaN(goalWeightKg)) return null;

  if (!(goalWeightKg >= 25 && goalWeightKg <= 400)) return 'Enter a goal weight in kg (25–400).';

  const current = Number(currentWeightKg);
  if (!Number.isFinite(current) || current <= 0) return null;
  if (goal === 'lose_weight' && goalWeightKg >= current) {
    return 'Your goal weight should be below your current weight.';
  }
  if ((goal === 'gain_weight' || goal === 'gain_muscle') && goalWeightKg <= current) {
    return 'Your goal weight should be above your current weight.';
  }
  return null;
}
