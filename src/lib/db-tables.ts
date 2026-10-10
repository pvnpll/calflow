/**
 * Table name constants for CalFlow.
 * Uses 'cf_' prefix to allow safe sharing of a single Supabase project
 * with other applications (e.g. instareels) without collision.
 */
export const TABLES = {
  USER_PROFILES: 'cf_user_profiles',
  NUTRITION_GOALS: 'cf_nutrition_goals',
  MEALS: 'cf_meals',
  MEAL_ITEMS: 'cf_meal_items',
  WATER_LOGS: 'cf_water_logs',
  WEIGHT_LOGS: 'cf_weight_logs',
  AI_INTERACTIONS: 'cf_ai_interactions',
  MCP_AUTH_CODES: 'cf_mcp_auth_codes',
  MCP_TOKENS: 'cf_mcp_tokens',
  DASHBOARD_SHARES: 'cf_dashboard_shares',
  FRIENDSHIPS: 'cf_friendships',
} as const;
