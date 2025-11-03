import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authenticateUser } from "../middleware/auth";
import { generalRateLimit } from "../middleware/rate-limiter";
import { getStreamToken } from "../controllers/stream/get-stream-token.controller";

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

export { router as streamRoutes };

