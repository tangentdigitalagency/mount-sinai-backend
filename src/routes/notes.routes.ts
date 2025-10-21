import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { authenticateUser } from "../middleware/auth";
import { getAllNotes } from "../controllers/notes/get-all-notes.controller";
import { getNoteById } from "../controllers/notes/get-note-by-id.controller";

const router = Router();

/**
 * GET /api/notes
 * Get all notes for the authenticated user
 */
router.get("/", authenticateUser, asyncHandler(getAllNotes));

/**
 * GET /api/notes/:id
 * Get a specific note by ID
 */
router.get("/:id", authenticateUser, asyncHandler(getNoteById));

export const notesRoutes = router;
