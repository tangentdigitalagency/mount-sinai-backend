import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../../types";
import { logger } from "../../../utils/logger";
import { LearningJourneyService } from "../../../services/ai/learning-journey.service";

/**
 * Get a specific learning plan with sessions
 */
export const getLearningPlan = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: planId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  if (!planId) {
    throw new AppError(400, "Plan ID is required");
  }

  try {
    const learningJourneyService = new LearningJourneyService();
    const result = await learningJourneyService.getLearningPlan(planId, userId);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Learning plan retrieved successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in getLearningPlan:", error);
    throw error;
  }
};
