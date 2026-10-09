import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/services/profile.service';
import { getActiveGoals } from '@/lib/services/goals.service';
import { getLatestWeight } from '@/lib/services/weight.service';

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

    const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
    const goals = goalsResult.status === 'fulfilled' ? goalsResult.value : null;
    const latestWeight = weightResult.status === 'fulfilled' ? weightResult.value : null;

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
