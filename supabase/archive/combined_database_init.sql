-- ==============================================================================
-- UNIFIED DATABASE INITIALIZATION SCRIPT
-- Contains both:
-- 1. InstaReels Tables (reels, accounts, daily_jobs, content_templates)
-- 2. CalFlow Tables (cf_user_profiles, cf_nutrition_goals, cf_meals, etc.)
-- ==============================================================================

-- ==============================================================================
-- PART 1: INSTAREELS TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    instagram_user_id TEXT NOT NULL,
    access_token TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    posting_time TEXT NOT NULL DEFAULT '19:00',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS content_templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'monk_student',
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,
    reel_number INTEGER,
    topic TEXT NOT NULL,
    category TEXT,
    content_depth INTEGER DEFAULT 1,
    title TEXT,
    hook TEXT,
    core_insight TEXT,
    conversation JSONB NOT NULL,
    caption TEXT,
    content_type TEXT NOT NULL DEFAULT 'monk_student',
    status TEXT NOT NULL DEFAULT 'generating',
    rendered_video_url TEXT,
    instagram_media_id TEXT,
    instagram_permalink TEXT,
    error_message TEXT,
    account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS daily_jobs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    scheduled_date DATE NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'generating',
    reel_id TEXT REFERENCES reels(id) ON DELETE SET NULL,
    account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_reels_status ON reels(status);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_jobs_date ON daily_jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_daily_jobs_status ON daily_jobs(status);

ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on reels" ON reels
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access on daily_jobs" ON daily_jobs
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access on accounts" ON accounts
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access on content_templates" ON content_templates
    FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- PART 2: CALFLOW TABLES (Prefixed with cf_)
-- ==============================================================================

CREATE OR REPLACE FUNCTION cf_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS cf_user_profiles (
    user_id uuid REFERENCES auth.users PRIMARY KEY,
    name text,
    age int,
    sex text,
    height_cm numeric,
    current_weight_kg numeric,
    activity_level text,
    goal text,
    diet text,
    preferences text[],
    allergies text[],
    foods_to_avoid text[],
    preferred_meal_count int DEFAULT 3,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_nutrition_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    calorie_target numeric,
    protein_target numeric,
    carbohydrate_target numeric,
    fat_target numeric,
    fiber_target numeric,
    water_target_ml numeric DEFAULT 2500,
    micronutrient_targets jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cf_active_nutrition_goals 
    ON cf_nutrition_goals (user_id) 
    WHERE is_active = true;

CREATE TABLE IF NOT EXISTS cf_meals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL,
    meal_type text NOT NULL,
    description text,
    estimated_calories numeric,
    estimated_protein numeric,
    estimated_carbs numeric,
    estimated_fat numeric,
    estimated_fiber numeric,
    micronutrients jsonb DEFAULT '{}',
    source text DEFAULT 'web_app',
    confidence text DEFAULT 'medium',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_meal_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id uuid REFERENCES cf_meals(id) ON DELETE CASCADE NOT NULL,
    food_name text NOT NULL,
    quantity numeric,
    unit text,
    estimated_calories numeric,
    estimated_protein numeric,
    estimated_carbs numeric,
    estimated_fat numeric,
    estimated_fiber numeric,
    micronutrients jsonb DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS cf_water_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL DEFAULT current_date,
    amount_ml numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_weight_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL DEFAULT current_date,
    weight_kg numeric NOT NULL,
    note text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_ai_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    action text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_mcp_auth_codes (
    code text PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    client_id text NOT NULL,
    redirect_uri text NOT NULL,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_mcp_tokens (
    access_token text PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    client_id text NOT NULL,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cf_meals_user_date ON cf_meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_cf_meal_items_meal_id ON cf_meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_cf_water_logs_user_date ON cf_water_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_cf_weight_logs_user_date ON cf_weight_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_cf_ai_interactions_user ON cf_ai_interactions(user_id);

DROP TRIGGER IF EXISTS trigger_cf_user_profiles_updated_at ON cf_user_profiles;
CREATE TRIGGER trigger_cf_user_profiles_updated_at
    BEFORE UPDATE ON cf_user_profiles
    FOR EACH ROW EXECUTE FUNCTION cf_update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_cf_nutrition_goals_updated_at ON cf_nutrition_goals;
CREATE TRIGGER trigger_cf_nutrition_goals_updated_at
    BEFORE UPDATE ON cf_nutrition_goals
    FOR EACH ROW EXECUTE FUNCTION cf_update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_cf_meals_updated_at ON cf_meals;
CREATE TRIGGER trigger_cf_meals_updated_at
    BEFORE UPDATE ON cf_meals
    FOR EACH ROW EXECUTE FUNCTION cf_update_updated_at_column();

ALTER TABLE cf_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_mcp_auth_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_mcp_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cf_user_profiles_select" ON cf_user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_user_profiles_insert" ON cf_user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cf_user_profiles_update" ON cf_user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cf_user_profiles_delete" ON cf_user_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "cf_nutrition_goals_select" ON cf_nutrition_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_nutrition_goals_insert" ON cf_nutrition_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cf_nutrition_goals_update" ON cf_nutrition_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cf_nutrition_goals_delete" ON cf_nutrition_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "cf_meals_select" ON cf_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_meals_insert" ON cf_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cf_meals_update" ON cf_meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cf_meals_delete" ON cf_meals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "cf_meal_items_select" ON cf_meal_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM cf_meals WHERE cf_meals.id = cf_meal_items.meal_id AND cf_meals.user_id = auth.uid())
);
CREATE POLICY "cf_meal_items_insert" ON cf_meal_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cf_meals WHERE cf_meals.id = cf_meal_items.meal_id AND cf_meals.user_id = auth.uid())
);
CREATE POLICY "cf_meal_items_update" ON cf_meal_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cf_meals WHERE cf_meals.id = cf_meal_items.meal_id AND cf_meals.user_id = auth.uid())
);
CREATE POLICY "cf_meal_items_delete" ON cf_meal_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM cf_meals WHERE cf_meals.id = cf_meal_items.meal_id AND cf_meals.user_id = auth.uid())
);

CREATE POLICY "cf_water_logs_select" ON cf_water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_water_logs_insert" ON cf_water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cf_water_logs_update" ON cf_water_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cf_water_logs_delete" ON cf_water_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "cf_weight_logs_select" ON cf_weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_weight_logs_insert" ON cf_weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cf_weight_logs_update" ON cf_weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cf_weight_logs_delete" ON cf_weight_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "cf_ai_interactions_select" ON cf_ai_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cf_ai_interactions_insert" ON cf_ai_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
