import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProfile } from "@/lib/services/profile.service";
import { createMeal, getMealsByDate, getMealsByDateRange, updateMeal, deleteMeal } from "@/lib/services/meals.service";
import { getTodaySummary, getNutritionSummary } from "@/lib/services/nutrition.service";

export function createCalflowMcpServer() {
  const server = new McpServer({
    name: "CalFlow MCP",
    version: "1.0.0",
  });

  // Tools

  // log_meal
  server.tool(
    "log_meal",
    "Record a meal and its estimated nutrition for the currently authenticated CalFlow user. Use this after the user tells you what they ate and you have estimated the nutrition.",
    {
      meal_text: z.string().describe("Original natural-language description of the meal"),
      calories: z.number().describe("Estimated total calories"),
      protein_g: z.number().describe("Estimated total protein in grams"),
      carbs_g: z.number().describe("Estimated total carbohydrates in grams"),
      fat_g: z.number().describe("Estimated total fat in grams"),
      fiber_g: z.number().optional().describe("Estimated total fiber in grams"),
      meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional().describe("Meal type: breakfast, lunch, dinner, or snack. Infer from time or food if omitted."),
      date: z.string().describe("Date in YYYY-MM-DD format"),
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
        micronutrients: z.record(z.string(), z.any()).optional().describe("Key micronutrients like calcium_mg, iron_mg, vitamin_c_mg, etc.")
      })).optional().describe("Individual constituent items of the meal"),
      micronutrients: z.record(z.string(), z.any()).optional().describe("Estimated total micronutrients for the entire meal (e.g. calcium_mg, iron_mg, vitamin_c_mg, etc.)")
    },
    async (args, extra) => {
      try {
        const userId = extra.authInfo?.extra?.userId as string;
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
          date: args.date,
          mealType: inferredMealType,
          description: args.meal_text,
          estimatedCalories: args.calories,
          estimatedProtein: args.protein_g,
          estimatedCarbs: args.carbs_g,
          estimatedFat: args.fat_g,
          estimatedFiber: args.fiber_g,
          micronutrients: args.micronutrients || {},
          items: mealItems,
          source: 'claude'
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
      start_date: z.string().optional().describe("Start date in YYYY-MM-DD format (or just date if end_date is omitted)"),
      end_date: z.string().optional().describe("End date in YYYY-MM-DD format")
    },
    async (args, extra) => {
      const userId = extra.authInfo?.extra?.userId as string;
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
      const userId = extra.authInfo?.extra?.userId as string;
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
      const userId = extra.authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const summary = await getNutritionSummary(userId, args.start_date, args.end_date);
      return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
    }
  );

  // update_meal
  server.tool(
    "update_meal",
    "Allow the authenticated user to modify their own meal record.",
    {
      meal_id: z.string().describe("The ID of the meal to update"),
      meal_text: z.string().optional().describe("Updated meal description"),
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
        micronutrients: z.record(z.string(), z.any()).optional().describe("Key micronutrients")
      })).optional().describe("Updated constituent items of the meal"),
      micronutrients: z.record(z.string(), z.any()).optional().describe("Updated micronutrients dictionary")
    },
    async (args, extra) => {
      try {
        const userId = extra.authInfo?.extra?.userId as string;
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
      const userId = extra.authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      await deleteMeal(userId, args.meal_id);
      return { content: [{ type: "text", text: `Meal deleted successfully. ID: ${args.meal_id}` }] };
    }
  );

  return server;
}
