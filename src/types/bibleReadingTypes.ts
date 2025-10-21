import { z } from "zod";

// ============================================================================
// BIBLE READING PROGRESS TYPES
// ============================================================================

export const BibleReadingProgressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  language: z.string(),
  version_id: z.string(),
  version_abbreviation: z.string(),
  book_id: z.string(),
  book_name: z.string(),
  current_chapter: z.number().int().positive(),
  current_verse: z.number().int().positive(),
  total_chapters: z.number().int().positive(),
  chapters_completed: z.number().int().min(0),
  book_progress_percentage: z.number().min(0).max(100).nullable(),
  last_read_at: z.string().nullable(), // timestamptz
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type BibleReadingProgress = z.infer<typeof BibleReadingProgressSchema>;

export const UpdateBibleReadingProgressSchema = BibleReadingProgressSchema.omit(
  {
    id: true,
    user_id: true,
    created_at: true,
  }
).partial();

export type UpdateBibleReadingProgress = z.infer<
  typeof UpdateBibleReadingProgressSchema
>;
