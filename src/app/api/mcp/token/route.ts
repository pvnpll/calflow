import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { code, client_id, client_secret, grant_type } = await req.json();

    if (grant_type !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify code
    const { data: codeData, error: codeError } = await admin
      .from('mcp_auth_codes')
      .select('*')
      .eq('code', code)
      .eq('client_id', client_id)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }

    // Check expiration
    if (new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Code expired' }, { status: 400 });
    }

    // Generate access token
    const access_token = randomBytes(32).toString('hex');
    
    await admin.from('mcp_tokens').insert({
      access_token,
      user_id: codeData.user_id,
      client_id,
    });

    // Delete the used code
    await admin.from('mcp_auth_codes').delete().eq('code', code);

    return NextResponse.json({
      access_token,
      token_type: 'Bearer',
      expires_in: 30 * 24 * 60 * 60, // 30 days
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
