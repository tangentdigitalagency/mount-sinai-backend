# AI Chat Personalization System

## Overview

The AI Chat system can be highly personalized using the extensive user data available in the database. This document outlines how to leverage all available user information to create deeply personalized AI interactions.

## Available User Data Sources

### 👤 **User Profile Information**
- **Name**: `first_name`, `last_name`, `username`
- **Demographics**: `gender`, `birth_date`, `address` (city, state, zipcode)
- **Profile**: `profile_picture_url`, `avatar_config`, `avatar_type`
- **Onboarding**: `onboarding_completed`

### 📖 **Current Reading Context**
- **Current Book**: `bible_reading_progress.book_name`
- **Current Chapter**: `bible_reading_progress.current_chapter`
- **Current Verse**: `bible_reading_progress.current_verse`
- **Bible Version**: `bible_reading_progress.version_abbreviation`
- **Reading Language**: `bible_reading_progress.language`
- **Progress**: `book_progress_percentage`, `chapters_completed`
- **Last Read**: `last_read_at`

### 📚 **Reading Plans & Goals**
- **Active Plan**: `user_reading_plans.enabled`
- **Plan Progress**: `current_day`, `completed_days`, `plan_duration`
- **Daily Reminder**: `daily_reminder`, `reminder_time`
- **Plan Type**: `sections` (OT+NT, OT, NT, etc.)

### 🎯 **Study Preferences**
- **Preferred Version**: `bible_reading_settings.preferred_version_abbreviation`
- **Audio Settings**: `auto_play_audio`, `audio_speed`
- **Display Settings**: `font_size`, `reading_mode`
- **Reader Preferences**: `font_family`, `line_height`, `color_theme`, `column_width`

### 📝 **Study History & Notes**
- **Notes**: `bible_notes.title`, `bible_notes.content`, `bible_notes.tags`
- **Note Tags**: `tags.name`, `tags.color`
- **Verse References**: `note_verse_references` (book, chapter, verse, text)
- **Study Topics**: Extracted from note content and tags

### 🎨 **Verse Interactions**
- **Highlights**: `verse_highlights` (book, chapter, verse, color, category, notes)
- **Bookmarks**: `verse_bookmarks` (book, chapter, verse, text, version)
- **Loved Verses**: `verse_loves` (book, chapter, verse, text, version)
- **Cross References**: `verse_cross_references` (relationships, notes)

### 🏆 **Achievements & Progress**
- **Reading Stats**: `user_reading_stats` (XP, level, streak, total days)
- **Achievements**: `user_achievements` (unlocked achievements)
- **Chapter Completions**: `bible_chapter_completions` (reading history)
- **Weekly Goals**: `weekly_goal`, `current_week_days`

### 🤖 **AI Learning Profile**
- **Question Patterns**: `ai_user_learning_profiles` (common question types)
- **Theological Interests**: Primary theological topics and interests
- **Study Style**: Preferred approach (concise, detailed, etc.)
- **Confidence Scores**: AI confidence in user preferences

## Enhanced Context Builder

### Current Implementation
The existing `ContextBuilderService` already gathers some user data, but we can significantly enhance it:

```typescript
// Enhanced User Context Interface
interface EnhancedUserContext {
  // Basic Profile
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    gender?: string;
    age?: number;
  };
  
  // Current Reading
  currentReading: {
    book: string;
    chapter: number;
    verse: number;
    version: string;
    progress: number;
    lastReadAt: string;
  };
  
  // Reading Plan
  readingPlan: {
    enabled: boolean;
    currentDay: number;
    completedDays: number;
    totalDays: number;
    planType: string;
    reminderTime?: string;
  };
  
  // Study Preferences
  preferences: {
    preferredVersion: string;
    audioSettings: {
      autoPlay: boolean;
      speed: number;
    };
    displaySettings: {
      fontSize: string;
      readingMode: string;
      fontFamily: string;
      colorTheme: string;
    };
  };
  
  // Study History
  studyHistory: {
    notes: Array<{
      title: string;
      content: any;
      tags: string[];
      createdAt: string;
    }>;
    highlights: Array<{
      book: string;
      chapter: number;
      verse: number;
      color: string;
      category?: string;
      notes?: string;
    }>;
    bookmarks: Array<{
      book: string;
      chapter: number;
      verse: number;
      text: string;
      version: string;
    }>;
    lovedVerses: Array<{
      book: string;
      chapter: number;
      verse: number;
      text: string;
      version: string;
    }>;
  };
  
  // Progress & Achievements
  progress: {
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    totalReadingDays: number;
    chaptersRead: number;
    plansCompleted: number;
    achievementsUnlocked: number;
  };
  
  // AI Learning Profile
  aiProfile: {
    questionPatterns: string[];
    theologicalInterests: string[];
    studyStyle: string;
    confidenceScores: Record<string, number>;
  };
}
```

