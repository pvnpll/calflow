import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Meal, MealItem, MealInput } from '@/lib/types'
import { TABLES } from '@/lib/db-tables'

function toDbMeal(data: Partial<MealInput>) {
  const dbData: Record<string, any> = {}
  if (data.date !== undefined) dbData.date = data.date
  if (data.mealType !== undefined) dbData.meal_type = data.mealType
  if (data.description !== undefined) dbData.description = data.description
  if (data.estimatedCalories !== undefined) dbData.estimated_calories = data.estimatedCalories
  if (data.estimatedProtein !== undefined) dbData.estimated_protein = data.estimatedProtein
  if (data.estimatedCarbs !== undefined) dbData.estimated_carbs = data.estimatedCarbs
  if (data.estimatedFat !== undefined) dbData.estimated_fat = data.estimatedFat
  if (data.estimatedFiber !== undefined) dbData.estimated_fiber = data.estimatedFiber
  if (data.micronutrients !== undefined) dbData.micronutrients = data.micronutrients
  if (data.source !== undefined) dbData.source = data.source
  if (data.confidence !== undefined) dbData.confidence = data.confidence
  return dbData
}

export async function createMeal(userId: string, data: MealInput) {
  const supabase = createAdminClient()
  
  const mealRecord = {
    user_id: userId,
    date: data.date,
    meal_type: data.mealType,
    description: data.description,
    estimated_calories: data.estimatedCalories,
    estimated_protein: data.estimatedProtein,
    estimated_carbs: data.estimatedCarbs,
    estimated_fat: data.estimatedFat,
    estimated_fiber: data.estimatedFiber,
    micronutrients: data.micronutrients || {},
    source: data.source || 'web_app',
    confidence: data.confidence || 'medium',
  }
  
  const { data: meal, error: mealError } = await supabase
    .from(TABLES.MEALS)
    .insert(mealRecord)
    .select()
    .single()
    
  if (mealError) throw mealError
  
  if (data.items && data.items.length > 0) {
    const itemsData = data.items.map(item => ({
      meal_id: meal.id,
      food_name: item.foodName,
      quantity: item.quantity,
      unit: item.unit,
      estimated_calories: item.estimatedCalories,
      estimated_protein: item.estimatedProtein,
      estimated_carbs: item.estimatedCarbs,
      estimated_fat: item.estimatedFat,
      estimated_fiber: item.estimatedFiber,
      micronutrients: item.micronutrients || {},
    }))
    const { error: itemsError } = await supabase
      .from(TABLES.MEAL_ITEMS)
      .insert(itemsData)
      
    if (itemsError) throw itemsError
  }
  
  try {
    const fetched = await getMealById(userId, meal.id)
    if (fetched) return fetched
  } catch (err) {
    console.warn("getMealById fallback after insert:", err)
  }
  
  return { ...meal, [TABLES.MEAL_ITEMS]: data.items || [] }
}

export async function getMealsByDate(userId: string, date: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLES.MEALS)
    .select(`*, ${TABLES.MEAL_ITEMS}(*)`)
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
    
  if (error) throw error
  return data
}

export async function getMealsByDateRange(userId: string, startDate: string, endDate: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLES.MEALS)
    .select(`*, ${TABLES.MEAL_ITEMS}(*)`)
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    
  if (error) throw error
  return data
}

export async function getMealById(userId: string, mealId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLES.MEALS)
    .select(`*, ${TABLES.MEAL_ITEMS}(*)`)
    .eq('user_id', userId)
    .eq('id', mealId)
    .single()
    
  if (error) throw error
  return data
}

export async function updateMeal(userId: string, mealId: string, data: Partial<MealInput>) {
  const supabase = createAdminClient()
  
  const mealData = toDbMeal(data)
  
  if (Object.keys(mealData).length > 0) {
    const { error: updateError } = await supabase
      .from(TABLES.MEALS)
      .update(mealData)
      .eq('user_id', userId)
      .eq('id', mealId)
      
    if (updateError) throw updateError
  }
  
  if (data.items) {
    await supabase.from(TABLES.MEAL_ITEMS).delete().eq('meal_id', mealId)
    if (data.items.length > 0) {
      const itemsData = data.items.map(item => ({
        meal_id: mealId,
        food_name: item.foodName,
        quantity: item.quantity,
        unit: item.unit,
        estimated_calories: item.estimatedCalories,
        estimated_protein: item.estimatedProtein,
        estimated_carbs: item.estimatedCarbs,
        estimated_fat: item.estimatedFat,
        estimated_fiber: item.estimatedFiber,
        micronutrients: item.micronutrients || {},
      }))
      await supabase.from(TABLES.MEAL_ITEMS).insert(itemsData)
    }
  }
  
  return getMealById(userId, mealId)
}

export async function deleteMeal(userId: string, mealId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from(TABLES.MEALS)
    .delete()
    .eq('user_id', userId)
    .eq('id', mealId)
    
  if (error) throw error
}
