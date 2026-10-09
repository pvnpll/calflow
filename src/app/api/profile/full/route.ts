import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/services/profile.service';
import { getActiveGoals } from '@/lib/services/goals.service';
import { getLatestWeight, syncProfileWeight } from '@/lib/services/weight.service';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [profileResult, goalsResult, weightResult] = await Promise.allSettled([
      getProfile(user.id),
      getActiveGoals(user.id),
      getLatestWeight(user.id),
    ]);

    let profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
    const goals = goalsResult.status === 'fulfilled' ? goalsResult.value : null;
    const latestWeight = weightResult.status === 'fulfilled' ? weightResult.value : null;

    // Self-heal: the profile weight must match the latest entry in the weight trend
    // (covers rows that drifted before weight and profile were kept in sync).
    if (profile && latestWeight && Number(profile.current_weight_kg) !== Number(latestWeight.weight_kg)) {
      await syncProfileWeight(user.id).catch(() => null);
      profile = { ...profile, current_weight_kg: Number(latestWeight.weight_kg) };
    }

    return NextResponse.json({
      profile,
      goals,
      latestWeightKg: latestWeight ? Number(latestWeight.weight_kg) : null,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
