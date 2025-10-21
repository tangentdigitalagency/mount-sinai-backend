-- Migration: Create ai_chat_messages table
-- Description: Stores all messages within chat sessions

CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  formatted_content JSONB, -- Formatted version with markdown, links, etc.
  metadata JSONB, -- Verse references, sources cited, etc.
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_session ON ai_chat_messages(session_id, created_at ASC);

-- Add constraint for valid roles
ALTER TABLE ai_chat_messages 
ADD CONSTRAINT check_message_role 
CHECK (role IN ('user', 'assistant', 'system'));

-- Add constraint for positive token usage
ALTER TABLE ai_chat_messages 
ADD CONSTRAINT check_tokens_positive 
CHECK (tokens_used IS NULL OR tokens_used >= 0);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view and manage messages in their own sessions
CREATE POLICY "Authenticated users can manage messages in their own AI chat sessions"
ON ai_chat_messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_chat_sessions
    WHERE ai_chat_sessions.id = session_id AND ai_chat_sessions.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_chat_sessions
    WHERE ai_chat_sessions.id = session_id AND ai_chat_sessions.user_id = auth.uid()
  )
);
