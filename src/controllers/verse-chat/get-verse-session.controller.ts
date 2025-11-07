import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { VerseChatService } from "../../services/ai/verse-chat.service";

/**
 * Get a specific verse chat session with verses and messages
 */
export const getVerseSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();
  const verseChatService = new VerseChatService();

  try {
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .eq("ai_version", "verse-chat")
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new AppError(404, "Verse chat session not found");
      }
      logger.error("Error fetching session:", sessionError);
      throw new AppError(500, "Failed to fetch session");
    }

    // Get verses
    const verses = await verseChatService.getSessionVerses(sessionId);

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      logger.error("Error fetching messages:", messagesError);
      throw new AppError(500, "Failed to fetch messages");
    }

    const response: ApiSuccessResponse<{
      session: typeof session;
      verses: typeof verses;
      messages: typeof messages;
    }> = {
      success: true,
      data: {
        session,
        verses,
        messages: messages || [],
      },
      message: "Verse chat session retrieved successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in getVerseSession:", error);
    throw error;
  }
};

