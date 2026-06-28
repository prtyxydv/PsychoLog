-- ============================================================
-- Migration 012: Waitlist Table
-- ============================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  requested_plan TEXT DEFAULT 'pro',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own waitlist requests" 
  ON waitlist
  FOR INSERT 
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view their own waitlist requests" 
  ON waitlist
  FOR SELECT 
  USING (auth.uid() = profile_id);

-- Admins can view/update waitlist requests via Service Role key, so no admin RLS needed here.
