import { z } from "zod";

// ============================================================================
// READER PREFERENCES TYPES
// ============================================================================

export const ReaderPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  font_family: z.enum(["system", "serif", "sans-serif", "mono"]).nullable(),
  font_size: z.enum(["small", "medium", "large", "xl", "xxl"]).nullable(),
  line_height: z.enum(["tight", "normal", "relaxed", "loose"]).nullable(),
  color_theme: z.enum(["light", "dark", "sepia", "system"]).nullable(),
  column_width: z.enum(["narrow", "default", "wide", "full"]).nullable(),
  show_verse_numbers: z.boolean().nullable(),
  paragraph_mode: z.boolean().nullable(),
  red_letter_edition: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type ReaderPreferences = z.infer<typeof ReaderPreferencesSchema>;

export const UpdateReaderPreferencesSchema = ReaderPreferencesSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type UpdateReaderPreferences = z.infer<
  typeof UpdateReaderPreferencesSchema
>;
