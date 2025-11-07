import OpenAI from "openai";
import { getOpenAIClient } from "../../config/openai";
import { getSupabaseClient } from "../../config/supabase";
import { logger } from "../../utils/logger";
import { ContextBuilderService } from "./context-builder.service";
import { ConversationalAIService } from "./conversational-ai.service";
import type {
  AIChatSession,
  AIChatMessage,
  AIResponseMetadata,
  FormattedContent,
  VerseInfo,
  VerseChatVerse,
} from "../../types/ai-chat.types";
import { VERSE_CHAT_VERSION_PROMPT } from "./prompts/verse-chat-version";

/**
 * Verse Chat Service for handling verse-based AI conversations
 */
export class VerseChatService {
  private openai: OpenAI;
  private supabase = getSupabaseClient();
  private contextBuilder = new ContextBuilderService();
  private conversationalAI = new ConversationalAIService();

  constructor() {
    this.openai = getOpenAIClient();
  }

  /**
   * Get all verses for a session
   */
  async getSessionVerses(sessionId: string): Promise<VerseChatVerse[]> {
    const { data, error } = await this.supabase
      .from("verse_chat_verses")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching session verses:", error);
      throw new Error("Failed to fetch session verses");
    }

    return (data || []) as VerseChatVerse[];
  }

  /**
   * Add verses to a session
   */
  async addVersesToSession(
    sessionId: string,
    verses: VerseInfo[],
    messageId?: string
  ): Promise<VerseChatVerse[]> {
    const verseData = verses.map((verse) => ({
      session_id: sessionId,
      message_id: messageId || null,
      version: verse.version,
      book_id: verse.book_id,
      chapter: verse.chapter,
      verse: verse.verse,
      verse_text: verse.verse_text,
    }));

    const { data, error } = await this.supabase
      .from("verse_chat_verses")
      .insert(verseData)
      .select();

    if (error) {
      logger.error("Error adding verses to session:", error);
      throw new Error("Failed to add verses to session");
    }

    return (data || []) as VerseChatVerse[];
  }

  /**
   * Build verse context string for AI prompt
   */
  private buildVerseContext(verses: VerseChatVerse[]): string {
    if (verses.length === 0) {
      return "";
    }

    const versesByBook = verses.reduce((acc, verse) => {
      const key = `${verse.book_id}-${verse.chapter}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(verse);
      return acc;
    }, {} as Record<string, VerseChatVerse[]>);

    let context = "## Verses in This Conversation\n\n";

    Object.entries(versesByBook).forEach(([_key, bookVerses]) => {
      const firstVerse = bookVerses[0];
      const sortedVerses = bookVerses.sort((a, b) => a.verse - b.verse);

      // Group consecutive verses
      const verseRanges: string[] = [];
      let start = sortedVerses[0].verse;
      let end = sortedVerses[0].verse;

      for (let i = 1; i < sortedVerses.length; i++) {
        if (sortedVerses[i].verse === end + 1) {
          end = sortedVerses[i].verse;
        } else {
          if (start === end) {
            verseRanges.push(`${start}`);
          } else {
            verseRanges.push(`${start}-${end}`);
          }
          start = sortedVerses[i].verse;
          end = sortedVerses[i].verse;
        }
      }
      if (start === end) {
        verseRanges.push(`${start}`);
      } else {
        verseRanges.push(`${start}-${end}`);
      }

      const verseRef = `${this.getBookName(firstVerse.book_id)} ${firstVerse.chapter}:${verseRanges.join(", ")}`;
      context += `### ${verseRef} (${firstVerse.version})\n\n`;

      sortedVerses.forEach((verse) => {
        context += `**${verseRef} (v${verse.verse})**: ${verse.verse_text}\n\n`;
      });
    });

    return context;
  }

  /**
   * Get book name from book_id (simplified - you might want to use a proper mapping)
   */
  private getBookName(bookId: string): string {
    // This is a simplified mapping - you might want to use a proper Bible book mapping
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
   * Build system prompt for verse chat
   */
  private buildVerseChatSystemPrompt(
    verses: VerseChatVerse[],
    userContext?: any
  ): string {
    let prompt = VERSE_CHAT_VERSION_PROMPT;

    // Add verse context
    if (verses.length > 0) {
      const verseContext = this.buildVerseContext(verses);
      prompt += "\n\n" + verseContext;
    }

    // Add conversational personality
    if (userContext) {
      const conversationalPrompt =
        this.conversationalAI.buildConversationalPromptAddition(userContext);
      prompt += "\n\n" + conversationalPrompt;
    }

    return prompt;
  }

  /**
   * Prepare messages for OpenAI API
   */
  private prepareOpenAIMessages(
    systemPrompt: string,
    conversationHistory: AIChatMessage[],
    userMessage: string,
    newVerses?: VerseInfo[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      if (msg.role !== "system") {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    });

    // Add new verses info if provided
    let enhancedUserMessage = userMessage;
    if (newVerses && newVerses.length > 0) {
      const versesInfo = newVerses
        .map(
          (v) =>
            `${this.getBookName(v.book_id)} ${v.chapter}:${v.verse} (${v.version}): ${v.verse_text}`
        )
        .join("\n");
      enhancedUserMessage = `[New verses added to conversation]\n${versesInfo}\n\n[User question]\n${userMessage}`;
    }

    messages.push({
      role: "user",
      content: enhancedUserMessage,
    });

    return messages;
  }

  /**
   * Process AI response to extract metadata and format content
   */
  private async processAIResponse(
    response: string,
    _sessionId: string
  ): Promise<{
    metadata: AIResponseMetadata;
    formattedContent: FormattedContent;
  }> {
    // Extract verse references from response
    const verseReferences = this.extractVerseReferences(response);

    // Format content
    const formattedContent: FormattedContent = {
      text: response,
      format: "markdown",
    };

    // Build metadata
    const metadata: AIResponseMetadata = {
      versesCited: verseReferences,
      confidence: 0.9,
    };

    return { metadata, formattedContent };
  }

  /**
   * Extract verse references from text (simplified - you might want more sophisticated parsing)
   */
  private extractVerseReferences(text: string): string[] {
    // Simple regex to find verse references like "John 3:16" or "John 3:16-18"
    const verseRegex = /(\d?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g;
    const matches = text.match(verseRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<AIChatSession | null> {
    const { data, error } = await this.supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("ai_version", "verse-chat")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("Error fetching session:", error);
      throw new Error("Failed to fetch session");
    }

    return data as AIChatSession;
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    sessionId: string
  ): Promise<{ messages: AIChatMessage[] }> {
    const { data, error } = await this.supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching conversation history:", error);
      throw new Error("Failed to fetch conversation history");
    }

    return { messages: (data || []) as AIChatMessage[] };
  }

  /**
   * Save messages to database
   */
  async saveMessages(
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    metadata: AIResponseMetadata,
    formattedContent: FormattedContent,
    tokensUsed: number
  ): Promise<void> {
    // Save user message
    const { error: userError } = await this.supabase
      .from("ai_chat_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: userMessage,
        formatted_content: formattedContent,
        metadata: metadata,
      });

    if (userError) {
      logger.error("Error saving user message:", userError);
      throw new Error("Failed to save user message");
    }

    // Save AI response
    const { error: aiError } = await this.supabase
      .from("ai_chat_messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: aiResponse,
        formatted_content: formattedContent,
        metadata: metadata,
        tokens_used: tokensUsed,
      });

    if (aiError) {
      logger.error("Error saving AI response:", aiError);
      throw new Error("Failed to save AI response");
    }

    // Update session last_message_at
    await this.supabase
      .from("ai_chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId);
  }

  /**
   * Send message to AI with verse context
   */
  async sendMessage(
    sessionId: string,
    userMessage: string,
    newVerses?: VerseInfo[]
  ): Promise<{
    aiResponse: string;
    metadata: AIResponseMetadata;
    formattedContent: FormattedContent;
    tokensUsed: number;
  }> {
    try {
      // Get session details
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Add new verses if provided
      if (newVerses && newVerses.length > 0) {
        await this.addVersesToSession(sessionId, newVerses);
      }

      // Get all verses for the session
      const verses = await this.getSessionVerses(sessionId);

      // Get user context and conversation history
      const [userContext, conversationHistory] = await Promise.all([
        this.contextBuilder.getUserContext(session.user_id, sessionId),
        this.getConversationHistory(sessionId),
      ]);

      // Build system prompt with verse context
      const systemPrompt = this.buildVerseChatSystemPrompt(verses, userContext);

      // Prepare messages for OpenAI
      const messages = this.prepareOpenAIMessages(
        systemPrompt,
        conversationHistory.messages,
        userMessage,
        newVerses
      );

      // Call OpenAI
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiResponse = response.choices[0]?.message?.content || "";
      const tokensUsed = response.usage?.total_tokens || 0;

      // Process and format the response
      const { metadata, formattedContent } = await this.processAIResponse(
        aiResponse,
        sessionId
      );

      // Save both user message and AI response
      await this.saveMessages(
        sessionId,
        userMessage,
        aiResponse,
        metadata,
        formattedContent,
        tokensUsed
      );

      return {
        aiResponse,
        metadata,
        formattedContent,
        tokensUsed,
      };
    } catch (error) {
      logger.error("Error in sendMessage:", error);
      throw error;
    }
  }

  /**
   * Generate personalized greeting for new verse chat session
   */
  async generateGreeting(verses: VerseChatVerse[]): Promise<{
    greeting: string;
    metadata: AIResponseMetadata;
    formattedContent: FormattedContent;
  }> {
    try {
      const verseContext = this.buildVerseContext(verses);
      const greetingPrompt = `The user has started a conversation about the following verse(s). Provide a warm, welcoming greeting that acknowledges the verse(s) and invites them to ask questions.

${verseContext}

Keep the greeting brief (2-3 sentences) and encouraging.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: VERSE_CHAT_VERSION_PROMPT,
          },
          {
            role: "user",
            content: greetingPrompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const greeting = response.choices[0]?.message?.content || "";
      const { metadata, formattedContent } = await this.processAIResponse(
        greeting,
        "greeting"
      );

      return {
        greeting,
        metadata,
        formattedContent,
      };
    } catch (error) {
      logger.error("Error generating greeting:", error);
      throw error;
    }
  }
}

