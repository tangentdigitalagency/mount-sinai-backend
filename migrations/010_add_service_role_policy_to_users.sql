-- ============================================================================
-- Migration 010: Add Service Role Policy to Users Table and RPC Function
-- ============================================================================
-- This allows the service role to bypass RLS on the users table
-- for backend operations like Stream Chat token generation
-- ============================================================================

-- Policy: Service role can manage all user records (for backend operations)
-- Drop policy if it exists first, then create it
DROP POLICY IF EXISTS "Service role can manage all user records" ON public.users;

CREATE POLICY "Service role can manage all user records"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can manage all user records" ON public.users IS 
  'Allows service role to bypass RLS for backend operations like Stream Chat token generation';

-- RPC Function: Get user by ID (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  username VARCHAR,
  gender TEXT,
  birth_date DATE,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  state VARCHAR,
  zipcode VARCHAR,
  profile_picture_url TEXT,
  avatar_type VARCHAR,
  avatar_config JSONB,
  onboarding_completed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.username,
    u.gender,
    u.birth_date,
    u.address1,
    u.address2,
    u.city,
    u.state,
    u.zipcode,
    u.profile_picture_url,
    u.avatar_type,
    u.avatar_config,
    u.onboarding_completed,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = user_id;
END;
$$;

COMMENT ON FUNCTION get_user_by_id IS 
  'Get user by ID, bypasses RLS using SECURITY DEFINER for backend operations';

