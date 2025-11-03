-- ============================================================================
-- Migration 010: Add Service Role Policy to Users Table
-- ============================================================================
-- This allows the service role to bypass RLS on the users table
-- for backend operations like Stream Chat token generation
-- ============================================================================

-- Policy: Service role can manage all user records (for backend operations)
CREATE POLICY IF NOT EXISTS "Service role can manage all user records"
  ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can manage all user records" ON public.users IS 
  'Allows service role to bypass RLS for backend operations like Stream Chat token generation';

