import OpenAI from "openai";
import { getOpenAIClient } from "../../config/openai";
import { getSupabaseClient } from "../../config/supabase";
import { logger } from "../../utils/logger";
import { ContextBuilderService } from "./context-builder.service";
import type {
  AIChatSession,
  AIChatMessage,
  AIResponseMetadata,
  FormattedContent,
  AIVersion,
} from "../../types/ai-chat.types";
import { TheologicalSourcesService } from "./theological-sources.service";

/**
 * Main AI chat service for OpenAI integration and message handling
 */
export class ChatService {
  private openai: OpenAI;
  private supabase = getSupabaseClient();
  private contextBuilder = new ContextBuilderService();
  private theologicalSources = new TheologicalSourcesService();

  constructor() {
    this.openai = getOpenAIClient();
  }

  /**
   * Send message to AI and get response
   */
  async sendMessage(
    sessionId: string,
    userMessage: string
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

      // Get user context and conversation history
      const [userContext, conversationHistory] = await Promise.all([
        this.contextBuilder.getUserContext(session.user_id, sessionId),
        this.contextBuilder.getConversationHistory(sessionId),
      ]);

      // Build system prompt with context
      const systemPrompt = this.contextBuilder.buildSystemPrompt(
        session.ai_version,
        userContext
      );

      // Prepare messages for OpenAI
      const messages = this.prepareOpenAIMessages(
        systemPrompt,
        conversationHistory.messages,
        userMessage
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
        session.ai_version
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

      // Extract learning insights asynchronously
      this.extractLearningInsightsAsync(
        session.user_id,
        conversationHistory.messages,
        userMessage,
        aiResponse
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
   * Generate personalized greeting for new chat session
   */
  async generateGreeting(
    aiVersion: AIVersion,
    book?: string,
    chapter?: number,
    version?: string
  ): Promise<{
    greeting: string;
    metadata: AIResponseMetadata;
    formattedContent: FormattedContent;
  }> {
    try {
      const greetingPrompt = this.buildGreetingPrompt(
        aiVersion,
        book,
        chapter,
        version
      );

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getBaseGreetingPrompt(),
          },
          {
            role: "user",
            content: greetingPrompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const greeting = response.choices[0]?.message?.content || "";
      const { metadata, formattedContent } = await this.processAIResponse(
        greeting,
        aiVersion
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

  /**
   * Save learning insights to user profile
   */
  async saveLearningInsights(userId: string, insights: any[]): Promise<void> {
    try {
      await this.contextBuilder.saveLearningInsights(userId, insights);
    } catch (error) {
      logger.error("Error saving learning insights:", error);
    }
  }

  /**
   * Format AI response for frontend rendering
   */
  async formatAIResponse(
    rawResponse: string,
    _aiVersion: AIVersion
  ): Promise<FormattedContent> {
    try {
      // Basic markdown formatting
      const formatted = this.formatMarkdown(rawResponse);

      return {
        text: formatted,
        format: "markdown",
        sections: this.parseSections(formatted),
      };
    } catch (error) {
      logger.error("Error formatting AI response:", error);
      return {
        text: rawResponse,
        format: "plain",
      };
    }
  }

  // Private helper methods

  private async getSession(sessionId: string): Promise<AIChatSession | null> {
    const { data, error } = await this.supabase
      .from("ai_chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      logger.error("Error fetching session:", error);
      return null;
    }

    return data;
  }

  private prepareOpenAIMessages(
    systemPrompt: string,
    conversationHistory: AIChatMessage[],
    userMessage: string
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    return messages;
  }

  private async processAIResponse(
    response: string,
    aiVersion: AIVersion
  ): Promise<{
    metadata: AIResponseMetadata;
    formattedContent: FormattedContent;
  }> {
    // Extract verse references
    const versesCited = this.extractVerseReferences(response);
    const detailedVerses = this.extractDetailedVerses(response);

    // Extract theological topics
    const theologicalTopics = this.extractTheologicalTopics(response);

    // Get cross-references
    const crossReferences = await this.theologicalSources.findCrossReferences(
      versesCited
    );

    // Get citable sources with detailed information
    const sourceData = await this.theologicalSources.getCitableSources(
      theologicalTopics
    );

    const metadata: AIResponseMetadata = {
      versesCited,
      detailedVerses,
      theologicalTopics,
      crossReferences,
      sourcesCited: sourceData.sources,
      detailedSources: sourceData.detailedSources,
      confidence: 0.8, // Default confidence
    };

    const formattedContent = await this.formatAIResponse(response, aiVersion);

    return { metadata, formattedContent };
  }

  private async saveMessages(
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    metadata: AIResponseMetadata,
    formattedContent: FormattedContent,
    tokensUsed: number
  ): Promise<void> {
    try {
      // Save user message
      const { error: userError } = await this.supabase
        .from("ai_chat_messages")
        .insert({
          session_id: sessionId,
          role: "user",
          content: userMessage,
          tokens_used: 0,
        });

      if (userError) {
        logger.error("Error saving user message:", userError);
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
      }

      // Update session last_message_at
      await this.supabase
        .from("ai_chat_sessions")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", sessionId);
    } catch (error) {
      logger.error("Error saving messages:", error);
    }
  }

  private async extractLearningInsightsAsync(
    userId: string,
    conversationHistory: AIChatMessage[],
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      // Add current messages to history for analysis
      const allMessages = [
        ...conversationHistory,
        { role: "user", content: userMessage } as AIChatMessage,
        { role: "assistant", content: aiResponse } as AIChatMessage,
      ];

      const insights = await this.contextBuilder.extractUserInsights(
        allMessages,
        userId
      );
      await this.contextBuilder.saveLearningInsights(userId, insights);
    } catch (error) {
      logger.error("Error extracting learning insights:", error);
    }
  }

  private buildGreetingPrompt(
    aiVersion: AIVersion,
    book?: string,
    chapter?: number,
    version?: string
  ): string {
    let prompt = `Generate a personalized greeting for a ${aiVersion} AI chat session.`;

    if (book && chapter) {
      prompt += ` The user is currently reading ${book} chapter ${chapter}`;
      if (version) {
        prompt += ` in the ${version} version`;
      }
      prompt += `. Ask if they need help with this specific reading.`;
    } else {
      prompt += ` Welcome them and ask how you can help with their biblical study.`;
    }

    return prompt;
  }

  private getBaseGreetingPrompt(): string {
    return `You are a helpful biblical AI assistant. Generate a warm, personalized greeting that:
1. Welcomes the user to the chat
2. Mentions their current reading if provided
3. Asks how you can help with their biblical study
4. Sets the tone for the conversation
5. Keeps it concise but encouraging

Use a friendly, scholarly tone that reflects your expertise while being approachable.`;
  }

  private extractVerseReferences(text: string): string[] {
    const versePattern = /\[([A-Za-z\s]+)\s+(\d+):(\d+)\]/g;
    const references: string[] = [];
    let match;

    while ((match = versePattern.exec(text)) !== null) {
      references.push(`${match[1]} ${match[2]}:${match[3]}`);
    }

    return references;
  }

  private extractDetailedVerses(
    text: string,
    defaultVersion: string = "ESV"
  ): Array<{
    book: string;
    chapter: number;
    verse: number;
    version: string;
    fullReference: string;
    text?: string;
    url?: string;
  }> {
    const detailedVerses: Array<{
      book: string;
      chapter: number;
      verse: number;
      version: string;
      fullReference: string;
      text?: string;
      url?: string;
    }> = [];

    // Multiple patterns to catch different verse formats
    const versePatterns = [
      // [Book Chapter:Verse] format
      /\[([A-Za-z\s]+)\s+(\d+):(\d+)\]/g,
      // **Book Chapter:Verse** format (bold)
      /\*\*([A-Za-z\s]+)\s+(\d+):(\d+)\*\*/g,
      // Book Chapter:Verse format (plain)
      /([A-Za-z\s]+)\s+(\d+):(\d+)/g,
      // Book Chapter:Verse-Verse format (ranges)
      /([A-Za-z\s]+)\s+(\d+):(\d+)-(\d+)/g,
    ];

    versePatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const book = match[1].trim();
        const chapter = parseInt(match[2]);
        const verse = parseInt(match[3]);

        // Skip if this looks like a date or other number pattern
        if (this.isValidBookName(book) && chapter > 0 && verse > 0) {
          const fullReference = `${book} ${chapter}:${verse}`;

          // Check if we already have this verse to avoid duplicates
          const exists = detailedVerses.some(
            (v) => v.book === book && v.chapter === chapter && v.verse === verse
          );

          if (!exists) {
            // Generate Bible Gateway URL for the verse
            const bookAbbrev = this.getBookAbbreviation(book);
            const url = `https://www.biblegateway.com/passage/?search=${bookAbbrev}+${chapter}%3A${verse}&version=${defaultVersion}`;

            detailedVerses.push({
              book,
              chapter,
              verse,
              version: defaultVersion,
              fullReference,
              url,
            });
          }
        }
      }
    });

    return detailedVerses;
  }

  private isValidBookName(bookName: string): boolean {
    const validBooks = [
      "Genesis",
      "Exodus",
      "Leviticus",
      "Numbers",
      "Deuteronomy",
      "Joshua",
      "Judges",
      "Ruth",
      "1 Samuel",
      "2 Samuel",
      "1 Kings",
      "2 Kings",
      "1 Chronicles",
      "2 Chronicles",
      "Ezra",
      "Nehemiah",
      "Esther",
      "Job",
      "Psalms",
      "Psalm",
      "Proverbs",
      "Ecclesiastes",
      "Song of Solomon",
      "Isaiah",
      "Jeremiah",
      "Lamentations",
      "Ezekiel",
      "Daniel",
      "Hosea",
      "Joel",
      "Amos",
      "Obadiah",
      "Jonah",
      "Micah",
      "Nahum",
      "Habakkuk",
      "Zephaniah",
      "Haggai",
      "Zechariah",
      "Malachi",
      "Matthew",
      "Mark",
      "Luke",
      "John",
      "Acts",
      "Romans",
      "1 Corinthians",
      "2 Corinthians",
      "Galatians",
      "Ephesians",
      "Philippians",
      "Colossians",
      "1 Thessalonians",
      "2 Thessalonians",
      "1 Timothy",
      "2 Timothy",
      "Titus",
      "Philemon",
      "Hebrews",
      "James",
      "1 Peter",
      "2 Peter",
      "1 John",
      "2 John",
      "3 John",
      "Jude",
      "Revelation",
    ];

    return validBooks.includes(bookName);
  }

  private getBookAbbreviation(bookName: string): string {
    const bookAbbreviations: Record<string, string> = {
      Genesis: "Gen",
      Exodus: "Exod",
      Leviticus: "Lev",
      Numbers: "Num",
      Deuteronomy: "Deut",
      Joshua: "Josh",
      Judges: "Judg",
      Ruth: "Ruth",
      "1 Samuel": "1Sam",
      "2 Samuel": "2Sam",
      "1 Kings": "1Kgs",
      "2 Kings": "2Kgs",
      "1 Chronicles": "1Chr",
      "2 Chronicles": "2Chr",
      Ezra: "Ezra",
      Nehemiah: "Neh",
      Esther: "Esth",
      Job: "Job",
      Psalms: "Ps",
      Psalm: "Ps",
      Proverbs: "Prov",
      Ecclesiastes: "Eccl",
      "Song of Solomon": "Song",
      Isaiah: "Isa",
      Jeremiah: "Jer",
      Lamentations: "Lam",
      Ezekiel: "Ezek",
      Daniel: "Dan",
      Hosea: "Hos",
      Joel: "Joel",
      Amos: "Amos",
      Obadiah: "Obad",
      Jonah: "Jonah",
      Micah: "Mic",
      Nahum: "Nah",
      Habakkuk: "Hab",
      Zephaniah: "Zeph",
      Haggai: "Hag",
      Zechariah: "Zech",
      Malachi: "Mal",
      Matthew: "Matt",
      Mark: "Mark",
      Luke: "Luke",
      John: "John",
      Acts: "Acts",
      Romans: "Rom",
      "1 Corinthians": "1Cor",
      "2 Corinthians": "2Cor",
      Galatians: "Gal",
      Ephesians: "Eph",
      Philippians: "Phil",
      Colossians: "Col",
      "1 Thessalonians": "1Thess",
      "2 Thessalonians": "2Thess",
      "1 Timothy": "1Tim",
      "2 Timothy": "2Tim",
      Titus: "Titus",
      Philemon: "Phlm",
      Hebrews: "Heb",
      James: "Jas",
      "1 Peter": "1Pet",
      "2 Peter": "2Pet",
      "1 John": "1John",
      "2 John": "2John",
      "3 John": "3John",
      Jude: "Jude",
      Revelation: "Rev",
    };

    return bookAbbreviations[bookName] || bookName;
  }

  private extractTheologicalTopics(text: string): string[] {
    const topics: string[] = [];
    const theologicalTerms = [
      "salvation",
      "grace",
      "faith",
      "justification",
      "sanctification",
      "trinity",
      "incarnation",
      "atonement",
      "resurrection",
      "eschatology",
      "baptism",
      "communion",
      "church",
      "ministry",
      "worship",
    ];

    theologicalTerms.forEach((term) => {
      if (text.toLowerCase().includes(term)) {
        topics.push(term);
      }
    });

    return topics;
  }

  private formatMarkdown(text: string): string {
    // Basic markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Bold
      .replace(/\*(.*?)\*/g, "*$1*") // Italic
      .replace(/^### (.*$)/gim, "### $1") // Headers
      .replace(/^## (.*$)/gim, "## $1")
      .replace(/^# (.*$)/gim, "# $1");
  }

  private parseSections(text: string): any[] {
    const sections: any[] = [];
    const lines = text.split("\n");
    let currentSection: any = null;

    lines.forEach((line) => {
      if (line.startsWith("#")) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          type: "heading",
          content: line,
          metadata: {},
        };
      } else if (currentSection && line.trim()) {
        if (currentSection.type === "heading") {
          currentSection.type = "section";
          currentSection.content = line;
        } else {
          currentSection.content += "\n" + line;
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }
}
