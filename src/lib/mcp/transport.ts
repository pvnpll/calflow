import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createCalflowMcpServer } from "./server";
import { createClient } from "@supabase/supabase-js";

// Global instances to persist across API route reloads in dev, 
// and to maintain state across GET (SSE) and POST (Message) requests.
declare global {
  var _mcpTransport: WebStandardStreamableHTTPServerTransport | undefined;
  var _mcpServerInitialized: boolean | undefined;
}

const transport = global._mcpTransport || new WebStandardStreamableHTTPServerTransport();
if (process.env.NODE_ENV !== 'production') {
  global._mcpTransport = transport;
}

const mcpServer = createCalflowMcpServer();

if (!global._mcpServerInitialized) {
  mcpServer.connect(transport).catch(console.error);
  global._mcpServerInitialized = true;
}

export { transport, mcpServer };

// Helper to validate bearer tokens
export async function authenticateToken(req: Request) {
  let token = "";
  
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    // Fallback to query parameter for SSE (GET)
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");
    if (queryToken) {
      token = queryToken;
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
