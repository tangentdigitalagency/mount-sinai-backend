import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Get all notes for the authenticated user with complete data
 */
export const getAllNotes = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  // Get all notes for the user
  const { data: notes, error: notesError } = await supabase
    .from("bible_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (notesError) {
    logger.error("Error fetching notes:", notesError);
    throw new AppError(500, "Failed to fetch notes");
  }

  // Get verse references for all notes
  const noteIds = notes?.map((note) => note.id) || [];

  let verseReferences = [];
  if (noteIds.length > 0) {
    const { data: verses, error: versesError } = await supabase
      .from("note_verse_references")
      .select("*")
      .in("note_id", noteIds);

    if (versesError) {
      logger.error("Error fetching verse references:", versesError);
      verseReferences = [];
    } else {
      verseReferences = verses || [];
    }
  }

  // Get tags for all notes
  let noteTags: any[] = [];
  if (noteIds.length > 0) {
    const { data: tags, error: tagsError } = await supabase
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
      .in("note_id", noteIds);

    if (tagsError) {
      logger.error("Error fetching note tags:", tagsError);
      noteTags = [];
    } else {
      noteTags = tags || [];
    }
  }

  // Combine notes with their verse references and tags
  const notesWithData =
    notes?.map((note) => {
      const noteVerses = verseReferences.filter(
        (v: any) => v.note_id === note.id
      );

      const noteTagData = noteTags
        .filter((nt: any) => nt.note_id === note.id)
        .map((nt: any) => nt.tag)
        .filter((tag: any) => tag !== null);

      return {
        ...note,
        verse_references: noteVerses,
        tags: noteTagData,
        verse_count: noteVerses.length,
        tag_count: noteTagData.length,
      };
    }) || [];

  const response: ApiSuccessResponse<typeof notesWithData> = {
    success: true,
    data: notesWithData,
    message: `Retrieved ${notesWithData.length} note${
      notesWithData.length !== 1 ? "s" : ""
    }`,
  };

  logger.info(`User ${userId} retrieved ${notesWithData.length} notes`);
  res.json(response);
};
