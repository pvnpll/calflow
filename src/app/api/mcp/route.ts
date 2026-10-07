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

export async function GET(req: NextRequest) {
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
    const server = createCalflowMcpServer(authInfo);
    
    let streamController: ReadableStreamDefaultController;
    const encoder = new TextEncoder();
    
    const supabase = getRealtimeClient();
    const channel = supabase.channel(`mcp_${sessionId}`);
    
    const stream = new ReadableStream({
        start(controller) {
            streamController = controller;
            const endpointUrl = new URL(req.url);
            endpointUrl.searchParams.set("sessionId", sessionId);
            // Send standard MCP endpoint event with absolute URL
            controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUrl.href}\n\n`));
            
            // Subscribe to channel for incoming POST messages
            channel.on('broadcast', { event: 'mcp-message' }, (payload) => {
                if (transport.onmessage) {
                    transport.onmessage(payload.payload);
                }
            }).subscribe();
        },
        cancel() {
            channel.unsubscribe();
        }
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
    console.error("[MCP GET Error]:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
      
      // Use Proxy to inject Accept header without consuming/cloning the body stream
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
    const channel = supabase.channel(`mcp_${sessionId}`);
    
    // We must ensure the channel is subscribed before broadcasting
    await new Promise((resolve) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          resolve(true);
        }
      });
    });

    await channel.send({
      type: 'broadcast',
      event: 'mcp-message',
      payload: message
    });

    await channel.unsubscribe();

    // Standard MCP requires 202 Accepted for POST messages
    return new Response("Accepted", { 
      status: 202,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      }
    });
  } catch (error: any) {
    console.error("[MCP POST Error]:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    }
  });
}
