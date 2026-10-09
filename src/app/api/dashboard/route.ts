import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodaySummary } from '@/lib/services/nutrition.service';
import { getMealsByDate } from '@/lib/services/meals.service';
import { getWaterByDate } from '@/lib/services/water.service';
import { getWeightHistory } from '@/lib/services/weight.service';
import { getProfile } from '@/lib/services/profile.service';
import { getUserToday } from '@/lib/services/user-time';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dateStr = await getUserToday(user.id);

    // Fetch everything in one parallel shot
    const [nutritionResult, mealsResult, waterResult, weightResult, profileResult] =
      await Promise.allSettled([
        getTodaySummary(user.id),
        getMealsByDate(user.id, dateStr),
        getWaterByDate(user.id, dateStr),
        getWeightHistory(user.id),
        getProfile(user.id),
      ]);

    const payload = {
      nutrition: nutritionResult.status === 'fulfilled' ? nutritionResult.value : null,
      meals: mealsResult.status === 'fulfilled' ? mealsResult.value : null,
      waterTotal: waterResult.status === 'fulfilled' ? waterResult.value : 0,
      weightHistory: weightResult.status === 'fulfilled' ? weightResult.value : [],
      profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
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
