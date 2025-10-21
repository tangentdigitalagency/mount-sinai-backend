import { Router } from "express";
import type { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validation";
import { authenticateUser, requireRole } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// Example schema
const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  quantity: z.number().int().positive(),
});

/**
 * GET /api/example
 * Public endpoint - no authentication required
 */
router.get(
  "/",
  asyncHandler(async (_req, res: Response) => {
    res.json({
      success: true,
      message: "Example endpoint",
      data: {
        items: [],
      },
    });
  })
);

/**
 * GET /api/example/:id
 * Protected endpoint - requires authentication
 */
router.get(
  "/:id",
  authenticateUser,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        id,
        name: "Example Item",
        userId: req.user?.id,
      },
    });
  })
);

/**
 * POST /api/example
 * Protected endpoint with validation and role requirement
 */
router.post(
  "/",
  authenticateUser,
  requireRole(["admin", "user"]),
  validate(CreateItemSchema, "body"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const validatedData = CreateItemSchema.parse(req.body);

    // Example: Save to database using Supabase
    // const supabase = getSupabaseClient();
    // const { data, error } = await supabase
    //   .from('items')
    //   .insert([{ ...validatedData, user_id: req.user?.id }])
    //   .select();

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: {
        ...validatedData,
        id: "generated-id",
        userId: req.user?.id,
      },
    });
  })
);

export const exampleRoutes = router;
