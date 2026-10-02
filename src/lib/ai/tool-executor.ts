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
      // Map AI tool item format to MealItemInput
      const items: MealItemInput[] = (args.items || []).map((item: any) => ({
        foodName: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        estimatedCalories: item.estimated_calories ?? item.estimated_nutrition?.calories,
        estimatedProtein: item.estimated_protein ?? item.estimated_nutrition?.protein_g,
        estimatedCarbs: item.estimated_carbs ?? item.estimated_nutrition?.carbohydrates_g ?? item.estimated_nutrition?.carbs_g,
        estimatedFat: item.estimated_fat ?? item.estimated_nutrition?.fat_g,
        estimatedFiber: item.estimated_fiber ?? item.estimated_nutrition?.fiber_g,
        micronutrients: item.micronutrients || {},
      }));

      return mealsService.createMeal(userId, {
        date: args.date,
        mealType: args.meal_type,
        description: args.description,
        items,
        estimatedCalories: args.estimated_total?.calories,
        estimatedProtein: args.estimated_total?.protein_g,
        estimatedCarbs: args.estimated_total?.carbs_g,
        estimatedFat: args.estimated_total?.fat_g,
        estimatedFiber: args.estimated_total?.fiber_g,
        micronutrients: args.micronutrients,
        confidence: args.confidence,
        source: 'chatgpt',
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

    case 'update_meal':
      return mealsService.updateMeal(userId, args.meal_id, args.updates);

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
