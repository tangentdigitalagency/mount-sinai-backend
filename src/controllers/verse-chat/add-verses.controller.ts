import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { VerseChatService } from "../../services/ai/verse-chat.service";
import { AddVersesSchema } from "../../types/ai-chat.types";

/**
 * Add verses to an existing verse chat session
 */
export const addVerses = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = AddVersesSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { verses } = validationResult.data;

  const supabase = getSupabaseClient();
  const verseChatService = new VerseChatService();

  try {
    // Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .select("id, ai_version, is_active")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("ai_version", "verse-chat")
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new AppError(404, "Verse chat session not found");
      }
      logger.error("Error verifying session:", sessionError);
      throw new AppError(500, "Failed to verify session");
    }

    if (!session.is_active) {
      throw new AppError(400, "Verse chat session is not active");
    }

    // Add verses to session
    const addedVerses = await verseChatService.addVersesToSession(
      sessionId,
      verses
    );

    const response: ApiSuccessResponse<typeof addedVerses> = {
      success: true,
      data: addedVerses,
      message: "Verses added to session successfully",
    };

    logger.info(
      `User ${userId} added ${verses.length} verse(s) to session ${sessionId}`
    );
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in addVerses:", error);
    throw error;
  }
};

