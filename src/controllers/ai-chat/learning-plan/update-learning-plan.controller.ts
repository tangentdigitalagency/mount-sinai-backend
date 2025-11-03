import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../../types";
import { logger } from "../../../utils/logger";
import { LearningJourneyService } from "../../../services/ai/learning-journey.service";
import { UpdateLearningPlanSchema } from "../../../types/ai-chat.types";

/**
 * Update a learning plan
 */
export const updateLearningPlan = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { id: planId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  if (!planId) {
    throw new AppError(400, "Plan ID is required");
  }

  // Validate request body
  const validationResult = UpdateLearningPlanSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const updates = validationResult.data;

  try {
    const learningJourneyService = new LearningJourneyService();
    const result = await learningJourneyService.updateLearningPlan(
      planId,
      userId,
      updates
    );

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Learning plan updated successfully",
    };

    logger.info(`User ${userId} updated learning plan: ${planId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in updateLearningPlan:", error);
    throw error;
  }
};
