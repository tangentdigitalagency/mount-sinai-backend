import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { generalRateLimit } from "../middleware/rate-limiter";
import { testNotifications } from "../controllers/notifications/test-notifications.controller";

const router = Router();

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================

/**
 * POST /api/notifications/test/:userId
 * Create test notifications for all types and priorities
 * 
 * This endpoint creates notifications for:
 * - All notification types (info, success, warning, error, achievement, system, social, reading, chat)
 * - All priority levels (low, normal, high, urgent)
 * - Additional test scenarios
 * 
 * Note: No authentication required for testing purposes
 * User ID: cc4f7fcb-c92d-4bfd-a69e-30bb87923898
 */
router.post(
  "/test/:userId",
  generalRateLimit,
  asyncHandler(testNotifications)
);

export { router as notificationRoutes };

