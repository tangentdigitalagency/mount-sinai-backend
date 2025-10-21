import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { UpdateLearningProfileSchema } from "../../types/ai-chat.types";

/**
 * Get user's AI learning profile
 */
export const getLearningProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    const { data: profile, error } = await supabase
      .from("ai_user_learning_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("confidence_score", { ascending: false });

    if (error) {
      logger.error("Error fetching learning profile:", error);
      throw new AppError(500, "Failed to fetch learning profile");
    }

    // Group insights by category
    const groupedProfile = (profile || []).reduce((acc, insight) => {
      if (!acc[insight.category]) {
        acc[insight.category] = [];
      }
      acc[insight.category].push(insight);
      return acc;
    }, {} as Record<string, any[]>);

    const response: ApiSuccessResponse<typeof groupedProfile> = {
      success: true,
      data: groupedProfile,
      message: "Learning profile retrieved successfully",
    };

    logger.info(
      `User ${userId} retrieved learning profile with ${
        profile?.length || 0
      } insights`
    );
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in getLearningProfile:", error);
    throw error;
  }
};

/**
 * Update a specific learning profile insight
 */
export const updateLearningProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { id: insightId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = UpdateLearningProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { insight_value, confidence_score, source } = validationResult.data;
  const supabase = getSupabaseClient();

  try {
    // Check if insight exists and belongs to user
    const { error: checkError } = await supabase
      .from("ai_user_learning_profiles")
      .select("id")
      .eq("id", insightId)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new AppError(404, "Learning insight not found");
      }
      logger.error("Error checking insight ownership:", checkError);
      throw new AppError(500, "Failed to verify insight ownership");
    }

    // Update insight
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (insight_value !== undefined) {
      updateData.insight_value = insight_value;
    }

    if (confidence_score !== undefined) {
      updateData.confidence_score = confidence_score;
    }

    if (source !== undefined) {
      updateData.source = source;
    }

    const { data: insight, error: updateError } = await supabase
      .from("ai_user_learning_profiles")
      .update(updateData)
      .eq("id", insightId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      logger.error("Error updating learning insight:", updateError);
      throw new AppError(500, "Failed to update learning insight");
    }

    const response: ApiSuccessResponse<typeof insight> = {
      success: true,
      data: insight,
      message: "Learning insight updated successfully",
    };

    logger.info(`User ${userId} updated learning insight ${insightId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in updateLearningProfile:", error);
    throw error;
  }
};

/**
 * Delete a learning profile insight
 */
export const deleteLearningProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { id: insightId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const supabase = getSupabaseClient();

  try {
    // Check if insight exists and belongs to user
    const { error: checkError } = await supabase
      .from("ai_user_learning_profiles")
      .select("id")
      .eq("id", insightId)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new AppError(404, "Learning insight not found");
      }
      logger.error("Error checking insight ownership:", checkError);
      throw new AppError(500, "Failed to verify insight ownership");
    }

    // Delete insight
    const { error: deleteError } = await supabase
      .from("ai_user_learning_profiles")
      .delete()
      .eq("id", insightId)
      .eq("user_id", userId);

    if (deleteError) {
      logger.error("Error deleting learning insight:", deleteError);
      throw new AppError(500, "Failed to delete learning insight");
    }

    const response: ApiSuccessResponse<null> = {
      success: true,
      data: null,
      message: "Learning insight deleted successfully",
    };

    logger.info(`User ${userId} deleted learning insight ${insightId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in deleteLearningProfile:", error);
    throw error;
  }
};
