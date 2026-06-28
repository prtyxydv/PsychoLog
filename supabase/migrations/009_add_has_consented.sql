-- ============================================================
-- Migration 009: Add has_consented to patients table
-- ============================================================

ALTER TABLE patients
ADD COLUMN IF NOT EXISTS has_consented BOOLEAN NOT NULL DEFAULT false;
