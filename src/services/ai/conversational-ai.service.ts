import { logger } from "../../utils/logger";
import type { UserContext } from "../../types/ai-chat.types";

/**
 * Conversational AI Service
 * Transforms the AI from robotic to conversational, engaging, and deeply personal
 */
export class ConversationalAIService {
  /**
   * Generate engaging, conversational response
   */
  async generateEngagingResponse(
    userMessage: string,
    userContext: UserContext,
    conversationHistory: any[]
  ): Promise<string> {
    try {
      // 1. Analyze user's emotional state
      const emotionalState = this.analyzeEmotionalState(userMessage);

      // 2. Determine conversation tone
      const tone = this.determineTone(emotionalState, userContext);

      // 3. Generate personalized response
      const response = await this.generatePersonalizedResponse(
        userMessage,
        userContext,
        tone,
        conversationHistory
      );

      // 4. Add conversational elements
      return this.addConversationalElements(
        response,
        userContext,
        emotionalState
      );
    } catch (error) {
      logger.error("Error generating engaging response:", error);
      throw error;
    }
  }

  /**
   * Create personalized learning plan
   */
  async createLearningPlan(
    topic: string,
    userContext: UserContext,
    _userLevel: "beginner" | "intermediate" | "advanced" = "beginner"
  ): Promise<string> {
    const firstName =
      (userContext.userProfile?.first_name as string) || "friend";
    const currentBook = userContext.currentBook || "your current reading";

    const plan = `
Hey ${firstName}! 🌟

I'm SO excited you want to learn about ${topic}! This is going to be an amazing journey together. 

Here's what we're going to explore:
📚 We'll start with the basics and build up
🤔 I'll ask you questions to help you think deeper
💡 We'll connect it to your current reading in ${currentBook}
🎯 You'll have practical takeaways you can apply

Ready to dive in? Let's start with the first session!

**Session 1: Understanding the Basics**
- What is ${topic}?
- Why is it important?
- How does it connect to your faith?

**Session 2: Going Deeper**
- Key concepts and principles
- Biblical foundations
- Real-world applications

**Session 3: Personal Application**
- How this applies to your life
- Practical next steps
- Continued growth

What do you think? Ready to start with Session 1? I'm here to guide you every step of the way! 🤗
    `;

    return plan;
  }

  /**
   * Generate follow-up questions to keep conversation engaging
   */
  generateFollowUpQuestions(
    userResponse: string,
    topic: string,
    userContext: UserContext
  ): string[] {
    const firstName =
      (userContext.userProfile?.first_name as string) || "friend";

    const questions = [
      `That's really insightful, ${firstName}! What made you think of that?`,
      `I love your perspective! Have you experienced this in your own life?`,
      `That's a great connection! How does this relate to what you're reading in ${userContext.currentBook}?`,
      `You're really getting it! What questions do you still have?`,
      `That shows great understanding! What would you like to explore next?`,
      `I can see you're really growing! How does this connect to your faith journey?`,
      `That's a beautiful insight! How can we apply this practically?`,
      `You're asking exactly the right questions! What's your experience with this?`,
    ];

    return this.selectRelevantQuestions(questions, userResponse, topic);
  }

  /**
   * Generate encouragement based on user progress
   */
  generateEncouragement(userProgress: any, userContext: UserContext): string {
    const firstName =
      (userContext.userProfile?.first_name as string) || "friend";

    if (userProgress.streakDays > 7) {
      return `Wow ${firstName}! ${userProgress.streakDays} days in a row - you're on fire! 🔥 Your dedication is inspiring!`;
    } else if (userProgress.streakDays > 3) {
      return `You're doing great, ${firstName}! ${userProgress.streakDays} days strong - keep it up! 💪`;
    } else if (userProgress.streakDays > 0) {
      return `I'm so proud of you for taking this step, ${firstName}! Every journey begins with a single step! 🌟`;
    } else {
      return `I'm so excited you're here, ${firstName}! Let's start this amazing journey together! 🚀`;
    }
  }

