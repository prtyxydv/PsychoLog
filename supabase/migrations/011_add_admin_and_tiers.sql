-- ============================================================
-- Migration 011: Admin Flag and Subscription Tiers
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free'
    CHECK (plan_type IN ('free', 'basic', 'pro', 'elite'));

COMMENT ON COLUMN profiles.is_admin IS 'Flag to allow access to the master admin dashboard.';
COMMENT ON COLUMN profiles.plan_type IS 'The active subscription tier dictating patient limits and features.';

-- Note: We DO NOT add admin RLS policies here to avoid infinite recursion.
-- The admin dashboard will use the Supabase Service Role key (createAdminClient) 
-- to bypass RLS and securely fetch/update all profiles.