## Personalized AI Prompts

### Enhanced System Prompts

```typescript
// Personalized System Prompt Builder
class PersonalizedPromptBuilder {
  buildPersonalizedPrompt(
    aiVersion: AIVersion,
    userContext: EnhancedUserContext,
    sessionContext: AIChatSession
  ): string {
    const basePrompt = this.getBasePrompt(aiVersion);
    
    return `
${basePrompt}

## PERSONAL CONTEXT
You are speaking with ${userContext.user.firstName} ${userContext.user.lastName} (@${userContext.user.username}).

### Current Reading
${userContext.user.firstName} is currently reading ${userContext.currentReading.book} ${userContext.currentReading.chapter}:${userContext.currentReading.verse} in the ${userContext.currentReading.version} version. They are ${userContext.currentReading.progress}% through the book.

### Reading Plan
${userContext.readingPlan.enabled ? 
  `${userContext.user.firstName} is on day ${userContext.readingPlan.currentDay} of a ${userContext.readingPlan.totalDays}-day reading plan. They have completed ${userContext.readingPlan.completedDays} days so far.` :
  `${userContext.user.firstName} is reading freely without a structured plan.`
}

### Study Preferences
- Preferred Bible version: ${userContext.preferences.preferredVersion}
- Study style: ${userContext.aiProfile.studyStyle}
- Primary interests: ${userContext.aiProfile.theologicalInterests.join(', ')}

### Recent Study Activity
${this.buildStudyActivitySummary(userContext.studyHistory)}

### Reading Progress
- Current level: ${userContext.progress.currentLevel}
- Reading streak: ${userContext.progress.currentStreak} days
- Total chapters read: ${userContext.progress.chaptersRead}
- Achievements unlocked: ${userContext.progress.achievementsUnlocked}

### Personalization Instructions
1. Use ${userContext.user.firstName}'s name naturally in conversation
2. Reference their current reading (${userContext.currentReading.book} ${userContext.currentReading.chapter})
3. Acknowledge their study interests: ${userContext.aiProfile.theologicalInterests.slice(0, 3).join(', ')}
4. Consider their preferred study style: ${userContext.aiProfile.studyStyle}
5. Reference their recent notes and highlights when relevant
6. Encourage their reading progress and achievements
7. Use their preferred Bible version (${userContext.preferences.preferredVersion}) for references
`;
  }
}
```

## Personalized Greeting Messages

### Dynamic Greeting System

```typescript
class PersonalizedGreetingBuilder {
  buildPersonalizedGreeting(
    userContext: EnhancedUserContext,
    sessionContext: AIChatSession
  ): string {
    const { user, currentReading, readingPlan, progress } = userContext;
    
    // Time-based greeting
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    // Reading progress acknowledgment
    const progressMessage = this.getProgressMessage(progress, readingPlan);
    
    // Current reading context
    const readingContext = this.getReadingContext(currentReading, sessionContext);
    
    return `
${timeGreeting}, ${user.firstName}! 👋

${readingContext}

${progressMessage}

