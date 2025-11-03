import { z } from "zod";

// ============================================================================
// AI CHAT TYPES
// ============================================================================

export const AIChatSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  ai_version: z.enum(["study", "debate", "note-taker", "explainer", "custom"]),
  title: z.string(),
  context_book_id: z.string().nullable(),
  context_chapter: z.number().int().positive().nullable(),
  context_version_id: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string(),
});

export type AIChatSession = z.infer<typeof AIChatSessionSchema>;

export const AIChatMessageSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  formatted_content: z.record(z.string(), z.unknown()).nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  tokens_used: z.number().int().nullable(),
  created_at: z.string(),
});

export type AIChatMessage = z.infer<typeof AIChatMessageSchema>;

export const AIUserLearningProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category: z.string(),
  insight_key: z.string(),
  insight_value: z.string(),
  confidence_score: z.number().min(0).max(1),
  source: z.enum(["auto", "manual"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AIUserLearningProfile = z.infer<typeof AIUserLearningProfileSchema>;

export const AIChatContextSnapshotSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  context_type: z.enum([
    "notes",
    "highlights",
    "bookmarks",
    "reading_progress",
    "verse_interactions",
  ]),
  context_data: z.record(z.string(), z.unknown()),
  created_at: z.string(),
});

export type AIChatContextSnapshot = z.infer<typeof AIChatContextSnapshotSchema>;

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export const CreateChatSessionSchema = z.object({
  ai_version: z.enum(["study", "debate", "note-taker", "explainer", "custom"]),
  title: z.string().optional(),
  context_book_id: z.string().optional(),
  context_chapter: z.number().int().positive().optional(),
  context_version_id: z.string().optional(),
});

export type CreateChatSession = z.infer<typeof CreateChatSessionSchema>;

export const SendMessageSchema = z.object({
  content: z.string().min(1),
});

export type SendMessage = z.infer<typeof SendMessageSchema>;

export const UpdateChatSessionSchema = z.object({
  title: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateChatSession = z.infer<typeof UpdateChatSessionSchema>;

export const UpdateLearningProfileSchema = z.object({
  insight_value: z.string().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  source: z.enum(["auto", "manual"]).optional(),
});

export type UpdateLearningProfile = z.infer<typeof UpdateLearningProfileSchema>;

// ============================================================================
// AI VERSION TYPES
// ============================================================================

export const AIVersionSchema = z.enum([
  "study",
  "debate",
  "note-taker",
  "explainer",
  "custom",
]);

export type AIVersion = z.infer<typeof AIVersionSchema>;

export const AIVersionConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  personality: z.string(),
  capabilities: z.array(z.string()),
  systemPrompt: z.string(),
});

