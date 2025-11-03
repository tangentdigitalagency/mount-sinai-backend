import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../../types";
import { logger } from "../../../utils/logger";
import { LearningJourneyService } from "../../../services/ai/learning-journey.service";

/**
 * Delete a learning plan
 */
export const deleteLearningPlan = async (req: AuthRequest, res: Response) => {
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
    await learningJourneyService.deleteLearningPlan(planId, userId);

    const response: ApiSuccessResponse<null> = {
      success: true,
      data: null,
      message: "Learning plan deleted successfully",
    };

    logger.info(`User ${userId} deleted learning plan: ${planId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in deleteLearningPlan:", error);
    throw error;
  }
};
