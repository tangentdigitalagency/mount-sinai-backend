import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../../types";
import { logger } from "../../../utils/logger";
import { LearningJourneyService } from "../../../services/ai/learning-journey.service";
import { UpdateLearningSessionSchema } from "../../../types/ai-chat.types";

/**
 * Complete a learning session
 */
export const completeSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { sessionId } = req.params;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  if (!sessionId) {
    throw new AppError(400, "Session ID is required");
  }

  // Validate request body
  const validationResult = UpdateLearningSessionSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const updates = validationResult.data;

  try {
    const learningJourneyService = new LearningJourneyService();
    const result = await learningJourneyService.completeSession(
      sessionId,
      userId,
      updates
    );

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Session updated successfully",
    };

    logger.info(`User ${userId} completed session: ${sessionId}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error("Error in completeSession:", error);
    throw error;
  }
};
