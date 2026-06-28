-- ============================================================
-- Migration 014: Add is_read to daily_logs
-- ============================================================

ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
