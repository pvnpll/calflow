import { createClient } from '@/lib/supabase/server'
import type { NutritionGoals } from '@/lib/types'
import { TABLES } from '@/lib/db-tables'

function toDbGoals(data: Partial<NutritionGoals>) {
  const dbData: Record<string, any> = {}
  if (data.calorieTarget !== undefined) dbData.calorie_target = data.calorieTarget
  if (data.proteinTarget !== undefined) dbData.protein_target = data.proteinTarget
  if (data.carbohydrateTarget !== undefined) dbData.carbohydrate_target = data.carbohydrateTarget
  if (data.fatTarget !== undefined) dbData.fat_target = data.fatTarget
  if (data.fiberTarget !== undefined) dbData.fiber_target = data.fiberTarget
  if (data.waterTargetMl !== undefined) dbData.water_target_ml = data.waterTargetMl
  if (data.micronutrientTargets !== undefined) dbData.micronutrient_targets = data.micronutrientTargets
  if (data.isActive !== undefined) dbData.is_active = data.isActive
  return dbData
}

export async function getActiveGoals(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(TABLES.NUTRITION_GOALS)
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function upsertGoals(userId: string, data: Partial<NutritionGoals>) {
  const supabase = await createClient()
  
  // Deactivate current active goals
  await supabase
    .from(TABLES.NUTRITION_GOALS)
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true)
    
  // Insert new active goal
  const { data: newGoal, error } = await supabase
    .from(TABLES.NUTRITION_GOALS)
    .insert({ user_id: userId, ...toDbGoals(data), is_active: true })
    .select()
    .single()
    
  if (error) throw error
  return newGoal
}

export async function getGoalsHistory(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(TABLES.NUTRITION_GOALS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return data
}
