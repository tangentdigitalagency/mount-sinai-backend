import { z } from "zod";

// ============================================================================
// VERSE INTERACTION TYPES
// ============================================================================

export const VerseBookmarkSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  book_id: z.string(),
  book_name: z.string(),
  chapter: z.number().int().positive(),
  verse_number: z.number().int().positive(),
  verse_text: z.string(),
  version_id: z.string(),
  version_abbreviation: z.string(),
  verse_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type VerseBookmark = z.infer<typeof VerseBookmarkSchema>;

export const CreateVerseBookmarkSchema = VerseBookmarkSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateVerseBookmark = z.infer<typeof CreateVerseBookmarkSchema>;

export const VerseLoveSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  book_id: z.string(),
  book_name: z.string(),
  chapter: z.number().int().positive(),
  verse_number: z.number().int().positive(),
  verse_text: z.string(),
  version_id: z.string(),
  version_abbreviation: z.string(),
  verse_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type VerseLove = z.infer<typeof VerseLoveSchema>;

export const CreateVerseLoveSchema = VerseLoveSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateVerseLove = z.infer<typeof CreateVerseLoveSchema>;

export const VerseHighlightSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  book_id: z.string(),
  chapter: z.number().int().positive(),
  verse_number: z.number().int().positive(),
  color: z.enum([
    "yellow",
    "green",
    "blue",
    "purple",
    "orange",
    "pink",
    "red",
    "teal",
  ]),
  category: z.string().nullable(),
  custom_category_name: z.string().nullable(),
  notes: z.string().nullable(),
  selected_text: z.string().nullable(),
  text_start_pos: z.number().int().min(0).nullable(),
  text_end_pos: z.number().int().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type VerseHighlight = z.infer<typeof VerseHighlightSchema>;

export const CreateVerseHighlightSchema = VerseHighlightSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateVerseHighlight = z.infer<typeof CreateVerseHighlightSchema>;

export const VerseCrossReferenceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  source_book_id: z.string(),
  source_chapter: z.number().int().positive(),
  source_verse: z.number().int().positive(),
  target_book_id: z.string(),
  target_chapter: z.number().int().positive(),
  target_verse: z.number().int().positive(),
  relationship_type: z
    .enum([
      "parallel",
      "fulfillment",
      "quotation",
      "contrast",
      "explanation",
      "example",
      "theme",
      "related",
      "custom",
    ])
    .nullable(),
  custom_label: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type VerseCrossReference = z.infer<typeof VerseCrossReferenceSchema>;

export const CreateVerseCrossReferenceSchema = VerseCrossReferenceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateVerseCrossReference = z.infer<
  typeof CreateVerseCrossReferenceSchema
>;