export type AIVersionConfig = z.infer<typeof AIVersionConfigSchema>;

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export const UserContextSchema = z.object({
  userId: z.string().uuid(),
  userProfile: z.record(z.string(), z.unknown()).optional(),
  currentBook: z.string().optional(),
  currentChapter: z.number().int().positive().optional(),
  currentVersion: z.string().optional(),
  notes: z.array(z.record(z.string(), z.unknown())).optional(),
  highlights: z.array(z.record(z.string(), z.unknown())).optional(),
  bookmarks: z.array(z.record(z.string(), z.unknown())).optional(),
  lovedVerses: z.array(z.record(z.string(), z.unknown())).optional(),
  readingProgress: z.record(z.string(), z.unknown()).optional(),
  readingSettings: z.record(z.string(), z.unknown()).optional(),
  readingPlan: z.record(z.string(), z.unknown()).optional(),
  readingStats: z.record(z.string(), z.unknown()).optional(),
  achievements: z.array(z.record(z.string(), z.unknown())).optional(),
  learningProfile: z.array(AIUserLearningProfileSchema).optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;

export const ConversationHistorySchema = z.object({
  messages: z.array(AIChatMessageSchema),
  totalTokens: z.number().int().optional(),
});

export type ConversationHistory = z.infer<typeof ConversationHistorySchema>;

// ============================================================================
// AI RESPONSE TYPES
// ============================================================================

export const DetailedSourceSchema = z.object({
  title: z.string(),
  author: z.string(),
  type: z.enum(["book", "commentary", "study_bible", "online_resource"]),
  url: z.string().optional(),
  description: z.string(),
  publisher: z.string().optional(),
  year: z.number().optional(),
  isbn: z.string().optional(),
  relevance: z.number().min(0).max(1),
});

export const DetailedVerseSchema = z.object({
  book: z.string(),
  chapter: z.number(),
  verse: z.number(),
  version: z.string().optional(),
  fullReference: z.string(),
  text: z.string().optional(),
  url: z.string().optional(),
});

export const AIResponseMetadataSchema = z.object({
  versesCited: z.array(z.string()).optional(),
  detailedVerses: z.array(DetailedVerseSchema).optional(),
  sourcesCited: z.array(z.string()).optional(),
  detailedSources: z.array(DetailedSourceSchema).optional(),
  crossReferences: z.array(z.string()).optional(),
  theologicalTopics: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type AIResponseMetadata = z.infer<typeof AIResponseMetadataSchema>;

export const FormattedContentSchema = z.object({
  text: z.string(),
  format: z.enum(["markdown", "html", "plain"]),
  sections: z
    .array(
      z.object({
        type: z.string(),
        content: z.string(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .optional(),
});

export type FormattedContent = z.infer<typeof FormattedContentSchema>;

// ============================================================================
// LEARNING INSIGHTS TYPES
// ============================================================================

export const LearningInsightSchema = z.object({
  category: z.string(),
  insightKey: z.string(),
  insightValue: z.string(),
  confidenceScore: z.number().min(0).max(1),
  evidence: z.array(z.string()).optional(),
});

export type LearningInsight = z.infer<typeof LearningInsightSchema>;

export const UserInsightsSchema = z.object({
  theologicalPreference: z.array(LearningInsightSchema).optional(),
  studyStyle: z.array(LearningInsightSchema).optional(),
  questionPatterns: z.array(LearningInsightSchema).optional(),
  interests: z.array(LearningInsightSchema).optional(),
});

export type UserInsights = z.infer<typeof UserInsightsSchema>;

// ============================================================================
// LEARNING PLANS TYPES
// ============================================================================

export const AILearningPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  topic: z.string(),
  description: z.string().nullable(),
  user_level: z.enum(["beginner", "intermediate", "advanced"]),
  total_sessions: z.number().int().positive(),
  completed_sessions: z.number().int().nonnegative(),
  status: z.enum(["active", "completed", "paused", "cancelled"]),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
});

export type AILearningPlan = z.infer<typeof AILearningPlanSchema>;

// Learning Sessions Types
export const AILearningSessionSchema = z.object({
  id: z.string().uuid(),
  learning_plan_id: z.string().uuid(),
  session_number: z.number().int().positive(),
  title: z.string(),
  objectives: z.array(z.string()),
  content_outline: z.record(z.string(), z.unknown()).nullable(),
  is_completed: z.boolean(),
  completed_at: z.string().nullable(),
  notes: z.string().nullable(),
  chat_session_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AILearningSession = z.infer<typeof AILearningSessionSchema>;

// User Progress Types
export const AIUserProgressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  metric_type: z.string(),
  metric_value: z.record(z.string(), z.unknown()),
  recorded_at: z.string(),
  created_at: z.string(),
});

export type AIUserProgress = z.infer<typeof AIUserProgressSchema>;

// AI Goals Types
export const AIUserGoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  goal_type: z.enum([
    "daily_chat",
    "weekly_sessions",
    "monthly_plans",
    "topic_mastery",
    "custom",
  ]),
  goal_target: z.record(z.string(), z.unknown()),
  current_progress: z.record(z.string(), z.unknown()),
  status: z.enum(["active", "completed", "failed", "paused"]),
  start_date: z.string(),
  end_date: z.string().nullable(),
  completed_at: z.string().nullable(),
  reward_xp: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AIUserGoal = z.infer<typeof AIUserGoalSchema>;

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

export const CreateLearningPlanSchema = z.object({
  topic: z.string().min(1).max(255),
  user_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  total_sessions: z.number().int().positive().optional(),
});

export type CreateLearningPlan = z.infer<typeof CreateLearningPlanSchema>;

export const UpdateLearningPlanSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
});

export type UpdateLearningPlan = z.infer<typeof UpdateLearningPlanSchema>;

export const UpdateLearningSessionSchema = z.object({
  is_completed: z.boolean().optional(),
  notes: z.string().optional(),
});

export type UpdateLearningSession = z.infer<typeof UpdateLearningSessionSchema>;

export const CreateAIGoalSchema = z.object({
  goal_type: z.enum([
    "daily_chat",
    "weekly_sessions",
    "monthly_plans",
    "topic_mastery",
    "custom",
  ]),
  goal_target: z.record(z.string(), z.unknown()),
  end_date: z.string().optional(),
  reward_xp: z.number().int().nonnegative().optional(),
});

export type CreateAIGoal = z.infer<typeof CreateAIGoalSchema>;

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export const DashboardSummarySchema = z.object({
  user: z.object({
    firstName: z.string(),
    level: z.number(),
    xp: z.number(),
    xpToNextLevel: z.number(),
    streak: z.number(),
  }),
  learningPlans: z.object({
    active: z.number(),
    completed: z.number(),
    totalSessions: z.number(),
    completedSessions: z.number(),
  }),
  recentActivity: z.array(
    z.object({
      type: z.string(),
      timestamp: z.string(),
      data: z.record(z.string(), z.unknown()),
    })
  ),
  achievements: z.object({
    total: z.number(),
    recent: z.array(z.unknown()),
  }),
  goals: z.object({
    active: z.array(AIUserGoalSchema),
    progress: z.record(z.string(), z.unknown()),
  }),
  stats: z.object({
    totalChatMessages: z.number(),
    totalPlansCompleted: z.number(),
    favoriteTopics: z.array(z.string()),
  }),
});

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
