'use server';

import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function getOrCreateMcpToken() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // We need to use service role to query/insert if RLS doesn't permit.
  // The codebase earlier used admin client for MCP tokens.
  const { createClient: createAdmin } = await import('@supabase/supabase-js');
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { TABLES } = await import('@/lib/db-tables');

  // Try to find an existing long-lived token (client_id = 'personal-access-token')
  const { data: existing } = await admin
    .from(TABLES.MCP_TOKENS)
    .select('access_token')
    .eq('user_id', user.id)
    .eq('client_id', 'personal-access-token')
    .limit(1)
    .single();

  if (existing) {
    return existing.access_token;
  }

  // Create a new one
  const token = randomBytes(32).toString('hex');
  await admin.from(TABLES.MCP_TOKENS).insert({
    access_token: token,
    user_id: user.id,
    client_id: 'personal-access-token',
  });

  return token;
}

