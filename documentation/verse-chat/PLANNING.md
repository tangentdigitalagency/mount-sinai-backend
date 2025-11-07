# Verse-Based Chat API - Planning Document

## Overview

A new AI chat API that allows users to ask questions about specific Bible verses. Users can hover over a verse, click an AI button, and start a conversational chat about that verse. Users can also add more verses to the conversation as it progresses.

## Key Features

1. **Verse Context**: Users send verse information (version, book, chapter, verse, text)
2. **Question-Based**: Users ask questions about the verse(s)
3. **Conversational**: Multi-turn conversations about verses
4. **Multi-Verse Support**: Users can add more verses to the conversation
5. **Persistent Sessions**: Chats are saved like regular AI chats for later access

## Database Design

### Option 1: Extend Existing Tables (Recommended)

**Pros:**

- Reuse existing session/message infrastructure
- Unified chat history for users
- Less code duplication
- Easier to maintain

**Cons:**

- Need to handle different message types in same table

**Implementation:**

- Add new `ai_version`: `"verse-chat"` to `ai_chat_sessions`
- Create new table: `verse_chat_verses` to store verses associated with sessions/messages

### Option 2: Separate Tables

**Pros:**

- Clear separation of concerns
- Can optimize specifically for verse chats

**Cons:**

- Code duplication
- Separate chat history
- More maintenance

**Recommendation: Option 1** - Extend existing system with `ai_version: "verse-chat"`

## Database Schema

### New Table: `verse_chat_verses`

```sql
CREATE TABLE verse_chat_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
  version VARCHAR(20) NOT NULL, -- e.g., "NKJV", "ESV"
  book_id VARCHAR(10) NOT NULL, -- e.g., "JHN"
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  verse_text TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verse_chat_verses_session ON verse_chat_verses(session_id, created_at DESC);
CREATE INDEX idx_verse_chat_verses_message ON verse_chat_verses(message_id);

-- Constraints
ALTER TABLE verse_chat_verses
ADD CONSTRAINT check_chapter_positive CHECK (chapter > 0);
ALTER TABLE verse_chat_verses
ADD CONSTRAINT check_verse_positive CHECK (verse > 0);
```

**Note:** `message_id` is nullable because:

- Initial verse(s) are added when creating the session (before first message)
- Additional verses can be added with specific messages
- We want to track all verses in a session regardless of when they were added

### Update `ai_chat_sessions` constraint

```sql
-- Update constraint to include "verse-chat"
ALTER TABLE ai_chat_sessions
DROP CONSTRAINT check_ai_version;

ALTER TABLE ai_chat_sessions
ADD CONSTRAINT check_ai_version
CHECK (ai_version IN ('study', 'debate', 'note-taker', 'explainer', 'custom', 'verse-chat'));
```

## API Design

### 1. Create Verse Chat Session

**Endpoint:** `POST /api/verse-chat/sessions`

**Request Body:**

```typescript
{
  verses: Array<{
    version: string;      // "NKJV"
    book_id: string;      // "JHN"
    chapter: number;      // 3
    verse: number;        // 16
    verse_text: string;   // "For God so loved the world..."
  }>;
  question?: string;      // Optional initial question
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    session: {
      id: string;
      user_id: string;
      ai_version: "verse-chat";
      title: string;      // Auto-generated: "John 3:16 (NKJV)"
      verses: Array<VerseInfo>;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }
  }
}
```

### 2. Add Verses to Session

**Endpoint:** `POST /api/verse-chat/sessions/:id/verses`

**Request Body:**

```typescript
{
  verses: Array<{
    version: string;
    book_id: string;
    chapter: number;
    verse: number;
    verse_text: string;
  }>;
}
```

### 3. Send Message (with optional new verses)

**Endpoint:** `POST /api/verse-chat/sessions/:id/messages`

**Request Body:**

```typescript
{
  content: string;        // User's question/message
  verses?: Array<{       // Optional: add new verses with this message
    version: string;
    book_id: string;
    chapter: number;
    verse: number;
    verse_text: string;
  }>;
}
```

**Response:** Same as regular AI chat response

### 4. Get Session with Verses

**Endpoint:** `GET /api/verse-chat/sessions/:id`

**Response:** Includes all verses associated with the session

### 5. List Sessions

**Endpoint:** `GET /api/verse-chat/sessions`

Same as regular AI chat, filtered by `ai_version: "verse-chat"`

## Implementation Plan

### Phase 1: Core Infrastructure

1. ✅ Create database migration for `verse_chat_verses` table
2. ✅ Update `ai_chat_sessions` constraint to include "verse-chat"
3. ✅ Create TypeScript types for verse chat
4. ✅ Create verse chat service (extends/uses ChatService)

### Phase 2: API Endpoints

1. ✅ Create verse chat routes
2. ✅ Create controllers:
   - `create-verse-session.controller.ts`
   - `add-verses.controller.ts`
   - `send-verse-message.controller.ts`
   - `get-verse-session.controller.ts`
   - `list-verse-sessions.controller.ts`

### Phase 3: AI Integration

1. ✅ Build system prompt for verse-based chat
2. ✅ Include verse context in messages
3. ✅ Handle multi-verse conversations
4. ✅ Format verse references in responses

### Phase 4: Testing & Documentation

