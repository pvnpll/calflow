import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/services/profile.service';
import { getActiveGoals } from '@/lib/services/goals.service';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [profileResult, goalsResult] = await Promise.allSettled([
      getProfile(user.id),
      getActiveGoals(user.id)
    ]);

    const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
    const goals = goalsResult.status === 'fulfilled' ? goalsResult.value : null;

    return NextResponse.json({ profile, goals }, {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
