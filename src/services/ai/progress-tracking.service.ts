import { getSupabaseClient } from "../../config/supabase";
import { getOpenAIClient } from "../../config/openai";
import { logger } from "../../utils/logger";
import type { UserContext } from "../../types/ai-chat.types";

/**
 * Progress Tracking Service
 * Tracks user growth and generates personalized encouragement
 */
export class ProgressTrackingService {
  private supabase = getSupabaseClient();
  private openai = getOpenAIClient();

  /**
   * Track knowledge growth based on conversation analysis
   */
  async trackKnowledgeGrowth(
    userId: string,
    sessionData: {
      userMessage: string;
      aiResponse: string;
      conversationHistory: any[];
    }
  ): Promise<void> {
    try {
      // Analyze the depth and complexity of the conversation
      const knowledgeScore = await this.analyzeKnowledgeDepth(sessionData);

      // Record the progress
      await this.recordProgress(userId, "knowledge_growth", {
        score: knowledgeScore,
        timestamp: new Date().toISOString(),
        sessionData: {
          messageLength: sessionData.userMessage.length,
          responseLength: sessionData.aiResponse.length,
          topicsDiscussed: this.extractTopics(sessionData.userMessage),
        },
      });

      logger.info(
        `Tracked knowledge growth for user ${userId}: ${knowledgeScore}`
      );
    } catch (error) {
      logger.error("Error tracking knowledge growth:", error);
    }
  }

  /**
   * Track application growth (practical understanding)
   */
  async trackApplicationGrowth(
    userId: string,
    sessionData: {
      userMessage: string;
      aiResponse: string;
      conversationHistory: any[];
    }
  ): Promise<void> {
    try {
      // Analyze how well the user is applying biblical concepts
      const applicationScore = await this.analyzeApplicationDepth(sessionData);

      // Record the progress
      await this.recordProgress(userId, "application_growth", {
        score: applicationScore,
        timestamp: new Date().toISOString(),
        applicationIndicators: this.extractApplicationIndicators(
          sessionData.userMessage
        ),
      });

      logger.info(
        `Tracked application growth for user ${userId}: ${applicationScore}`
      );
    } catch (error) {
      logger.error("Error tracking application growth:", error);
    }
  }

  /**
   * Track study streaks
   */
  async trackStudyStreak(userId: string): Promise<void> {
    try {
      // Get current streak
      const currentStreak = await this.getCurrentStreak(userId);

      // Update streak
      const newStreak = currentStreak + 1;
      await this.recordProgress(userId, "ai_chat_streak", {
        currentStreak: newStreak,
        lastActivity: new Date().toISOString(),
      });

      // Check for streak achievements
      await this.checkStreakAchievements(userId, newStreak);

      logger.info(`Updated study streak for user ${userId}: ${newStreak}`);
    } catch (error) {
      logger.error("Error tracking study streak:", error);
    }
  }