  /**
   * Analyze user's emotional state from their message
   */
  private analyzeEmotionalState(message: string): {
    excitement: number;
    confusion: number;
    curiosity: number;
    frustration: number;
    joy: number;
  } {
    const excitementWords = [
      "excited",
      "amazing",
      "wow",
      "awesome",
      "fantastic",
    ];
    const confusionWords = [
      "confused",
      "don't understand",
      "unclear",
      "lost",
      "help",
    ];
    const curiosityWords = [
      "wonder",
      "curious",
      "interested",
      "want to know",
      "explore",
    ];
    const frustrationWords = [
      "frustrated",
      "difficult",
      "hard",
      "struggling",
      "stuck",
    ];
    const joyWords = ["happy", "joyful", "blessed", "grateful", "thankful"];

    const excitement = this.countWords(message, excitementWords);
    const confusion = this.countWords(message, confusionWords);
    const curiosity = this.countWords(message, curiosityWords);
    const frustration = this.countWords(message, frustrationWords);
    const joy = this.countWords(message, joyWords);

    return { excitement, confusion, curiosity, frustration, joy };
  }

  /**
   * Determine appropriate tone based on emotional state and context
   */
  private determineTone(
    emotionalState: any,
    userContext: UserContext
  ): "enthusiastic" | "gentle" | "encouraging" | "scholarly" | "pastoral" {
    if (emotionalState.frustration > 0.5) {
      return "gentle";
    } else if (emotionalState.excitement > 0.5) {
      return "enthusiastic";
    } else if (emotionalState.confusion > 0.5) {
      return "encouraging";
    } else if ((userContext.readingStats as any)?.currentLevel > 5) {
      return "scholarly";
    } else {
      return "pastoral";
    }
  }

  /**
   * Generate personalized response based on tone and context
   */
  private async generatePersonalizedResponse(
    userMessage: string,
    userContext: UserContext,
    tone: string,
    _conversationHistory: any[]
  ): Promise<string> {
    const firstName =
      (userContext.userProfile?.first_name as string) || "friend";

    // Base response from existing AI system
    const baseResponse = await this.getBaseAIResponse(userMessage, userContext);

    // Add conversational elements based on tone
    switch (tone) {
      case "enthusiastic":
        return this.addEnthusiasm(baseResponse, firstName);
      case "gentle":
        return this.addGentleness(baseResponse, firstName);
      case "encouraging":
        return this.addEncouragement(baseResponse, firstName);
      case "scholarly":
        return this.addScholarlyTone(baseResponse, firstName);
      case "pastoral":
        return this.addPastoralCare(baseResponse, firstName);
      default:
        return baseResponse;
    }
  }

  /**
   * Add conversational elements to response
   */
  private addConversationalElements(
    response: string,
    userContext: UserContext,
    emotionalState: any
  ): string {
    const firstName =
      (userContext.userProfile?.first_name as string) || "friend";

    // Add personalized greeting
    const greeting = this.getPersonalizedGreeting(firstName, userContext);

    // Add encouragement
    const encouragement = this.getEncouragement(emotionalState, firstName);

    // Add follow-up question
    const followUp = this.getFollowUpQuestion(userContext);

    // Combine elements
    return `${greeting}\n\n${response}\n\n${encouragement}\n\n${followUp}`;
  }

