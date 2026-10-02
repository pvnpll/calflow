# CalFlow Claude MCP Custom Connector

This document describes the Model Context Protocol (MCP) server integration for CalFlow, which enables users to connect their CalFlow account securely to Claude via a Custom Connector.

## What is CalFlow MCP?
The CalFlow MCP server is an integration layer that exposes specific, authorized CalFlow functionality as MCP tools. Claude can use these tools to directly interact with a user's CalFlow database (log meals, retrieve summaries) while maintaining absolute user isolation and data security. 

## How the MCP Server Works
The MCP Server is implemented natively within the Next.js application using the official `@modelcontextprotocol/sdk` and `WebStandardStreamableHTTPServerTransport`. It exposes an HTTP SSE (Server-Sent Events) endpoint at `/api/mcp` which accepts `GET` requests to establish the streaming connection and `POST` requests to receive JSON-RPC messages.

## How OAuth Works
To securely authenticate Claude on behalf of the user, CalFlow implements an OAuth 2.0 authorization code flow:
1. **Authorization Screen**: Claude redirects the user to `/mcp/authorize?client_id=...&redirect_uri=...`.
2. **User Consent**: If the user is logged into their CalFlow account, they are presented with a consent screen. Upon approval, an authorization code is generated and saved securely in `mcp_auth_codes`.
3. **Redirection**: The user is redirected back to Claude's `redirect_uri` with the `code`.
4. **Token Exchange**: Claude securely POSTs to `/api/mcp/token` to exchange the `code` for a long-lived `access_token` (Bearer token) which is stored in `mcp_tokens`.
5. **Authenticated Requests**: Claude includes this Bearer token in the `Authorization` header for all subsequent `/api/mcp` requests.

## How Users Connect CalFlow to Claude
1. The user adds the CalFlow Custom Connector within Claude.
2. Claude opens a popup requesting authorization from the CalFlow app.
3. The user signs in, approves the connection, and Claude handles the rest.

## Available MCP Tools
- `log_meal`: Record a natural-language meal description along with Claude's nutrient estimates.
- `get_meals`: Retrieve meal records for a specified date or date range.
- `get_daily_summary`: Retrieve total calories, macros, and meal count for a specific day.
- `get_nutrition_summary`: Retrieve aggregated nutrition stats (averages) for a date range.
- `update_meal`: Update an existing meal record.
- `delete_meal`: Delete a specific meal record.

## Authentication & Security Model
- **No Shared Keys**: Each Claude user uses an OAuth Bearer token mapped directly to their CalFlow `user_id`.
- **Per-User Authorization**: The MCP endpoint extracts the `user_id` from the Bearer token. This ID is passed to the internal service layer, ensuring Supabase RLS (Row Level Security) and logic-level isolation is enforced.
- **Service-Role Isolation**: The `SUPABASE_SERVICE_ROLE_KEY` is only used on the server side to validate OAuth tokens. It is never exposed to Claude or the browser.

## Local Development
To test this locally:
1. Ensure your `.env.local` contains all Supabase configuration, plus your service role key.
2. Run `supabase start` or point to a local/cloud Supabase instance.
3. Run the migrations: `supabase migration up`.
4. Start the dev server: `npm run dev`.
5. You can test the OAuth flow by visiting `http://localhost:3000/mcp/authorize?client_id=test&redirect_uri=http://localhost:3000/auth/callback`.

## Production Configuration
- Ensure your production Supabase has RLS fully enabled and the `mcp_auth_codes` and `mcp_tokens` tables properly migrated.
- Expose `/api/mcp` to Claude's Custom Connector configuration.
- Set the OAuth Authorization URL to `https://<your-domain>/mcp/authorize`.
- Set the OAuth Token URL to `https://<your-domain>/api/mcp/token`.
