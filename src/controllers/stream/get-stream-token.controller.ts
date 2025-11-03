import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { StreamService } from "../../services/stream/stream.service";
import { logger } from "../../utils/logger";

/**
 * Get or create Stream Chat token for authenticated user
 * 
 * This endpoint:
 * 1. Checks if user has been synced to Stream (to avoid DAU issues)
 * 2. If not, syncs user to Stream and creates token
 * 3. If yes, generates a fresh token
 * 4. Returns token and user data for frontend to connect to Stream
 */
export const getStreamToken = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const streamService = new StreamService();

  try {
    const result = await streamService.getOrCreateStreamToken(userId);

    logger.info(
      `Stream token ${result.isNewUser ? "created" : "refreshed"} for user ${userId}`
    );

    const response: ApiSuccessResponse<{
      token: string;
      user: typeof result.user;
      isNewUser: boolean;
    }> = {
      success: true,
      data: {
        token: result.token,
        user: result.user,
        isNewUser: result.isNewUser,
      },
      message: result.isNewUser
        ? "Stream Chat token created successfully"
        : "Stream Chat token refreshed successfully",
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error("Error getting Stream token:", error);

    // If it's a Stream service error, return user-friendly message
    if (error instanceof Error && error.message.includes("unavailable")) {
      throw new AppError(
        503,
        "Stream Chat service is currently unavailable. Please try again later."
      );
    }

    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error;
    }

    // Generic error handling
    throw new AppError(500, "Failed to get Stream Chat token");
  }
};

