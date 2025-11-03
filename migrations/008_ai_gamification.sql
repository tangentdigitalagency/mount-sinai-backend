-- Migration: Add AI learning achievements and goals
-- Description: Extends existing gamification system for AI learning features

-- Add AI learning achievements to existing reading_achievements table
INSERT INTO reading_achievements (achievement_key, name, description, category, icon, points, tier, unlock_criteria) VALUES
('ai_first_plan', 'Learning Journey Starter', 'Created your first AI learning plan', 'ai_learning', '🎓', 50, 'bronze', '{"type": "learning_plans_created", "count": 1}'),
('ai_complete_plan', 'Knowledge Seeker', 'Completed your first learning plan', 'ai_learning', '📚', 100, 'silver', '{"type": "learning_plans_completed", "count": 1}'),
('ai_chat_streak_7', 'Consistent Learner', '7-day AI chat streak', 'ai_engagement', '🔥', 75, 'bronze', '{"type": "ai_chat_streak", "days": 7}'),
('ai_chat_streak_30', 'Dedicated Scholar', '30-day AI chat streak', 'ai_engagement', '🔥', 200, 'gold', '{"type": "ai_chat_streak", "days": 30}'),
('ai_deep_dive', 'Deep Thinker', 'Completed 5 advanced learning sessions', 'ai_learning', '🧠', 150, 'gold', '{"type": "advanced_sessions_completed", "count": 5}'),
('ai_topic_master', 'Topic Master', 'Mastered 3 different topics', 'ai_learning', '🏆', 300, 'platinum', '{"type": "topics_mastered", "count": 3}'),
('ai_question_king', 'Question King', 'Asked 100 insightful questions', 'ai_engagement', '❓', 100, 'silver', '{"type": "questions_asked", "count": 100}'),
('ai_insight_hunter', 'Insight Hunter', 'Gained 50 key insights', 'ai_learning', '💡', 150, 'gold', '{"type": "insights_gained", "count": 50}');

-- Create AI user goals table
CREATE TABLE ai_user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily_chat', 'weekly_sessions', 'monthly_plans', 'topic_mastery', 'custom')),
  goal_target JSONB NOT NULL, -- {"sessions": 3, "period": "week"}
  current_progress JSONB NOT NULL DEFAULT '{}', -- {"sessions": 1}
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
  start_date DATE NOT NULL,
  end_date DATE,
  completed_at TIMESTAMPTZ,
  reward_xp INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for AI goals
CREATE INDEX idx_ai_goals_user ON ai_user_goals(user_id, status, start_date DESC);
CREATE INDEX idx_ai_goals_type ON ai_user_goals(goal_type);
CREATE INDEX idx_ai_goals_status ON ai_user_goals(status);

-- Enable RLS for AI goals
ALTER TABLE ai_user_goals ENABLE ROW LEVEL SECURITY;

-- Policy for AI goals
CREATE POLICY "Users can manage their own AI goals"
ON ai_user_goals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to update AI goals progress
CREATE OR REPLACE FUNCTION update_ai_goal_progress(
  p_user_id UUID,
  p_goal_type VARCHAR(50),
  p_activity_type VARCHAR(50),
  p_increment INT DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  -- Update progress for matching goals
  UPDATE ai_user_goals 
  SET current_progress = jsonb_set(
    current_progress, 
    '{' || p_activity_type || '}', 
    to_jsonb((current_progress->>p_activity_type)::int + p_increment)
  ),
  updated_at = NOW()
  WHERE user_id = p_user_id 
    AND goal_type = p_goal_type 
    AND status = 'active';
    
  -- Check for completed goals
  UPDATE ai_user_goals 
  SET status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
  WHERE user_id = p_user_id 
    AND status = 'active'
    AND current_progress >= goal_target;
END;
$$ LANGUAGE plpgsql;

-- Create function to award XP for AI activities
CREATE OR REPLACE FUNCTION award_ai_xp(
  p_user_id UUID,
  p_activity_type VARCHAR(50),
  p_xp_amount INT
)
RETURNS VOID AS $$
BEGIN
  -- Update user reading stats with XP
  UPDATE user_reading_stats 
  SET total_xp = total_xp + p_xp_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Check for level up (simplified - you may want to implement more sophisticated leveling)
  -- This is a placeholder - you can implement more complex leveling logic
  
  -- Update AI goals progress
  PERFORM update_ai_goal_progress(p_user_id, 'daily_chat', p_activity_type, 1);
  
  -- Record the activity in progress tracking
  INSERT INTO ai_user_progress (user_id, metric_type, metric_value)
  VALUES (p_user_id, 'ai_activity', jsonb_build_object(
    'activity_type', p_activity_type,
    'xp_earned', p_xp_amount,
    'timestamp', NOW()
  ));
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on AI goals
CREATE OR REPLACE FUNCTION update_ai_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_goals_updated_at
  BEFORE UPDATE ON ai_user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_goals_updated_at();
