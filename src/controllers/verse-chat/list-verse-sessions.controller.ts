import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";

/**
 * List user's verse chat sessions
 */
export const listVerseSessions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    // Get query parameters
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const isActive = req.query.is_active;

    // Build query
    let query = supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("ai_version", "verse-chat")
      .order("last_message_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by active status if provided
    if (isActive !== undefined) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data: sessions, error } = await query;

    if (error) {
      logger.error("Error fetching verse chat sessions:", error);
      throw new AppError(500, "Failed to fetch verse chat sessions");
    }

    const response: ApiSuccessResponse<typeof sessions> = {
      success: true,
      data: sessions || [],
      message: "Verse chat sessions retrieved successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in listVerseSessions:", error);
    throw error;
  }
};

