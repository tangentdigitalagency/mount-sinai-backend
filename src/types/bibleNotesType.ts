import { z } from "zod";

// ============================================================================
// BIBLE NOTES TYPES
// ============================================================================

export const BibleNoteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  content: z.record(z.string(), z.unknown()), // JSONB - TipTap editor content
  tags: z.array(z.string()),
  search_vector: z.unknown().nullable(), // tsvector
  created_at: z.string(),
  updated_at: z.string(),
});

export type BibleNote = z.infer<typeof BibleNoteSchema>;

export const CreateBibleNoteSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()).optional(),
});

export type CreateBibleNote = z.infer<typeof CreateBibleNoteSchema>;

export const UpdateBibleNoteSchema = CreateBibleNoteSchema.omit({
  user_id: true,
}).partial();

export type UpdateBibleNote = z.infer<typeof UpdateBibleNoteSchema>;

export const NoteVerseReferenceSchema = z.object({
  id: z.string().uuid(),
  note_id: z.string().uuid(),
  user_id: z.string().uuid(),
  book_id: z.string(),
  book_name: z.string(),
  chapter: z.number().int().positive(),
  verse_number: z.number().int().positive(),
  verse_text: z.string(),
  version_id: z.string(),
  version_abbreviation: z.string(),
  verse_id: z.string(),
  is_quoted: z.boolean().nullable(),
  created_at: z.string(),
});

export type NoteVerseReference = z.infer<typeof NoteVerseReferenceSchema>;

export const CreateNoteVerseReferenceSchema = NoteVerseReferenceSchema.omit({
  id: true,
  created_at: true,
});

export type CreateNoteVerseReference = z.infer<
  typeof CreateNoteVerseReferenceSchema
>;
