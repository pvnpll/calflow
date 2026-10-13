# Changelog

All notable changes to **CalFlow** are documented in this file.

CalFlow is an AI-first personal nutrition tracking web app available at [https://cal-flow.vercel.app](https://cal-flow.vercel.app).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.7.7] — 2026-10-10

**Fix: Password Autofill Support**

### Fixed
- Added missing `name="email"` and `name="password"` attributes to the inputs on the Login, Signup, Forgot Password, and Reset Password pages so that browser password managers (like iCloud Keychain, 1Password) can correctly identify the fields and trigger autofill.

---

## [0.7.6] — 2026-10-09

**Fix: Isolate AI Chat Sessions per User**

### Fixed
- Fixed a bug where AI chat sessions were stored in `localStorage` under a common key (`calflow_chat_messages`), causing new signups or different users logging in on the same device to see previous users' chat history.
- Chat history is now isolated by appending the Supabase `userId` to the `localStorage` key.

---

## [0.7.5] — 2026-10-08

**Fix: Scrolling Background & Rubber Banding**

### Fixed
- Fixed an issue where the background blobs would scroll out of view when the document scrolled by changing their positioning from absolute to fixed.
- Added `overscroll-behavior-y: none` to the global stylesheet to prevent the entire website from rubber-banding (bouncing) on iOS Safari when scrolling past the top or bottom bounds.

---

## [0.7.4] — 2026-10-08

**Fix: AI Chat Mobile Scrolling & Keyboard Trap**

### Fixed
- Fixed a severe regression on mobile where focusing the AI chat input pushed the entire website up, permanently trapping the viewport and preventing scrolling.
- Removed strict `h-[100dvh]` bounded flex heights from the root layout container.
- Chat page now allows native document scrolling, preventing Safari's virtual keyboard from locking the page layout.
- Chat input and header use sticky positioning adjusted for the mobile navigation bar, ensuring they remain accessible above the keyboard without breaking the document flow.
- Ensured non-chat pages also continue to scroll natively with buttery smoothness.

---

## [0.7.3] — 2026-10-08

**Fix: Layout Regression on Non-Chat Pages**

### Fixed
- Fixed an issue where non-chat pages couldn't scroll.

---

## [0.7.2] — 2026-10-08

**Fix: AI Chat Scrolling & Layout**

### Fixed
- Fixed critical scrolling issues in the AI Chat page on both mobile and desktop.
- Chat UI is now a true fullscreen flex layout that perfectly bounds to the viewport, keeping the input fixed at the bottom while allowing messages to scroll cleanly within their own container.
- Eliminated double-scrollbar issues on desktop and layout-shift bugs on mobile Safari.
- Replaced `h-screen` (which uses `100vh`) with `h-[100dvh]` globally in the dashboard layout to fix iOS Safari address bar and virtual keyboard viewport resizing issues, ensuring the chat input is never pushed off-screen.

---

## [0.7.1] — 2026-10-08

**Mobile UI Polish & Glassmorphism Theme**

### Added
- Unified glassmorphism theme: added frosted glass (`backdrop-blur-md`) to mobile top header, mobile bottom navigation, desktop sidebar, and Auth cards.
- Ambient glowing background blobs from auth layout applied globally to the dashboard layout for a premium consistent theme.
- Global `-webkit-tap-highlight-color: transparent` to remove iOS Safari tap highlights.

### Changed
- Replaced basic buttons and `<a>` links in navigation components with Next.js `<Link>` for buttery smooth SPA client-side routing.
- Replaced default button active translation with `active:scale-95` to provide a buttery smooth, bouncy touch feedback on all buttons and navigation links.
- Increased default `Input`, `Textarea`, and `Button` heights from 32px (`h-8`) to 40px (`h-10`) with proportionally larger padding to improve mobile tap targets and prevent clumsy interactions.

---

## [0.7.0] — 2026-10-02 · `76bb022`

**Merge: Goal-Based Tracking**

### Added
- Merged `feature/goal-tracking` branch into `main` via Pull Request #1
- Goal-based calorie and macro tracking — nutrition targets are now driven by the user's selected goal (lose weight, maintain, gain, etc.)

---

## [0.6.2] — 2026-10-02 · `88dae4d`

**Goal-Based Tracking**

### Added
- `feature/goal-tracking` branch: dynamic nutrition targets calculated from user goals, activity level, height, weight, and age
- Goals form now auto-computes recommended calorie/macro splits based on profile

---

## [0.6.1] — 2026-10-02 · `14927e5`

**UI Fixes**

### Fixed
- Miscellaneous UI polish and layout corrections across dashboard and meals pages

---

## [0.6.0] — 2026-10-02 · `a387de9`

**MCP Connector Page**

### Added
- New `/connect` page (`src/app/(dashboard)/connect/page.tsx`) — dedicated UI for connecting Claude as a custom MCP connector
- Step-by-step instructions for users to authenticate and link their CalFlow account to Claude
- Shows the MCP endpoint URL and OAuth scopes required

---

## [0.5.0] — 2026-10-02 · `84cf08c`

**Dark/Light Mode + All 27 Micronutrients on Dashboard**

### Added
- `src/components/shared/ThemeProvider.tsx` — React context provider for dark/light mode with `localStorage` persistence and system preference detection
- `src/components/shared/ThemeToggle.tsx` — Sun/Moon icon button to toggle between themes
- All 27 FDA/NIH essential micronutrients displayed on the dashboard in a responsive grid
  - 14 vitamins: A, C, D, E, K, B1 (Thiamine), B2 (Riboflavin), B3 (Niacin), B5 (Pantothenic Acid), B6, B7 (Biotin), B9 (Folate), B12, Choline
  - 13 minerals: Calcium, Iron, Magnesium, Phosphorus, Potassium, Sodium, Zinc, Copper, Manganese, Selenium, Chromium, Molybdenum, Iodine
- **"X of 27 tracked today"** counter on the micronutrients panel
- Dimmed cards for untracked nutrients; colour-coded progress bars (🟢 ≥ 75 %, 🔵 50–74 %, 🟠 < 50 %)

### Changed
- `src/app/layout.tsx` — wrapped with `<ThemeProvider>`, added `suppressHydrationWarning`
- `src/app/(dashboard)/layout.tsx` — ThemeToggle added to sidebar header (desktop) and mobile top bar; mobile top bar (`h-14`) added with CalFlow logo + ThemeToggle
- `src/components/dashboard/DashboardContent.tsx` — replaced dynamic chart with hardcoded `ESSENTIAL_MICRONUTRIENTS` array; each entry has `aliases[]` for flexible JSON-key matching

---

## [0.4.1] — 2026-10-02 · `bdc30f4`

**Fix: Claude Writing Vitamins to Description Text**

### Fixed
- `src/lib/mcp/server.ts` — `update_meal` tool description now explicitly states:
  *"DO NOT append vitamins as text to description; pass them directly into the `micronutrients` argument as structured key-value pairs."*
- Added a concrete example JSON object in the `micronutrients` parameter description so Claude follows the schema correctly

---

## [0.4.0] — 2026-10-02 · `7a3fb76`

**FDA/NIH Nutrient References + Comprehensive Vitamin/Mineral Extraction**

### Added
- `src/lib/constants/nutrition-reference.ts` — central reference file with all 27 essential nutrients, their FDA/NIH daily values (RDI), unit labels, and alias arrays for flexible JSON-key matching. Exports `findNutrientReference()` utility
- `log_meal` MCP tool description updated to mandate extraction of all vitamins and minerals by name
- `src/lib/ai/system-prompt.ts` — explicit listing of all 27 vitamin/mineral keys (`vitamin_a_mcg`, `vitamin_b12_mcg`, `calcium_mg`, etc.) that Claude and Ollama must populate

### Changed
- `src/components/dashboard/DashboardContent.tsx` — replaced simple chip view with a full grid of nutrient cards showing FDA/NIH %DV progress bars, colour-coded by intake level

---

## [0.3.0] — 2026-10-02 · `23aff98`

**Fix update_meal Schema + Chat Persistence**

### Fixed
- `src/lib/mcp/server.ts` — expanded `update_meal` tool with `meal_type`, `fiber_g`, `items` array, and `micronutrients` object; added `try/catch` blocks returning `isError: true` on failure
- `src/lib/ai/tools.ts` — relaxed `log_meal` schema (only `description` required; `date` and `items` are optional); added top-level `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g` fields so Ollama can log without structured items

### Added
- `src/lib/ai/tool-executor.ts` — smart defaults:
  - `date` inferred to today if omitted
  - `meal_type` inferred from keywords (e.g., egg/omelette/idli → breakfast)
  - Flexible item field mapping; totals aggregated from items when top-level totals are missing
- `src/app/(dashboard)/chat/page.tsx` — `localStorage` persistence of chat history; `Clear Chat` button; `Nutrition Assistant` header; chat no longer vanishes on page refresh

---

## [0.2.0] — 2026-10-02 · `9944bfb`

**NaN Fixes, Ollama Cloud AI Integration, Live Profile/Insights Data**

### Added
- `src/lib/ai/ollama.provider.ts` — `OllamaProvider` class using OpenAI-compatible SDK pointed at `https://ollama.com/v1` (`gemma4:31b` model)
- `src/lib/ai/factory.ts` — `AI_PROVIDER=ollama` switch to route to `OllamaProvider`

### Fixed
- `src/components/dashboard/CalorieRing.tsx` — division-by-zero guards preventing NaN in the calorie ring
- `src/components/dashboard/MacroCard.tsx` — NaN guards on all macro values
- `src/components/dashboard/RecentMeals.tsx` — fallback display for undefined `estimated_calories`
- `src/components/dashboard/WaterTracker.tsx` — `initialConsumed` sync fix; NaN guards
- `src/components/dashboard/DashboardContent.tsx` — aggregated micronutrient display
- `src/components/meals/MealCard.tsx` — NaN guards + micronutrient chips display
- `src/app/(dashboard)/insights/page.tsx` — connected to live `/api/insights` endpoint
- `src/app/(dashboard)/weight/page.tsx` — connected to live `/api/weight` endpoint
- `src/components/profile/ProfileForm.tsx` — connected to live `/api/profile` endpoint
- `src/components/profile/GoalsForm.tsx` — connected to live `/api/goals` endpoint
- `src/components/profile/PreferencesForm.tsx` — connected to live `/api/profile` (preferences fields)
- `src/app/api/chat/route.ts` — integrated AI provider factory

---

## [0.1.5] — 2026-10-02 · `d713804`

**Fix: Admin Client for MCP Tool Execution**

### Fixed
- All service functions used by MCP tools now call `createAdminClient()` (service-role key) to bypass Supabase Row Level Security, since MCP requests are authenticated via bearer token rather than a user cookie session

---

## [0.1.4] — 2026-10-02 · `091b245`

**Fix: log_meal Error Handling and Return Payload**

### Fixed
- `src/lib/mcp/server.ts` — `log_meal` now wraps execution in safe try/catch; returns the created meal payload on success, structured error on failure

---

## [0.1.3] — 2026-10-02 · `dc9c16f`

**Fix: Server Fallback to Service-Role Client for MCP Context**

### Fixed
- MCP tool execution path now falls back to service-role Supabase client when called outside a user cookie session (i.e., all external Claude requests)

---

## [0.1.2] — 2026-10-02 · `46fa55d`

**Fix: RFC 9728 Resource Metadata + Universal CORS Headers**

### Fixed
- Added RFC 9728 path-specific resource metadata at `/.well-known/oauth-protected-resource`
- Added universal CORS headers to the `/api/mcp` route so Claude's browser-based OAuth flow is not blocked

---

## [0.1.1] — 2026-10-02 · `775d37a`

**Fix: Stateless MCP Transport for Serverless**

### Fixed
- Instantiate a fresh `WebStandardStreamableHTTPServerTransport` per request to support all MCP JSON-RPC methods on Vercel's serverless infrastructure (no shared in-memory state between requests)

---

## [0.1.0] — 2026-10-02 · `e9165a6`

**Fix: Serverless Stateless Transport + RFC 9728 WWW-Authenticate Challenge**

### Fixed
- MCP endpoint returns a proper `401 Unauthorized` with `WWW-Authenticate` header as required by RFC 9728 when no bearer token is present, triggering Claude's OAuth flow correctly

---

## [0.0.5] — 2026-10-02 · `e859195`

**Feature: Claude MCP OAuth Integration (RFC 8414 / RFC 9728 / RFC 7591)**

### Added
- Full OAuth 2.0 authorization server implementation for Claude custom connectors:
  - `GET /.well-known/oauth-authorization-server` — RFC 8414 authorization server metadata
  - `GET /.well-known/oauth-protected-resource` — RFC 9728 protected resource metadata
  - `POST /api/mcp/register` — RFC 7591 dynamic client registration
  - `GET /api/mcp/authorize` — OAuth 2.0 authorization endpoint (user consent)
  - `POST /api/mcp/token` — token exchange endpoint
- `cf_mcp_auth_codes` and `cf_mcp_tokens` Supabase tables for storing auth codes and bearer tokens
- `src/lib/mcp/transport.ts` — `authenticateToken()` looks up bearer tokens in Supabase; `handleStatelessMcpRequest()` creates fresh transport per request
- `src/app/api/mcp/route.ts` — exports GET/POST/OPTIONS handlers; wraps auth and transport

---

## [0.0.4] — 2026-10-02 · `248a522`

**Feature: cf_ Table Prefix for Shared Supabase Projects**

### Changed
- All database tables renamed with `cf_` prefix (e.g., `meals` → `cf_meals`, `user_profiles` → `cf_user_profiles`) to avoid collisions in a shared Supabase project
- `src/lib/db-tables.ts` created — central constants file for all table names
- All service files and API routes updated to reference the new table names

---

## [0.0.3] — 2026-10-02 · `dd3529c`

**Fix: Graceful Supabase Env Variable Fallback**

### Fixed
- `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` — graceful fallback when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing (prevents hard crash on cold start before env vars are set)

---

## [0.0.2] — 2026-10-02 · `3757111`

**Fix: Middleware Guard for Missing Supabase Env Vars**

### Fixed
- `src/middleware.ts` — early return if Supabase environment variables are not configured, preventing middleware crash on Vercel cold starts during initial deployment

---

## [0.0.1] — 2026-10-02 · `64f8a76`

**Chore: Vercel CLI Dev Dependency**

### Added
- `vercel` added as a dev dependency for local deployment management and environment variable syncing

---

## [0.0.0] — 2026-10-02 · `d1d62ee` / `f03071d`

**Initial Release — CalFlow MVP**

### Added

**Foundation**
- Next.js 15 App Router project scaffolded with TypeScript and Tailwind CSS v4
- `shadcn/ui` component library configured
- Supabase PostgreSQL backend with Row Level Security on all tables
- Vercel deployment at [https://cal-flow.vercel.app](https://cal-flow.vercel.app)

**Database Schema** (`supabase/migrations/001_initial_schema.sql`)
- `cf_user_profiles` — name, age, sex, height, weight, activity level, goal, diet, preferences, allergies
- `cf_nutrition_goals` — calorie, macro, and micronutrient targets per user
- `cf_meals` — meal entries with type, description, estimated macros, `micronutrients` JSONB column, source, and confidence
- `cf_meal_items` — individual food items within a meal with per-item nutrition
- `cf_water_logs` — daily water intake entries
- `cf_weight_logs` — weight entries with optional notes
- `cf_ai_interactions` — audit log of AI tool calls
- RLS policies on all tables; updated_at triggers; indexes on common query patterns

**Auth**
- Supabase email/password authentication
- Login and Signup pages (`src/app/(auth)/login`, `src/app/(auth)/signup`)
- Auth middleware protecting all `/(dashboard)` routes
- `signOut()` server action

**Service Layer**
- `profile.service.ts` — getProfile, upsertProfile, updateProfile
- `goals.service.ts` — getActiveGoals, upsertGoals, getGoalsHistory
- `meals.service.ts` — createMeal, getMealsByDate, getMealsByDateRange, getMealById, updateMeal, deleteMeal
- `nutrition.service.ts` — getTodaySummary, getNutritionSummary, getNutritionGaps, getDailyBreakdown
- `water.service.ts` — logWater, getWaterByDate, getWaterSummary
- `weight.service.ts` — logWeight, getWeightHistory, getLatestWeight, getWeightChange
- `insights.service.ts` — getInsights (avg calories/macros, water, weight trend, logging consistency, most-logged foods, macro distribution, target achievement rate)

**API Routes**
- `/api/profile` (GET, PUT, PATCH)
- `/api/goals` (GET, PUT)
- `/api/meals` (GET, POST) and `/api/meals/[id]` (GET, PUT, DELETE)
- `/api/nutrition/today`, `/api/nutrition/summary`, `/api/nutrition/gaps`
- `/api/water` (GET, POST)
- `/api/weight` (GET, POST)
- `/api/insights`
- `/api/chat` — in-app AI chat endpoint
- `/api/mcp` — MCP server endpoint for Claude integration

**AI Integration**
- `src/lib/ai/provider.ts` — `AIProvider` interface
- `src/lib/ai/openai.provider.ts` — OpenAI GPT-4o provider
- `src/lib/ai/ollama.provider.ts` — Ollama Cloud provider (`gemma4:31b`)
- `src/lib/ai/factory.ts` — provider factory via `AI_PROVIDER` env var
- `src/lib/ai/tools.ts` — 15 CalFlow tool definitions (log_meal, get_today_summary, update_meal, delete_meal, log_water, log_weight, get_insights, etc.)
- `src/lib/ai/tool-executor.ts` — maps AI tool calls to service functions
- `src/lib/ai/system-prompt.ts` — context-aware system prompt with user profile, goals, and full vitamin/mineral key list
- `src/lib/mcp/server.ts` — MCP server with all tools exposed

**Dashboard UI**
- Sidebar navigation (desktop) + bottom navigation (mobile)
- Dashboard: calorie ring, macro cards (protein/carbs/fat/fiber), water tracker, recent meals, weight card, micronutrient grid
- Meals page: date-picker, grouped by meal type, add/edit/delete dialogs
- Insights page: calorie/macro/water/weight charts (Recharts), weekly report card
- Chat page: full-screen AI chat with Ollama Cloud
- Profile page: personal info, goals, preferences, account tabs
- Weight page: log weight, history chart, period selector

**Infrastructure**
- All environment variables configured on Vercel (Production, Preview, Development)
- `vercel` CLI as dev dependency

---

> **Legend**  
> 🚀 Feature &nbsp; 🐛 Bug Fix &nbsp; ♻️ Refactor &nbsp; 🏗️ Infrastructure &nbsp; 📝 Documentation
