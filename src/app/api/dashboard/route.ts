import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodaySummary } from '@/lib/services/nutrition.service';
import { getMealsByDate } from '@/lib/services/meals.service';
import { getWaterByDate } from '@/lib/services/water.service';
import { getWeightHistory } from '@/lib/services/weight.service';
import { getProfile } from '@/lib/services/profile.service';
import { getUserToday } from '@/lib/services/user-time';
import { canViewDashboard } from '@/lib/services/sharing.service';

export const runtime = 'edge';

/** What a friend may see of a meal: only what the Home page displays (no notes, source, ids of the owner, etc.). */
function publicMeal(meal: any) {
  return {
    id: meal.id,
    date: meal.date,
    meal_type: meal.meal_type,
    description: meal.description,
    estimated_calories: meal.estimated_calories,
    estimated_protein: meal.estimated_protein,
    estimated_carbs: meal.estimated_carbs,
    estimated_fat: meal.estimated_fat,
    estimated_fiber: meal.estimated_fiber,
    micronutrients: meal.micronutrients,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ?friend=<ownerId> views a dashboard someone shared with me (read-only).
    const friendId = req.nextUrl.searchParams.get('friend');
    const isShared = !!friendId && friendId !== user.id;
    if (isShared && !(await canViewDashboard(user.id, friendId))) {
      return NextResponse.json({ error: 'not_shared' }, { status: 403 });
    }
    const targetId = isShared ? friendId : user.id;

    const dateStr = await getUserToday(targetId);

    // Fetch everything in one parallel shot
    const [nutritionResult, mealsResult, waterResult, weightResult, profileResult] =
      await Promise.allSettled([
        getTodaySummary(targetId),
        getMealsByDate(targetId, dateStr),
        getWaterByDate(targetId, dateStr),
        getWeightHistory(targetId),
        getProfile(targetId),
      ]);

    const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
    const meals = mealsResult.status === 'fulfilled' ? mealsResult.value : null;
    const weightHistory = weightResult.status === 'fulfilled' ? weightResult.value : [];
    const nutrition = nutritionResult.status === 'fulfilled' ? nutritionResult.value : null;

    const payload = {
      date: dateStr,
      shared: isShared,
      nutrition: isShared && nutrition
        ? { ...nutrition, targets: nutrition.targets && {
            calorie_target: nutrition.targets.calorie_target,
            protein_target: nutrition.targets.protein_target,
            carbohydrate_target: nutrition.targets.carbohydrate_target,
            fat_target: nutrition.targets.fat_target,
            fiber_target: nutrition.targets.fiber_target,
            water_target_ml: nutrition.targets.water_target_ml,
          } }
        : nutrition,
      meals: isShared ? meals?.map(publicMeal) ?? null : meals,
      waterTotal: waterResult.status === 'fulfilled' ? waterResult.value : 0,
      // A shared view gets no private weigh-in notes, and no age, sex, height,
      // allergies, preferences or timezone — only what the Home page displays.
      weightHistory: isShared
        ? (weightHistory ?? []).map((w: any) => ({ date: w.date, weight_kg: w.weight_kg }))
        : weightHistory,
      profile: isShared
        ? profile && { name: profile.name, goal: profile.goal, goal_weight_kg: profile.goal_weight_kg }
        : profile,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
