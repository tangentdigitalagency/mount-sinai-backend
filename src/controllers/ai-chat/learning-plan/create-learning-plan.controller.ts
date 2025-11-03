import type { Response } from "express";
import type { AuthRequest } from "../../../middleware/auth";
import { AppError } from "../../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../../types";
import { logger } from "../../../utils/logger";
import { LearningJourneyService } from "../../../services/ai/learning-journey.service";
import { ContextBuilderService } from "../../../services/ai/context-builder.service";
import { CreateLearningPlanSchema } from "../../../types/ai-chat.types";

/**
 * Create a new AI learning plan
 */
export const createLearningPlan = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = CreateLearningPlanSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { topic, user_level, total_sessions } = validationResult.data;

  try {
    // Get user context for personalization
    const contextBuilder = new ContextBuilderService();
    const userContext = await contextBuilder.getUserContext(userId);

    // Create learning plan
    const learningJourneyService = new LearningJourneyService();
    const result = await learningJourneyService.createPersonalizedStudyPlan(
      userId,
      topic,
      user_level || "beginner",
      userContext,
      total_sessions || 3
    );

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: "Learning plan created successfully",
    };

    logger.info(`User ${userId} created learning plan for topic: ${topic}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error("Error in createLearningPlan:", error);
    throw error;
  }
};
