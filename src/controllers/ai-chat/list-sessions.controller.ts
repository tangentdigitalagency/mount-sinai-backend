import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * List user's AI chat sessions
 */
export const listSessions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    // Parse query parameters
    const { ai_version, is_active, limit = 20, offset = 0 } = req.query;

    // Build query
    let query = supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })
      .range(offset as number, (offset as number) + (limit as number) - 1);

    // Apply filters
    if (ai_version) {
      query = query.eq("ai_version", ai_version);
    }

    if (is_active !== undefined) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data: sessions, error } = await query;

    if (error) {
      logger.error("Error fetching chat sessions:", error);
      throw new AppError(500, "Failed to fetch chat sessions");
    }

    // Get message counts for each session
    const sessionsWithCounts = await Promise.all(
      (sessions || []).map(async (session) => {
        const { count } = await supabase
          .from("ai_chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id);

        return {
          ...session,
          message_count: count || 0,
        };
      })
    );

    const response: ApiSuccessResponse<typeof sessionsWithCounts> = {
      success: true,
      data: sessionsWithCounts,
      message: `Retrieved ${sessionsWithCounts.length} chat sessions`,
    };

    logger.info(
      `User ${userId} retrieved ${sessionsWithCounts.length} chat sessions`
    );
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in listSessions:", error);
    throw error;
  }
};
