-- ============================================================================
-- Migration 011: Remove All RLS Restrictions
-- ============================================================================
-- This migration removes all RLS restrictions by adding permissive policies
-- that allow all authenticated users to perform all operations on all tables
-- ============================================================================

-- Users table - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all user records" ON public.users;
CREATE POLICY "Everyone can manage all user records"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- AI Chat Sessions - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all AI chat sessions" ON public.ai_chat_sessions;
CREATE POLICY "Everyone can manage all AI chat sessions"
  ON public.ai_chat_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- AI Chat Messages - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all AI chat messages" ON public.ai_chat_messages;
CREATE POLICY "Everyone can manage all AI chat messages"
  ON public.ai_chat_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- AI Chat Context Snapshots - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all AI chat context snapshots" ON public.ai_chat_context_snapshots;
CREATE POLICY "Everyone can manage all AI chat context snapshots"
  ON public.ai_chat_context_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- AI User Learning Profiles - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all AI user learning profiles" ON public.ai_user_learning_profiles;
CREATE POLICY "Everyone can manage all AI user learning profiles"
  ON public.ai_user_learning_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Bible Chapter Completions - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all bible chapter completions" ON public.bible_chapter_completions;
CREATE POLICY "Everyone can manage all bible chapter completions"
  ON public.bible_chapter_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Bible Notes - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all bible notes" ON public.bible_notes;
CREATE POLICY "Everyone can manage all bible notes"
  ON public.bible_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Bible Reading Progress - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all bible reading progress" ON public.bible_reading_progress;
CREATE POLICY "Everyone can manage all bible reading progress"
  ON public.bible_reading_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Bible Reading Settings - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all bible reading settings" ON public.bible_reading_settings;
CREATE POLICY "Everyone can manage all bible reading settings"
  ON public.bible_reading_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note Tags - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all note tags" ON public.note_tags;
CREATE POLICY "Everyone can manage all note tags"
  ON public.note_tags
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note Verse References - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all note verse references" ON public.note_verse_references;
CREATE POLICY "Everyone can manage all note verse references"
  ON public.note_verse_references
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reader Preferences - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all reader preferences" ON public.reader_preferences;
CREATE POLICY "Everyone can manage all reader preferences"
  ON public.reader_preferences
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reading Achievements - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all reading achievements" ON public.reading_achievements;
CREATE POLICY "Everyone can manage all reading achievements"
  ON public.reading_achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reading Plan Chapter Progress - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all reading plan chapter progress" ON public.reading_plan_chapter_progress;
CREATE POLICY "Everyone can manage all reading plan chapter progress"
  ON public.reading_plan_chapter_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reading Plan Daily Progress - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all reading plan daily progress" ON public.reading_plan_daily_progress;
CREATE POLICY "Everyone can manage all reading plan daily progress"
  ON public.reading_plan_daily_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reading Plan Templates - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all reading plan templates" ON public.reading_plan_templates;
CREATE POLICY "Everyone can manage all reading plan templates"
  ON public.reading_plan_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reading Plans - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all reading plans" ON public.reading_plans;
CREATE POLICY "Everyone can manage all reading plans"
  ON public.reading_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Stream User Tokens - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all stream user tokens" ON public.stream_user_tokens;
CREATE POLICY "Everyone can manage all stream user tokens"
  ON public.stream_user_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tags - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all tags" ON public.tags;
CREATE POLICY "Everyone can manage all tags"
  ON public.tags
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- User Achievements - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all user achievements" ON public.user_achievements;
CREATE POLICY "Everyone can manage all user achievements"
  ON public.user_achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- User Reading Plans - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all user reading plans" ON public.user_reading_plans;
CREATE POLICY "Everyone can manage all user reading plans"
  ON public.user_reading_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- User Reading Stats - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all user reading stats" ON public.user_reading_stats;
CREATE POLICY "Everyone can manage all user reading stats"
  ON public.user_reading_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verse Bookmarks - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all verse bookmarks" ON public.verse_bookmarks;
CREATE POLICY "Everyone can manage all verse bookmarks"
  ON public.verse_bookmarks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verse Cross References - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all verse cross references" ON public.verse_cross_references;
CREATE POLICY "Everyone can manage all verse cross references"
  ON public.verse_cross_references
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verse Highlights - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all verse highlights" ON public.verse_highlights;
CREATE POLICY "Everyone can manage all verse highlights"
  ON public.verse_highlights
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verse Loves - Allow all authenticated users to do everything
DROP POLICY IF EXISTS "Everyone can manage all verse loves" ON public.verse_loves;
CREATE POLICY "Everyone can manage all verse loves"
  ON public.verse_loves
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Everyone can manage all user records" ON public.users IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all AI chat sessions" ON public.ai_chat_sessions IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all AI chat messages" ON public.ai_chat_messages IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all AI chat context snapshots" ON public.ai_chat_context_snapshots IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all AI user learning profiles" ON public.ai_user_learning_profiles IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all bible chapter completions" ON public.bible_chapter_completions IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all bible notes" ON public.bible_notes IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all bible reading progress" ON public.bible_reading_progress IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all bible reading settings" ON public.bible_reading_settings IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all note tags" ON public.note_tags IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all note verse references" ON public.note_verse_references IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all reader preferences" ON public.reader_preferences IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all reading achievements" ON public.reading_achievements IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all reading plan chapter progress" ON public.reading_plan_chapter_progress IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all reading plan daily progress" ON public.reading_plan_daily_progress IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all reading plan templates" ON public.reading_plan_templates IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all reading plans" ON public.reading_plans IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all stream user tokens" ON public.stream_user_tokens IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all tags" ON public.tags IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all user achievements" ON public.user_achievements IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all user reading plans" ON public.user_reading_plans IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all user reading stats" ON public.user_reading_stats IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all verse bookmarks" ON public.verse_bookmarks IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all verse cross references" ON public.verse_cross_references IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all verse highlights" ON public.verse_highlights IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

COMMENT ON POLICY "Everyone can manage all verse loves" ON public.verse_loves IS 
  'Removes all RLS restrictions - all authenticated users can do everything';

