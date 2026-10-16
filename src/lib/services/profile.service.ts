import { createAdminClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/types'
import { isValidTimezone } from '@/lib/date'
import { TABLES } from '@/lib/db-tables'
import { GoalValidationError, validateGoalWeight } from '@/lib/goal-validation'
import { getLatestWeight, upsertWeightForDate } from '@/lib/services/weight.service'

function toDbProfile(data: Partial<UserProfile>) {
  const dbData: Record<string, any> = {}
  if (data.name !== undefined) dbData.name = data.name
  if (data.age !== undefined) dbData.age = data.age
  if (data.sex !== undefined) dbData.sex = data.sex
  if (data.heightCm !== undefined) dbData.height_cm = data.heightCm
  if (data.currentWeightKg !== undefined) dbData.current_weight_kg = data.currentWeightKg
  if (data.activityLevel !== undefined) dbData.activity_level = data.activityLevel
  if (data.timezone !== undefined && isValidTimezone(data.timezone)) dbData.timezone = data.timezone
  if (data.goal !== undefined) dbData.goal = data.goal
  if (data.goalWeightKg !== undefined) dbData.goal_weight_kg = data.goalWeightKg
  if (data.goalRate !== undefined) dbData.goal_rate = data.goalRate
  if (data.diet !== undefined) dbData.diet = data.diet
  if (data.preferences !== undefined) dbData.preferences = data.preferences
  if (data.allergies !== undefined) dbData.allergies = data.allergies
  if (data.foodsToAvoid !== undefined) dbData.foods_to_avoid = data.foodsToAvoid
  if (data.preferredMealCount !== undefined) dbData.preferred_meal_count = data.preferredMealCount
  return dbData
}

export async function getProfile(userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

/**
 * The profile's current weight is derived from the weight trend. When it is edited from the
 * profile, record it as today's entry (skipped if it equals the latest entry, so saving other
 * fields doesn't add noise). The log write also re-syncs the profile row.
 */
async function recordWeightFromProfile(userId: string, weightKg: number | undefined) {
  if (typeof weightKg !== 'number' || !Number.isFinite(weightKg) || weightKg <= 0) return
  const latest = await getLatestWeight(userId)
  if (!latest || Number(latest.weight_kg) !== weightKg) {
    await upsertWeightForDate(userId, weightKg)
  }
}

/**
 * Rejects a goal weight on the wrong side of the current weight for the goal. Checked only when
 * the goal or goal weight is being written, so logging a weight that reaches the target still works.
 */
async function assertGoalWeightValid(userId: string, data: Partial<UserProfile>) {
  if (data.goal === undefined && data.goalWeightKg === undefined) return
  const existing = await getProfile(userId)
  const goal = data.goal ?? existing?.goal
  const goalWeightKg = data.goalWeightKg !== undefined ? data.goalWeightKg : existing?.goal_weight_kg
  const currentWeightKg = data.currentWeightKg ?? existing?.current_weight_kg
  const problem = validateGoalWeight(goal, goalWeightKg == null ? null : Number(goalWeightKg), currentWeightKg)
  if (problem) throw new GoalValidationError(problem)
}

export async function upsertProfile(userId: string, data: Partial<UserProfile>) {
  await assertGoalWeightValid(userId, data)
  const supabase = createAdminClient()
  const { data: profile, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .upsert({ user_id: userId, ...toDbProfile(data) })
    .select()
    .single()

  if (error) throw error
  await recordWeightFromProfile(userId, data.currentWeightKg)
  return profile
}

export async function updateProfile(userId: string, data: Partial<UserProfile>) {
  await assertGoalWeightValid(userId, data)
  const supabase = createAdminClient()
  const { data: profile, error } = await supabase
    .from(TABLES.USER_PROFILES)
    .update(toDbProfile(data))
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  await recordWeightFromProfile(userId, data.currentWeightKg)
  return profile
}
