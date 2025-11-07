import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getSupabaseClient } from "../../config/supabase";
import { AppError } from "../../middleware/error-handler";
import type { ApiSuccessResponse } from "../../types";
import { logger } from "../../utils/logger";
import { VerseChatService } from "../../services/ai/verse-chat.service";
import { CreateVerseSessionSchema } from "../../types/ai-chat.types";
import { ContextBuilderService } from "../../services/ai/context-builder.service";

/**
 * Create a new verse chat session
 */
export const createVerseSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  // Validate request body
  const validationResult = CreateVerseSessionSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError(400, "Invalid request data");
  }

  const { verses, question } = validationResult.data;

  const supabase = getSupabaseClient();
  const verseChatService = new VerseChatService();

  try {
    // Generate title from first verse
    const firstVerse = verses[0];
    const bookName = getBookName(firstVerse.book_id);
    const verseRef =
      verses.length === 1
        ? `${bookName} ${firstVerse.chapter}:${firstVerse.verse}`
        : `${bookName} ${firstVerse.chapter}:${firstVerse.verse}${verses.length > 1 ? ` (+${verses.length - 1} more)` : ""}`;
    const sessionTitle = `${verseRef} (${firstVerse.version})`;

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from("ai_chat_sessions")
      .insert({
        user_id: userId,
        ai_version: "verse-chat",
        title: sessionTitle,
        context_book_id: firstVerse.book_id,
        context_chapter: firstVerse.chapter,
        context_version_id: firstVerse.version,
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      logger.error("Error creating verse chat session:", sessionError);
      throw new AppError(500, "Failed to create verse chat session");
    }

    // Add verses to session
    await verseChatService.addVersesToSession(session.id, verses);

    // Capture context snapshot
    await captureContextSnapshot(session.id, userId, supabase);

    // Get verses for greeting
    const sessionVerses = await verseChatService.getSessionVerses(session.id);

    // Generate personalized greeting
    const greeting = await verseChatService.generateGreeting(sessionVerses);

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

    // If user provided an initial question, send it
    if (question) {
      try {
        await verseChatService.sendMessage(session.id, question);
      } catch (error) {
        logger.error("Error sending initial question:", error);
        // Don't fail the session creation if initial question fails
      }
    }

    // Get session with verses
    const sessionVersesData = await verseChatService.getSessionVerses(
      session.id
    );

    const response: ApiSuccessResponse<{
      session: typeof session;
      verses: typeof sessionVersesData;
    }> = {
      success: true,
      data: {
        session,
        verses: sessionVersesData,
      },
      message: "Verse chat session created successfully",
    };

    logger.info(
      `User ${userId} created new verse chat session: ${session.id} with ${verses.length} verse(s)`
    );
    res.status(201).json(response);
  } catch (error) {
    logger.error("Error in createVerseSession:", error);
    throw error;
  }
};

/**
 * Get book name from book_id
 */
function getBookName(bookId: string): string {
  const bookMap: Record<string, string> = {
    GEN: "Genesis",
    EXO: "Exodus",
    LEV: "Leviticus",
    NUM: "Numbers",
    DEU: "Deuteronomy",
    JOS: "Joshua",
    JDG: "Judges",
    RUT: "Ruth",
    "1SA": "1 Samuel",
    "2SA": "2 Samuel",
    "1KI": "1 Kings",
    "2KI": "2 Kings",
    "1CH": "1 Chronicles",
    "2CH": "2 Chronicles",
    EZR: "Ezra",
    NEH: "Nehemiah",
    EST: "Esther",
    JOB: "Job",
    PSA: "Psalms",
    PRO: "Proverbs",
    ECC: "Ecclesiastes",
    SNG: "Song of Songs",
    ISA: "Isaiah",
    JER: "Jeremiah",
    LAM: "Lamentations",
    EZK: "Ezekiel",
    DAN: "Daniel",
    HOS: "Hosea",
    JOL: "Joel",
    AMO: "Amos",
    OBA: "Obadiah",
    JON: "Jonah",
    MIC: "Micah",
    NAM: "Nahum",
    HAB: "Habakkuk",
    ZEP: "Zephaniah",
    HAG: "Haggai",
    ZEC: "Zechariah",
    MAL: "Malachi",
    MAT: "Matthew",
    MRK: "Mark",
    LUK: "Luke",
    JHN: "John",
    ACT: "Acts",
    ROM: "Romans",
    "1CO": "1 Corinthians",
    "2CO": "2 Corinthians",
    GAL: "Galatians",
    EPH: "Ephesians",
    PHP: "Philippians",
    COL: "Colossians",
    "1TH": "1 Thessalonians",
    "2TH": "2 Thessalonians",
    "1TI": "1 Timothy",
    "2TI": "2 Timothy",
    TIT: "Titus",
    PHM: "Philemon",
    HEB: "Hebrews",
    JAS: "James",
    "1PE": "1 Peter",
    "2PE": "2 Peter",
    "1JN": "1 John",
    "2JN": "2 John",
    "3JN": "3 John",
    JUD: "Jude",
    REV: "Revelation",
  };

  return bookMap[bookId] || bookId;
}

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
      { type: "verse_interactions", data: [] },
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

