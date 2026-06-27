-- ============================================================
-- Migration 003: Daily Logs (Clinical data — NO identity data)
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links to anonymized patient (NOT to therapist directly)
  patient_uuid        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Submission metadata
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  mood_score          INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),

  -- Raw fields — NEVER sent to Gemini or any external service
  event_raw           TEXT,
  feeling_raw         TEXT,

  -- Sanitized fields — ONLY these reach Gemini
  event_sanitized     TEXT,
  feeling_sanitized   TEXT,

  -- AI output
  ai_summary          TEXT,               -- Gemini output (markdown bullets)
  ai_generated_at     TIMESTAMPTZ,        -- When Gemini ran

  -- Therapist annotation (client-side encrypted before storage)
  therapist_notes     TEXT,               -- Ciphertext — only decryptable in browser
  notes_edited_at     TIMESTAMPTZ,        -- Last edit timestamp

  -- Crisis flag
  crisis_detected     BOOLEAN NOT NULL DEFAULT false,
  crisis_severity     TEXT CHECK (crisis_severity IN ('low', 'high', NULL)),

  -- 24h context flag
  has_prior_context   BOOLEAN NOT NULL DEFAULT false,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for patient timeline queries (newest first)
CREATE INDEX idx_daily_logs_patient_uuid ON daily_logs(patient_uuid, submitted_at DESC);
-- Index for crisis alerts dashboard
CREATE INDEX idx_daily_logs_crisis ON daily_logs(crisis_detected, submitted_at DESC) WHERE crisis_detected = true;
