-- ============================================================
-- Migration 008: Per-patient next session notes + appointment
-- ============================================================

CREATE TABLE IF NOT EXISTS patient_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Next appointment
  next_appointment  TIMESTAMPTZ,                  -- date/time of next session
  reminder_sent_at  TIMESTAMPTZ,                  -- when reminder email was dispatched

  -- Therapist prep notes for next session (NOT shown to patient)
  prep_notes        TEXT        NOT NULL DEFAULT '',

  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One active session plan per patient
  CONSTRAINT one_session_per_patient UNIQUE (patient_id)
);

CREATE TRIGGER patient_sessions_updated_at
  BEFORE UPDATE ON patient_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for the reminder cron job (find upcoming appointments)
CREATE INDEX IF NOT EXISTS idx_patient_sessions_appointment
  ON patient_sessions(next_appointment)
  WHERE next_appointment IS NOT NULL AND reminder_sent_at IS NULL;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE patient_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_sessions_select" ON patient_sessions
  FOR SELECT USING (therapist_id = auth.uid());

CREATE POLICY "patient_sessions_insert" ON patient_sessions
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "patient_sessions_update" ON patient_sessions
  FOR UPDATE USING (therapist_id = auth.uid());
