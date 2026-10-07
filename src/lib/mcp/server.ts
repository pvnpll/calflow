import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProfile, upsertProfile } from "@/lib/services/profile.service";
import { getActiveGoals, upsertGoals } from "@/lib/services/goals.service";
import { logWeight, getWeightHistory } from "@/lib/services/weight.service";
import { logWater, getWaterByDateRange } from "@/lib/services/water.service";
import { getInsights } from "@/lib/services/insights.service";
import { createMeal, getMealsByDate, getMealsByDateRange, updateMeal, deleteMeal } from "@/lib/services/meals.service";
import { getTodaySummary, getNutritionSummary } from "@/lib/services/nutrition.service";

export function createCalflowMcpServer(authInfo?: any, defaultSource: 'chatgpt' | 'claude' | 'mcp' | 'calflow_ai' | 'web_app' = 'claude') {
  const server = new McpServer({
    name: "calflow",
    version: "1.0.0",
  });

  // Tools

  // log_meal
  server.tool(
    "log_meal",
    "Record a meal and its complete estimated nutrition for the user. IMPORTANT: Provide comprehensive nutritional data including all vitamins (vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg, b-complex) and minerals (calcium_mg, iron_mg, magnesium_mg, potassium_mg, zinc_mg, etc.) from the foods based on USDA/FDA reference standards, not just basic calories and macros.",
    {
      meal_text: z.string().describe("An extremely short, 1-3 word title summarizing the meal (e.g., 'Omelette & Oats', 'Chicken Tikka'). DO NOT include quantities or descriptions."),
      calories: z.number().describe("Estimated total calories"),
      protein_g: z.number().describe("Estimated total protein in grams"),
      carbs_g: z.number().describe("Estimated total carbohydrates in grams"),
      fat_g: z.number().describe("Estimated total fat in grams"),
      fiber_g: z.number().optional().describe("Estimated total fiber in grams"),
      meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional().describe("Meal type: breakfast, lunch, dinner, or snack. Infer from time or food if omitted."),
      date: z.string().optional().describe("Date in YYYY-MM-DD format. ALWAYS OMIT this field to default to the current day, unless the user explicitly specifies a different date (e.g., 'yesterday')."),
      time: z.string().optional().describe("Time in HH:mm format"),
      notes: z.string().optional().describe("Any additional notes"),
      items: z.array(z.object({
        food_name: z.string().describe("Name of the food item"),
        quantity: z.number().optional().describe("Quantity or portion amount"),
        unit: z.string().optional().describe("Serving unit (e.g. slice, egg, ml, g, cup)"),
        calories: z.number().optional().describe("Calories for this item"),
        protein_g: z.number().optional().describe("Protein in grams for this item"),
        carbs_g: z.number().optional().describe("Carbohydrates in grams for this item"),
        fat_g: z.number().optional().describe("Fat in grams for this item"),
        fiber_g: z.number().optional().describe("Fiber in grams for this item"),
        micronutrients: z.record(z.string(), z.number()).optional().describe("Vitamins and minerals for this specific food item as numeric values (e.g. vitamin_a_mcg: 240, calcium_mg: 300, etc.)")
      })).optional().describe("Individual constituent items of the meal"),
      micronutrients: z.record(z.string(), z.number()).optional().describe("Complete vitamins and minerals breakdown for the entire meal with numeric values only (e.g. calcium_mg: 350, iron_mg: 2.8, potassium_mg: 480, vitamin_c_mg: 15)")
    },
    async (args, extra) => {
      try {
        const userId = authInfo?.extra?.userId as string;
        if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
        
        console.log("[MCP log_meal] Executing with args:", JSON.stringify(args), "userId:", userId);
        
        // Infer meal type if not explicitly provided
        let inferredMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = args.meal_type || 'snack';
        if (!args.meal_type && args.meal_text) {
          const lower = args.meal_text.toLowerCase();
          if (lower.includes('breakfast') || lower.includes('egg') || lower.includes('omelette') || lower.includes('pancake') || lower.includes('oat') || lower.includes('toast') || lower.includes('cereal') || lower.includes('dosa') || lower.includes('idli')) {
            inferredMealType = 'breakfast';
          } else if (lower.includes('lunch')) {
            inferredMealType = 'lunch';
          } else if (lower.includes('dinner')) {
            inferredMealType = 'dinner';
          }
        }

        const mealItems = args.items?.map(item => ({
          foodName: item.food_name,
          quantity: item.quantity ?? 1,
          unit: item.unit ?? 'serving',
          estimatedCalories: item.calories,
          estimatedProtein: item.protein_g,
          estimatedCarbs: item.carbs_g,
          estimatedFat: item.fat_g,
          estimatedFiber: item.fiber_g,
          micronutrients: item.micronutrients || {},
        })) || [];

        const meal = await createMeal(userId, {
          date: args.date || new Date().toISOString().split('T')[0],
          mealType: inferredMealType,
          description: args.meal_text,
          estimatedCalories: args.calories,
          estimatedProtein: args.protein_g,
          estimatedCarbs: args.carbs_g,
          estimatedFat: args.fat_g,
          estimatedFiber: args.fiber_g,
          micronutrients: args.micronutrients || {},
          items: mealItems,
          source: defaultSource
        });
        console.log("[MCP log_meal] Success, created meal id:", meal?.id);
        return { content: [{ type: "text", text: `Meal logged successfully as ${inferredMealType}. ID: ${meal?.id}` }] };
      } catch (err: any) {
        console.error("[MCP log_meal ERROR]:", err?.message || err, err?.stack || "");
        return {
          content: [{ type: "text", text: `Failed to log meal: ${err?.message || String(err)}` }],
          isError: true
        };
      }
    }
  );

  // get_meals
  server.tool(
    "get_meals",
    "Retrieve meal records belonging to the currently authenticated CalFlow user for a specified date or date range.",
    {
      start_date: z.string().optional().describe("Start date in YYYY-MM-DD format (or just date if end_date is omitted). ALWAYS OMIT to use today unless explicitly requested."),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      let meals;
      if (args.start_date && args.end_date) {
        meals = await getMealsByDateRange(userId, args.start_date, args.end_date);
      } else {
        const targetDate = args.start_date || new Date().toISOString().split('T')[0];
        meals = await getMealsByDate(userId, targetDate);
      }
      return { content: [{ type: "text", text: JSON.stringify(meals, null, 2) }] };
    }
  );

  // get_daily_summary
  server.tool(
    "get_daily_summary",
    "Retrieve the authenticated user's total nutrition for a specific day. If no date is provided, returns today's summary.",
    {},
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const summary = await getTodaySummary(userId);
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  // get_nutrition_summary
  server.tool(
    "get_nutrition_summary",
    "Retrieve the authenticated user's nutrition summary for a date range.",
    {
      start_date: z.string().describe("Start date in YYYY-MM-DD format"),
      end_date: z.string().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const summary = await getNutritionSummary(userId, args.start_date, args.end_date);
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  // update_meal
  server.tool(
    "update_meal",
    "Update an existing meal record. Use this to update the description, macros, items, and especially the structured 'micronutrients' dictionary with complete vitamins and minerals (e.g. vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg, b-complex, calcium_mg, iron_mg, magnesium_mg, potassium_mg, zinc_mg, selenium_mcg, etc.). DO NOT append vitamins as text to description; pass them directly into the 'micronutrients' argument as structured key-value pairs.",
    {
      meal_id: z.string().describe("The ID of the meal to update"),
      meal_text: z.string().optional().describe("Updated meal title (extremely short, 1-3 words)"),
      meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional().describe("Updated meal category"),
      calories: z.number().optional().describe("Updated calories"),
      protein_g: z.number().optional().describe("Updated protein in grams"),
      carbs_g: z.number().optional().describe("Updated carbohydrates in grams"),
      fat_g: z.number().optional().describe("Updated fat in grams"),
      fiber_g: z.number().optional().describe("Updated fiber in grams"),
      items: z.array(z.object({
        food_name: z.string().describe("Name of the food item"),
        quantity: z.number().optional().describe("Quantity or portion amount"),
        unit: z.string().optional().describe("Serving unit (e.g. slice, egg, ml, g, cup)"),
        calories: z.number().optional().describe("Calories for this item"),
        protein_g: z.number().optional().describe("Protein in grams for this item"),
        carbs_g: z.number().optional().describe("Carbohydrates in grams for this item"),
        fat_g: z.number().optional().describe("Fat in grams for this item"),
        fiber_g: z.number().optional().describe("Fiber in grams for this item"),
        micronutrients: z.record(z.string(), z.number()).optional().describe("Key micronutrients for this item as numeric values")
      })).optional().describe("Updated constituent items of the meal"),
      micronutrients: z.record(z.string(), z.number()).optional().describe("Structured dictionary of all vitamins and minerals with numeric values only. (e.g. {\"vitamin_a_mcg\": 240, \"vitamin_c_mg\": 15, \"calcium_mg\": 350}).")
    },
    async (args, extra) => {
      try {
        const userId = authInfo?.extra?.userId as string;
        if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
        
        const updates: any = {};
        if (args.meal_text !== undefined) updates.description = args.meal_text;
        if (args.meal_type !== undefined) updates.mealType = args.meal_type;
        if (args.calories !== undefined) updates.estimatedCalories = args.calories;
        if (args.protein_g !== undefined) updates.estimatedProtein = args.protein_g;
        if (args.carbs_g !== undefined) updates.estimatedCarbs = args.carbs_g;
        if (args.fat_g !== undefined) updates.estimatedFat = args.fat_g;
        if (args.fiber_g !== undefined) updates.estimatedFiber = args.fiber_g;
        if (args.micronutrients !== undefined) updates.micronutrients = args.micronutrients;

        if (args.items) {
          updates.items = args.items.map(item => ({
            foodName: item.food_name,
            quantity: item.quantity ?? 1,
            unit: item.unit ?? 'serving',
            estimatedCalories: item.calories,
            estimatedProtein: item.protein_g,
            estimatedCarbs: item.carbs_g,
            estimatedFat: item.fat_g,
            estimatedFiber: item.fiber_g,
            micronutrients: item.micronutrients || {},
          }));
        }
        
        const updated = await updateMeal(userId, args.meal_id, updates);
        return { content: [{ type: "text", text: `Meal updated successfully. ID: ${args.meal_id}` }] };
      } catch (err: any) {
        console.error("[MCP update_meal ERROR]:", err?.message || err);
        return {
          content: [{ type: "text", text: `Failed to update meal: ${err?.message || String(err)}` }],
          isError: true,
        };
      }
    }
  );

  // delete_meal
  server.tool(
    "delete_meal",
    "Allow deletion of the authenticated user's own meal.",
    {
      meal_id: z.string().describe("The ID of the meal to delete"),
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      await deleteMeal(userId, args.meal_id);
      return { content: [{ type: "text", text: `Meal deleted successfully. ID: ${args.meal_id}` }] };
    }
  );

  // get_goals
  server.tool(
    "get_goals",
    "Retrieve the authenticated user's profile and nutrition goals.",
    {},
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const [profile, goals] = await Promise.all([
        getProfile(userId).catch(() => null),
        getActiveGoals(userId).catch(() => null)
      ]);
      return { content: [{ type: "text", text: JSON.stringify({ profile, goals }, null, 2) }] };
    }
  );

  // update_goals
  server.tool(
    "update_goals",
    "Update the authenticated user's profile and/or nutrition goals. You can update goal parameters (like goal_weight_kg, goal, goal_rate) or macronutrient targets.",
    {
      goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'gain_muscle']).optional().describe("Primary health goal"),
      goal_weight_kg: z.number().optional().describe("Target weight in kg"),
      goal_rate: z.enum(['slow', 'moderate', 'fast']).optional().describe("Desired rate of progress"),
      calorie_target: z.number().optional().describe("Daily calorie target"),
      protein_target: z.number().optional().describe("Daily protein target (g)"),
      carbohydrate_target: z.number().optional().describe("Daily carb target (g)"),
      fat_target: z.number().optional().describe("Daily fat target (g)"),
      fiber_target: z.number().optional().describe("Daily fiber target (g)"),
      water_target_ml: z.number().optional().describe("Daily water target (ml)")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      let profileResult = null;
      let goalsResult = null;
      
      if (args.goal || args.goal_weight_kg !== undefined || args.goal_rate) {
        const profileUpdates: any = {};
        if (args.goal) profileUpdates.goal = args.goal;
        if (args.goal_weight_kg !== undefined) profileUpdates.goalWeightKg = args.goal_weight_kg;
        if (args.goal_rate) profileUpdates.goalRate = args.goal_rate;
        profileResult = await upsertProfile(userId, profileUpdates);
      }
      
      if (args.calorie_target !== undefined || args.protein_target !== undefined || args.carbohydrate_target !== undefined || args.fat_target !== undefined || args.fiber_target !== undefined || args.water_target_ml !== undefined) {
        const goalUpdates: any = {};
        if (args.calorie_target !== undefined) goalUpdates.calorieTarget = args.calorie_target;
        if (args.protein_target !== undefined) goalUpdates.proteinTarget = args.protein_target;
        if (args.carbohydrate_target !== undefined) goalUpdates.carbohydrateTarget = args.carbohydrate_target;
        if (args.fat_target !== undefined) goalUpdates.fatTarget = args.fat_target;
        if (args.fiber_target !== undefined) goalUpdates.fiberTarget = args.fiber_target;
        if (args.water_target_ml !== undefined) goalUpdates.waterTargetMl = args.water_target_ml;
        goalsResult = await upsertGoals(userId, goalUpdates);
      }
      
      return { content: [{ type: "text", text: `Goals updated successfully.\nProfile updates: ${JSON.stringify(profileResult)}\nNutrition target updates: ${JSON.stringify(goalsResult)}` }] };
    }
  );

  // log_weight
  server.tool(
    "log_weight",
    "Record a new weight measurement for the user.",
    {
      weight_kg: z.number().describe("Weight in kilograms"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format. ALWAYS OMIT to use today unless explicitly requested."),
      note: z.string().optional().describe("Optional note for this weight log")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const log = await logWeight(userId, args.weight_kg, args.date, args.note);
      return { content: [{ type: "text", text: `Weight logged successfully. ID: ${log?.id}` }] };
    }
  );

  // get_weight_history
  server.tool(
    "get_weight_history",
    "Retrieve the user's weight log history for a specific date range.",
    {
      start_date: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const history = await getWeightHistory(userId, args.start_date, args.end_date);
      return { content: [{ type: "text", text: JSON.stringify(history, null, 2) }] };
    }
  );

  // log_water
  server.tool(
    "log_water",
    "Record a new water consumption log for the user.",
    {
      amount_ml: z.number().describe("Amount of water consumed in milliliters (ml)"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format. ALWAYS OMIT to use today unless explicitly requested.")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const log = await logWater(userId, args.amount_ml, args.date);
      return { content: [{ type: "text", text: `Water logged successfully. Amount: ${log?.amount_ml}ml` }] };
    }
  );

  // get_water_logs
  server.tool(
    "get_water_logs",
    "Retrieve the user's water consumption logs for a specific date range.",
    {
      start_date: z.string().describe("Start date in YYYY-MM-DD format"),
      end_date: z.string().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const logs = await getWaterByDateRange(userId, args.start_date, args.end_date);
      return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
    }
  );

  // get_insights
  server.tool(
    "get_insights",
    "Retrieve the user's aggregated health insights (averages, consistency, weight trend, target achievement) for the past X days.",
    {
      days: z.number().optional().describe("Number of past days to aggregate (default: 30)")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const insights = await getInsights(userId, args.days || 30);
      return { content: [{ type: "text", text: JSON.stringify(insights, null, 2) }] };
    }
  );

  return server;
}
