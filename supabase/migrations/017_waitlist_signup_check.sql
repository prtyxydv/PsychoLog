-- ============================================================
-- Migration 017: Enforce Waitlist Approval on User Signup
-- ============================================================

-- Update the handle_new_user trigger function to validate waitlist status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_allowed BOOLEAN;
BEGIN
  -- 1. Verify if email is the main admin email OR exists in the public_waitlist with status 'approved'
  SELECT EXISTS (
    SELECT 1 FROM public.public_waitlist
    WHERE LOWER(email) = LOWER(NEW.email) AND status = 'approved'
  ) OR LOWER(NEW.email) = 'pratyakshyadav888@gmail.com' INTO is_allowed;

  -- 2. Raise exception to abort the signup transaction if not approved
  IF NOT is_allowed THEN
    RAISE EXCEPTION 'Your email (%) is not approved on the waitlist yet. Please register your interest at /waitlist.', NEW.email;
  END IF;

  -- 3. Proceed with profile creation
  INSERT INTO public.profiles (id, email, full_name, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
