# Verse Chat API Reference

## Overview

The Verse Chat API allows users to ask questions about specific Bible verses. Users can hover over a verse, click an AI button, and start a conversational chat about that verse. Users can also add more verses to the conversation as it progresses.

## Base URL

All endpoints are prefixed with `/api/verse-chat`

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limits

- **Create/Update/Delete Sessions**: 50 requests per hour
- **Send Messages**: 50 requests per hour
- **Get Sessions/Messages**: 100 requests per hour

---

## Endpoints

### 1. Create Verse Chat Session

Creates a new verse chat session with initial verse(s).

**Endpoint**: `POST /api/verse-chat/sessions`

**Request Body**:

```typescript
{
  verses: Array<{
    version: string;      // e.g., "NKJV", "ESV"
    book_id: string;      // e.g., "JHN"
    chapter: number;       // e.g., 3
    verse: number;         // e.g., 16
    verse_text: string;    // Full verse text
  }>;
  question?: string;      // Optional initial question
}
```

**Example Request**:

```json
{
  "verses": [
    {
      "version": "NKJV",
      "book_id": "JHN",
      "chapter": 3,
      "verse": 16,
      "verse_text": "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life."
    }
  ],
  "question": "What does this verse mean?"
}
```

**Success Response (201 Created)**:

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174001",
      "ai_version": "verse-chat",
      "title": "John 3:16 (NKJV)",
      "context_book_id": "JHN",
      "context_chapter": 3,
      "context_version_id": "NKJV",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_message_at": "2024-01-15T10:30:00Z"
    },
    "verses": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "message_id": null,
        "version": "NKJV",
        "book_id": "JHN",
        "chapter": 3,
        "verse": 16,
        "verse_text": "For God so loved the world...",
        "added_at": "2024-01-15T10:30:00Z",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "message": "Verse chat session created successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded

---

### 2. List Verse Chat Sessions

Retrieves user's verse chat sessions.

**Endpoint**: `GET /api/verse-chat/sessions`

**Query Parameters**:

| Parameter | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| limit     | number  | No       | Number of sessions to return   |
| offset    | number  | No       | Number of sessions to skip     |
| is_active | boolean | No       | Filter by active status        |

**Example Request**:

```
GET /api/verse-chat/sessions?limit=20&offset=0&is_active=true
```

