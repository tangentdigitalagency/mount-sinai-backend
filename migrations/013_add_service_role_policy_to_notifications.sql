-- ============================================================================
-- Migration 013: Add Service Role Policy to Notifications
-- ============================================================================
-- This allows the service role to bypass RLS on the notifications table
-- for backend operations like webhooks that create notifications
-- 
-- NOTE: This policy already exists in migration 012, but this migration
-- ensures it's properly configured if migration 012 was run without it.
-- ============================================================================

-- Policy: Service role can manage all notifications (for backend operations like webhooks)
-- Drop and recreate to ensure it's properly configured
DROP POLICY IF EXISTS "Service role can manage all notifications" ON notifications;

CREATE POLICY "Service role can manage all notifications"
  ON notifications
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can manage all notifications" ON notifications IS 
  'Allows service role to bypass RLS for backend operations like webhook notifications';

