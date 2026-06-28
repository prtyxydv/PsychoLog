-- ============================================================
-- Migration 007: Stripe subscription fields on profiles
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status  TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('free', 'trialing', 'active', 'past_due', 'canceled')),
  ADD COLUMN IF NOT EXISTS trial_ends_at           TIMESTAMPTZ;

-- Unique constraint so we can look up by Stripe customer ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- ── RLS note ─────────────────────────────────────────────────
-- Profiles already have RLS from migration 004. The new columns
-- are governed by the same policies — each therapist can only
-- read/update their own profile row.

COMMENT ON COLUMN profiles.verification_status IS
  'Manual or automated check that the account belongs to a licensed therapist.';
COMMENT ON COLUMN profiles.subscription_status IS
  'Mirrors the Stripe subscription status. free = no Stripe sub yet.';
