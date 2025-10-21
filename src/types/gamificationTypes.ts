import { z } from "zod";

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export const ReadingAchievementSchema = z.object({
  id: z.string().uuid(),
  achievement_key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  icon: z.string().nullable(),
  points: z.number().int().min(0),
  tier: z.string().nullable(),
  unlock_criteria: z.record(z.string(), z.unknown()).nullable(), // JSONB
  is_active: z.boolean().nullable(),
  created_at: z.string().nullable(),
});

export type ReadingAchievement = z.infer<typeof ReadingAchievementSchema>;

export const UserAchievementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  plan_id: z.string().uuid().nullable(),
  unlocked_at: z.string().nullable(), // timestamptz
  created_at: z.string().nullable(),
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;

export const UserReadingStatsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  total_xp: z.number().int().min(0),
  current_level: z.number().int().positive(),
  xp_to_next_level: z.number().int().positive(),
  current_streak: z.number().int().min(0),
  longest_streak: z.number().int().min(0),
  total_reading_days: z.number().int().min(0),
  last_reading_date: z.string().nullable(), // date
  streak_freeze_available: z.boolean().nullable(),
  last_streak_freeze_used: z.string().nullable(), // date
  total_chapters_read: z.number().int().min(0),
  total_plans_completed: z.number().int().min(0),
  total_achievements_unlocked: z.number().int().min(0),
  weekly_goal: z.number().int().positive().nullable(),
  current_week_days: z.number().int().min(0).nullable(),
  week_start_date: z.string().nullable(), // date
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type UserReadingStats = z.infer<typeof UserReadingStatsSchema>;

export const UpdateUserReadingStatsSchema = UserReadingStatsSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type UpdateUserReadingStats = z.infer<
  typeof UpdateUserReadingStatsSchema
>;
