-- ============================================================
-- Migration 005: Add folder_name to patients
-- ============================================================

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS folder_name TEXT NOT NULL DEFAULT 'General';

-- Index for folder-based queries per therapist
CREATE INDEX IF NOT EXISTS idx_patients_folder ON patients(therapist_id, folder_name);
