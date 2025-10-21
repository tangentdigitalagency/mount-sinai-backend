import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Delete an AI chat session
 */
export const deleteSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    // Check if session exists and belongs to user
    const { error: checkError } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new AppError(404, "Chat session not found");
      }
      logger.error("Error checking session ownership:", checkError);
      throw new AppError(500, "Failed to verify session ownership");
    }

    // Delete session (messages and context snapshots will be deleted by CASCADE)
    const { error: deleteError } = await supabase
      .from("ai_chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (deleteError) {
      logger.error("Error deleting chat session:", deleteError);
      throw new AppError(500, "Failed to delete chat session");
    }

    const response: ApiSuccessResponse<null> = {
      success: true,
      data: null,
      message: "Chat session deleted successfully",
    };

    logger.info(`User ${userId} deleted chat session ${sessionId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in deleteSession:", error);
    throw error;
  }
};
