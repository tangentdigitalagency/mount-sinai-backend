import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Get a specific AI chat session with recent messages
 */
export const getSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new AppError(404, "Chat session not found");
      }
      logger.error("Error fetching chat session:", sessionError);
      throw new AppError(500, "Failed to fetch chat session");
    }

    // Get recent messages (last 50)
    const { data: messages, error: messagesError } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (messagesError) {
      logger.error("Error fetching session messages:", messagesError);
      // Continue without messages if there's an error
    }

    // Get context snapshots
    const { data: contextSnapshots, error: contextError } = await supabase
      .from("ai_chat_context_snapshots")
      .select("*")
      .eq("session_id", sessionId);

    if (contextError) {
      logger.error("Error fetching context snapshots:", contextError);
    }

    const sessionWithData = {
      ...session,
      messages: messages || [],
      context_snapshots: contextSnapshots || [],
      message_count: messages?.length || 0,
    };

    const response: ApiSuccessResponse<typeof sessionWithData> = {
      success: true,
      data: sessionWithData,
      message: "Chat session retrieved successfully",
    };

    logger.info(`User ${userId} retrieved chat session ${sessionId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in getSession:", error);
    throw error;
  }
};
