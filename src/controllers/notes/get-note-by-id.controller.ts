import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Get a specific note by ID with complete data
 */
export const getNoteById = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: noteId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  // Get the note
  const { data: note, error: noteError } = await supabase
    .from("bible_notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", userId)
    .single();

  if (noteError || !note) {
    logger.warn(`Note ${noteId} not found for user ${userId}`);
    throw new AppError(404, "Note not found");
  }

  // Get verse references
  const { data: verseReferences, error: versesError } = await supabase
    .from("note_verse_references")
    .select("*")
    .eq("note_id", noteId);

  if (versesError) {
    logger.error("Error fetching verse references:", versesError);
  }

  // Get tags
  const { data: noteTags, error: tagsError } = await supabase
    .from("note_tags")
    .select(
      `
      note_id,
      tag:tags (
        id,
        name,
        color
      )
    `
    )
    .eq("note_id", noteId);

  if (tagsError) {
    logger.error("Error fetching tags:", tagsError);
  }

  const tags =
    noteTags?.map((nt: any) => nt.tag).filter((tag: any) => tag !== null) || [];

  const noteWithData = {
    ...note,
    verse_references: verseReferences || [],
    tags,
    verse_count: verseReferences?.length || 0,
    tag_count: tags.length,
  };

  const response: ApiSuccessResponse<typeof noteWithData> = {
    success: true,
    data: noteWithData,
  };

  // Detailed logging of the response data
  console.log("\n========================================");
  console.log("📝 GET NOTE BY ID API RESPONSE");
  console.log("========================================");
  console.log("Note ID:", noteId);
  console.log("\nFull Response Data:");
  console.log(JSON.stringify(response, null, 2));
  console.log("========================================\n");

  res.json(response);
};
