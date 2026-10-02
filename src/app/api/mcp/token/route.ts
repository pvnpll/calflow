import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest) {
  try {
    let code = '';
    let client_id = '';
    let grant_type = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      code = (formData.get('code') as string) || '';
      client_id = (formData.get('client_id') as string) || '';
      grant_type = (formData.get('grant_type') as string) || '';
    } else {
      const body = await req.json().catch(() => ({}));
      code = body.code || '';
      client_id = body.client_id || '';
      grant_type = body.grant_type || '';
    }

    if (grant_type !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { TABLES } = await import('@/lib/db-tables');

    // Verify code
    const query = admin
      .from(TABLES.MCP_AUTH_CODES)
      .select('*')
      .eq('code', code);

    if (client_id) {
      query.eq('client_id', client_id);
    }

    const { data: codeData, error: codeError } = await query.single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'invalid_grant' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Check expiration
    if (new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'invalid_grant', error_description: 'Code expired' }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Generate access token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const access_token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');

    
    await admin.from(TABLES.MCP_TOKENS).insert({
      access_token,
      user_id: codeData.user_id,
      client_id: client_id || codeData.client_id,
    });

    // Delete the used code
    await admin.from(TABLES.MCP_AUTH_CODES).delete().eq('code', code);

    return NextResponse.json({
      access_token,
      token_type: 'Bearer',
      expires_in: 30 * 24 * 60 * 60, // 30 days
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'server_error' }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    }
  });
}
