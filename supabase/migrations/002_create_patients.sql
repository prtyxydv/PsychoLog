-- ============================================================
-- Migration 002: Patients (Anonymized Mapping — NO clinical data)
-- ============================================================

CREATE TABLE IF NOT EXISTS patients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Anonymized alias — never a real name
  display_alias    TEXT NOT NULL,         -- e.g. "Patient-Alpha-7"

  -- Invite system
  invite_email     TEXT NOT NULL,         -- where the invite was sent (PII — in this table only)
  invite_token     TEXT UNIQUE NOT NULL,  -- token embedded in the patient's log link
  invite_expires   TIMESTAMPTZ NOT NULL,  -- end of therapy / link expiry

  -- PIN (hashed) — set by patient on first visit
  pin_hash         TEXT,                  -- bcrypt hash; NULL until patient sets PIN

  -- Status
  is_active        BOOLEAN NOT NULL DEFAULT true,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast token lookups (patient log page)
CREATE INDEX idx_patients_invite_token ON patients(invite_token);
-- Index for therapist roster queries
CREATE INDEX idx_patients_therapist_id ON patients(therapist_id);
