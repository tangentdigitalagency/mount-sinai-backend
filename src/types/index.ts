/**
 * Central export file for all TypeScript types
 *
 * This file re-exports all types from domain-specific files
 * for easy importing throughout the application.
 */

// User types
export * from "./userTypes";

// API request/response types
export * from "./api.types";

// Query parameter types
export * from "./query-params.types";

// Type guards and utilities
export * from "./type-guards";

// Re-export commonly used types for convenience

// User types
export type { User, CreateUser, UpdateUser } from "./userTypes";

// Bible reading types
export type {
  BibleReadingProgress,
  UpdateBibleReadingProgress,
} from "./bibleReadingTypes";

export type {
  BibleReadingSettings,
  UpdateBibleReadingSettings,
} from "./bibleReadingSettingsType";

export type {
  ReaderPreferences,
  UpdateReaderPreferences,
} from "./readerPreferencesSettings";

export type {
  VerseBookmark,
  VerseLove,
  VerseHighlight,
  VerseCrossReference,
  CreateVerseBookmark,
  CreateVerseLove,
  CreateVerseHighlight,
  CreateVerseCrossReference,
} from "./verseInteractionsTypes";

export type {
  BibleNote,
  CreateBibleNote,
  UpdateBibleNote,
  NoteVerseReference,
  CreateNoteVerseReference,
} from "./bibleNotesType";

export type { Tag, CreateTag, NoteTag } from "./notesTagTypes";

export type {
  UserReadingPlan,
  CreateUserReadingPlan,
  UpdateUserReadingPlan,
  ReadingPlan,
  ReadingPlanDailyProgress,
  ReadingPlanChapterProgress,
  ReadingPlanTemplate,
  BibleChapterCompletion,
  CreateBibleChapterCompletion,
} from "./readingPlanTypes";

export type {
  ReadingAchievement,
  UserAchievement,
  UserReadingStats,
  UpdateUserReadingStats,
} from "./gamificationTypes";

export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  VerseReference,
  ChapterReference,
} from "./api.types";
