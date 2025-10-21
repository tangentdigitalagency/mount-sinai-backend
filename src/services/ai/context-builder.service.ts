import { getSupabaseClient } from "../../config/supabase";
import { logger } from "../../utils/logger";
import type {
  UserContext,
  ConversationHistory,
  AIUserLearningProfile,
  LearningInsight,
} from "../../types/ai-chat.types";

/**
 * Service for building comprehensive context for AI chat sessions
 * Gathers user data, conversation history, and learning profile
 */
export class ContextBuilderService {
  private supabase = getSupabaseClient();

  /**
   * Get comprehensive user context for AI chat
   */
  async getUserContext(
    userId: string,
    _sessionId?: string
  ): Promise<UserContext> {
    try {
      // Get all user data in parallel for comprehensive personalization
      const [
        userProfile,
        readingProgress,
        readingSettings,
        readingPlan,
        notes,
        highlights,
        bookmarks,
        lovedVerses,
        readingStats,
        achievements,
        learningProfile,
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getReadingProgress(userId),
        this.getReadingSettings(userId),
        this.getReadingPlan(userId),
        this.getUserNotes(userId),
        this.getUserHighlights(userId),
        this.getUserBookmarks(userId),
        this.getUserLovedVerses(userId),
        this.getReadingStats(userId),
        this.getUserAchievements(userId),
        this.getLearningProfile(userId),
      ]);

      return {
        userId,
        userProfile: userProfile as Record<string, unknown>,
        currentBook: readingProgress?.book_id,
        currentChapter: readingProgress?.chapter,
        currentVersion: readingProgress?.version_id,
        notes,
        highlights,
        bookmarks,
        lovedVerses,
        readingProgress,
        readingSettings,
        readingPlan,
        readingStats,
        achievements,
        learningProfile,
      };
    } catch (error) {
      logger.error("Error building user context:", error);
      throw error;
    }
  }

  /**
   * Build system prompt for specific AI version with user context
   */
  buildSystemPrompt(aiVersion: string, userContext: UserContext): string {
    const basePrompt = this.getBasePrompt();
    const versionPrompt = this.getVersionPrompt(aiVersion);
    const contextPrompt = this.buildContextPrompt(userContext);

    return `${basePrompt}

${versionPrompt}

## Current User Context
${contextPrompt}

## Instructions
Use the user's context to provide personalized, relevant responses. Reference their notes, highlights, and reading progress when appropriate.

## CRITICAL VERSE FORMATTING REQUIREMENT
- ALL Bible verse references MUST be formatted as [Book Chapter:Verse] (e.g., [John 3:16], [Romans 5:8])
- When mentioning any Bible verse, always include the full reference in square brackets
- This ensures the frontend can properly display clickable verse links with detailed metadata`;
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(
    sessionId: string,
    limit = 50
  ): Promise<ConversationHistory> {
    try {
      const { data: messages, error } = await this.supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) {
        logger.error("Error fetching conversation history:", error);
        throw error;
      }

      // Calculate total tokens used
      const totalTokens =
        messages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0;

      return {
        messages: messages || [],
        totalTokens,
      };
    } catch (error) {
      logger.error("Error getting conversation history:", error);
      throw error;
    }
  }

  /**
   * Extract learning insights from conversation
   */
  async extractUserInsights(
    messages: any[],
    _userId: string
  ): Promise<LearningInsight[]> {
    try {
      // This would typically use AI to analyze the conversation
      // For now, we'll implement basic pattern recognition
      const insights: LearningInsight[] = [];

      // Analyze question patterns
      const questions = messages.filter((msg) => msg.role === "user");
      const questionPatterns = this.analyzeQuestionPatterns(questions);

      if (questionPatterns.length > 0) {
        insights.push({
          category: "question_patterns",
          insightKey: "common_question_types",
          insightValue: questionPatterns.join(", "),
          confidenceScore: 0.7,
          evidence: questions.slice(0, 5).map((q) => q.content),
        });
      }

      // Analyze theological interests
      const theologicalTopics = this.analyzeTheologicalTopics(messages);
      if (theologicalTopics.length > 0) {
        insights.push({
          category: "theological_preference",
          insightKey: "primary_interests",
          insightValue: theologicalTopics.join(", "),
          confidenceScore: 0.8,
          evidence: messages
            .filter((m) =>
              theologicalTopics.some((topic) =>
                m.content.toLowerCase().includes(topic.toLowerCase())
              )
            )
            .map((m) => m.content),
        });
      }

      // Analyze study style
      const studyStyle = this.analyzeStudyStyle(messages);
      if (studyStyle) {
        insights.push({
          category: "study_style",
          insightKey: "preferred_approach",
          insightValue: studyStyle,
          confidenceScore: 0.6,
          evidence: messages.slice(0, 10).map((m) => m.content),
        });
      }

      return insights;
    } catch (error) {
      logger.error("Error extracting user insights:", error);
      return [];
    }
  }

  /**
   * Save learning insights to database
   */
  async saveLearningInsights(
    userId: string,
    insights: LearningInsight[]
  ): Promise<void> {
    try {
      for (const insight of insights) {
        const { error } = await this.supabase
          .from("ai_user_learning_profiles")
          .upsert(
            {
              user_id: userId,
              category: insight.category,
              insight_key: insight.insightKey,
              insight_value: insight.insightValue,
              confidence_score: insight.confidenceScore,
              source: "auto",
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,category,insight_key",
            }
          );

        if (error) {
          logger.error("Error saving learning insight:", error);
        }
      }
    } catch (error) {
      logger.error("Error saving learning insights:", error);
    }
  }

  // Private helper methods

  private async getReadingProgress(userId: string) {
    const { data, error } = await this.supabase
      .from("bible_reading_progress")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Error fetching reading progress:", error);
    }

    return data;
  }

  private async getUserNotes(userId: string) {
    const { data, error } = await this.supabase
      .from("bible_notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      logger.error("Error fetching user notes:", error);
      return [];
    }

    return data || [];
  }

  private async getUserHighlights(userId: string) {
    const { data, error } = await this.supabase
      .from("verse_highlights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      logger.error("Error fetching user highlights:", error);
      return [];
    }

    return data || [];
  }

  private async getUserBookmarks(userId: string) {
    const { data, error } = await this.supabase
      .from("verse_bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      logger.error("Error fetching user bookmarks:", error);
      return [];
    }

    return data || [];
  }

  private async getLearningProfile(
    userId: string
  ): Promise<AIUserLearningProfile[]> {
    const { data, error } = await this.supabase
      .from("ai_user_learning_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("confidence_score", { ascending: false });

    if (error) {
      logger.error("Error fetching learning profile:", error);
      return [];
    }

    return data || [];
  }

  private getBasePrompt(): string {
    return `You are an expert biblical scholar and theologian with deep knowledge of Scripture, church history, and Christian doctrine. You are committed to providing accurate, biblically-grounded responses while being respectful of different Christian traditions.

## Core Principles

1. **Biblical Authority**: All responses must be grounded in Scripture. When discussing theological topics, always cite relevant biblical passages and provide context.

2. **Denominational Neutrality**: Present multiple Christian perspectives fairly when they exist.

3. **Scholarly Integrity**: Distinguish between biblical teaching and denominational interpretation.

4. **Response Format**: Structure your responses with clear headings, bullet points, bold text for key concepts, and verse references in [Book Chapter:Verse] format.

5. **Pastoral Sensitivity**: Be encouraging and supportive while maintaining scholarly depth.`;
  }

  private getVersionPrompt(aiVersion: string): string {
    const prompts = {
      study:
        "You are a **Study AI** - focused on deep theological analysis, original language insights, and comprehensive biblical study.",
      debate:
        "You are a **Debate AI** - focused on structured argumentation, logical reasoning, and presenting multiple theological perspectives.",
      "note-taker":
        "You are a **Note-Taker AI** - focused on helping users organize their thoughts and create structured study materials.",
      explainer:
        "You are an **Explainer AI** - focused on making complex biblical concepts clear and accessible.",
      custom:
        "You are a **Custom AI** - adaptable to the user's specific needs and preferences.",
    };

    return prompts[aiVersion as keyof typeof prompts] || prompts.custom;
  }

  private buildContextPrompt(userContext: UserContext): string {
    let context = "";

    // User Profile Information
    if (userContext.userProfile) {
      const firstName = userContext.userProfile.first_name;
      const lastName = userContext.userProfile.last_name;
      const username = userContext.userProfile.username;

      context += `## PERSONAL CONTEXT\n`;
      context += `You are speaking with ${firstName} ${lastName} (@${username}).\n\n`;
    }

    // Current Reading Context
    context += `### Current Reading\n`;
    context += `${
      userContext.userProfile?.first_name || "The user"
    } is currently reading ${userContext.currentBook || "Not specified"} ${
      userContext.currentChapter || ""
    } in the ${userContext.currentVersion || "Not specified"} version.\n\n`;

    // Reading Plan Information
    if (userContext.readingPlan) {
      const plan = userContext.readingPlan;
      if (plan.enabled) {
        context += `### Reading Plan\n`;
        context += `${
          userContext.userProfile?.first_name || "The user"
        } is on day ${plan.current_day} of a ${
          plan.plan_duration
        }-day reading plan. They have completed ${
          plan.completed_days
        } days so far.\n\n`;
      }
    }

    // Reading Statistics
    if (userContext.readingStats) {
      const stats = userContext.readingStats;
      context += `### Reading Progress\n`;
      context += `- Current level: ${stats.current_level}\n`;
      context += `- Reading streak: ${stats.current_streak} days\n`;
      context += `- Total chapters read: ${stats.total_chapters_read}\n`;
      context += `- Achievements unlocked: ${stats.total_achievements_unlocked}\n\n`;
    }

    // Study Preferences
    if (userContext.readingSettings) {
      const settings = userContext.readingSettings;
      context += `### Study Preferences\n`;
      context += `- Preferred Bible version: ${
        settings.preferred_version_abbreviation || "Not specified"
      }\n`;
      context += `- Audio settings: ${
        settings.auto_play_audio ? "Auto-play enabled" : "Manual control"
      }\n`;
      context += `- Display: ${settings.font_size} font, ${settings.reading_mode} mode\n\n`;
    }

    // Recent Study Activity
    if (userContext.notes && userContext.notes.length > 0) {
      context += `### Recent Notes (${userContext.notes.length}):\n`;
      userContext.notes.slice(0, 5).forEach((note) => {
        context += `- ${note.title}: ${
          note.content
            ? JSON.stringify(note.content).substring(0, 100) + "..."
            : "No content"
        }\n`;
      });
      context += "\n";
    }

    if (userContext.highlights && userContext.highlights.length > 0) {
      context += `### Recent Highlights (${userContext.highlights.length}):\n`;
      userContext.highlights.slice(0, 5).forEach((highlight) => {
        context += `- ${highlight.book_id} ${highlight.chapter}:${highlight.verse_number} (${highlight.color})\n`;
      });
      context += "\n";
    }

    if (userContext.bookmarks && userContext.bookmarks.length > 0) {
      context += `### Recent Bookmarks (${userContext.bookmarks.length}):\n`;
      userContext.bookmarks.slice(0, 5).forEach((bookmark) => {
        context += `- ${bookmark.book_name} ${bookmark.chapter}:${bookmark.verse_number}\n`;
      });
      context += "\n";
    }

    if (userContext.lovedVerses && userContext.lovedVerses.length > 0) {
      context += `### Loved Verses (${userContext.lovedVerses.length}):\n`;
      userContext.lovedVerses.slice(0, 5).forEach((verse) => {
        context += `- ${verse.book_name} ${verse.chapter}:${verse.verse_number}\n`;
      });
      context += "\n";
    }

    // AI Learning Profile
    if (userContext.learningProfile && userContext.learningProfile.length > 0) {
      context += `### AI Learning Profile:\n`;
      userContext.learningProfile.forEach((profile) => {
        context += `- ${profile.category}: ${profile.insight_key} = ${profile.insight_value} (confidence: ${profile.confidence_score})\n`;
      });
      context += "\n";
    }

    // Achievements
    if (userContext.achievements && userContext.achievements.length > 0) {
      context += `### Recent Achievements (${userContext.achievements.length}):\n`;
      userContext.achievements.slice(0, 3).forEach((achievement) => {
        context += `- ${
          (achievement.reading_achievements as { name: string })?.name ||
          "Achievement"
        }\n`;
      });
      context += "\n";
    }

    return context;
  }

  private analyzeQuestionPatterns(questions: any[]): string[] {
    const patterns: string[] = [];

    questions.forEach((q) => {
      const content = q.content.toLowerCase();
      if (content.includes("what does") || content.includes("what is")) {
        patterns.push("definitional questions");
      }
      if (content.includes("why") || content.includes("how come")) {
        patterns.push("explanatory questions");
      }
      if (content.includes("should") || content.includes("ought")) {
        patterns.push("ethical questions");
      }
      if (content.includes("compare") || content.includes("difference")) {
        patterns.push("comparative questions");
      }
    });

    return [...new Set(patterns)];
  }

  private analyzeTheologicalTopics(messages: any[]): string[] {
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
    const coreDoctrinalTerms = [
      "god",
      "jesus",
      "holy spirit",
      "trinity",
      "incarnation",
      "atonement",
      "resurrection",
      "ascension",
      "salvation",
      "justification",
      "sanctification",
      "redemption",
      "regeneration",
      "grace",
      "faith",
      "repentance",
      "sin",
      "forgiveness",
      "righteousness",
      "holiness",
      "covenant",
      "law",
      "gospel",
      "creation",
      "fall",
      "original sin",
      "image of god",
    ];

    const eschatologyTerms = [
      "eschatology",
      "second coming",
      "rapture",
      "judgment",
      "heaven",
      "hell",
      "new earth",
      "millennium",
      "antichrist",
      "apocalypse",
      "revelation",
      "tribulation",
      "kingdom of god",
    ];

    const scriptureFutureThemes = [
      "bible",
      "scripture",
      "canon",
      "revelation",
      "inspiration",
      "illumination",
      "hermeneutics",
      "exegesis",
      "interpretation",
      "prophecy",
      "logos",
      "word of god",
    ];

    const chruchSacramentsThemes = [
      "church",
      "ekklesia",
      "body of christ",
      "ministry",
      "apostles",
      "discipleship",
      "ordination",
      "baptism",
      "communion",
      "eucharist",
      "sacrament",
      "confirmation",
      "confession",
      "liturgy",
      "worship",
      "prayer",
      "fellowship",
      "mission",
      "evangelism",
    ];

    const christologyThemes = [
      "christology",
      "messiah",
      "son of god",
      "lord",
      "redeemer",
      "savior",
      "logos",
      "hypostatic union",
      "kenosis",
      "christ",
      "immanuel",
    ];

    const pneumatologyThemes = [
      "pneumatology",
      "holy spirit",
      "spiritual gifts",
      "tongues",
      "fruit of the spirit",
      "conviction",
      "baptism of the spirit",
    ];

    const soteriologyThemes = [
      "soteriology",
      "election",
      "predestination",
      "atonement",
      "propitiation",
      "reconciliation",
      "faith",
      "grace",
      "repentance",
      "new birth",
      "regeneration",
    ];

    const oldTestamentThemes = [
      "law of moses",
      "tabernacle",
      "temple",
      "priesthood",
      "sacrifice",
      "israel",
      "covenant",
      "abrahamic covenant",
      "mosaic covenant",
      "davidic covenant",
      "prophet",
      "torah",
      "psalms",
    ];

    const apologeticsThemes = [
      "apologetics",
      "theodicy",
      "free will",
      "determinism",
      "omniscience",
      "omnipotence",
      "omnibenevolence",
      "metaphysics",
      "ontology",
      "ethics",
      "epistemology",
      "existence of god",
    ];

    const interfaithDialogueThemes = [
      "judaism",
      "islam",
      "hinduism",
      "buddhism",
      "paganism",
      "gnosticism",
      "heresy",
      "orthodoxy",
      "catholicism",
      "protestantism",
      "eastern orthodoxy",
      "ecumenism",
    ];

    const historicalThemes = [
      "augustine",
      "aquinas",
      "calvin",
      "luther",
      "reformation",
      "council of nicaea",
      "creed",
      "apostles creed",
      "nicene creed",
      "westminster confession",
      "scholasticism",
      "church fathers",
      "patristics",
    ];

    const ethicsThemes = [
      "morality",
      "virtue",
      "vice",
      "charity",
      "humility",
      "obedience",
      "justice",
      "mercy",
      "love",
      "truth",
      "righteous living",
      "beatitudes",
      "commandments",
      "sermon on the mount",
    ];

    const spiritualThemes = [
      "discipleship",
      "prayer",
      "fasting",
      "meditation",
      "scripture reading",
      "devotion",
      "pilgrimage",
      "confession",
      "sabbath",
      "spiritual warfare",
    ];

    const metaThemes = [
      "biblical theology",
      "systematic theology",
      "practical theology",
      "historical theology",
      "dogmatics",
      "ethics",
      "philosophical theology",
      "comparative theology",
    ];

    const themes = [
      ...theologicalTerms,
      ...chruchSacramentsThemes,
      ...christologyThemes,
      ...pneumatologyThemes,
      ...soteriologyThemes,
      ...oldTestamentThemes,
      ...apologeticsThemes,
      ...interfaithDialogueThemes,
      ...historicalThemes,
      ...ethicsThemes,
      ...spiritualThemes,
      ...metaThemes,
      ...coreDoctrinalTerms,
      ...eschatologyTerms,
      ...scriptureFutureThemes,
    ];
    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      themes.forEach((term) => {
        if (content.includes(term) && !topics.includes(term)) {
          topics.push(term);
        }
      });
    });

    return topics;
  }

  private analyzeStudyStyle(messages: any[]): string | null {
    const userMessages = messages.filter((m) => m.role === "user");

    if (userMessages.length < 3) return null;

    const avgLength =
      userMessages.reduce((sum, m) => sum + m.content.length, 0) /
      userMessages.length;

    if (avgLength > 200) return "detailed and comprehensive";
    if (avgLength > 100) return "moderate depth";
    return "concise and focused";
  }

  /**
   * Get user profile information
   */
  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select(
          "id, first_name, last_name, username, gender, birth_date, profile_picture_url, avatar_config, avatar_type"
        )
        .eq("id", userId)
        .single();

      if (error) {
        logger.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error getting user profile:", error);
      return null;
    }
  }

  /**
   * Get user's reading settings
   */
  private async getReadingSettings(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("bible_reading_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        logger.error("Error fetching reading settings:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error getting reading settings:", error);
      return null;
    }
  }

  /**
   * Get user's reading plan
   */
  private async getReadingPlan(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_reading_plans")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        logger.error("Error fetching reading plan:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error getting reading plan:", error);
      return null;
    }
  }

  /**
   * Get user's loved verses
   */
  private async getUserLovedVerses(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("verse_loves")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        logger.error("Error fetching loved verses:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error getting loved verses:", error);
      return [];
    }
  }

  /**
   * Get user's reading statistics
   */
  private async getReadingStats(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_reading_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        logger.error("Error fetching reading stats:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error getting reading stats:", error);
      return null;
    }
  }

  /**
   * Get user's achievements
   */
  private async getUserAchievements(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_achievements")
        .select(
          `
          *,
          reading_achievements (
            name,
            description,
            category,
            icon,
            points,
            tier
          )
        `
        )
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (error) {
        logger.error("Error fetching achievements:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error getting achievements:", error);
      return [];
    }
  }
}
