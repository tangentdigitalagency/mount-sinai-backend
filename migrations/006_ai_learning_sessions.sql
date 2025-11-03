-- Migration: Create ai_learning_sessions table
-- Description: Individual sessions within a learning plan

CREATE TABLE ai_learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_plan_id UUID NOT NULL REFERENCES ai_learning_plans(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  objectives TEXT[] DEFAULT '{}',
  content_outline JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  chat_session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learning_plan_id, session_number)
);

-- Indexes for performance
CREATE INDEX idx_learning_sessions_plan ON ai_learning_sessions(learning_plan_id, session_number);
CREATE INDEX idx_learning_sessions_completed ON ai_learning_sessions(is_completed);
CREATE INDEX idx_learning_sessions_chat ON ai_learning_sessions(chat_session_id);

-- Add constraint for valid session numbers
ALTER TABLE ai_learning_sessions 
ADD CONSTRAINT check_session_number_positive 
CHECK (session_number > 0);

-- Add constraint for completion logic
ALTER TABLE ai_learning_sessions 
ADD CONSTRAINT check_session_completion_logic 
CHECK (
  (is_completed = true AND completed_at IS NOT NULL) OR 
  (is_completed = false AND completed_at IS NULL)
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_learning_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view sessions for their plans
CREATE POLICY "Users can view sessions for their plans"
ON ai_learning_sessions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM ai_learning_plans
  WHERE ai_learning_plans.id = ai_learning_sessions.learning_plan_id
  AND ai_learning_plans.user_id = auth.uid()
));

-- Policy for users to manage sessions for their plans
CREATE POLICY "Users can manage sessions for their plans"
ON ai_learning_sessions FOR INSERT, UPDATE, DELETE
USING (EXISTS (
  SELECT 1 FROM ai_learning_plans
  WHERE ai_learning_plans.id = ai_learning_sessions.learning_plan_id
  AND ai_learning_plans.user_id = auth.uid()
));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_learning_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_ai_learning_sessions_updated_at
  BEFORE UPDATE ON ai_learning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_learning_sessions_updated_at();

-- Create function to update plan progress when session is completed
CREATE OR REPLACE FUNCTION update_plan_progress_on_session_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if session is being marked as completed
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    -- Update the plan's completed_sessions count
    UPDATE ai_learning_plans 
    SET completed_sessions = completed_sessions + 1,
        updated_at = NOW()
    WHERE id = NEW.learning_plan_id;
    
    -- Check if plan is now complete
    UPDATE ai_learning_plans 
    SET status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.learning_plan_id 
    AND completed_sessions >= total_sessions
    AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update plan progress
CREATE TRIGGER trigger_update_plan_progress
  AFTER UPDATE ON ai_learning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_progress_on_session_completion();
