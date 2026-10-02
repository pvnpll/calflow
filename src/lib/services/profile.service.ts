import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/lib/types'

function toDbProfile(data: Partial<UserProfile>) {
  const dbData: Record<string, any> = {}
  if (data.name !== undefined) dbData.name = data.name
  if (data.age !== undefined) dbData.age = data.age
  if (data.sex !== undefined) dbData.sex = data.sex
  if (data.heightCm !== undefined) dbData.height_cm = data.heightCm
  if (data.currentWeightKg !== undefined) dbData.current_weight_kg = data.currentWeightKg
  if (data.activityLevel !== undefined) dbData.activity_level = data.activityLevel
  if (data.goal !== undefined) dbData.goal = data.goal
  if (data.diet !== undefined) dbData.diet = data.diet
  if (data.preferences !== undefined) dbData.preferences = data.preferences
  if (data.allergies !== undefined) dbData.allergies = data.allergies
  if (data.foodsToAvoid !== undefined) dbData.foods_to_avoid = data.foodsToAvoid
  if (data.preferredMealCount !== undefined) dbData.preferred_meal_count = data.preferredMealCount
  return dbData
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

export async function upsertProfile(userId: string, data: Partial<UserProfile>) {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...toDbProfile(data) })
    .select()
    .single()
    
  if (error) throw error
  return profile
}

export async function updateProfile(userId: string, data: Partial<UserProfile>) {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(toDbProfile(data))
    .eq('user_id', userId)
    .select()
    .single()
    
  if (error) throw error
  return profile
}
