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

-- RPC Function: Create stream token record (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION create_stream_token_record(
  p_user_id UUID,
  p_stream_user_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO stream_user_tokens (
    user_id,
    stream_user_id,
    token_issued_at,
    last_token_refreshed_at,
    is_active
  )
  VALUES (
    p_user_id,
    p_stream_user_id,
    NOW(),
    NOW(),
    true
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION create_stream_token_record IS 
  'Create stream token record, bypasses RLS using SECURITY DEFINER for backend operations';

-- RPC Function: Update stream token record (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION update_stream_token_record(
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE stream_user_tokens
  SET 
    last_token_refreshed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION update_stream_token_record IS 
  'Update stream token record refresh timestamp, bypasses RLS using SECURITY DEFINER for backend operations';

-- RPC Function: Get stream token record (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_stream_token_record(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  stream_user_id TEXT,
  token_issued_at TIMESTAMPTZ,
  last_token_refreshed_at TIMESTAMPTZ,
  is_active BOOLEAN,
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
    t.id,
    t.user_id,
    t.stream_user_id,
    t.token_issued_at,
    t.last_token_refreshed_at,
    t.is_active,
    t.created_at,
    t.updated_at
  FROM stream_user_tokens t
  WHERE t.user_id = p_user_id
    AND t.is_active = true;
END;
$$;

COMMENT ON FUNCTION get_stream_token_record IS 
  'Get stream token record by user_id, bypasses RLS using SECURITY DEFINER for backend operations';

