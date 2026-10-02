import { NextRequest } from "next/server";
import { handleStatelessMcpRequest, authenticateToken } from "@/lib/mcp/transport";

export const dynamic = "force-dynamic";

async function handleMcpRequest(req: NextRequest) {
  try {
    // Validate token
    const authInfo = await authenticateToken(req);
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

    // Convert NextRequest to standard Web Request to avoid internal property conflicts in SDK
    const webRequest = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    });

    const response = await handleStatelessMcpRequest(webRequest, authInfo);

    // Ensure permissive CORS headers on all MCP responses for Claude Web / Desktop
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error: any) {
    console.error("[MCP Route Error]:", error);
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32603, message: error?.message || "Internal server error" },
      id: null
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      }
    });
  }
}

export async function GET(req: NextRequest) {
  return handleMcpRequest(req);
}

export async function POST(req: NextRequest) {
  return handleMcpRequest(req);
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
