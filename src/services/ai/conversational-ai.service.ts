import { logger } from "../../utils/logger";
import type { UserContext } from "../../types/ai-chat.types";

/**
 * Conversational AI Service
 * Transforms the AI from robotic to conversational, engaging, and deeply personal
 */
export class ConversationalAIService {
  /**
   * Add conversational wrapper to existing AI response
   */
  async addConversationalWrapper(
    aiResponse: string,
    userContext: UserContext,
    userMessage: string,
    _conversationHistory: any[]
  ): Promise<string> {
    try {
      // 1. Analyze user's emotional state
      const emotionalState = this.analyzeEmotionalState(userMessage);

      // 2. Determine conversation tone
      const tone = this.determineTone(emotionalState, userContext);

      // 3. Add conversational elements to the existing response
      return this.addConversationalElements(
        aiResponse,
        userContext,
        emotionalState,
        tone
      );
    } catch (error) {
      logger.error("Error adding conversational wrapper:", error);
      // Return original response if enhancement fails
      return aiResponse;
    }
  }

  /**
   * Build conversational prompt addition for system prompt
   */
  buildConversationalPromptAddition(userContext: UserContext): string {
    const firstName = userContext.userProfile?.first_name || "friend";
    const currentBook = userContext.currentBook || "your current reading";
    const streak = (userContext.readingStats as any)?.current_streak || 0;

    return `## CONVERSATIONAL PERSONALITY
- You are speaking with ${firstName}
- Use their name naturally (2-3 times per response)
- Start with warm greetings: "Hey ${firstName}!", "Great question, ${firstName}!"
- End with engaging follow-up questions
- Show genuine enthusiasm and encouragement
- Reference their reading progress and achievements when relevant
- Current context: ${firstName} is reading ${currentBook}${
      streak > 0 ? ` with a ${streak}-day streak` : ""
    }
- Be conversational, not robotic or academic
- Ask follow-up questions to keep the conversation engaging
- Celebrate their progress and insights
- Show genuine interest in their spiritual journey`;
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
   * Add conversational elements to response
   */
  private addConversationalElements(
    response: string,
    userContext: UserContext,
    _emotionalState: any,
    _tone?: string
  ): string {
    // For now, just return the response with minimal enhancement
    // The main conversational personality is added via the system prompt
    // This method can be enhanced later to add more dynamic elements

    // Add a simple follow-up question if the response doesn't already have one
    const hasQuestion = response.includes("?");
    if (!hasQuestion) {
      const followUp = this.getFollowUpQuestion(userContext);
      return `${response}\n\n${followUp}`;
    }

    return response;
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
}
