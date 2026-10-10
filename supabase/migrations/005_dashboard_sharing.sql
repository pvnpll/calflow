-- Dashboard sharing: an owner publishes a link (token); anyone who opens it becomes a "friend" (viewer)
-- who can view the owner's Home dashboard read-only until the owner disables sharing or the viewer removes them.

CREATE TABLE IF NOT EXISTS cf_dashboard_shares (
    user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cf_friendships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    viewer_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE (viewer_id, owner_id),
    CHECK (viewer_id <> owner_id)
);

CREATE INDEX IF NOT EXISTS idx_cf_friendships_owner ON cf_friendships(owner_id);

DROP TRIGGER IF EXISTS trigger_cf_dashboard_shares_updated_at ON cf_dashboard_shares;
CREATE TRIGGER trigger_cf_dashboard_shares_updated_at
    BEFORE UPDATE ON cf_dashboard_shares
    FOR EACH ROW EXECUTE FUNCTION cf_update_updated_at_column();

-- RLS: the app reads/writes these with the service role (token lookups must never be exposed to clients),
-- so policies only let people see their own rows if they ever query directly.
ALTER TABLE cf_dashboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE cf_friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cf_dashboard_shares_select" ON cf_dashboard_shares;
CREATE POLICY "cf_dashboard_shares_select" ON cf_dashboard_shares FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cf_friendships_select" ON cf_friendships;
CREATE POLICY "cf_friendships_select" ON cf_friendships FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "cf_friendships_delete" ON cf_friendships;
CREATE POLICY "cf_friendships_delete" ON cf_friendships FOR DELETE USING (auth.uid() = viewer_id OR auth.uid() = owner_id);
