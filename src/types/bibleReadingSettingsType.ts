import { z } from "zod";

// ============================================================================
// BIBLE READING SETTINGS TYPES
// ============================================================================

export const BibleReadingSettingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  preferred_language: z.string(),
  preferred_version_id: z.string(),
  preferred_version_abbreviation: z.string(),
  auto_play_audio: z.boolean().nullable(),
  audio_speed: z.number().positive().nullable(),
  font_size: z.enum(["small", "medium", "large"]).nullable(),
  reading_mode: z.enum(["light", "dark"]).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type BibleReadingSettings = z.infer<typeof BibleReadingSettingsSchema>;

export const UpdateBibleReadingSettingsSchema = BibleReadingSettingsSchema.omit(
  {
    id: true,
    user_id: true,
    created_at: true,
    updated_at: true,
  }
).partial();

export type UpdateBibleReadingSettings = z.infer<
  typeof UpdateBibleReadingSettingsSchema
>;
