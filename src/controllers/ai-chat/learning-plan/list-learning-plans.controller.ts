import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../../types";
import { logger } from "../../../utils/logger";
import { LearningJourneyService } from "../../../services/ai/learning-journey.service";

/**
 * List user's learning plans
 */
export const listLearningPlans = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const learningJourneyService = new LearningJourneyService();
    const result = await learningJourneyService.getUserLearningPlans(
      userId,
      status as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Learning plans retrieved successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in listLearningPlans:", error);
    throw error;
  }
};
