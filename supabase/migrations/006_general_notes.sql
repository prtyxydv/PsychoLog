-- ============================================================
-- Migration 006: General Therapist Notes (not patient-linked)
-- ============================================================

CREATE TABLE IF NOT EXISTS therapist_general_notes (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id  UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT    NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One note doc per therapist
  CONSTRAINT one_note_per_therapist UNIQUE (therapist_id)
);

CREATE TRIGGER therapist_notes_updated_at
  BEFORE UPDATE ON therapist_general_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE therapist_general_notes ENABLE ROW LEVEL SECURITY;

-- Therapist can only read their own note
CREATE POLICY "therapist_general_notes_select" ON therapist_general_notes
  FOR SELECT USING (therapist_id = auth.uid());

-- Therapist can only insert their own note
CREATE POLICY "therapist_general_notes_insert" ON therapist_general_notes
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

-- Therapist can only update their own note
CREATE POLICY "therapist_general_notes_update" ON therapist_general_notes
  FOR UPDATE USING (therapist_id = auth.uid());
