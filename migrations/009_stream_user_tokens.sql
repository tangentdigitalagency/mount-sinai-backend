-- ============================================================================
-- Migration 009: Stream User Tokens
-- ============================================================================
-- This migration creates a table to track Stream Chat token issuance
-- to prevent duplicate user creation in Stream and avoid DAU limit issues
-- ============================================================================

CREATE TABLE IF NOT EXISTS stream_user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_user_id TEXT NOT NULL, -- Stream user ID (same as our user ID)
  token_issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_token_refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_stream_user_tokens_user_id ON stream_user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_user_tokens_stream_user_id ON stream_user_tokens(stream_user_id);

-- Enable RLS
ALTER TABLE stream_user_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own Stream token records
CREATE POLICY "Users can view their own Stream token records"
  ON stream_user_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can manage all records (for backend operations)
CREATE POLICY "Service role can manage all Stream token records"
  ON stream_user_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE stream_user_tokens IS 'Tracks Stream Chat token issuance to prevent duplicate user creation';
COMMENT ON COLUMN stream_user_tokens.stream_user_id IS 'Stream user ID (typically same as auth.users.id)';
COMMENT ON COLUMN stream_user_tokens.token_issued_at IS 'When the user was first synced to Stream';
COMMENT ON COLUMN stream_user_tokens.last_token_refreshed_at IS 'Last time a token was generated for this user';

