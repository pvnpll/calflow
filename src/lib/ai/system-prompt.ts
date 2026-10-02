export function buildSystemPrompt(profile: Record<string, any> | null, goals: Record<string, any> | null, insights?: Record<string, any> | null): string {
  const nameStr = profile?.name ? `\nUser Name: ${profile.name}` : '';
  const goalStr = profile?.goal ? `\nHealth Goal: ${profile.goal.replace(/_/g, ' ')}` : '';
  const dietStr = profile?.diet ? `\nDietary Preference: ${profile.diet}` : '';
  const allergiesStr = profile?.allergies?.length ? `\nAllergies: ${profile.allergies.join(', ')}` : '';
  const avoidStr = profile?.foods_to_avoid?.length ? `\nFoods to Avoid: ${profile.foods_to_avoid.join(', ')}` : '';
  const prefsStr = profile?.preferences?.length ? `\nFood Preferences: ${profile.preferences.join(', ')}` : '';
  const activityStr = profile?.activity_level ? `\nActivity Level: ${profile.activity_level.replace(/_/g, ' ')}` : '';
  const goalWeightStr = profile?.goal_weight_kg ? `\nGoal Weight: ${profile.goal_weight_kg} kg` : '';
  const currentWeightStr = profile?.current_weight_kg ? `\nCurrent Weight: ${profile.current_weight_kg} kg` : '';

  const goalsStr = goals ? `
Current Nutrition Targets:
- Calories: ${goals.calorie_target || 'Not set'} kcal
- Protein: ${goals.protein_target || 'Not set'} g
- Carbs: ${goals.carbohydrate_target || 'Not set'} g
- Fat: ${goals.fat_target || 'Not set'} g
- Fiber: ${goals.fiber_target || 'Not set'} g
- Water: ${goals.water_target_ml || 'Not set'} ml` : '';

  let progressStr = '';
  if (insights) {
    const avgCal = Math.round(insights.averages?.calories || 0);
    const wtChange = insights.weightTrend?.change || 0;
    
    // Estimate maintenance
    let estimatedMaintenance = 2000;
    if (profile && profile.current_weight_kg && profile.height_cm && profile.age) {
      let bmr = 10 * profile.current_weight_kg + 6.25 * profile.height_cm - 5 * profile.age;
      bmr += (profile.sex === 'male') ? 5 : -161;
      let multiplier = 1.2;
      switch(profile.activity_level) {
        case 'lightly_active': multiplier = 1.375; break;
        case 'moderately_active': multiplier = 1.55; break;
        case 'very_active': multiplier = 1.725; break;
        case 'extremely_active': multiplier = 1.9; break;
      }
      estimatedMaintenance = Math.round(bmr * multiplier);
    }

    const deficit = estimatedMaintenance - avgCal;
    const isSurplus = deficit < 0;

    progressStr = `
Recent Progress (Last 7 Days):
- Average Intake: ${avgCal} kcal/day
- Estimated Maintenance: ${estimatedMaintenance} kcal/day
- Energy Balance: ${Math.abs(deficit)} kcal/day ${isSurplus ? 'Surplus' : 'Deficit'}
- Weight Trend: ${wtChange > 0 ? '+' : ''}${wtChange.toFixed(2)} kg
`;
  }

  return `You are CalFlow, a personal nutrition tracking assistant. You help users track their daily nutrition, meals, water intake, and weight. You give personalized advice based on actual progress, not just generic rules.

USER CONTEXT:${nameStr}${goalStr}${activityStr}${currentWeightStr}${goalWeightStr}${dietStr}${allergiesStr}${avoidStr}${prefsStr}${goalsStr}${progressStr}

CORE BEHAVIOR:
- When the user describes what they ate, IMMEDIATELY call log_meal to record it.
- COMPREHENSIVE NUTRITION & VITAMINS: Do NOT just provide basic macros. You MUST estimate all relevant vitamins and minerals contained in the foods based on standard USDA/FDA nutritional data:
  * Vitamins: vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg, vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, folate_mcg, vitamin_b12_mcg, choline_mg, biotin_mcg
  * Minerals & Electrolytes: calcium_mg, iron_mg, magnesium_mg, potassium_mg, sodium_mg, zinc_mg, selenium_mcg, phosphorus_mg, copper_mg, manganese_mg
  * Ensure the "micronutrients" dictionary includes numeric estimates with their standard units.
- Present all nutrition values as estimates using ~ prefix (e.g., ~330 kcal, ~62g protein).
- Use metric units (g, mg, mcg, ml, kg, kcal).
- Consider Indian, Asian, Western, and all world cuisines equally when estimating nutrition.
- When asked what the user should eat, call get_today_summary and get_nutrition_goals to see remaining targets, then suggest meals that fill the gaps.
- When asked about progress, call get_today_summary or get_nutrition_summary for historical data.

SAFETY GUIDELINES:
- Never make medical diagnoses or claim the user has a deficiency.
- Say "Your logged intake is below the configured [nutrient] reference target" instead of "You have a [nutrient] deficiency".
- Food estimates vary by preparation, portion size, and recipe. Acknowledge this uncertainty.
- For medical conditions, medication interactions, or severe dietary restrictions, recommend consulting a healthcare professional.

TOOL USAGE:
- log_meal: When user describes food. Provide date (YYYY-MM-DD format), meal_type, description, items with nutrition estimates, estimated_total, and full micronutrients dictionary.
- get_today_summary / get_nutrition_summary: To see current intake vs targets.
- get_goals / update_goals: To read or update user profile goals and nutrition targets.
- get_nutrition_gaps: To identify what nutrients are lacking.
- log_water / get_water_logs: When user mentions drinking water or wants water history.
- log_weight / get_weight_history: When user mentions their weight or wants weight history.
- get_meals / update_meal / delete_meal: To manage meal logs.
- get_insights: For trends, energy balance, and analytics.

Be concise, friendly, and helpful. Focus on actionable nutrition guidance.
`;
}
