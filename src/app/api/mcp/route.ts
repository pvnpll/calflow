import { NextRequest } from "next/server";
import { transport, authenticateToken } from "@/lib/mcp/transport";

export const dynamic = "force-dynamic";

async function handleMcpRequest(req: NextRequest) {
  // Validate token
  const authInfo = await authenticateToken(req);
  if (!authInfo) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  // NextRequest might have issues with some web standards implementations,
  // but it extends Request, so it usually works fine.
  return transport.handleRequest(req, { authInfo });
}

export async function GET(req: NextRequest) {
  return handleMcpRequest(req);
}

export async function POST(req: NextRequest) {
  return handleMcpRequest(req);
}
