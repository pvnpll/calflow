import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { disableSharing, enableSharing, getShareStatus } from '@/lib/services/sharing.service';

export const runtime = 'edge';

async function authedUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Owner-only: status of my share link.
export async function GET() {
  try {
    const userId = await authedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await getShareStatus(userId), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Enable sharing (idempotent) and return the link token.
export async function POST() {
  try {
    const userId = await authedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await enableSharing(userId));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Disable sharing: kills the link and removes every viewer.
export async function DELETE() {
  try {
    const userId = await authedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await disableSharing(userId);
    return NextResponse.json({ enabled: false, token: null, viewerCount: 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
