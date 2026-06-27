-- ============================================================
-- Migration 004: Row-Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs  ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ─────────────────────────────────────────────────
-- Therapists can only read/update their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ── PATIENTS ─────────────────────────────────────────────────
-- Therapists can only see their own patients
CREATE POLICY "patients_select_own"
  ON patients FOR SELECT
  USING (therapist_id = auth.uid());

-- Therapists can insert patients for themselves only
CREATE POLICY "patients_insert_own"
  ON patients FOR INSERT
  WITH CHECK (therapist_id = auth.uid());

-- Therapists can update their own patients (e.g. deactivate)
CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE
  USING (therapist_id = auth.uid());

-- Therapists can delete their own patients
CREATE POLICY "patients_delete_own"
  ON patients FOR DELETE
  USING (therapist_id = auth.uid());

-- ── DAILY LOGS ───────────────────────────────────────────────
-- Therapists can only see logs for their own patients
CREATE POLICY "daily_logs_select_own"
  ON daily_logs FOR SELECT
  USING (
    patient_uuid IN (
      SELECT id FROM patients WHERE therapist_id = auth.uid()
    )
  );

-- Therapists can update notes on their own patients' logs
CREATE POLICY "daily_logs_update_notes"
  ON daily_logs FOR UPDATE
  USING (
    patient_uuid IN (
      SELECT id FROM patients WHERE therapist_id = auth.uid()
    )
  );

-- ── SERVICE ROLE BYPASS (for API route handlers) ─────────────
-- The service role key bypasses RLS by default in Supabase.
-- Patient log submissions use the service role (no auth session).
-- All other public access is denied by the above policies.