**Success Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174001",
      "ai_version": "verse-chat",
      "title": "John 3:16 (NKJV)",
      "context_book_id": "JHN",
      "context_chapter": 3,
      "context_version_id": "NKJV",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_message_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Verse chat sessions retrieved successfully"
}
```

---

### 3. Get Verse Chat Session

Retrieves a specific verse chat session with verses and messages.

**Endpoint**: `GET /api/verse-chat/sessions/:id`

**Path Parameters**:

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| id        | string | Yes      | Session UUID |

**Success Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174001",
      "ai_version": "verse-chat",
      "title": "John 3:16 (NKJV)",
      "context_book_id": "JHN",
      "context_chapter": 3,
      "context_version_id": "NKJV",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_message_at": "2024-01-15T10:30:00Z"
    },
    "verses": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "message_id": null,
        "version": "NKJV",
        "book_id": "JHN",
        "chapter": 3,
        "verse": 16,
        "verse_text": "For God so loved the world...",
        "added_at": "2024-01-15T10:30:00Z",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "messages": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "assistant",
        "content": "Hello! I'm here to help you understand John 3:16...",
        "formatted_content": { ... },
        "metadata": { ... },
        "tokens_used": 150,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "message": "Verse chat session retrieved successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Session not found
- `429 Too Many Requests`: Rate limit exceeded

---

### 4. Add Verses to Session

Adds more verses to an existing verse chat session.

**Endpoint**: `POST /api/verse-chat/sessions/:id/verses`

**Path Parameters**:

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| id        | string | Yes      | Session UUID |

**Request Body**:

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

**Example Request**:

```json
{
  "verses": [
    {
      "version": "NKJV",
      "book_id": "JHN",
      "chapter": 3,
      "verse": 17,
      "verse_text": "For God did not send His Son into the world to condemn the world, but that the world through Him might be saved."
    }
  ]
}
```

**Success Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174004",
      "session_id": "123e4567-e89b-12d3-a456-426614174000",
      "message_id": null,
      "version": "NKJV",
      "book_id": "JHN",
      "chapter": 3,
      "verse": 17,
      "verse_text": "For God did not send His Son...",
      "added_at": "2024-01-15T10:35:00Z",
      "created_at": "2024-01-15T10:35:00Z"
    }
  ],
  "message": "Verses added to session successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request data or session not active
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Session not found
- `429 Too Many Requests`: Rate limit exceeded

---

### 5. Send Message

Sends a message to the verse chat AI and gets a response. Can optionally include new verses.

**Endpoint**: `POST /api/verse-chat/sessions/:id/messages`

**Path Parameters**:

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| id        | string | Yes      | Session UUID |

**Request Body**:

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

**Example Request**:

```json
{
  "content": "Can you explain this verse in more detail?",
  "verses": [
    {
      "version": "NKJV",
      "book_id": "JHN",
      "chapter": 3,
      "verse": 18,
      "verse_text": "He who believes in Him is not condemned; but he who does not believe is condemned already, because he has not believed in the name of the only begotten Son of God."
    }
  ]
}
```

**Success Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "aiResponse": "Certainly! Let me explain John 3:16 in detail...",
    "metadata": {
      "versesCited": ["John 3:16", "John 3:17"],
      "confidence": 0.9
    },
    "formattedContent": {
      "text": "Certainly! Let me explain John 3:16 in detail...",
      "format": "markdown"
    },
    "tokensUsed": 450
  },
  "message": "Message sent successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid request data or session not active
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Session not found
- `429 Too Many Requests`: Rate limit exceeded

---

## Type Definitions

### VerseInfo

```typescript
interface VerseInfo {
  version: string;      // e.g., "NKJV", "ESV"
  book_id: string;      // e.g., "JHN"
  chapter: number;       // e.g., 3
  verse: number;         // e.g., 16
  verse_text: string;    // Full verse text
}
```

### VerseChatVerse

```typescript
interface VerseChatVerse {
  id: string;
  session_id: string;
  message_id: string | null;
  version: string;
  book_id: string;
  chapter: number;
  verse: number;
  verse_text: string;
  added_at: string;
  created_at: string;
}
```

### VerseChatSession

```typescript
interface VerseChatSession {
  id: string;
  user_id: string;
  ai_version: "verse-chat";
  title: string;
  context_book_id: string | null;
  context_chapter: number | null;
  context_version_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  verses?: VerseChatVerse[];
}
```

---

## Usage Examples

### Frontend Integration Example

```typescript
// 1. Create session with initial verse
const createSession = async (verse: VerseInfo, question?: string) => {
  const response = await fetch('/api/verse-chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      verses: [verse],
      question
    })
  });
  return response.json();
};

// 2. Send message (can include new verses)
const sendMessage = async (sessionId: string, content: string, newVerses?: VerseInfo[]) => {
  const response = await fetch(`/api/verse-chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content,
      verses: newVerses
    })
  });
  return response.json();
};

// 3. Add more verses to existing session
const addVerses = async (sessionId: string, verses: VerseInfo[]) => {
  const response = await fetch(`/api/verse-chat/sessions/${sessionId}/verses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ verses })
  });
  return response.json();
};

// 4. Get session with all verses and messages
const getSession = async (sessionId: string) => {
  const response = await fetch(`/api/verse-chat/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Best Practices

1. **Session Management**: Create new sessions for different verse contexts
2. **Verse Ranges**: When selecting verse ranges (e.g., John 3:16-18), send all individual verses
3. **Adding Verses**: Add verses when you want to compare or discuss multiple verses together
4. **Conversation Flow**: The AI maintains context throughout the session
5. **Message Length**: Keep messages under 4000 characters for optimal processing

---

## Notes

- Verse chats are saved like regular AI chats for later access
- Users can add multiple verses to a conversation as it progresses
- The AI can handle translation comparisons when requested
- All verse references are properly formatted for frontend display
- Conversations maintain context across messages

