-- Migration: Create ai_user_progress table
-- Description: Overall progress tracking for AI learning activities

CREATE TABLE ai_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL,
  metric_value JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_progress_user ON ai_user_progress(user_id, metric_type, recorded_at DESC);
CREATE INDEX idx_user_progress_type ON ai_user_progress(metric_type);
CREATE INDEX idx_user_progress_recorded ON ai_user_progress(recorded_at DESC);

-- Add constraint for valid metric types
ALTER TABLE ai_user_progress 
ADD CONSTRAINT check_metric_type_valid 
CHECK (metric_type IN (
  'knowledge_growth', 
  'application_growth', 
  'engagement_score',
  'ai_chat_streak',
  'learning_plans_completed',
  'sessions_completed',
  'topics_mastered',
  'questions_asked',
  'insights_gained'
));

-- Enable Row Level Security (RLS)
ALTER TABLE ai_user_progress ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own progress
CREATE POLICY "Users can manage their own AI progress"
ON ai_user_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to get latest progress for a metric type
CREATE OR REPLACE FUNCTION get_latest_progress(
  p_user_id UUID,
  p_metric_type VARCHAR(100)
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT metric_value INTO result
  FROM ai_user_progress
  WHERE user_id = p_user_id 
    AND metric_type = p_metric_type
  ORDER BY recorded_at DESC
  LIMIT 1;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create function to update or insert progress
CREATE OR REPLACE FUNCTION upsert_progress(
  p_user_id UUID,
  p_metric_type VARCHAR(100),
  p_metric_value JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_user_progress (user_id, metric_type, metric_value)
  VALUES (p_user_id, p_metric_type, p_metric_value)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
