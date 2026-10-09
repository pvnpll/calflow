import { getMealsByDateRange } from './meals.service'
import { getWaterByDateRange } from './water.service'
import { getWeightHistory } from './weight.service'
import { getActiveGoals } from './goals.service'

import { getProfile } from './profile.service'
import { getUserDateRange } from './user-time'

export async function getInsights(userId: string, days = 30) {
  const { start: startIso, end: endIso } = await getUserDateRange(userId, days)
  
  const [meals, waterLogs, weightHistory, goals, profile] = await Promise.all([
    getMealsByDateRange(userId, startIso, endIso),
    getWaterByDateRange(userId, startIso, endIso),
    getWeightHistory(userId, startIso, endIso),
    getActiveGoals(userId),
    getProfile(userId)
  ])
  
  // Averages
  const loggedDays = new Set(meals.map((m: any) => m.date)).size
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 }
  
  for (const meal of meals) {
    totals.calories += meal.estimated_calories || 0
    totals.protein += meal.estimated_protein || 0
    totals.carbs += meal.estimated_carbs || 0
    totals.fat += meal.estimated_fat || 0
    totals.fiber += meal.estimated_fiber || 0
  }
  
  for (const log of waterLogs) {
    totals.water += log.amount_ml || 0
  }
  
  const divisor = loggedDays || 1
  const averages = {
    calories: totals.calories / divisor,
    protein: totals.protein / divisor,
    carbs: totals.carbs / divisor,
    fat: totals.fat / divisor,
    fiber: totals.fiber / divisor,
    water: totals.water / divisor
  }
  
  // Weight trend
  const weightTrend = {
    start: weightHistory.length > 0 ? weightHistory[0].weight_kg : null,
    end: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight_kg : null,
    change: weightHistory.length >= 2 ? 
      weightHistory[weightHistory.length - 1].weight_kg - weightHistory[0].weight_kg : 0
  }
  
  // Consistency
  const consistency = {
    daysLogged: loggedDays,
    totalDays: days,
    percentage: (loggedDays / days) * 100
  }
  
  // Most logged foods
  const foodCounts: Record<string, number> = {}
  for (const meal of meals) {
    if (meal.meal_items) {
      for (const item of meal.meal_items) {
        if (item.food_name) {
          foodCounts[item.food_name] = (foodCounts[item.food_name] || 0) + 1
        }
      }
    }
  }
  
  const mostLoggedFoods = Object.entries(foodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))
    
  // Macro distribution
  const totalMacrosCalories = (totals.protein * 4) + (totals.carbs * 4) + (totals.fat * 9)
  const macroDistribution = totalMacrosCalories > 0 ? {
    protein: ((totals.protein * 4) / totalMacrosCalories) * 100,
    carbs: ((totals.carbs * 4) / totalMacrosCalories) * 100,
    fat: ((totals.fat * 9) / totalMacrosCalories) * 100,
  } : { protein: 0, carbs: 0, fat: 0 }
  
  // Target achievement
  const daysMetTarget = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }
  const dailyTotals: Record<string, any> = {}
  
  for (const meal of meals) {
    if (!dailyTotals[meal.date]) dailyTotals[meal.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    dailyTotals[meal.date].calories += meal.estimated_calories || 0
    dailyTotals[meal.date].protein += meal.estimated_protein || 0
    dailyTotals[meal.date].carbs += meal.estimated_carbs || 0
    dailyTotals[meal.date].fat += meal.estimated_fat || 0
  }
  
  const dailyWater: Record<string, number> = {}
  for (const log of waterLogs) {
    dailyWater[log.date] = (dailyWater[log.date] || 0) + (log.amount_ml || 0)
  }
  
  if (goals) {
    for (const date of Object.keys(dailyTotals)) {
      const d = dailyTotals[date]
      if (goals.calorie_target && Math.abs(d.calories - goals.calorie_target) <= 200) daysMetTarget.calories++
      if (goals.protein_target && d.protein >= goals.protein_target) daysMetTarget.protein++
      if (goals.carbohydrate_target && d.carbs <= goals.carbohydrate_target) daysMetTarget.carbs++
      if (goals.fat_target && d.fat <= goals.fat_target) daysMetTarget.fat++
    }
    
    for (const date of Object.keys(dailyWater)) {
      if (goals.water_target_ml && dailyWater[date] >= goals.water_target_ml) daysMetTarget.water++
    }
  }

  return {
    averages,
    weightTrend,
    consistency,
    mostLoggedFoods,
    macroDistribution,
    targetAchievementRate: {
      calories: loggedDays > 0 ? (daysMetTarget.calories / loggedDays) * 100 : 0,
      protein: loggedDays > 0 ? (daysMetTarget.protein / loggedDays) * 100 : 0,
      carbs: loggedDays > 0 ? (daysMetTarget.carbs / loggedDays) * 100 : 0,
      fat: loggedDays > 0 ? (daysMetTarget.fat / loggedDays) * 100 : 0,
      water: Object.keys(dailyWater).length > 0 ? (daysMetTarget.water / Object.keys(dailyWater).length) * 100 : 0,
    },
    rawMeals: meals,
    rawWaterLogs: waterLogs,
    rawWeightHistory: weightHistory,
    profile
  }
}
