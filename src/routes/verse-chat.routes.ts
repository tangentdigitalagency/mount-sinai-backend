import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authenticateUser } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  messageRateLimit,
  sessionRateLimit,
  generalRateLimit,
} from "../middleware/rate-limiter";

// Import controllers
import { createVerseSession } from "../controllers/verse-chat/create-verse-session.controller";
import { listVerseSessions } from "../controllers/verse-chat/list-verse-sessions.controller";
import { getVerseSession } from "../controllers/verse-chat/get-verse-session.controller";
import { addVerses } from "../controllers/verse-chat/add-verses.controller";
import { sendVerseMessage } from "../controllers/verse-chat/send-verse-message.controller";

// Import schemas
import {
  CreateVerseSessionSchema,
  AddVersesSchema,
  SendVerseMessageSchema,
} from "../types/ai-chat.types";

const router = Router();

// ============================================================================
// VERSE CHAT SESSION ROUTES
// ============================================================================

/**
 * POST /api/verse-chat/sessions
 * Create a new verse chat session
 */
router.post(
  "/sessions",
  sessionRateLimit,
  authenticateUser,
  validate(CreateVerseSessionSchema),
  asyncHandler(createVerseSession)
);

/**
 * GET /api/verse-chat/sessions
 * List user's verse chat sessions
 */
router.get(
  "/sessions",
  generalRateLimit,
  authenticateUser,
  asyncHandler(listVerseSessions)
);

/**
 * GET /api/verse-chat/sessions/:id
 * Get a specific verse chat session with verses and messages
 */
router.get(
  "/sessions/:id",
  generalRateLimit,
  authenticateUser,
  asyncHandler(getVerseSession)
);

/**
 * POST /api/verse-chat/sessions/:id/verses
 * Add verses to an existing verse chat session
 */
router.post(
  "/sessions/:id/verses",
  generalRateLimit,
  authenticateUser,
  validate(AddVersesSchema),
  asyncHandler(addVerses)
);

/**
 * POST /api/verse-chat/sessions/:id/messages
 * Send a message to verse chat AI and get response
 */
router.post(
  "/sessions/:id/messages",
  messageRateLimit,
  authenticateUser,
  validate(SendVerseMessageSchema),
  asyncHandler(sendVerseMessage)
);

export { router as verseChatRoutes };

