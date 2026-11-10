# CalFlow

AI-first personal nutrition, hydration, and body composition tracker. CalFlow combines structured meal logging with computer vision, natural-language AI chat, multi-channel assistant MCP integration (Claude & ChatGPT), dashboard sharing, and comprehensive health insights.

---

## Architecture & Design

CalFlow is built on Next.js 16 (App Router), Supabase (PostgreSQL + Auth + Storage), and Tailwind CSS with `@base-ui/react` primitives.

### Three Front Doors, One Service Layer
The application exposes three primary interaction channels, all funneling into a unified service layer (`src/lib/services/*.service.ts`):
1. **Web Dashboard (`src/app/(dashboard)/*`)**: Client components fetching through authenticated Next.js route handlers (`src/app/api/*`). Authenticated by session cookies (`createClient()` + `auth.getUser()`).
2. **In-App AI Chat (`src/app/api/chat/route.ts`)**: Edge runtime multi-turn conversation engine that constructs a personalized system prompt from user goals, profile, and recent insights, executing structured tools (`src/lib/ai/tool-executor.ts`) via OpenAI or Ollama providers.
3. **Model Context Protocol (MCP) Server (`src/lib/mcp/server.ts`)**: Connects external AI assistants (ChatGPT, Claude Desktop) using Bearer tokens authenticated via `cf_mcp_tokens`. Enables natural assistant-driven commands (`log_meal`, `get_meals`, `log_water`, `get_water_logs`, `log_weight`, `get_insights`).

### Multi-Tenant Database Safety
All database objects belong to CalFlow and are prefixed with `cf_` (`cf_user_profiles`, `cf_meals`, `cf_meal_items`, `cf_water_logs`, `cf_weight_logs`, `cf_dashboard_shares`, `cf_friendships`, `cf_mcp_tokens`, etc.) via `src/lib/db-tables.ts`. CalFlow never modifies or accesses database tables belonging to sibling applications.

### User-Local Calendar Boundaries
Dates are stored as plain `YYYY-MM-DD` strings derived from the user's configured IANA timezone (`cf_user_profiles.timezone`) via `src/lib/date.ts` and `src/lib/services/user-time.ts`. Instant-to-date conversions avoid UTC date shifting (`toISOString()`), ensuring midnight rollover matches the user's physical day.

### Dashboard Sharing & Concurrency Protection
Shareable public links (`/s/<token>`) issue cryptographically random 128-bit URL-safe tokens (`cf_dashboard_shares`). Disabling sharing immediately rotates the token, marks the share inactive, and purges friendship links (`cf_friendships`). Active joins enforce a double-checked verification fence to guarantee no race condition leaves a usable friendship after sharing is disabled.

---

## AI Nutrition Estimates & Health Disclaimer

> [!NOTE]
> All nutrient values (calories, proteins, fats, carbohydrates, and micronutrients) provided by CalFlow's AI meal parsing and estimation tools are algorithmic approximations designed for personal tracking and informational guidance. They are not medical assessments, dietary prescriptions, or clinical records. For medical conditions or clinical diet management, always consult a licensed medical professional.

---

## Getting Started

### Prerequisites
- Node.js 20+ (recommended v24)
- A Supabase project with CalFlow migrations applied (`supabase/migrations/`)

### Environment Configuration
Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous client key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase administrative key (server-only; never exposed to browser)
- `NEXT_PUBLIC_APP_URL`: Base application URL (e.g. `http://localhost:3000` or production URL)
- `CALFLOW_API_SECRET`: Shared secret for backend integrations
- `AI_PROVIDER`: `openai` or `ollama`
- `OPENAI_API_KEY`: API key for OpenAI models (if using OpenAI provider)

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open the application.

---

## Verification & Testing

CalFlow maintains a deterministic regression test suite with zero external network dependencies:

```bash
# Run unit & contract regression tests
npm test

# Run ESLint checks
npm run lint

# Build production bundle and verify TypeScript types
npm run build
```

### Test Coverage
- **`tests/water-validation.test.mjs`**: Validates physiological hydration limits (1–10,000 ml), calendar date formatting, leap year verification, paired query date ranges, and timezone-midnight consistency.
- **`tests/sharing-concurrency.test.mjs`**: Verifies token format validation, share enable/disable lifecycle, concurrent join race prevention, and old token revocation.
- **`tests/nutrition-contracts.test.mjs`**: Tests weight goals, boundary ranges (25–400 kg), micronutrient key/value formatting, and calendar arithmetic.
