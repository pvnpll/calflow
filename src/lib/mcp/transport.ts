import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createCalflowMcpServer } from "./server";
import { createClient } from "@supabase/supabase-js";

/**
 * For stateless HTTP mode in MCP SDK, each HTTP request must create a fresh
 * instance of WebStandardStreamableHTTPServerTransport and attach it to a server.
 */
export async function handleStatelessMcpRequest(webRequest: Request, authInfo: any) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless per-request
    enableDnsRebindingProtection: false,
  });
  const server = createCalflowMcpServer(authInfo);
  await server.connect(transport);
  return transport.handleRequest(webRequest, { authInfo });
}

// Helper to validate bearer tokens
export async function authenticateToken(req: Request) {
  let token = "";
  
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    // Fallback to query parameter for SSE (GET)
    try {
      const url = new URL(req.url);
      const queryToken = url.searchParams.get("token");
      if (queryToken) {
        token = queryToken;
      }
    } catch {
      // ignore URL parsing error
    }
  }
  
  if (!token) return null;
  
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { TABLES } = await import('@/lib/db-tables');
  
  const { data, error } = await admin
    .from(TABLES.MCP_TOKENS)
    .select("user_id, client_id")
    .eq("access_token", token)
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return { 
    token, 
    clientId: data.client_id || "unknown", 
    scopes: [], 
    extra: { userId: data.user_id } 
  };
}

