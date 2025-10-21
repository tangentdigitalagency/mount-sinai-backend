import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authenticateUser } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  messageRateLimit,
  sessionRateLimit,
  learningProfileRateLimit,
  generalRateLimit,
} from "../middleware/rate-limiter";
// import type { AuthRequest } from "../middleware/auth";

// Import controllers
import { createSession } from "../controllers/ai-chat/create-session.controller";
import { listSessions } from "../controllers/ai-chat/list-sessions.controller";
import { getSession } from "../controllers/ai-chat/get-session.controller";
import { updateSession } from "../controllers/ai-chat/update-session.controller";
import { deleteSession } from "../controllers/ai-chat/delete-session.controller";
import { sendMessage } from "../controllers/ai-chat/send-message.controller";
import { getMessages } from "../controllers/ai-chat/get-messages.controller";
import {
  getLearningProfile,
  updateLearningProfile,
  deleteLearningProfile,
} from "../controllers/ai-chat/learning-profile.controller";

// Import schemas
import {
  CreateChatSessionSchema,
  UpdateChatSessionSchema,
  SendMessageSchema,
  UpdateLearningProfileSchema,
} from "../types/ai-chat.types";

const router = Router();

// ============================================================================
// CHAT SESSION ROUTES
// ============================================================================

/**
 * POST /api/ai-chat/sessions
 * Create a new AI chat session
 */
router.post(
  "/sessions",
  sessionRateLimit,
  authenticateUser,
  validate(CreateChatSessionSchema),
  asyncHandler(createSession)
);

/**
 * GET /api/ai-chat/sessions
 * List user's AI chat sessions
 */
router.get(
  "/sessions",
  generalRateLimit,
  authenticateUser,
  asyncHandler(listSessions)
);

/**
 * GET /api/ai-chat/sessions/:id
 * Get a specific AI chat session with recent messages
 */
router.get(
  "/sessions/:id",
  generalRateLimit,
  authenticateUser,
  asyncHandler(getSession)
);

/**
 * PATCH /api/ai-chat/sessions/:id
 * Update an AI chat session (title, is_active)
 */
router.patch(
  "/sessions/:id",
  generalRateLimit,
  authenticateUser,
  validate(UpdateChatSessionSchema),
  asyncHandler(updateSession)
);

/**
 * DELETE /api/ai-chat/sessions/:id
 * Delete an AI chat session
 */
router.delete(
  "/sessions/:id",
  generalRateLimit,
  authenticateUser,
  asyncHandler(deleteSession)
);

// ============================================================================
// CHAT MESSAGE ROUTES
// ============================================================================

/**
 * POST /api/ai-chat/sessions/:id/messages
 * Send a message to AI and get response
 */
router.post(
  "/sessions/:id/messages",
  messageRateLimit,
  authenticateUser,
  validate(SendMessageSchema),
  asyncHandler(sendMessage)
);

/**
 * GET /api/ai-chat/sessions/:id/messages
 * Get message history for a chat session
 */
router.get(
  "/sessions/:id/messages",
  generalRateLimit,
  authenticateUser,
  asyncHandler(getMessages)
);

// ============================================================================
// LEARNING PROFILE ROUTES
// ============================================================================

/**
 * GET /api/ai-chat/learning-profile
 * Get user's AI learning profile
 */
router.get(
  "/learning-profile",
  generalRateLimit,
  authenticateUser,
  asyncHandler(getLearningProfile)
);

/**
 * PUT /api/ai-chat/learning-profile/:id
 * Update a specific learning profile insight
 */
router.put(
  "/learning-profile/:id",
  learningProfileRateLimit,
  authenticateUser,
  validate(UpdateLearningProfileSchema),
  asyncHandler(updateLearningProfile)
);

/**
 * DELETE /api/ai-chat/learning-profile/:id
 * Delete a learning profile insight
 */
router.delete(
  "/learning-profile/:id",
  learningProfileRateLimit,
  authenticateUser,
  asyncHandler(deleteLearningProfile)
);

export { router as aiChatRoutes };
