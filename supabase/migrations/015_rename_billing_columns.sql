-- ============================================================
-- Migration 015: Rename Stripe columns to generic billing
-- ============================================================

ALTER TABLE profiles
  RENAME COLUMN stripe_customer_id TO billing_customer_id;

ALTER TABLE profiles
  RENAME COLUMN stripe_subscription_id TO billing_subscription_id;

-- Drop the old stripe index if it exists
DROP INDEX IF EXISTS idx_profiles_stripe_customer;

-- Create the new generic billing index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_billing_customer
  ON profiles(billing_customer_id)
  WHERE billing_customer_id IS NOT NULL;

COMMENT ON COLUMN profiles.subscription_status IS
  'Mirrors the Billing subscription status (e.g., Lemon Squeezy). free = no active subscription.';
