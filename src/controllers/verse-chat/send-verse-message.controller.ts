import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { VerseChatService } from "../../services/ai/verse-chat.service";
import { SendVerseMessageSchema } from "../../types/ai-chat.types";

/**
 * Send a message to verse chat AI and get response
 */
export const sendVerseMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = SendVerseMessageSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { content, verses } = validationResult.data;

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

    // Send message to AI (will add verses if provided)
    const result = await verseChatService.sendMessage(
      sessionId,
      content,
      verses
    );

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Message sent successfully",
    };

    logger.info(`User ${userId} sent message to verse chat session ${sessionId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in sendVerseMessage:", error);
    throw error;
  }
};