  /**
   * Generate personalized encouragement
   */
  async generateEncouragement(
    userId: string,
    userContext: UserContext
  ): Promise<string> {
    try {
      const firstName = (userContext.userProfile?.first_name as string | undefined) || "friend";
      const recentProgress = await this.getRecentProgress(userId);
      const achievements = await this.getRecentAchievements(userId);

      const prompt = `Generate personalized encouragement for ${firstName} based on their recent progress:

Recent Progress: ${JSON.stringify(recentProgress)}
Recent Achievements: ${JSON.stringify(achievements)}
Current Reading: ${userContext.currentBook || "their current study"}

Make it warm, specific, and motivating. Reference their actual progress and achievements. Keep it under 100 words.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, encouraging spiritual mentor. Generate personalized encouragement that celebrates progress and motivates continued growth.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return (
        response.choices[0]?.message?.content ||
        this.getDefaultEncouragement(firstName)
      );
    } catch (error) {
      logger.error("Error generating encouragement:", error);
      return this.getDefaultEncouragement(
        (userContext.userProfile?.first_name as string | undefined) || "friend"
      );
    }
  }

  /**
   * Get user's overall progress summary
   */
  async getUserProgressSummary(userId: string): Promise<{
    knowledgeGrowth: number;
    applicationGrowth: number;
    currentStreak: number;
    totalSessions: number;
    recentAchievements: any[];
  }> {
    try {
      const [
        knowledgeGrowth,
        applicationGrowth,
        currentStreak,
        totalSessions,
        recentAchievements,
      ] = await Promise.all([
        this.getLatestProgress(userId, "knowledge_growth"),
        this.getLatestProgress(userId, "application_growth"),
        this.getLatestProgress(userId, "ai_chat_streak"),
        this.getTotalSessions(userId),
        this.getRecentAchievements(userId),
      ]);

      return {
        knowledgeGrowth: knowledgeGrowth?.score || 0,
        applicationGrowth: applicationGrowth?.score || 0,
        currentStreak: currentStreak?.currentStreak || 0,
        totalSessions: totalSessions || 0,
        recentAchievements: recentAchievements || [],
      };
    } catch (error) {
      logger.error("Error getting progress summary:", error);
      return {
        knowledgeGrowth: 0,
        applicationGrowth: 0,
        currentStreak: 0,
        totalSessions: 0,
        recentAchievements: [],
      };
    }
  }

  // Private helper methods

  private async analyzeKnowledgeDepth(sessionData: any): Promise<number> {
    // Simple analysis based on message complexity and topics
    const messageLength = sessionData.userMessage.length;
    const responseLength = sessionData.aiResponse.length;
    const topicsCount = this.extractTopics(sessionData.userMessage).length;

    // Basic scoring algorithm (0-1 scale)
    const lengthScore = Math.min(messageLength / 500, 1);
    const topicsScore = Math.min(topicsCount / 3, 1);
    const engagementScore = Math.min(responseLength / 1000, 1);

    return (lengthScore + topicsScore + engagementScore) / 3;
  }

  private async analyzeApplicationDepth(sessionData: any): Promise<number> {
    // Look for application indicators in the user's message
    const applicationIndicators = this.extractApplicationIndicators(
      sessionData.userMessage
    );
    return Math.min(applicationIndicators.length / 5, 1);
  }

  private extractTopics(message: string): string[] {
    // Simple topic extraction
    const topicKeywords = [
      "trinity",
      "salvation",
      "grace",
      "faith",
      "love",
      "hope",
      "prayer",
      "bible",
      "scripture",
      "god",
      "jesus",
      "christ",
      "holy spirit",
      "church",
      "worship",
      "ministry",
      "discipleship",
      "evangelism",
    ];

    const messageLower = message.toLowerCase();
    return topicKeywords.filter((keyword) => messageLower.includes(keyword));
  }

  private extractApplicationIndicators(message: string): string[] {
    const applicationPhrases = [
      "i apply",
      "i use",
      "i practice",
      "in my life",
      "i try to",
      "i want to",
      "i need to",
      "i should",
      "i will",
      "i can",
      "practical",
      "real life",
      "everyday",
      "daily",
      "personal",
    ];

    const messageLower = message.toLowerCase();
    return applicationPhrases.filter((phrase) => messageLower.includes(phrase));
  }

  private async recordProgress(
    userId: string,
    metricType: string,
    metricValue: any
  ): Promise<void> {
    await this.supabase.from("ai_user_progress").insert({
      user_id: userId,
      metric_type: metricType,
      metric_value: metricValue,
    });
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const { data } = await this.supabase
      .from("ai_user_progress")
      .select("metric_value")
      .eq("user_id", userId)
      .eq("metric_type", "ai_chat_streak")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    return data?.metric_value?.currentStreak || 0;
  }

  private async getLatestProgress(
    userId: string,
    metricType: string
  ): Promise<any> {
    const { data } = await this.supabase
      .from("ai_user_progress")
      .select("metric_value")
      .eq("user_id", userId)
      .eq("metric_type", metricType)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    return data?.metric_value;
  }

  private async getRecentProgress(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from("ai_user_progress")
      .select("metric_type, metric_value, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(10);

    return data || [];
  }

  private async getTotalSessions(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from("ai_chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return count || 0;
  }

  private async getRecentAchievements(_userId: string): Promise<any[]> {
    // This would integrate with your existing achievements system
    // For now, return empty array
    return [];
  }

  private async checkStreakAchievements(
    userId: string,
    streak: number
  ): Promise<void> {
    // Check for streak milestones (7, 30, 100 days, etc.)
    const milestones = [7, 30, 100];
    if (milestones.includes(streak)) {
      // Award achievement
      logger.info(`User ${userId} reached ${streak}-day streak milestone`);
    }
  }

  private getDefaultEncouragement(firstName: string): string {
    const encouragements = [
      `Keep up the great work, ${firstName}! Your dedication to learning is inspiring! 🌟`,
      `I'm so proud of your progress, ${firstName}! You're growing in wisdom and understanding! 📚`,
      `Your commitment to study is amazing, ${firstName}! Keep pressing forward! 💪`,
      `You're doing wonderfully, ${firstName}! Your spiritual journey is beautiful to witness! 🙏`,
    ];

    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
}
