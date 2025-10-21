import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Get message history for a chat session
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    // Verify session belongs to user
    const { error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (sessionError) {
      if (sessionError.code === "PGRST116") {
        throw new AppError(404, "Chat session not found");
      }
      logger.error("Error verifying session ownership:", sessionError);
      throw new AppError(500, "Failed to verify session ownership");
    }

    // Parse query parameters
    const { limit = 50, offset = 0, role } = req.query;

    // Build query
    let query = supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .range(offset as number, (offset as number) + (limit as number) - 1);

    // Apply role filter if provided
    if (role) {
      query = query.eq("role", role);
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      logger.error("Error fetching messages:", messagesError);
      throw new AppError(500, "Failed to fetch messages");
    }

    // Get total count for pagination
    const { count } = await supabase
      .from("ai_chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    const response: ApiSuccessResponse<{
      messages: typeof messages;
      pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
      };
    }> = {
      success: true,
      data: {
        messages: messages || [],
        pagination: {
          total: count || 0,
          limit: limit as number,
          offset: offset as number,
          has_more: (count || 0) > (offset as number) + (limit as number),
        },
      },
      message: `Retrieved ${messages?.length || 0} messages`,
    };

    logger.info(
      `User ${userId} retrieved ${
        messages?.length || 0
      } messages from session ${sessionId}`
    );
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in getMessages:", error);
    throw error;
  }
};
