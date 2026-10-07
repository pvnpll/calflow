import * as profileService from '@/lib/services/profile.service';
import * as goalsService from '@/lib/services/goals.service';
import * as mealsService from '@/lib/services/meals.service';
import * as nutritionService from '@/lib/services/nutrition.service';
import * as waterService from '@/lib/services/water.service';
import * as weightService from '@/lib/services/weight.service';
import * as insightsService from '@/lib/services/insights.service';
import type { MealItemInput } from '@/lib/types';

export async function executeTool(toolName: string, args: Record<string, any>, userId: string): Promise<any> {
  switch (toolName) {
    case 'log_meal': {
      const today = new Date().toISOString().split('T')[0];
      const mealDate = args.date || today;

      // Infer meal type if omitted
      let inferredMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = args.meal_type || 'snack';
      if (!args.meal_type && args.description) {
        const lower = args.description.toLowerCase();
        if (lower.includes('breakfast') || lower.includes('egg') || lower.includes('omelette') || lower.includes('toast') || lower.includes('oat') || lower.includes('cereal') || lower.includes('idli') || lower.includes('dosa')) {
          inferredMealType = 'breakfast';
        } else if (lower.includes('lunch')) {
          inferredMealType = 'lunch';
        } else if (lower.includes('dinner')) {
          inferredMealType = 'dinner';
        }
      }

      // Map AI tool item format to MealItemInput
      const items: MealItemInput[] = (args.items || []).map((item: any) => ({
        foodName: item.food_name || item.name || 'Food item',
        quantity: item.quantity ?? 1,
        unit: item.unit ?? 'serving',
        estimatedCalories: item.estimated_calories ?? item.calories ?? item.estimated_nutrition?.calories,
        estimatedProtein: item.estimated_protein ?? item.protein_g ?? item.protein ?? item.estimated_nutrition?.protein_g,
        estimatedCarbs: item.estimated_carbs ?? item.carbs_g ?? item.carbs ?? item.estimated_nutrition?.carbohydrates_g ?? item.estimated_nutrition?.carbs_g,
        estimatedFat: item.estimated_fat ?? item.fat_g ?? item.fat ?? item.estimated_nutrition?.fat_g,
        estimatedFiber: item.estimated_fiber ?? item.fiber_g ?? item.fiber ?? item.estimated_nutrition?.fiber_g,
        micronutrients: item.micronutrients || {},
      }));

      // Calculate totals if not explicitly given
      const totalCalories = args.estimated_total?.calories ?? args.calories ?? (items.length > 0 ? items.reduce((s, it) => s + (it.estimatedCalories || 0), 0) : undefined);
      const totalProtein = args.estimated_total?.protein_g ?? args.protein_g ?? (items.length > 0 ? items.reduce((s, it) => s + (it.estimatedProtein || 0), 0) : undefined);
      const totalCarbs = args.estimated_total?.carbs_g ?? args.carbs_g ?? (items.length > 0 ? items.reduce((s, it) => s + (it.estimatedCarbs || 0), 0) : undefined);
      const totalFat = args.estimated_total?.fat_g ?? args.fat_g ?? (items.length > 0 ? items.reduce((s, it) => s + (it.estimatedFat || 0), 0) : undefined);
      const totalFiber = args.estimated_total?.fiber_g ?? args.fiber_g ?? (items.length > 0 ? items.reduce((s, it) => s + (it.estimatedFiber || 0), 0) : undefined);

      return mealsService.createMeal(userId, {
        date: mealDate,
        mealType: inferredMealType,
        description: args.description || 'Logged meal',
        items,
        estimatedCalories: totalCalories,
        estimatedProtein: totalProtein,
        estimatedCarbs: totalCarbs,
        estimatedFat: totalFat,
        estimatedFiber: totalFiber,
        micronutrients: args.micronutrients || {},
        confidence: args.confidence || 'medium',
        source: 'calflow_ai',
      });
    }

    case 'get_today_summary':
      return nutritionService.getTodaySummary(userId);

    case 'get_meals': {
      if (args.date) {
        return mealsService.getMealsByDate(userId, args.date);
      }
      if (args.start_date && args.end_date) {
        return mealsService.getMealsByDateRange(userId, args.start_date, args.end_date);
      }
      // Default: return today's meals
      const today = new Date().toISOString().split('T')[0];
      return mealsService.getMealsByDate(userId, today);
    }

    case 'update_meal': {
      // Normalize snake_case keys from AI to camelCase expected by the service
      const raw = args.updates || {};
      const updates: Record<string, any> = {};
      if (raw.description !== undefined) updates.description = raw.description;
      if (raw.meal_type !== undefined || raw.mealType !== undefined) updates.mealType = raw.meal_type ?? raw.mealType;
      if (raw.date !== undefined) updates.date = raw.date;
      if (raw.estimated_calories !== undefined || raw.estimatedCalories !== undefined)
        updates.estimatedCalories = raw.estimated_calories ?? raw.estimatedCalories;
      if (raw.estimated_protein !== undefined || raw.estimatedProtein !== undefined)
        updates.estimatedProtein = raw.estimated_protein ?? raw.estimatedProtein;
      if (raw.estimated_carbs !== undefined || raw.estimatedCarbs !== undefined)
        updates.estimatedCarbs = raw.estimated_carbs ?? raw.estimatedCarbs;
      if (raw.estimated_fat !== undefined || raw.estimatedFat !== undefined)
        updates.estimatedFat = raw.estimated_fat ?? raw.estimatedFat;
      if (raw.estimated_fiber !== undefined || raw.estimatedFiber !== undefined)
        updates.estimatedFiber = raw.estimated_fiber ?? raw.estimatedFiber;
      if (raw.micronutrients !== undefined) updates.micronutrients = raw.micronutrients;
      if (raw.confidence !== undefined) updates.confidence = raw.confidence;
      if (raw.items !== undefined) {
        updates.items = raw.items.map((item: any) => ({
          foodName: item.food_name || item.foodName || 'Food item',
          quantity: item.quantity ?? 1,
          unit: item.unit ?? 'serving',
          estimatedCalories: item.estimated_calories ?? item.estimatedCalories,
          estimatedProtein: item.estimated_protein ?? item.estimatedProtein,
          estimatedCarbs: item.estimated_carbs ?? item.estimatedCarbs,
          estimatedFat: item.estimated_fat ?? item.estimatedFat,
          estimatedFiber: item.estimated_fiber ?? item.estimatedFiber,
          micronutrients: item.micronutrients || {},
        }));
      }
      return mealsService.updateMeal(userId, args.meal_id, updates);
    }

    case 'delete_meal':
      return mealsService.deleteMeal(userId, args.meal_id);

    case 'get_user_profile':
      return profileService.getProfile(userId);

    case 'get_nutrition_goals':
      return goalsService.getActiveGoals(userId);

    case 'update_nutrition_goals':
      return goalsService.upsertGoals(userId, {
        calorieTarget: args.calorie_target,
        proteinTarget: args.protein_target,
        carbohydrateTarget: args.carbohydrate_target,
        fatTarget: args.fat_target,
        fiberTarget: args.fiber_target,
        waterTargetMl: args.water_target_ml,
      });

    case 'get_nutrition_gaps':
      return nutritionService.getNutritionGaps(userId);

    case 'get_nutrition_summary':
      return nutritionService.getNutritionSummary(userId, args.start_date, args.end_date);

    case 'log_water':
      return waterService.logWater(userId, args.amount_ml, args.date);

    case 'get_water_summary': {
      if (args.date) {
        return waterService.getWaterByDate(userId, args.date);
      }
      if (args.start_date && args.end_date) {
        return waterService.getWaterSummary(userId, args.start_date, args.end_date);
      }
      const todayDate = new Date().toISOString().split('T')[0];
      return waterService.getWaterByDate(userId, todayDate);
    }

    case 'log_weight':
      return weightService.logWeight(userId, args.weight_kg, args.date, args.note);

    case 'get_weight_history':
      return weightService.getWeightHistory(userId, args.start_date, args.end_date);

    case 'get_insights':
      return insightsService.getInsights(userId, args.days || 30);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
