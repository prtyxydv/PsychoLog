-- ============================================================
-- Migration 013: Drop Raw Data Columns
-- ============================================================

-- Security/Privacy Enforcement:
-- The platform is strictly designed to ONLY store sanitized data.
-- We are permanently dropping the raw text columns from the daily_logs
-- table so that PHI (Protected Health Information) is never saved
-- to disk. Any existing raw data will be destroyed.

ALTER TABLE daily_logs 
  DROP COLUMN IF EXISTS event_raw,
  DROP COLUMN IF EXISTS feeling_raw;
