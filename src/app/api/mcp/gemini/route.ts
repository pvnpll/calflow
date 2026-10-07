import { NextRequest } from "next/server";
import { authenticateToken } from "@/lib/mcp/transport";
import { createCalflowMcpServer } from "@/lib/mcp/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = 'edge';

function getRealtimeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function logInteraction(action: string, req: NextRequest, extraInfo?: any) {
  try {
    const admin = getRealtimeClient();
    let body = null;
    try {
      if (req.method !== 'GET' && req.method !== 'OPTIONS') {
        const clonedReq = req.clone();
        body = await clonedReq.text();
      }
    } catch (e) {}

    await admin.from('cf_ai_interactions').insert({
      user_id: null,
      action: action,
      metadata: {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        body: body,
        extraInfo
      }
    });
  } catch (e) {
    console.error("Log error", e);
  }
}

export async function GET(req: NextRequest) {
  await logInteraction('gemini_mcp_get', req);
  try {
    const authInfo = await authenticateToken(req as unknown as Request);
    if (!authInfo) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { 
          "Content-Type": "application/json",
          "WWW-Authenticate": `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Expose-Headers": "WWW-Authenticate"
        } 
      });
    }

    const sessionId = crypto.randomUUID();
    const server = createCalflowMcpServer(authInfo, 'calflow_ai');
    
    let streamController: ReadableStreamDefaultController;
    const encoder = new TextEncoder();
    
    const supabase = getRealtimeClient();
    const channel = supabase.channel(`mcp_gemini_${sessionId}`);
    
    const stream = new ReadableStream({
        async start(controller) {
            streamController = controller;
            await new Promise((resolve, reject) => {
                channel.on('broadcast', { event: 'mcp-message' }, (payload) => {
                    if (transport.onmessage) transport.onmessage(payload.payload);
                }).subscribe((status) => {
                    if (status === 'SUBSCRIBED') resolve(true);
                    else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') reject(new Error(`Failed to subscribe: ${status}`));
                });
            });

            const forwardedHost = req.headers.get('x-forwarded-host');
            const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
            let base = process.env.NEXT_PUBLIC_APP_URL || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(req.url).origin);
            const endpointUrl = new URL(req.nextUrl.pathname, base);
            endpointUrl.searchParams.set("sessionId", sessionId);
            controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUrl.href}\n\n`));
        },
        cancel() { channel.unsubscribe(); }
    });

    const transport = {
        start: async () => {},
        close: async () => { await channel.unsubscribe(); },
        send: async (message: any) => {
            streamController.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(message)}\n\n`));
        },
        onmessage: undefined as ((message: any) => void) | undefined,
        onclose: undefined,
        onerror: undefined,
    };
    
    await server.connect(transport as any);
    
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    });
  } catch (error: any) {
    await logInteraction('gemini_mcp_get_error', req, { error: error.message });
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await logInteraction('gemini_mcp_post', req);
  try {
    const authInfo = await authenticateToken(req as unknown as Request);
    if (!authInfo) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { 
          "Content-Type": "application/json",
          "WWW-Authenticate": `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Expose-Headers": "WWW-Authenticate"
        } 
      });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    
    if (!sessionId) {
      const { handleStatelessMcpRequest } = await import('@/lib/mcp/transport');
      
      const proxiedReq = new Proxy(req as unknown as Request, {
        get(target, prop) {
          if (prop === 'headers') {
            return new Proxy(target.headers, {
              get(headersTarget, headersProp) {
                if (headersProp === 'get') {
                  return (name: string) => {
                    if (name.toLowerCase() === 'accept') {
                      const val = headersTarget.get(name) || '*/*';
                      if (!val.includes('text/event-stream')) {
                        return `${val}, text/event-stream, application/json`;
                      }
                    }
                    return headersTarget.get(name);
                  };
                }
                const val = Reflect.get(headersTarget, headersProp);
                return typeof val === 'function' ? val.bind(headersTarget) : val;
              }
            });
          }
          const val = Reflect.get(target, prop);
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });

      const response = await handleStatelessMcpRequest(proxiedReq, authInfo);
      
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "*");
      newHeaders.set("Access-Control-Expose-Headers", "WWW-Authenticate");
      
      let resBodyStr = null;
      try {
        const clonedRes = response.clone();
        resBodyStr = await clonedRes.text();
        await logInteraction('gemini_mcp_stateless_response', req, { status: response.status, body: resBodyStr });
      } catch (e) {}

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    let message;
    try {
      message = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const supabase = getRealtimeClient();
    const channel = supabase.channel(`mcp_gemini_${sessionId}`);
    
    await new Promise((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') resolve(true);
      });
    });

    await channel.send({
      type: 'broadcast',
      event: 'mcp-message',
      payload: message
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    await channel.unsubscribe();

    return new Response("Accepted", { 
      status: 202,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      }
    });
  } catch (error: any) {
    await logInteraction('gemini_mcp_post_error', req, { error: error.message });
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  await logInteraction('gemini_mcp_options', req);
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-Requested-With, Origin",
      "Access-Control-Expose-Headers": "WWW-Authenticate",
      "Access-Control-Max-Age": "86400"
    }
  });
}
