import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { ChatService } from "../../services/ai/chat.service";
import { ContextBuilderService } from "../../services/ai/context-builder.service";
import { CreateChatSessionSchema } from "../../types/ai-chat.types";

/**
 * Create a new AI chat session
 */
export const createSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = CreateChatSessionSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const {
    ai_version,
    title,
    context_book_id,
    context_chapter,
    context_version_id,
  } = validationResult.data;

  const supabase = getSupabaseClient();
  const chatService = new ChatService();
  // const contextBuilder = new ContextBuilderService();

  try {
    // Generate title if not provided
    const sessionTitle =
      title ||
      `${
        ai_version.charAt(0).toUpperCase() + ai_version.slice(1)
      } Chat - ${new Date().toLocaleDateString()}`;

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .insert({
        user_id: userId,
        ai_version,
        title: sessionTitle,
        context_book_id,
        context_chapter,
        context_version_id,
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      logger.error("Error creating chat session:", sessionError);
      throw new AppError(500, "Failed to create chat session");
    }

    // Capture context snapshot
    await captureContextSnapshot(session.id, userId, supabase);

    // Generate personalized greeting
    const greeting = await chatService.generateGreeting(
      ai_version,
      context_book_id,
      context_chapter,
      context_version_id
    );

    // Save greeting as first message
    const { error: messageError } = await supabase
      .from("ai_chat_messages")
      .insert({
        session_id: session.id,
        role: "assistant",
        content: greeting.greeting,
        formatted_content: greeting.formattedContent,
        metadata: greeting.metadata,
        tokens_used: 0,
      });

    if (messageError) {
      logger.error("Error saving greeting message:", messageError);
    }

    const response: ApiSuccessResponse<typeof session> = {
      success: true,
      data: session,
      message: "Chat session created successfully",
    };

    logger.info(
      `User ${userId} created new ${ai_version} chat session: ${session.id}`
    );
    res.status(201).json(response);
  } catch (error) {
    logger.error("Error in createSession:", error);
    throw error;
  }
};

/**
 * Capture context snapshot for the session
 */
async function captureContextSnapshot(
  sessionId: string,
  userId: string,
  supabase: any
) {
  try {
    // Get user's current context
    const contextBuilder = new ContextBuilderService();
    const userContext = await contextBuilder.getUserContext(userId);

    // Save different types of context
    const contextTypes = [
      { type: "notes", data: userContext.notes || [] },
      { type: "highlights", data: userContext.highlights || [] },
      { type: "bookmarks", data: userContext.bookmarks || [] },
      { type: "reading_progress", data: userContext.readingProgress || {} },
      { type: "verse_interactions", data: [] }, // Could include likes, cross-references, etc.
    ];

    for (const contextType of contextTypes) {
      if (
        contextType.data &&
        (Array.isArray(contextType.data)
          ? contextType.data.length > 0
          : Object.keys(contextType.data).length > 0)
      ) {
        await supabase.from("ai_chat_context_snapshots").insert({
          session_id: sessionId,
          context_type: contextType.type,
          context_data: contextType.data,
        });
      }
    }
  } catch (error) {
    logger.error("Error capturing context snapshot:", error);
    // Don't throw - context snapshot is not critical for session creation
  }
}
