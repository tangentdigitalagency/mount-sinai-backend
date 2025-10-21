import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { UpdateChatSessionSchema } from "../../types/ai-chat.types";

/**
 * Update an AI chat session
 */
export const updateSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = UpdateChatSessionSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { title, is_active } = validationResult.data;
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

    // Update session
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { data: session, error: updateError } = await supabase
      .from("ai_chat_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      logger.error("Error updating chat session:", updateError);
      throw new AppError(500, "Failed to update chat session");
    }

    const response: ApiSuccessResponse<typeof session> = {
      success: true,
      data: session,
      message: "Chat session updated successfully",
    };

    logger.info(`User ${userId} updated chat session ${sessionId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in updateSession:", error);
    throw error;
  }
};
