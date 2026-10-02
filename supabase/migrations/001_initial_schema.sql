-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tables

CREATE TABLE user_profiles (
    user_id uuid REFERENCES auth.users PRIMARY KEY,
    name text,
    age int,
    sex text,
    height_cm numeric,
    current_weight_kg numeric,
    activity_level text, -- (sedentary/lightly_active/moderately_active/very_active/extremely_active)
    goal text, -- (lose_weight/maintain_weight/gain_weight/gain_muscle/general_health)
    diet text, -- (omnivore/vegetarian/vegan/pescatarian/keto/paleo/other)
    preferences text[],
    allergies text[],
    foods_to_avoid text[],
    preferred_meal_count int DEFAULT 3,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE nutrition_goals (
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
CREATE UNIQUE INDEX idx_active_nutrition_goals ON nutrition_goals (user_id) WHERE is_active = true;

CREATE TABLE meals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL,
    meal_type text NOT NULL, -- (breakfast/lunch/dinner/snack)
    description text,
    estimated_calories numeric,
    estimated_protein numeric,
    estimated_carbs numeric,
    estimated_fat numeric,
    estimated_fiber numeric,
    micronutrients jsonb DEFAULT '{}',
    source text DEFAULT 'web_app', -- (chatgpt/web_app/import)
    confidence text DEFAULT 'medium', -- (low/medium/high)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE meal_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id uuid REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
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

CREATE TABLE water_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL DEFAULT current_date,
    amount_ml numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE weight_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    date date NOT NULL DEFAULT current_date,
    weight_kg numeric NOT NULL,
    note text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE ai_interactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    action text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Triggers

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at
    BEFORE UPDATE ON nutrition_goals
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON meals
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Indexes

CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, date);
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date);
CREATE INDEX idx_meal_items_meal_id ON meal_items(meal_id);

-- RLS

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

-- nutrition_goals policies
CREATE POLICY "Users can view own nutrition goals" ON nutrition_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition goals" ON nutrition_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition goals" ON nutrition_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition goals" ON nutrition_goals FOR DELETE USING (auth.uid() = user_id);

-- meals policies
CREATE POLICY "Users can view own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON meals FOR DELETE USING (auth.uid() = user_id);

-- meal_items policies
CREATE POLICY "Users can view own meal items" ON meal_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);
CREATE POLICY "Users can insert own meal items" ON meal_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);
CREATE POLICY "Users can update own meal items" ON meal_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);
CREATE POLICY "Users can delete own meal items" ON meal_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);

-- water_logs policies
CREATE POLICY "Users can view own water logs" ON water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water logs" ON water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water logs" ON water_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own water logs" ON water_logs FOR DELETE USING (auth.uid() = user_id);

-- weight_logs policies
CREATE POLICY "Users can view own weight logs" ON weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight logs" ON weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight logs" ON weight_logs FOR DELETE USING (auth.uid() = user_id);

-- ai_interactions policies
CREATE POLICY "Users can view own ai interactions" ON ai_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai interactions" ON ai_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai interactions" ON ai_interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai interactions" ON ai_interactions FOR DELETE USING (auth.uid() = user_id);
