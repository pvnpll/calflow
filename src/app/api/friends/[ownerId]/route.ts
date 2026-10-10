import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeFriend } from '@/lib/services/sharing.service';

export const runtime = 'edge';

// Remove someone from my friends (only ever deletes my own viewer row).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ ownerId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { ownerId } = await params;
    await removeFriend(user.id, ownerId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
