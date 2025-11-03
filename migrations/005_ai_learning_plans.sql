-- Migration: Create ai_learning_plans table
-- Description: Stores user study plans for AI-generated learning journeys

CREATE TABLE ai_learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  user_level VARCHAR(20) NOT NULL CHECK (user_level IN ('beginner', 'intermediate', 'advanced')),
  total_sessions INT NOT NULL DEFAULT 3,
  completed_sessions INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_learning_plans_user ON ai_learning_plans(user_id, status, created_at DESC);
CREATE INDEX idx_learning_plans_topic ON ai_learning_plans(topic);
CREATE INDEX idx_learning_plans_status ON ai_learning_plans(status);

-- Add constraint for valid session counts
ALTER TABLE ai_learning_plans 
ADD CONSTRAINT check_sessions_positive 
CHECK (total_sessions > 0 AND completed_sessions >= 0 AND completed_sessions <= total_sessions);

-- Add constraint for completion logic
ALTER TABLE ai_learning_plans 
ADD CONSTRAINT check_completion_logic 
CHECK (
  (status = 'completed' AND completed_at IS NOT NULL) OR 
  (status != 'completed' AND completed_at IS NULL)
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_learning_plans ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own learning plans
CREATE POLICY "Users can manage their own AI learning plans"
ON ai_learning_plans FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_learning_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_ai_learning_plans_updated_at
  BEFORE UPDATE ON ai_learning_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_learning_plans_updated_at();
