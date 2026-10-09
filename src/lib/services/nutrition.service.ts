import { getActiveGoals } from './goals.service'
import { getMealsByDate, getMealsByDateRange } from './meals.service'
import { getWaterByDate, getWaterByDateRange } from './water.service'
import { getUserToday } from './user-time'
import type { NutritionGoals, Meal } from '@/lib/types'

function aggregateMeals(meals: any[]) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  for (const meal of meals) {
    totals.calories += meal.estimated_calories || 0
    totals.protein += meal.estimated_protein || 0
    totals.carbs += meal.estimated_carbs || 0
    totals.fat += meal.estimated_fat || 0
    totals.fiber += meal.estimated_fiber || 0
  }
  return totals
}

export async function getTodaySummary(userId: string) {
  const today = await getUserToday(userId)
  const [goals, meals, waterTotal] = await Promise.all([
    getActiveGoals(userId),
    getMealsByDate(userId, today),
    getWaterByDate(userId, today)
  ])

  const consumed = aggregateMeals(meals)
  const remaining = {
    calories: (goals?.calorie_target || 0) - consumed.calories,
    protein: (goals?.protein_target || 0) - consumed.protein,
    carbs: (goals?.carbohydrate_target || 0) - consumed.carbs,
    fat: (goals?.fat_target || 0) - consumed.fat,
    fiber: (goals?.fiber_target || 0) - consumed.fiber,
    water: (goals?.water_target_ml || 0) - waterTotal
  }

  return { targets: goals, consumed: { ...consumed, water: waterTotal }, remaining }
}

export async function getNutritionSummary(userId: string, startDate: string, endDate: string) {
  const [meals, waterLogs] = await Promise.all([
    getMealsByDateRange(userId, startDate, endDate),
    getWaterByDateRange(userId, startDate, endDate)
  ])

  const consumed = aggregateMeals(meals)
  const waterTotal = waterLogs.reduce((acc, log) => acc + (log.amount_ml || 0), 0)

  return { consumed: { ...consumed, water: waterTotal } }
}

export async function getNutritionGaps(userId: string) {
  const summary = await getTodaySummary(userId)
  if (!summary.targets) return null
  
  const gaps: Record<string, number> = {}
  for (const [key, value] of Object.entries(summary.remaining)) {
    if (value > 0) gaps[key] = value
  }
  return gaps
}

export async function getDailyBreakdown(userId: string, startDate: string, endDate: string) {
  const [meals, waterLogs] = await Promise.all([
    getMealsByDateRange(userId, startDate, endDate),
    getWaterByDateRange(userId, startDate, endDate)
  ])

  const breakdown: Record<string, any> = {}
  
  for (const meal of meals) {
    if (!breakdown[meal.date]) {
      breakdown[meal.date] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 }
    }
    breakdown[meal.date].calories += meal.estimated_calories || 0
    breakdown[meal.date].protein += meal.estimated_protein || 0
    breakdown[meal.date].carbs += meal.estimated_carbs || 0
    breakdown[meal.date].fat += meal.estimated_fat || 0
    breakdown[meal.date].fiber += meal.estimated_fiber || 0
  }

  for (const log of waterLogs) {
    if (!breakdown[log.date]) {
      breakdown[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 }
    }
    breakdown[log.date].water += log.amount_ml || 0
  }

  return breakdown
}
