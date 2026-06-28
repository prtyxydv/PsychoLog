-- ============================================================
-- Migration 010: Drop invite_email to ensure zero PII retention
-- ============================================================

ALTER TABLE patients
DROP COLUMN IF EXISTS invite_email;
