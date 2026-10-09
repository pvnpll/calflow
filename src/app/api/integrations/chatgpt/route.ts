import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/services/profile.service';
import { getActiveGoals, upsertGoals } from '@/lib/services/goals.service';
import { getMealsByDate, getMealsByDateRange, createMeal, updateMeal, deleteMeal } from '@/lib/services/meals.service';
import { getTodaySummary, getNutritionSummary, getNutritionGaps } from '@/lib/services/nutrition.service';
import { getWaterByDate, getWaterSummary, logWater } from '@/lib/services/water.service';
import { getWeightHistory, logWeight } from '@/lib/services/weight.service';
import { getInsights } from '@/lib/services/insights.service';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getUserToday } from '@/lib/services/user-time';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const isBearer = authHeader?.startsWith('Bearer ');
    const token = isBearer ? authHeader?.split(' ')[1] : null;

    let userId: string | null = null;
    const supabaseForAction = await createClient();

    if (token === process.env.CALFLOW_API_SECRET && process.env.CALFLOW_API_SECRET) {
      // The body might contain user_token to act on behalf of a user
    } else {
      const { data: { user } } = await supabaseForAction.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    const body = await req.json();
    const { action, params, user_token } = body;

    if (!userId && user_token) {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        }
      );
      const { data: { user } } = await adminClient.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user context' }, { status: 401 });
    }

    let result;
    switch (action) {
      case 'get_user_profile':
        result = await getProfile(userId);
        break;
      case 'get_nutrition_goals':
        result = await getActiveGoals(userId);
        break;
      case 'update_nutrition_goals':
        result = await upsertGoals(userId, params);
        break;
      case 'log_meal':
        params.source = 'chatgpt';
        result = await createMeal(userId, params);
        break;
      case 'get_meals':
        if (params.start && params.end) {
          result = await getMealsByDateRange(userId, params.start, params.end);
        } else {
          result = await getMealsByDate(userId, params.date || await getUserToday(userId));
        }
        break;
      case 'update_meal':
        result = await updateMeal(userId, params.id, params.data);
        break;
      case 'delete_meal':
        await deleteMeal(userId, params.id);
        result = { success: true };
        break;
      case 'get_today_summary':
        result = await getTodaySummary(userId);
        break;
      case 'get_nutrition_summary':
        result = await getNutritionSummary(userId, params.startDate, params.endDate);
        break;
      case 'get_nutrition_gaps':
        result = await getNutritionGaps(userId);
        break;
      case 'log_water':
        result = await logWater(userId, params.amount_ml, params.date);
        break;
      case 'get_water_summary':
        if (params.start && params.end) {
          result = await getWaterSummary(userId, params.start, params.end);
        } else {
          result = await getWaterByDate(userId, params.date || await getUserToday(userId));
        }
        break;
      case 'log_weight':
        result = await logWeight(userId, params.weight_kg, params.date, params.note);
        break;
      case 'get_weight_history':
        result = await getWeightHistory(userId, params.start, params.end);
        break;
      case 'get_insights':
        result = await getInsights(userId, params.days || 30);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    try {
      const { TABLES } = await import('@/lib/db-tables');
      await supabaseForAction.from(TABLES.AI_INTERACTIONS).insert({
        user_id: userId,
        action,
        metadata: { params, status: 'success' },
      });
    } catch (e) {
      console.error('Failed to log interaction', e);
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
