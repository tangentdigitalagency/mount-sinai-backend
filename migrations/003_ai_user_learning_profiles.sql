-- Migration: Create ai_user_learning_profiles table
-- Description: Tracks AI-learned insights about user preferences and beliefs

CREATE TABLE ai_user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'theological_preference', 'study_style', 'question_patterns', etc.
  insight_key VARCHAR(255) NOT NULL,
  insight_value TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  source VARCHAR(50) DEFAULT 'auto', -- 'auto' or 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, insight_key)
);

-- Indexes for performance
CREATE INDEX idx_learning_user ON ai_user_learning_profiles(user_id, category);

-- Add constraint for valid confidence score
ALTER TABLE ai_user_learning_profiles 
ADD CONSTRAINT check_confidence_score 
CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0);

-- Add constraint for valid source
ALTER TABLE ai_user_learning_profiles 
ADD CONSTRAINT check_source 
CHECK (source IN ('auto', 'manual'));

-- Enable Row Level Security (RLS)
ALTER TABLE ai_user_learning_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own learning profiles
CREATE POLICY "Authenticated users can manage their own AI learning profiles"
ON ai_user_learning_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
