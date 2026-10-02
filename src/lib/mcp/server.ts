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
      calories: z.number().describe("Estimated calories"),
      protein_g: z.number().describe("Estimated protein in grams"),
      carbs_g: z.number().describe("Estimated carbohydrates in grams"),
      fat_g: z.number().describe("Estimated fat in grams"),
      fiber_g: z.number().optional().describe("Estimated fiber in grams"),
      date: z.string().describe("Date in YYYY-MM-DD format"),
      time: z.string().optional().describe("Time in HH:mm format"),
      notes: z.string().optional().describe("Any additional notes")
    },
    async (args, extra) => {
      try {
        const userId = extra.authInfo?.extra?.userId as string;
        if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
        
        console.log("[MCP log_meal] Executing with args:", JSON.stringify(args), "userId:", userId);
        const meal = await createMeal(userId, {
          date: args.date,
          mealType: 'snack', // Defaulting, you can enhance to infer meal type if needed
          description: args.meal_text,
          estimatedCalories: args.calories,
          estimatedProtein: args.protein_g,
          estimatedCarbs: args.carbs_g,
          estimatedFat: args.fat_g,
          estimatedFiber: args.fiber_g,
          source: 'import'
        });
        console.log("[MCP log_meal] Success, created meal id:", meal?.id);
        return { content: [{ type: "text", text: `Meal logged successfully. ID: ${meal?.id}` }] };
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
      calories: z.number().optional().describe("Updated calories"),
      protein_g: z.number().optional().describe("Updated protein in grams"),
      carbs_g: z.number().optional().describe("Updated carbohydrates in grams"),
      fat_g: z.number().optional().describe("Updated fat in grams"),
    },
    async (args, extra) => {
      const userId = extra.authInfo?.extra?.userId as string;
      if (!userId) throw new Error("Unauthorized: Missing user_id in auth context");
      
      const updates: any = {};
      if (args.meal_text) updates.description = args.meal_text;
      if (args.calories !== undefined) updates.estimatedCalories = args.calories;
      if (args.protein_g !== undefined) updates.estimatedProtein = args.protein_g;
      if (args.carbs_g !== undefined) updates.estimatedCarbs = args.carbs_g;
      if (args.fat_g !== undefined) updates.estimatedFat = args.fat_g;
      
      const updated = await updateMeal(userId, args.meal_id, updates);
      return { content: [{ type: "text", text: `Meal updated successfully. ID: ${args.meal_id}` }] };
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
