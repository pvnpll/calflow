-- Create OAuth tables for MCP Custom Connector

CREATE TABLE mcp_auth_codes (
  code text primary key,
  user_id uuid references auth.users not null,
  client_id text not null,
  redirect_uri text not null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now()
);

CREATE TABLE mcp_tokens (
  access_token text primary key,
  user_id uuid references auth.users not null,
  client_id text not null,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE mcp_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_tokens ENABLE ROW LEVEL SECURITY;

-- No access from browser/client (only service role or admin can query these tables directly)
-- The Next.js server will use the service_role key to manage tokens.
