import { getSupabaseClient } from "../../config/supabase";
import { getOpenAIClient } from "../../config/openai";
import { logger } from "../../utils/logger";
import type {
  UserContext,
  AILearningPlan,
  AILearningSession,
  UpdateLearningPlan,
  UpdateLearningSession,
} from "../../types/ai-chat.types";

/**
 * Learning Journey Service
 * Manages AI-generated learning plans and sessions
 */
export class LearningJourneyService {
  private supabase = getSupabaseClient();
  private openai = getOpenAIClient();

  /**
   * Create a personalized study plan using AI
   */
  async createPersonalizedStudyPlan(
    userId: string,
    topic: string,
    userLevel: "beginner" | "intermediate" | "advanced" = "beginner",
    userContext: UserContext,
    totalSessions: number = 3
  ): Promise<{ plan: AILearningPlan; sessions: AILearningSession[] }> {
    try {
      // Generate plan title and description using AI
      const planDetails = await this.generatePlanDetails(
        topic,
        userLevel,
        userContext
      );

      // Create the learning plan
      const { data: plan, error: planError } = await this.supabase
        .from("ai_learning_plans")
        .insert({
          user_id: userId,
          title: planDetails.title,
          topic,
          description: planDetails.description,
          user_level: userLevel,
          total_sessions: totalSessions,
        })
        .select()
        .single();

      if (planError) {
        logger.error("Error creating learning plan:", planError);
        throw new Error("Failed to create learning plan");
      }

      // Generate sessions using AI
      const sessions = await this.generateSessions(
        plan.id,
        topic,
        userLevel,
        totalSessions,
        userContext
      );

      return { plan, sessions };
    } catch (error) {
      logger.error("Error creating personalized study plan:", error);
      throw error;
    }
  }

