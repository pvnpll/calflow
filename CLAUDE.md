# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- There is no test runner. `scripts/test-mcp.ts` is a manual DB-service smoke script that loads `.env.local` and hits a real Supabase project; run it with a TS runner such as `npx tsx scripts/test-mcp.ts` (`tsx` is not a dependency).

Next.js is 16.x with breaking changes from older versions — see the note imported from AGENTS.md and read `node_modules/next/dist/docs/` before touching framework APIs. Notably, request interception lives in `src/proxy.ts` (the renamed `middleware`), not `middleware.ts`.

Env vars are listed in `.env.example` (Supabase URL/anon/service-role keys, `CALFLOW_API_SECRET`, `NEXT_PUBLIC_APP_URL`, `AI_PROVIDER` + provider keys). Database schema is in `supabase/migrations/` (apply with the Supabase CLI).

## Architecture

CalFlow is an AI-first nutrition tracker (Next.js App Router + Supabase + Tailwind v4/shadcn on `@base-ui/react`). Import alias `@/*` → `src/*`. `CHANGELOG.md` is maintained per release (keep it and the `package.json` version in step when shipping changes).

**Three front doors, one service layer.** The same data operations are reachable from the web UI, the in-app AI chat, and external AI assistants. All of them funnel into `src/lib/services/*.service.ts` (meals, nutrition, goals, profile, water, weight, insights). Services take an explicit `userId` and mostly use `createAdminClient()` (service-role, bypasses RLS) from `src/lib/supabase/server.ts`, so **per-user isolation is enforced by the caller passing the right `userId` and by the services filtering on it** — never pass a client-supplied user id through.

- **Web app**: `src/app/(dashboard)/*` pages (client components) fetch from `src/app/api/*` route handlers, which authenticate via the cookie session (`createClient()` + `auth.getUser()`) and call services. `src/proxy.ts` → `lib/supabase/middleware.ts#updateSession` refreshes the session and redirects unauthenticated users to `/login`; `/api`, `/.well-known`, `/auth/callback` and static assets are exempt (API routes must do their own auth). `ProfileContext` caches `/api/profile/full` for the dashboard shell.
- **In-app AI chat** (`api/chat/route.ts`, edge runtime): builds a system prompt from profile/goals/7-day insights (`lib/ai/system-prompt.ts`), calls the provider selected by `AI_PROVIDER` (`lib/ai/factory.ts` → `OllamaProvider` / `OpenAIProvider`, both behind the `AIProvider` interface in `provider.ts`), and loops up to 5 times executing tool calls through `lib/ai/tool-executor.ts` against tool schemas in `lib/ai/tools.ts`. The response is a single JSON blob streamed with keep-alive whitespace to dodge Vercel's initial-byte timeout. Note `.env.example` mentions `anthropic` and the factory has a `gemini` stub, but neither is implemented.
- **MCP server for Claude/ChatGPT** (`api/mcp/route.ts`, `lib/mcp/server.ts`, `lib/mcp/transport.ts`): `createCalflowMcpServer(authInfo, source)` registers the tools (log_meal, get_meals, get_goals, log_water, get_insights, …) and every handler reads `authInfo.extra.userId`. Requests authenticate with a Bearer token looked up in `cf_mcp_tokens` (`authenticateToken`), which also infers the client (`claude` vs `chatgpt`) and sets the meal `source`. POST without `sessionId` is the primary path: stateless `WebStandardStreamableHTTPServerTransport`. The legacy GET-SSE + POST-with-`sessionId` path relays messages through Supabase Realtime broadcast channels. The OAuth 2.0 flow (consent page `(auth)/mcp/authorize`, `api/mcp/register`, `api/mcp/token`, `.well-known/oauth-*` metadata) issues those tokens; see `docs/claude-mcp.md` (its table names lack the `cf_` prefix — the real ones are in `lib/db-tables.ts`). The route currently writes debug rows to `cf_ai_interactions` ("LOGGING HACK").
- **Generic action endpoint** `api/integrations/chatgpt/route.ts`: single POST `{action, params, user_token?}` switch; auth is either a user session, a Supabase user JWT in `user_token`, or the shared `CALFLOW_API_SECRET`.

**When adding or changing a data capability**, it usually has to be mirrored in up to four places: the service, the MCP tool (`lib/mcp/server.ts`), the in-app AI tool (`lib/ai/tools.ts` + `tool-executor.ts`), and the `integrations/chatgpt` action switch — these are hand-duplicated, not generated (e.g. meal-type inference exists in both the MCP server and the tool executor).

**Database**: all tables use the `cf_` prefix because the Supabase project is shared with another app; always reference them through `TABLES` in `src/lib/db-tables.ts` rather than string literals. Services convert camelCase app types (`lib/types`) to snake_case columns by hand (see `toDbMeal`). Meals carry a free-form `micronutrients` JSON map (keys like `vitamin_c_mg`) both on the meal and per `cf_meal_items` row; reference targets live in `lib/constants/nutrition-reference.ts`.

**Dates** are plain `YYYY-MM-DD` strings in the *user's* timezone — never use `toISOString()` for them. Use `src/lib/date.ts` (`todayStr`, `addDaysStr`, `parseDateStr`): on the client omit the timezone (browser-local); on the server get the user's zone from `services/user-time.ts` (`getUserToday(userId)`), which reads `cf_user_profiles.timezone` (migration 004), kept in sync from the browser by `components/shared/TimezoneSync.tsx`. MCP gets it via `authInfo.extra.timezone`; the system prompt via `profile.timezone`.

**Onboarding**: the `(dashboard)` layout redirects to `/onboarding` (outside the dashboard shell) until `isOnboardingComplete(profile)` (`lib/onboarding.ts`: age, sex, height, weight, goal) is true. The onboarding page saves targets (via `lib/nutrition-targets.ts`) first and the profile last, since the profile is what marks it complete. Signup seeds `profile.name`; the full name's first word drives the dashboard greeting.

`goal-tracking.md` and `docs/landing-page-spec.md` are product/design specs, not documentation of current behavior.
