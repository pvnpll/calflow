import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty or form-encoded
    }

    const array1 = new Uint8Array(16);
    crypto.getRandomValues(array1);
    const clientId = `claude_${Array.from(array1).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const array2 = new Uint8Array(32);
    crypto.getRandomValues(array2);
    const clientSecret = Array.from(array2).map(b => b.toString(16).padStart(2, '0')).join('');
    const redirectUris = body.redirect_uris || [];

    return NextResponse.json({
      client_id: clientId,
      client_secret: clientSecret,
      client_name: body.client_name || 'Claude Custom Connector',
      redirect_uris: redirectUris,
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      }
    });
  } catch (error: any) {
    console.error('Dynamic Client Registration error:', error);
    return NextResponse.json({ error: 'invalid_client_metadata' }, { status: 400 });
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
