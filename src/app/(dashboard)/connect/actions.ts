'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/db-tables';

export async function getOrCreateMcpToken() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const admin = createAdminClient();

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

  // Create a new one using Web Crypto API instead of Node.js crypto
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  
  await admin.from(TABLES.MCP_TOKENS).insert({
    access_token: token,
    user_id: user.id,
    client_id: 'personal-access-token',
  });

  return token;
}

