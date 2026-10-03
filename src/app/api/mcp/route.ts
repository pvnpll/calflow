import { NextRequest } from "next/server";
import { authenticateToken } from "@/lib/mcp/transport";
import { createCalflowMcpServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

// In-memory session store for standard MCP SSE
const sessions = new Map<string, { push: (msg: any) => void; server: any }>();

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
        } 
      });
    }

    const sessionId = crypto.randomUUID();
    const server = createCalflowMcpServer(authInfo);
    
    let streamController: ReadableStreamDefaultController;
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
        start(controller) {
            streamController = controller;
            const endpointUrl = new URL(req.url);
            endpointUrl.searchParams.set("sessionId", sessionId);
            // Send standard MCP endpoint event
            controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUrl.pathname}${endpointUrl.search}\n\n`));
        },
        cancel() {
            sessions.delete(sessionId);
        }
    });

    const transport = {
        start: async () => {},
        close: async () => { sessions.delete(sessionId); },
        send: async (message: any) => {
            streamController.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(message)}\n\n`));
        },
        onmessage: undefined as ((message: any) => void) | undefined,
        onclose: undefined,
        onerror: undefined,
    };

    sessions.set(sessionId, { 
      push: (msg: any) => {
        if (transport.onmessage) transport.onmessage(msg);
      }, 
      server 
    });
    
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
        } 
      });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    
    if (!sessionId) {
      return new Response("Missing sessionId", { status: 400 });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return new Response("Session not found", { 
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    let message;
    try {
      message = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Push the message to the MCP server via the transport
    session.push(message);

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
