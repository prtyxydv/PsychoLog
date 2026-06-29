-- ============================================================
-- Migration 016: Public Waitlist Table (no auth required)
-- ============================================================

CREATE TABLE IF NOT EXISTS public_waitlist (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT,
  requested_plan TEXT DEFAULT 'pro',
  note          TEXT,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public inserts (no auth needed)
ALTER TABLE public_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON public_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read (admins via Supabase dashboard / admin panel)
CREATE POLICY "Service role can read waitlist"
  ON public_waitlist
  FOR SELECT
  USING (false); -- blocked for regular users; use service role key for admin reads
