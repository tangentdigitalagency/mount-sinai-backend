/**
 * Query Parameter Types for API Endpoints
 *
 * Specific query parameter schemas for different endpoints
 */

import { z } from "zod";
import { PaginationParamsSchema } from "./api.types";

// ============================================================================
// USER QUERY PARAMS
// ============================================================================

export const GetUserProfileParamsSchema = z.object({
  include_stats: z.enum(["true", "false"]).default("false"),
  include_achievements: z.enum(["true", "false"]).default("false"),
});

export type GetUserProfileParams = z.infer<typeof GetUserProfileParamsSchema>;

// ============================================================================
// BIBLE READING QUERY PARAMS
// ============================================================================

export const GetReadingProgressParamsSchema = z.object({
  user_id: z.string().uuid(),
});

export type GetReadingProgressParams = z.infer<
  typeof GetReadingProgressParamsSchema
>;

export const GetChapterQuerySchema = z.object({
  book_id: z.string(),
  chapter: z.coerce.number().int().positive(),
  version_id: z.string().optional(),
  include_highlights: z.enum(["true", "false"]).default("false"),
  include_notes: z.enum(["true", "false"]).default("false"),
  include_bookmarks: z.enum(["true", "false"]).default("false"),
});

export type GetChapterQuery = z.infer<typeof GetChapterQuerySchema>;

// ============================================================================
// NOTES QUERY PARAMS
// ============================================================================

export const GetNotesQuerySchema = PaginationParamsSchema.extend({
  tag_id: z.string().uuid().optional(),
  search: z.string().optional(),
  book_id: z.string().optional(),
  chapter: z.coerce.number().int().positive().optional(),
  created_after: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  created_before: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type GetNotesQuery = z.infer<typeof GetNotesQuerySchema>;

export const SearchNotesQuerySchema = z.object({
  q: z.string().min(1).max(255),
  limit: z.coerce.number().int().positive().max(50).default(20),
  include_verse_refs: z.enum(["true", "false"]).default("true"),
  include_tags: z.enum(["true", "false"]).default("true"),
});

export type SearchNotesQuery = z.infer<typeof SearchNotesQuerySchema>;

// ============================================================================
// HIGHLIGHTS QUERY PARAMS
// ============================================================================

export const GetHighlightsQuerySchema = PaginationParamsSchema.extend({
  book_id: z.string().optional(),
  chapter: z.coerce.number().int().positive().optional(),
  color: z
    .enum([
      "yellow",
      "green",
      "blue",
      "purple",
      "orange",
      "pink",
      "red",
      "teal",
    ])
    .optional(),
  category: z.string().optional(),
});

export type GetHighlightsQuery = z.infer<typeof GetHighlightsQuerySchema>;

// ============================================================================
// BOOKMARKS QUERY PARAMS
// ============================================================================

export const GetBookmarksQuerySchema = PaginationParamsSchema.extend({
  book_id: z.string().optional(),
  version_id: z.string().optional(),
  created_after: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type GetBookmarksQuery = z.infer<typeof GetBookmarksQuerySchema>;

// ============================================================================
// READING PLAN QUERY PARAMS
// ============================================================================

export const GetReadingPlansQuerySchema = z.object({
  is_active: z.enum(["true", "false", "all"]).default("all"),
  is_completed: z.enum(["true", "false", "all"]).default("all"),
  plan_type: z.string().optional(),
});

export type GetReadingPlansQuery = z.infer<typeof GetReadingPlansQuerySchema>;

export const GetPlanProgressQuerySchema = z.object({
  plan_id: z.string().uuid(),
  include_daily: z.enum(["true", "false"]).default("true"),
  include_chapters: z.enum(["true", "false"]).default("false"),
});

export type GetPlanProgressQuery = z.infer<typeof GetPlanProgressQuerySchema>;

// ============================================================================
// ACHIEVEMENTS QUERY PARAMS
// ============================================================================

export const GetAchievementsQuerySchema = z.object({
  category: z.string().optional(),
  unlocked_only: z.enum(["true", "false"]).default("false"),
  tier: z.string().optional(),
});

export type GetAchievementsQuery = z.infer<typeof GetAchievementsQuerySchema>;

// ============================================================================
// STATISTICS QUERY PARAMS
// ============================================================================

export const GetReadingStatsQuerySchema = z.object({
  user_id: z.string().uuid(),
  include_achievements: z.enum(["true", "false"]).default("false"),
  include_streak_history: z.enum(["true", "false"]).default("false"),
});

export type GetReadingStatsQuery = z.infer<typeof GetReadingStatsQuerySchema>;

export const GetReadingHistoryQuerySchema = PaginationParamsSchema.extend({
  user_id: z.string().uuid(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  source_type: z.enum(["free", "plan", "all"]).default("all"),
});

export type GetReadingHistoryQuery = z.infer<
  typeof GetReadingHistoryQuerySchema
>;

// ============================================================================
// TAG QUERY PARAMS
// ============================================================================

export const GetTagsQuerySchema = z.object({
  include_count: z.enum(["true", "false"]).default("false"),
  sort_by: z.enum(["name", "created_at", "usage_count"]).default("created_at"),
});

export type GetTagsQuery = z.infer<typeof GetTagsQuerySchema>;
