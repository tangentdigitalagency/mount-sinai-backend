-- ============================================================================
-- Migration 012: Create Notifications Table
-- ============================================================================
-- This migration creates a notifications table for user notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Optional link to navigate when notification is clicked
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ, -- When the notification was marked as read
  type VARCHAR(50), -- Optional: 'info', 'success', 'warning', 'error', 'achievement', etc.
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  icon VARCHAR(50), -- Optional icon name or emoji
  metadata JSONB, -- Optional flexible data for additional context
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type) WHERE type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Add constraint for valid notification types
ALTER TABLE notifications 
ADD CONSTRAINT check_notification_type 
CHECK (type IS NULL OR type IN ('info', 'success', 'warning', 'error', 'achievement', 'system', 'social', 'reading', 'chat'));

-- Add constraint for valid priority levels
ALTER TABLE notifications 
ADD CONSTRAINT check_notification_priority 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add constraint: read_at must be set when is_read is true
ALTER TABLE notifications 
ADD CONSTRAINT check_read_at_when_read 
CHECK (is_read = false OR read_at IS NOT NULL);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view and manage their own notifications
CREATE POLICY "Authenticated users can manage their own notifications"
  ON notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Function to automatically set read_at when is_read becomes true
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false AND NEW.read_at IS NULL THEN
    NEW.read_at = NOW();
  END IF;
  IF NEW.is_read = false THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set read_at timestamp
CREATE TRIGGER set_notification_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_read_at();

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications with title, message, link, and read status';
COMMENT ON COLUMN notifications.user_id IS 'The user this notification is associated with';
COMMENT ON COLUMN notifications.title IS 'Short title/heading for the notification';
COMMENT ON COLUMN notifications.message IS 'Full notification message content';
COMMENT ON COLUMN notifications.link IS 'Optional link to navigate when notification is clicked';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';
COMMENT ON COLUMN notifications.type IS 'Notification type/category for filtering';
COMMENT ON COLUMN notifications.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN notifications.icon IS 'Optional icon name or emoji for visual indication';
COMMENT ON COLUMN notifications.metadata IS 'Flexible JSONB data for additional context';