1. ✅ Write API documentation
2. ✅ Create frontend integration guide
3. ✅ Test multi-verse scenarios

## AI Prompt Design

### System Prompt for Verse Chat

The AI should:

1. **Focus on the specific verse(s)** provided
2. **Answer questions** about the verse(s) contextually
3. **Reference cross-references** when relevant
4. **Explain theological concepts** in the verse(s)
5. **Maintain conversation context** as more verses are added
6. **Compare verses** when multiple are provided
7. **Be conversational** and engaging

### Example System Prompt:

```
You are a biblical scholar AI assistant helping users understand specific Bible verses.

The user will provide you with specific Bible verses and ask questions about them. Your role is to:
- Provide accurate, contextual explanations of the verses
- Answer questions about meaning, context, and theology
- Reference related verses when helpful
- Explain historical and cultural context
- Help users understand how verses relate to each other when multiple are provided
- Be warm, engaging, and encouraging

When multiple verses are provided, help the user understand:
- How they relate to each other
- Common themes or contrasts
- Theological connections
- Practical applications

Always format verse references properly for the frontend to display.
```

## Frontend Integration

### User Flow:

1. User hovers over a verse in the Bible reader
2. Clicks "AI" button
3. Modal opens with:
   - Verse displayed (version, book, chapter, verse, text)
   - Input field for question
   - Option to add more verses
4. User types question and sends
5. Conversation continues with AI responses
6. User can add more verses at any time
7. Session is saved and accessible later

### API Calls:

```typescript
// 1. Create session with initial verse
POST /api/verse-chat/sessions
{
  verses: [{ version, book_id, chapter, verse, verse_text }],
  question: "What does this mean?"
}

// 2. Send message (can include new verses)
POST /api/verse-chat/sessions/:id/messages
{
  content: "Can you explain this more?",
  verses: [...] // Optional
}

// 3. Add verses to existing session
POST /api/verse-chat/sessions/:id/verses
{
  verses: [...]
}
```

## Future Growth Opportunities

### 1. **Verse Comparison Mode**

- Compare multiple versions side-by-side
- Highlight differences between translations
- Explain translation choices

### 2. **Verse Study Plans**

- Generate study plans based on verses
- Suggest related verses to study
- Create reading plans from verse collections

### 3. **Verse Collections**

- Save verse collections from chats
- Share collections with others
- Create themed collections (e.g., "Verses about love")

### 4. **Cross-Reference Explorer**

- AI suggests related verses
- Visual graph of verse connections
- Thematic verse chains

### 5. **Verse Notes Integration**

- Link verse chats to user notes
- Auto-suggest notes when discussing verses
- Export chat insights as notes

### 6. **Verse Memorization**

- AI helps with memorization techniques
- Quiz mode for verse memorization
- Progress tracking

### 7. **Verse Sharing**

- Share verse chat sessions
- Export verse discussions as PDFs
- Social features (with privacy controls)

### 8. **Advanced Analysis**

- Word study (Greek/Hebrew)
- Historical context deep-dives
- Theological analysis
- Application suggestions

### 9. **Verse-Based Learning Plans**

- Create learning plans from verse collections
- Structured study of related verses
- Progress tracking

### 10. **AI Verse Recommendations**

- "You might also want to study..."
- Based on user's verse interests
- Thematic suggestions

## Technical Considerations

### 1. **Token Management**

- Verse text can be long
- Need to manage context window efficiently
- Consider summarizing older verses if conversation gets long

### 2. **Verse Validation**

- Validate book_id, chapter, verse combinations
- Verify verse_text matches reference
- Handle invalid references gracefully

### 3. **Performance**

- Index verse lookups efficiently
- Cache verse metadata
- Optimize session loading with verses

### 4. **Rate Limiting**

- Same as regular AI chat
- Consider verse addition as separate operation

### 5. **Error Handling**

- Invalid verse references
- Missing verse text
- OpenAI API errors

## Decisions Made

1. **Verse Text Validation**: ✅ Trust what frontend sends (comes from Bible API)
2. **Verse Ranges**: ✅ Store as individual verses (e.g., John 3:16-18 becomes 3 separate verse entries: 16, 17, 18)
3. **Searchability**: ❌ No search functionality needed
4. **Version Comparison**: ✅ Yes, but only at user request - OpenAI can handle comparing different translations
5. **AI Personality**: ✅ Mix of all personalities (scholarly, conversational, warm, engaging)

## Verse Range Handling

When a user selects a verse range (e.g., John 3:16-18), the frontend will send all individual verses in that range. We store each verse separately in the `verse_chat_verses` table. This approach:

- Keeps the database schema simple
- Works seamlessly with the AI (it can see all verses)
- Allows users to reference specific verses in the range
- Makes it easy to add/remove verses from ranges

Example: User selects "John 3:16-18"

- Frontend sends: `[{chapter: 3, verse: 16, ...}, {chapter: 3, verse: 17, ...}, {chapter: 3, verse: 18, ...}]`
- We store 3 separate rows in `verse_chat_verses`
- AI can reference "John 3:16" or "the passage from John 3:16-18" as needed

## Next Steps

1. Review and approve this plan
2. Create database migration
3. Implement core types and services
4. Build API endpoints
5. Test with frontend integration
6. Iterate based on feedback
