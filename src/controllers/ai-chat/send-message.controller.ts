import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { ChatService } from "../../services/ai/chat.service";
import { SendMessageSchema } from "../../types/ai-chat.types";

/**
 * Send a message to AI and get response
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = SendMessageSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { content } = validationResult.data;
  const supabase = getSupabaseClient();

  try {
    // Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .select("id, ai_version, is_active")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new AppError(404, "Chat session not found");
      }
      logger.error("Error verifying session:", sessionError);
      throw new AppError(500, "Failed to verify session");
    }

    if (!session.is_active) {
      throw new AppError(400, "Chat session is not active");
    }

    // Send message to AI
    const chatService = new ChatService();
    const result = await chatService.sendMessage(sessionId, content);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Message sent successfully",
    };

    logger.info(`User ${userId} sent message to session ${sessionId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    throw error;
  }
};
