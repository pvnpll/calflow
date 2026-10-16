import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProfile, upsertProfile } from "@/lib/services/profile.service";
import { getActiveGoals, upsertGoals } from "@/lib/services/goals.service";
import { logWeight, getWeightHistory } from "@/lib/services/weight.service";
import { logWater, getWaterByDateRange } from "@/lib/services/water.service";
import { getInsights } from "@/lib/services/insights.service";
import { createMeal, getMealsByDate, getMealsByDateRange, updateMeal, deleteMeal } from "@/lib/services/meals.service";
import { getTodaySummary, getNutritionSummary } from "@/lib/services/nutrition.service";
import { todayStr } from "@/lib/date";

const CALFLOW_MCP_INSTRUCTIONS = `You are connected to the CalFlow MCP server, a personal nutrition tracking assistant.

CRITICAL NUTRITION ESTIMATION RULES:
1. CONSERVATIVE & REALISTIC ESTIMATES FOR ALL MACROS & MICROS:
   - Always provide grounded, realistic, and conservative estimates for both macronutrients and micronutrients based on verified USDA FoodData Central / FDA food composition standards.
   - Never inflate nutrition numbers or make optimistic assumptions.

2. STRICT PROTEIN REALISM (DO NOT OVERESTIMATE):
   - AI models routinely overestimate protein content, which causes users to under-consume relative to their fitness and dietary goals.
   - You MUST provide conservative and realistic protein estimates based on verified USDA cooked portion references:
     * Cooked boneless, skinless chicken breast: ~31g protein per 100g cooked (raw chicken loses ~20-25% water weight upon cooking; a typical 150g raw breast yields ~115g cooked, which is ~35g protein total, never 50g+).
     * Cooked lean beef / steak: ~26-28g protein per 100g cooked.
     * Cooked fish / salmon: ~22-25g protein per 100g cooked.
     * Whole large egg: ~6.0g to 6.3g protein each (NOT 8-10g). 1 egg white: ~3.6g protein.
     * Paneer: ~18g protein per 100g.
     * Firm tofu: ~8-10g protein per 100g.
     * Cooked lentils / dal / beans: ~7-9g protein per 100g cooked (~15-18g per 1 cup cooked). DO NOT use raw dry lentil values for cooked dal!
     * Cooked rice: ~2.5g protein per 100g cooked (~4g per cup).
     * Wheat roti / chapati: ~3g protein per medium roti (35-40g dough).
     * Greek yogurt: ~9-10g protein per 100g. Whole milk / curd: ~3.2-3.4g per 100ml (1 cup milk = ~8g protein).
     * Peanut butter / nuts: ~4g protein per 1 tbsp (16g), with ~8g fat. They are calorie-dense fat sources, not high-protein substitutes.
     * Vegetables and salads: contain only trace protein (1-2g per serving); do not inflate.
   - When portion sizes or cooking methods are ambiguous, ALWAYS err on the conservative (lower) side for protein.

3. REALISTIC CALORIES & FATS (ACCOUNT FOR COOKING OILS & CONDIMENTS):
   - Users and AI often overlook cooking oils, butter, ghee, dressings, and sauces. Realistically account for preparation fats (~1-2 tsp oil/butter = 5-10g fat, 45-90 kcal per cooked dish) unless explicitly stated as oil-free/steamed.

4. COMPREHENSIVE & REALISTIC MICRONUTRIENTS:
   - Provide realistic estimates for all relevant vitamins and minerals in the 'micronutrients' dictionary with standard unit keys (e.g., vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg, vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, folate_mcg, vitamin_b12_mcg, calcium_mg, iron_mg, magnesium_mg, potassium_mg, sodium_mg, zinc_mg, selenium_mcg).
   - Use numeric values only. Base numbers on USDA reference standards for the portion actually consumed. Do not inflate values or hallucinate 100% daily values. Account for realistic cooking losses (e.g. vitamin C degradation in heat).

5. WORKFLOW & TOOL RULES:
   - log_meal: Record NEW meals. Keep 'meal_text' to a concise 1-3 word title (e.g., 'Eggs & Toast', 'Chicken Rice').
   - update_meal: When modifying, correcting, or updating a meal, use get_meals first to get the meal_id, then call update_meal. Never log duplicates.`;