  /**
   * Get user's learning plans
   */
  async getUserLearningPlans(
    userId: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ plans: AILearningPlan[]; total: number }> {
    try {
      let query = this.supabase
        .from("ai_learning_plans")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data: plans, error, count } = await query;

      if (error) {
        logger.error("Error fetching learning plans:", error);
        throw new Error("Failed to fetch learning plans");
      }

      return {
        plans: plans || [],
        total: count || 0,
      };
    } catch (error) {
      logger.error("Error getting user learning plans:", error);
      throw error;
    }
  }

  /**
   * Get a specific learning plan with sessions
   */
  async getLearningPlan(
    planId: string,
    userId: string
  ): Promise<{
    plan: AILearningPlan;
    sessions: AILearningSession[];
    progress: {
      completedSessions: number;
      totalSessions: number;
      percentage: number;
    };
  }> {
    try {
      // Get the plan
      const { data: plan, error: planError } = await this.supabase
        .from("ai_learning_plans")
        .select("*")
        .eq("id", planId)
        .eq("user_id", userId)
        .single();

      if (planError) {
        logger.error("Error fetching learning plan:", planError);
        throw new Error("Learning plan not found");
      }

      // Get sessions
      const { data: sessions, error: sessionsError } = await this.supabase
        .from("ai_learning_sessions")
        .select("*")
        .eq("learning_plan_id", planId)
        .order("session_number", { ascending: true });

      if (sessionsError) {
        logger.error("Error fetching learning sessions:", sessionsError);
        throw new Error("Failed to fetch learning sessions");
      }

      const completedSessions =
        sessions?.filter((s) => s.is_completed).length || 0;
      const totalSessions = sessions?.length || 0;
      const percentage =
        totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0;

      return {
        plan,
        sessions: sessions || [],
        progress: {
          completedSessions,
          totalSessions,
          percentage,
        },
      };
    } catch (error) {
      logger.error("Error getting learning plan:", error);
      throw error;
    }
  }

  /**
   * Update a learning plan
   */
  async updateLearningPlan(
    planId: string,
    userId: string,
    updates: UpdateLearningPlan
  ): Promise<AILearningPlan> {
    try {
      const { data: plan, error } = await this.supabase
        .from("ai_learning_plans")
        .update(updates)
        .eq("id", planId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        logger.error("Error updating learning plan:", error);
        throw new Error("Failed to update learning plan");
      }

      return plan;
    } catch (error) {
      logger.error("Error updating learning plan:", error);
      throw error;
    }
  }

  /**
   * Delete a learning plan
   */
  async deleteLearningPlan(planId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("ai_learning_plans")
        .delete()
        .eq("id", planId)
        .eq("user_id", userId);

      if (error) {
        logger.error("Error deleting learning plan:", error);
        throw new Error("Failed to delete learning plan");
      }
    } catch (error) {
      logger.error("Error deleting learning plan:", error);
      throw error;
    }
  }

  /**
   * Complete a learning session
   */
  async completeSession(
    sessionId: string,
    userId: string,
    updates: UpdateLearningSession
  ): Promise<AILearningSession> {
    try {
      // Verify the session belongs to the user
      const { data: _session, error: sessionError } = await this.supabase
        .from("ai_learning_sessions")
        .select(
          `
          *,
          ai_learning_plans!inner(user_id)
        `
        )
        .eq("id", sessionId)
        .eq("ai_learning_plans.user_id", userId)
        .single();

      if (sessionError) {
        logger.error("Error verifying session ownership:", sessionError);
        throw new Error("Session not found or access denied");
      }

      // Update the session
      const { data: updatedSession, error: updateError } = await this.supabase
        .from("ai_learning_sessions")
        .update({
          ...updates,
          completed_at: updates.is_completed ? new Date().toISOString() : null,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (updateError) {
        logger.error("Error updating session:", updateError);
        throw new Error("Failed to update session");
      }

      return updatedSession;
    } catch (error) {
      logger.error("Error completing session:", error);
      throw error;
    }
  }

  /**
   * Get next session in a plan
   */
  async getNextSession(
    planId: string,
    userId: string
  ): Promise<AILearningSession | null> {
    try {
      const { data: session, error } = await this.supabase
        .from("ai_learning_sessions")
        .select(
          `
          *,
          ai_learning_plans!inner(user_id)
        `
        )
        .eq("learning_plan_id", planId)
        .eq("ai_learning_plans.user_id", userId)
        .eq("is_completed", false)
        .order("session_number", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error("Error fetching next session:", error);
        throw new Error("Failed to fetch next session");
      }

      return session || null;
    } catch (error) {
      logger.error("Error getting next session:", error);
      throw error;
    }
  }

  // Private helper methods

  private async generatePlanDetails(
    topic: string,
    userLevel: string,
    userContext: UserContext
  ): Promise<{ title: string; description: string }> {
    const firstName = userContext.userProfile?.first_name || "friend";
    const currentBook = userContext.currentBook || "your current reading";

    const prompt = `Generate a personalized learning plan for ${firstName} who wants to learn about "${topic}".

User Level: ${userLevel}
Current Reading: ${currentBook}

Please generate:
1. An engaging title (max 100 characters)
2. A motivating description (max 500 characters) that explains what they'll learn and why it's important

Make it personal and encouraging, referencing their current study context.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that creates engaging, personalized learning plan titles and descriptions for biblical study.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      const lines = content.split("\n").filter((line) => line.trim());

      return {
        title:
          lines[0]?.replace(/^[0-9]+\.\s*/, "").trim() || `Learning ${topic}`,
        description:
          lines[1]?.replace(/^[0-9]+\.\s*/, "").trim() ||
          `A comprehensive study of ${topic}`,
      };
    } catch (error) {
      logger.error("Error generating plan details:", error);
      return {
        title: `Learning ${topic}`,
        description: `A comprehensive study of ${topic} tailored for ${userLevel} level learners.`,
      };
    }
  }

  private async generateSessions(
    planId: string,
    topic: string,
    userLevel: string,
    totalSessions: number,
    userContext: UserContext
  ): Promise<AILearningSession[]> {
    const firstName = userContext.userProfile?.first_name || "friend";

    const prompt = `Create ${totalSessions} learning sessions for studying "${topic}" at ${userLevel} level.

For each session, provide:
1. Session title (engaging and specific)
2. 3-5 learning objectives
3. Brief content outline (what will be covered)

Make it progressive - each session should build on the previous one.
Make it personal and encouraging for ${firstName}.

Format as JSON array with objects containing: title, objectives (array), content_outline (object).`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert biblical educator. Create structured, progressive learning sessions that build knowledge systematically.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      const sessionsData = JSON.parse(content);

      // Create sessions in database
      const sessions: AILearningSession[] = [];
      for (let i = 0; i < sessionsData.length; i++) {
        const sessionData = sessionsData[i];
        const { data: session, error } = await this.supabase
          .from("ai_learning_sessions")
          .insert({
            learning_plan_id: planId,
            session_number: i + 1,
            title: sessionData.title,
            objectives: sessionData.objectives,
            content_outline: sessionData.content_outline,
          })
          .select()
          .single();

        if (error) {
          logger.error("Error creating session:", error);
          continue;
        }

        sessions.push(session);
      }

      return sessions;
    } catch (error) {
      logger.error("Error generating sessions:", error);
      // Fallback: create basic sessions
      return this.createFallbackSessions(planId, topic, totalSessions);
    }
  }

  private async createFallbackSessions(
    planId: string,
    topic: string,
    totalSessions: number
  ): Promise<AILearningSession[]> {
    const sessions: AILearningSession[] = [];

    for (let i = 1; i <= totalSessions; i++) {
      const { data: session, error } = await this.supabase
        .from("ai_learning_sessions")
        .insert({
          learning_plan_id: planId,
          session_number: i,
          title: `Session ${i}: ${topic} - Part ${i}`,
          objectives: [
            `Understand key concepts of ${topic}`,
            `Apply learning to personal faith`,
            `Connect to biblical foundations`,
          ],
          content_outline: {
            introduction: `Introduction to ${topic}`,
            main_content: `Deep dive into ${topic} concepts`,
            application: `Practical application`,
            conclusion: `Summary and next steps`,
          },
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating fallback session:", error);
        continue;
      }

      sessions.push(session);
    }

    return sessions;
  }
}
