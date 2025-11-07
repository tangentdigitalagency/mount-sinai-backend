-- Migration: Create verse_chat_verses table and update ai_chat_sessions constraint
-- Description: Adds support for verse-based chat sessions where users can ask questions about specific Bible verses

-- ============================================================================
-- 1. Create verse_chat_verses table
-- ============================================================================

CREATE TABLE verse_chat_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
  version VARCHAR(20) NOT NULL, -- e.g., "NKJV", "ESV"
  book_id VARCHAR(10) NOT NULL, -- e.g., "JHN"
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_verse_chat_verses_session ON verse_chat_verses(session_id, created_at DESC);
CREATE INDEX idx_verse_chat_verses_message ON verse_chat_verses(message_id);
CREATE INDEX idx_verse_chat_verses_reference ON verse_chat_verses(book_id, chapter, verse);

-- Constraints
ALTER TABLE verse_chat_verses 
ADD CONSTRAINT check_chapter_positive CHECK (chapter > 0);

ALTER TABLE verse_chat_verses 
ADD CONSTRAINT check_verse_positive CHECK (verse > 0);

-- Enable Row Level Security (RLS)
ALTER TABLE verse_chat_verses ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view and manage verses in their own sessions
CREATE POLICY "Authenticated users can manage verses in their own verse chat sessions"
ON verse_chat_verses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_chat_sessions
    WHERE ai_chat_sessions.id = session_id 
    AND ai_chat_sessions.user_id = auth.uid()
    AND ai_chat_sessions.ai_version = 'verse-chat'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_chat_sessions
    WHERE ai_chat_sessions.id = session_id 
    AND ai_chat_sessions.user_id = auth.uid()
    AND ai_chat_sessions.ai_version = 'verse-chat'
  )
);

-- ============================================================================
-- 2. Update ai_chat_sessions constraint to include 'verse-chat'
-- ============================================================================

-- Drop the existing constraint
ALTER TABLE ai_chat_sessions 
DROP CONSTRAINT check_ai_version;

-- Add the updated constraint with 'verse-chat' included
ALTER TABLE ai_chat_sessions 
ADD CONSTRAINT check_ai_version 
CHECK (ai_version IN ('study', 'debate', 'note-taker', 'explainer', 'custom', 'verse-chat'));

