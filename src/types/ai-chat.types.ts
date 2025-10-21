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
