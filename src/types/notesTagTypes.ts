import { z } from "zod";

// ============================================================================
// TAG TYPES
// ============================================================================

export const TagSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Tag = z.infer<typeof TagSchema>;

export const CreateTagSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
});

export type CreateTag = z.infer<typeof CreateTagSchema>;

export const NoteTagSchema = z.object({
  id: z.string().uuid(),
  note_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
});

export type NoteTag = z.infer<typeof NoteTagSchema>;
