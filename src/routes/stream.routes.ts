import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authenticateUser } from "../middleware/auth";
import { generalRateLimit } from "../middleware/rate-limiter";
import { getStreamToken } from "../controllers/stream/get-stream-token.controller";
import { handleStreamWebhook } from "../controllers/stream/stream-webhook.controller";

const router = Router();

// ============================================================================
// STREAM CHAT ROUTES
// ============================================================================

/**
 * GET /api/stream/token
 * Get or create Stream Chat token for authenticated user
 *
 * Returns:
 * - token: JWT token for Stream Chat
 * - user: User data formatted for Stream
 * - isNewUser: Whether this is the first time syncing to Stream
 */
router.get(
  "/token",
  generalRateLimit,
  authenticateUser,
  asyncHandler(getStreamToken)
);

/**
 * POST /api/stream/webhook
 * Webhook endpoint for Stream Chat events
 *
 * Stream sends events here when:
 * - New messages are sent (message.new)
 * - Messages are updated (message.updated)
 * - Members are added (member.added)
 * etc.
 *
 * This endpoint creates notifications for users when they receive messages.
 *
 * Note: No authentication required - uses signature verification instead
 */
router.post("/webhook", asyncHandler(handleStreamWebhook));

export { router as streamRoutes };
