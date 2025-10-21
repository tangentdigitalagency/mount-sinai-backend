-- Migration: Create ai_chat_context_snapshots table
-- Description: Stores snapshots of user context (notes, bookmarks, highlights) at chat creation

CREATE TABLE ai_chat_context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  context_type VARCHAR(50) NOT NULL, -- 'notes', 'highlights', 'bookmarks', 'reading_progress'
  context_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_context_session ON ai_chat_context_snapshots(session_id, context_type);

-- Add constraint for valid context types
ALTER TABLE ai_chat_context_snapshots 
ADD CONSTRAINT check_context_type 
CHECK (context_type IN ('notes', 'highlights', 'bookmarks', 'reading_progress', 'verse_interactions'));

-- Enable Row Level Security (RLS)
ALTER TABLE ai_chat_context_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view context snapshots for their own sessions
CREATE POLICY "Authenticated users can view context snapshots for their own AI chat sessions"
ON ai_chat_context_snapshots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_chat_sessions
    WHERE ai_chat_sessions.id = session_id AND ai_chat_sessions.user_id = auth.uid()
  )
);
