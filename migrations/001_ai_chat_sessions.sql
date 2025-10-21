-- Migration: Create ai_chat_sessions table
-- Description: Stores individual chat sessions that users manually create

CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_version VARCHAR(50) NOT NULL, -- 'study', 'debate', 'note-taker', 'explainer', etc.
  title VARCHAR(255) NOT NULL,
  context_book_id VARCHAR(10), -- Optional: which book they were reading
  context_chapter INTEGER,
  context_version_id VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_sessions_user ON ai_chat_sessions(user_id, last_message_at DESC);
CREATE INDEX idx_chat_sessions_version ON ai_chat_sessions(ai_version);

-- Add constraint for valid AI versions
ALTER TABLE ai_chat_sessions 
ADD CONSTRAINT check_ai_version 
CHECK (ai_version IN ('study', 'debate', 'note-taker', 'explainer', 'custom'));

-- Add constraint for valid chapter numbers
ALTER TABLE ai_chat_sessions 
ADD CONSTRAINT check_chapter_positive 
CHECK (context_chapter IS NULL OR context_chapter > 0);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view and manage their own sessions
CREATE POLICY "Authenticated users can manage their own AI chat sessions"
ON ai_chat_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
