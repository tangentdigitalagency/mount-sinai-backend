-- ============================================================================
-- Migration 014: Create RPC Functions for Notifications
-- ============================================================================
-- This creates RPC functions with SECURITY DEFINER to bypass RLS
-- for backend operations like webhooks that create notifications
-- ============================================================================

-- RPC Function: Create notification (bypasses RLS using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_type VARCHAR(50) DEFAULT 'info',
  p_priority VARCHAR(20) DEFAULT 'normal',
  p_icon VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title VARCHAR(255),
  message TEXT,
  link TEXT,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  type VARCHAR(50),
  priority VARCHAR(20),
  icon VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_notification notifications%ROWTYPE;
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    message,
    link,
    type,
    priority,
    icon,
    metadata
  )
  VALUES (
    p_user_id,
    p_title,
    p_message,
    p_link,
    p_type,
    p_priority,
    p_icon,
    p_metadata
  )
  RETURNING * INTO new_notification;

  RETURN QUERY
  SELECT 
    new_notification.id,
    new_notification.user_id,
    new_notification.title,
    new_notification.message,
    new_notification.link,
    new_notification.is_read,
    new_notification.read_at,
    new_notification.type,
    new_notification.priority,
    new_notification.icon,
    new_notification.metadata,
    new_notification.created_at,
    new_notification.updated_at;
END;
$$;

COMMENT ON FUNCTION create_notification IS 
  'Creates a notification for a user, bypassing RLS using SECURITY DEFINER. Used by backend services like webhooks.';

