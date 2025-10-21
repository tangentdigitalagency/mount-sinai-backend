import { z } from "zod";

// ============================================================================
// READING PLAN TYPES
// ============================================================================

export const UserReadingPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  enabled: z.boolean(),
  plan_duration: z.number().int().positive(),
  sections: z.string(), // e.g., "OT+NT"
  start_date: z.string(), // date
  user_age: z.number().int().positive().nullable(),
  daily_reminder: z.boolean(),
  reminder_time: z.string().nullable(), // time
  current_day: z.number().int().positive(),
  completed_days: z.number().int().min(0),
  is_completed: z.boolean(),
  last_read_date: z.string().nullable(), // date
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type UserReadingPlan = z.infer<typeof UserReadingPlanSchema>;

export const CreateUserReadingPlanSchema = z.object({
  user_id: z.string().uuid(),
  enabled: z.boolean().default(false),
  plan_duration: z.number().int().positive().default(365),
  sections: z.string().default("OT+NT"),
  start_date: z.string(), // Client should send local date YYYY-MM-DD
  user_age: z.number().int().positive().nullable().optional(),
  daily_reminder: z.boolean().default(true),
  reminder_time: z.string().nullable().optional(),
});

export type CreateUserReadingPlan = z.infer<typeof CreateUserReadingPlanSchema>;

export const UpdateUserReadingPlanSchema = CreateUserReadingPlanSchema.omit({
  user_id: true,
}).partial();

export type UpdateUserReadingPlan = z.infer<typeof UpdateUserReadingPlanSchema>;

export const ReadingPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan_name: z.string(),
  plan_type: z.string(),
  plan_duration: z.number().int().positive(),
  sections: z.string().nullable(),
  topic: z.string().nullable(),
  start_date: z.string(), // date
  end_date: z.string(), // date
  reader_age: z.number().int().nullable(),
  plan_data: z.record(z.string(), z.unknown()), // JSONB
  current_day: z.number().int().positive(),
  total_chapters: z.number().int().positive(),
  chapters_completed: z.number().int().min(0),
  days_completed: z.number().int().min(0),
  completion_percentage: z.number().min(0).max(100).nullable(),
  is_active: z.boolean(),
  is_completed: z.boolean(),
  daily_reminder: z.boolean(),
  reminder_time: z.string().nullable(), // time
  skip_weekends: z.boolean().nullable(),
  last_read_date: z.string().nullable(), // date
  completed_at: z.string().nullable(), // timestamptz
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type ReadingPlan = z.infer<typeof ReadingPlanSchema>;

export const ReadingPlanDailyProgressSchema = z.object({
  id: z.string().uuid(),
  plan_id: z.string().uuid(),
  day_number: z.number().int().positive(),
  scheduled_date: z.string(), // date
  total_chapters_for_day: z.number().int().positive(),
  chapters_completed_for_day: z.number().int().min(0),
  is_day_completed: z.boolean().nullable(),
  started_at: z.string().nullable(), // timestamptz
  completed_at: z.string().nullable(), // timestamptz
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type ReadingPlanDailyProgress = z.infer<
  typeof ReadingPlanDailyProgressSchema
>;

export const ReadingPlanChapterProgressSchema = z.object({
  id: z.string().uuid(),
  plan_id: z.string().uuid(),
  daily_progress_id: z.string().uuid(),
  day_number: z.number().int().positive(),
  book_name: z.string(),
  chapter_number: z.number().int().positive(),
  reading_order: z.number().int().positive(),
  is_completed: z.boolean().nullable(),
  completed_at: z.string().nullable(), // timestamptz
  created_at: z.string().nullable(),
});

export type ReadingPlanChapterProgress = z.infer<
  typeof ReadingPlanChapterProgressSchema
>;

export const ReadingPlanTemplateSchema = z.object({
  id: z.string().uuid(),
  template_name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  duration_days: z.number().int().positive(),
  sections: z.string().nullable(),
  topic: z.string().nullable(),
  plan_type: z.string(),
  is_active: z.boolean().nullable(),
  created_at: z.string().nullable(),
});

export type ReadingPlanTemplate = z.infer<typeof ReadingPlanTemplateSchema>;

export const BibleChapterCompletionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  book_id: z.string(),
  book_name: z.string(),
  chapter_number: z.number().int().positive(),
  source_type: z.enum(["free", "plan"]),
  plan_id: z.string().uuid().nullable(),
  version_abbreviation: z.string().nullable(),
  reading_time_seconds: z.number().int().min(0).nullable(),
  completed_at: z.string().nullable(), // timestamptz
  completed_date: z.string(), // date - user's local date
});

export type BibleChapterCompletion = z.infer<
  typeof BibleChapterCompletionSchema
>;

export const CreateBibleChapterCompletionSchema =
  BibleChapterCompletionSchema.omit({
    id: true,
    completed_at: true,
  });

export type CreateBibleChapterCompletion = z.infer<
  typeof CreateBibleChapterCompletionSchema
>;