  /**
   * Get personalized greeting
   */
  private getPersonalizedGreeting(
    firstName: string,
    userContext: UserContext
  ): string {
    const currentBook = userContext.currentBook || "your current reading";
    const streak = (userContext.readingStats as any)?.currentStreak || 0;

    const greetings = [
      `Hey ${firstName}! Great to see you again! 👋`,
      `Hi ${firstName}! I've been thinking about our last conversation...`,
      `Welcome back, ${firstName}! Ready to dive deeper?`,
      `Hey ${firstName}! How's your study of ${currentBook} going?`,
      `Hi ${firstName}! I'm excited to continue our journey together!`,
    ];

    if (streak > 0) {
      return `Hey ${firstName}! I see you're on a ${streak}-day streak - that's amazing! 🔥`;
    }

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Get encouragement based on emotional state
   */
  private getEncouragement(emotionalState: any, firstName: string): string {
    if (emotionalState.frustration > 0.5) {
      return `Don't worry, ${firstName}! I'm here to help you understand this step by step. 🤗`;
    } else if (emotionalState.excitement > 0.5) {
      return `I love your enthusiasm, ${firstName}! Your curiosity is inspiring! 🌟`;
    } else if (emotionalState.confusion > 0.5) {
      return `I can see you're really thinking about this, ${firstName}! That's exactly what we want! 🤔`;
    } else {
      return `I love your heart for learning, ${firstName}! You're asking exactly the right questions! 💡`;
    }
  }

  /**
   * Get follow-up question
   */
  private getFollowUpQuestion(userContext: UserContext): string {
    const firstName =
      (userContext.userProfile?.first_name as string) || "friend";
    const currentBook = userContext.currentBook || "your current reading";

    const followUps = [
      `What do you think about that, ${firstName}?`,
      `How does that connect to your life, ${firstName}?`,
      `What questions does that raise for you, ${firstName}?`,
      `How can we apply this practically, ${firstName}?`,
      `What's your experience with this, ${firstName}?`,
      `How does this relate to what you're reading in ${currentBook}, ${firstName}?`,
    ];

    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  /**
   * Add enthusiasm to response
   */
  private addEnthusiasm(response: string, firstName: string): string {
    return `I'm SO excited you're asking about this, ${firstName}! This is going to be amazing! 🚀\n\n${response}\n\nReady to dive deeper? I can't wait to explore this with you! 🤗`;
  }

  /**
   * Add gentleness to response
   */
  private addGentleness(response: string, firstName: string): string {
    return `I understand this might feel overwhelming, ${firstName}. Let me walk you through this gently, step by step. 🤗\n\n${response}\n\nTake your time with this, ${firstName}. I'm here to help you understand. 💙`;
  }

  /**
   * Add encouragement to response
   */
  private addEncouragement(response: string, firstName: string): string {
    return `You're doing great, ${firstName}! I can see you're really growing in your understanding! 🌟\n\n${response}\n\nKeep asking questions, ${firstName}! That's how we learn and grow! 💪`;
  }

  /**
   * Add scholarly tone to response
   */
  private addScholarlyTone(response: string, firstName: string): string {
    return `Excellent question, ${firstName}! This is a fascinating topic that has been studied for centuries. 📚\n\n${response}\n\nWhat aspects of this would you like to explore further, ${firstName}?`;
  }

  /**
   * Add pastoral care to response
   */
  private addPastoralCare(response: string, firstName: string): string {
    return `I'm so glad you're exploring this, ${firstName}. This is such an important part of your faith journey. 🙏\n\n${response}\n\nHow is this speaking to your heart, ${firstName}? Let's pray about this together. 💙`;
  }

  /**
   * Select relevant questions based on user response and topic
   */
  private selectRelevantQuestions(
    questions: string[],
    userResponse: string,
    topic: string
  ): string[] {
    // Simple relevance scoring - in production, use more sophisticated NLP
    const relevantQuestions = questions.filter((question) => {
      const questionWords = question.toLowerCase().split(" ");
      const responseWords = userResponse.toLowerCase().split(" ");
      const topicWords = topic.toLowerCase().split(" ");

      const commonWords = questionWords.filter(
        (word) => responseWords.includes(word) || topicWords.includes(word)
      );

      return commonWords.length > 0;
    });

    return relevantQuestions.slice(0, 3); // Return top 3 relevant questions
  }

  /**
   * Count words in message
   */
  private countWords(message: string, words: string[]): number {
    const messageWords = message.toLowerCase().split(" ");
    return words.filter((word) => messageWords.includes(word.toLowerCase()))
      .length;
  }

  /**
   * Get base AI response (placeholder - integrate with existing AI system)
   */
  private async getBaseAIResponse(
    _userMessage: string,
    _userContext: UserContext
  ): Promise<string> {
    // This would integrate with your existing AI chat service
    // For now, return a placeholder
    return "This is where the base AI response would go. In production, this would call your existing AI chat service.";
  }
}
