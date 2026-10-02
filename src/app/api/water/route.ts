import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWaterByDate, getWaterSummary, logWater } from '@/lib/services/water.service';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (start && end) {
      const summary = await getWaterSummary(user.id, start, end);
      return NextResponse.json(summary);
    } else if (date) {
      const water = await getWaterByDate(user.id, date);
      return NextResponse.json(water);
    } else {
      return NextResponse.json({ error: 'Missing date or start/end query parameters' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const water = await logWater(user.id, body.amount_ml, body.date);
    return NextResponse.json(water, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