export function createCalflowMcpServer(authInfo?: any, defaultSource: 'chatgpt' | 'claude' | 'mcp' | 'calflow_ai' | 'web_app' = 'claude') {
  // "Today" is the user's local date (their stored timezone), not the server's UTC date.
  const today = todayStr(authInfo?.extra?.timezone as string | undefined);
  const server = new McpServer(
    {
      name: "calflow",
      version: "1.0.0",
    },
    {
      instructions: CALFLOW_MCP_INSTRUCTIONS,
    }
  );

  // Tools

  // log_meal
  server.tool(
    "log_meal",
    "Record a meal and its complete estimated nutrition for the user with CONSERVATIVE and REALISTIC estimates. NUTRITION RULES: Provide realistic, conservative estimates for both macronutrients and micronutrients based on USDA/FDA reference standards. CRITICAL FOR PROTEIN: AI models often overestimate protein. Strictly provide conservative, realistic protein figures based on cooked portions (e.g., 1 large egg = ~6g, 100g cooked chicken breast = ~31g, 1 cup cooked dal = ~15-18g, 100g paneer = ~18g, 1 cup cooked rice = ~4g). Never inflate protein. Account realistically for cooking oils and fats. Include comprehensive micronutrients (vitamins in mcg/mg, minerals in mg) with realistic values.",
    {
      meal_text: z.string().describe("An extremely short, 1-3 word title summarizing the meal (e.g., 'Omelette & Oats', 'Chicken Tikka'). DO NOT include quantities or descriptions."),
      calories: z.number().describe("Realistic total calories, conservatively accounting for cooking oils, butter, dressings, and preparation method."),
      protein_g: z.number().describe("Conservative and realistic total protein in grams. DO NOT overestimate or inflate. Base estimates strictly on verified USDA cooked portion standards (e.g., large egg ~6g, 100g cooked chicken breast ~31g, 1 cup cooked lentils ~15-18g, 100g paneer ~18g). When uncertain, err on the conservative (lower) side."),
      carbs_g: z.number().describe("Realistic total carbohydrates in grams based on cooked portion sizes."),
      fat_g: z.number().describe("Realistic total fat in grams, accounting for cooking oils, butter, dressings, and natural fats."),
      fiber_g: z.number().optional().describe("Realistic total dietary fiber in grams."),
      meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional().describe("Meal type: breakfast, lunch, dinner, or snack. Infer from time or food if omitted."),
      date: z.string().optional().describe(`Date in YYYY-MM-DD format. ALWAYS OMIT to use today. If you must specify today, the current server date is ${today}`),
      time: z.string().optional().describe("Time in HH:mm format"),
      notes: z.string().optional().describe("Any additional notes"),
      items: z.array(z.object({
        food_name: z.string().describe("Name of the food item"),
        quantity: z.number().optional().describe("Quantity or portion amount"),
        unit: z.string().optional().describe("Serving unit (e.g. slice, egg, ml, g, cup)"),
        calories: z.number().optional().describe("Realistic calories for this item"),
        protein_g: z.number().optional().describe("Conservative, realistic protein in grams for this specific food item. Do not overestimate; use cooked portion benchmarks."),
        carbs_g: z.number().optional().describe("Realistic carbohydrates in grams for this item"),
        fat_g: z.number().optional().describe("Realistic fat in grams for this item including preparation fats"),
        fiber_g: z.number().optional().describe("Realistic dietary fiber in grams for this item"),
        micronutrients: z.record(z.string(), z.number()).optional().describe("Realistic vitamins and minerals for this specific food item as numeric values in standard units based on USDA reference standards (e.g. vitamin_a_mcg: 240, calcium_mg: 300, iron_mg: 1.5, etc.)")
      })).optional().describe("Individual constituent items of the meal"),
      micronutrients: z.record(z.string(), z.number()).optional().describe("Complete, realistic vitamins and minerals breakdown for the entire meal with numeric values only grounded in USDA/FDA data (e.g. calcium_mg: 350, iron_mg: 2.8, potassium_mg: 480, vitamin_c_mg: 15, zinc_mg: 2.1). Do not inflate.")
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
          date: args.date || today,
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
      start_date: z.string().optional().describe(`Start date (YYYY-MM-DD). ALWAYS OMIT to use today. Current server date: ${today}`),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      let meals;
      if (args.start_date && args.end_date) {
        meals = await getMealsByDateRange(userId, args.start_date, args.end_date);
      } else {
        const targetDate = args.start_date || today;
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
    "Retrieve the authenticated user's nutrition summary for a date range. ALWAYS OMIT dates to get today's summary.",
    {
      start_date: z.string().optional().describe(`Start date in YYYY-MM-DD format. ALWAYS OMIT to use today. Current server date: ${today}`),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const targetStartDate = args.start_date || today;
      const targetEndDate = args.end_date || targetStartDate;
      
      const summary = await getNutritionSummary(userId, targetStartDate, targetEndDate);
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  // update_meal
  server.tool(
    "update_meal",
    "Update an existing meal record with conservative, realistic nutrition estimates. NUTRITION ESTIMATION GUIDELINES: Provide realistic, conservative estimates for macros and comprehensive micronutrients based on USDA/FDA standards. CRITICAL FOR PROTEIN: Strictly avoid protein overestimation; use verified cooked portion references (e.g., 1 large egg = ~6g, 100g cooked chicken breast = ~31g, 1 cup cooked dal = ~15-18g). Pass all vitamins and minerals directly into the structured 'micronutrients' dictionary with standard unit keys. DO NOT append vitamins as text to description.",
    {
      meal_id: z.string().describe("The ID of the meal to update"),
      meal_text: z.string().optional().describe("Updated meal title (extremely short, 1-3 words)"),
      meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional().describe("Updated meal category"),
      calories: z.number().optional().describe("Updated realistic total calories, conservatively accounting for cooking oils, butter, and sauces"),
      protein_g: z.number().optional().describe("Updated conservative and realistic protein in grams. DO NOT overestimate; reference USDA cooked portion standards (e.g. large egg ~6g, 100g cooked chicken breast ~31g)."),
      carbs_g: z.number().optional().describe("Updated realistic carbohydrates in grams"),
      fat_g: z.number().optional().describe("Updated realistic fat in grams, accounting for preparation oils"),
      fiber_g: z.number().optional().describe("Updated realistic dietary fiber in grams"),
      items: z.array(z.object({
        food_name: z.string().describe("Name of the food item"),
        quantity: z.number().optional().describe("Quantity or portion amount"),
        unit: z.string().optional().describe("Serving unit (e.g. slice, egg, ml, g, cup)"),
        calories: z.number().optional().describe("Realistic calories for this item"),
        protein_g: z.number().optional().describe("Conservative, realistic protein in grams for this item. Avoid overestimating."),
        carbs_g: z.number().optional().describe("Realistic carbohydrates in grams for this item"),
        fat_g: z.number().optional().describe("Realistic fat in grams for this item"),
        fiber_g: z.number().optional().describe("Realistic fiber in grams for this item"),
        micronutrients: z.record(z.string(), z.number()).optional().describe("Realistic micronutrients for this item as numeric values in standard units")
      })).optional().describe("Updated constituent items of the meal"),
      micronutrients: z.record(z.string(), z.number()).optional().describe("Structured dictionary of realistic vitamins and minerals with numeric values only grounded in USDA/FDA data (e.g. {\"vitamin_a_mcg\": 240, \"vitamin_c_mg\": 15, \"calcium_mg\": 350}). Do not inflate.")
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

          // If items were updated but top-level totals were not explicitly specified, derive them from items
          if (args.protein_g === undefined && updates.items.some((i: any) => i.estimatedProtein !== undefined)) {
            updates.estimatedProtein = Math.round(updates.items.reduce((s: number, i: any) => s + (i.estimatedProtein || 0), 0) * 10) / 10;
          }
          if (args.calories === undefined && updates.items.some((i: any) => i.estimatedCalories !== undefined)) {
            updates.estimatedCalories = Math.round(updates.items.reduce((s: number, i: any) => s + (i.estimatedCalories || 0), 0));
          }
          if (args.carbs_g === undefined && updates.items.some((i: any) => i.estimatedCarbs !== undefined)) {
            updates.estimatedCarbs = Math.round(updates.items.reduce((s: number, i: any) => s + (i.estimatedCarbs || 0), 0) * 10) / 10;
          }
          if (args.fat_g === undefined && updates.items.some((i: any) => i.estimatedFat !== undefined)) {
            updates.estimatedFat = Math.round(updates.items.reduce((s: number, i: any) => s + (i.estimatedFat || 0), 0) * 10) / 10;
          }
          if (args.fiber_g === undefined && updates.items.some((i: any) => i.estimatedFiber !== undefined)) {
            updates.estimatedFiber = Math.round(updates.items.reduce((s: number, i: any) => s + (i.estimatedFiber || 0), 0) * 10) / 10;
          }
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
      goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight', 'gain_muscle', 'body_recomposition']).optional().describe("Primary health goal. body_recomposition = lose fat and build muscle at maintenance calories."),
      goal_weight_kg: z.number().optional().describe("Target weight in kg"),
      goal_rate: z.enum(['slow', 'moderate', 'fast']).optional().describe("Desired rate of progress (only used for lose_weight and gain_weight)"),
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
      date: z.string().optional().describe(`Date in YYYY-MM-DD format. ALWAYS OMIT to use today. Current server date: ${today}`),
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
    "Retrieve the user's weight log history for a specific date range. ALWAYS OMIT dates to get today's logs.",
    {
      start_date: z.string().optional().describe(`Start date (YYYY-MM-DD). ALWAYS OMIT to use today. Current server date: ${today}`),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const targetStartDate = args.start_date || today;
      const targetEndDate = args.end_date || targetStartDate;
      
      const history = await getWeightHistory(userId, targetStartDate, targetEndDate);
      return { content: [{ type: "text", text: JSON.stringify(history, null, 2) }] };
    }
  );

  // log_water
  server.tool(
    "log_water",
    "Record a new water consumption log for the user.",
    {
      amount_ml: z.number().describe("Amount of water consumed in milliliters (ml)"),
      date: z.string().optional().describe(`Date in YYYY-MM-DD format. ALWAYS OMIT to use today. Current server date: ${today}`)
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
    "Retrieve the user's water consumption logs for a specific date range. ALWAYS OMIT dates to get today's logs.",
    {
      start_date: z.string().optional().describe(`Start date in YYYY-MM-DD format. ALWAYS OMIT to use today. Current server date: ${today}`),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const targetStartDate = args.start_date || today;
      const targetEndDate = args.end_date || targetStartDate;
      
      const logs = await getWaterByDateRange(userId, targetStartDate, targetEndDate);
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