I'm here to help you with your study of ${currentReading.book} ${currentReading.chapter} or any other theological questions you might have. What would you like to explore today?
`;
  }
  
  private getProgressMessage(progress: any, readingPlan: any): string {
    if (readingPlan.enabled) {
      return `I see you're on day ${readingPlan.currentDay} of your ${readingPlan.totalDays}-day reading plan. Keep up the great work!`;
    } else if (progress.currentStreak > 0) {
      return `Amazing! You have a ${progress.currentStreak}-day reading streak going. That's dedication!`;
    } else {
      return `I'm excited to help you dive deeper into God's Word today.`;
    }
  }
  
  private getReadingContext(currentReading: any, sessionContext: any): string {
    if (sessionContext.context_book_id && sessionContext.context_chapter) {
      return `I notice you're currently reading ${currentReading.book} ${currentReading.chapter}:${currentReading.verse} in the ${currentReading.version} version.`;
    } else {
      return `I see you're currently in ${currentReading.book} ${currentReading.chapter}:${currentReading.verse} in the ${currentReading.version} version.`;
    }
  }
}
```

## Context-Aware Responses

### Study History Integration

```typescript
class StudyHistoryIntegrator {
  integrateStudyHistory(
    userContext: EnhancedUserContext,
    currentQuestion: string
  ): string {
    const { studyHistory } = userContext;
    
    // Find relevant notes
    const relevantNotes = this.findRelevantNotes(studyHistory.notes, currentQuestion);
    
    // Find related highlights
    const relatedHighlights = this.findRelatedHighlights(studyHistory.highlights, currentQuestion);
    
    // Find bookmarked verses
    const relevantBookmarks = this.findRelevantBookmarks(studyHistory.bookmarks, currentQuestion);
    
    return `
## RELEVANT STUDY HISTORY

### Previous Notes
${relevantNotes.map(note => `- "${note.title}": ${this.extractNoteSummary(note.content)}`).join('\n')}

### Related Highlights
${relatedHighlights.map(highlight => `- ${highlight.book} ${highlight.chapter}:${highlight.verse} (${highlight.color})`).join('\n')}

### Bookmarked Verses
${relevantBookmarks.map(bookmark => `- ${bookmark.book} ${bookmark.chapter}:${bookmark.verse}`).join('\n')}

Use this context to provide more personalized and relevant responses.
`;
  }
}
```

## Implementation in Chat Service

### Enhanced Context Building

```typescript
// Enhanced ChatService method
private async buildEnhancedUserContext(userId: string): Promise<EnhancedUserContext> {
  const supabase = getSupabaseClient();
  
  // Get all user data in parallel
  const [
    userData,
    readingProgress,
    readingSettings,
    readingPlan,
    notes,
    highlights,
    bookmarks,
    lovedVerses,
    readingStats,
    achievements,
    aiProfile
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
    this.getAILearningProfile(userId)
  ]);
  
  return {
    user: userData,
    currentReading: readingProgress,
    readingPlan: readingPlan,
    preferences: readingSettings,
    studyHistory: {
      notes,
      highlights,
      bookmarks,
      lovedVerses
    },
    progress: readingStats,
    aiProfile: aiProfile
  };
}
```

## Benefits of Personalization

### 1. **Name Recognition**
- AI uses user's first name naturally
- Creates personal connection and rapport
- Feels like talking to a knowledgeable friend

### 2. **Reading Context Awareness**
- References current book, chapter, and verse
- Acknowledges reading progress and streaks
- Connects questions to current study

### 3. **Study History Integration**
- References previous notes and highlights
- Builds on past conversations
- Shows continuity in learning

### 4. **Preference Awareness**
- Uses preferred Bible version
- Adapts to study style (concise vs. detailed)
- Considers theological interests

### 5. **Progress Recognition**
- Celebrates achievements and streaks
- Encourages continued study
- Acknowledges reading milestones

### 6. **Contextual Responses**
- Answers relate to current reading
- References relevant study materials
- Builds on established knowledge

## Example Personalized Interaction

### User: "What does this verse mean?"

### AI Response:
```
Hi David! I see you're currently reading Genesis 11:1 in the KJV version. 

Based on your previous notes about "1 Samuel 2:4" and your interest in biblical interpretation, I can help explain this verse in context.

Since you prefer concise and focused explanations, here's what Genesis 11:1 means:

[Personalized explanation referencing current reading and study style]

I notice you've highlighted several verses in purple - would you like me to connect this to any of your previous highlights or notes?
```

This level of personalization transforms the AI from a generic chatbot into a **personal theological study companion** that knows the user intimately and can provide highly relevant, contextual assistance! 🤖✨
