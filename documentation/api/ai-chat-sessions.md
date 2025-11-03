# AI Chat Sessions API

## Overview

AI Chat Sessions provide conversational biblical study experiences with personalized AI responses. The AI can detect learning intent and suggest creating structured learning plans.

## Endpoints

### Create Chat Session

Creates a new AI chat session with personalized greeting.

**Endpoint**: `POST /api/ai-chat/sessions`

**Authentication**: Required

**Rate Limit**: 50 requests/hour

#### Request Body

| Field              | Type   | Required | Description                       |
| ------------------ | ------ | -------- | --------------------------------- |
| ai_version         | enum   | Yes      | study/debate/note-taker/explainer |
| context_book_id    | string | No       | Bible book ID (e.g., "JHN")       |
| context_chapter    | number | No       | Chapter number                    |
| context_version_id | string | No       | Bible version (e.g., "ESV")       |

#### Example Request

```json
{
  "ai_version": "study",
  "context_book_id": "JHN",
  "context_chapter": 3,
  "context_version_id": "ESV"
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "ai_version": "study",
    "title": "Study Session - John 3",
    "context_book_id": "JHN",
    "context_chapter": 3,
    "context_version_id": "ESV",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_message_at": "2024-01-15T10:30:00Z"
  },
  "message": "Chat session created successfully"
}
```

#### Error Responses

- `400 Bad Request`: Invalid AI version or context
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded

---

### List Chat Sessions

Retrieves user's chat sessions with optional filtering.

**Endpoint**: `GET /api/ai-chat/sessions`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Query Parameters

| Parameter  | Type    | Description                     |
| ---------- | ------- | ------------------------------- |
| ai_version | string  | Filter by AI version            |
| is_active  | boolean | Filter by active status         |
| limit      | number  | Number of results (default: 20) |
| offset     | number  | Pagination offset (default: 0)  |

#### Example Request

```
GET /api/ai-chat/sessions?ai_version=study&is_active=true&limit=10
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "ai_version": "study",
        "title": "Study Session - John 3",
        "context_book_id": "JHN",
        "context_chapter": 3,
        "context_version_id": "ESV",
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "last_message_at": "2024-01-15T11:00:00Z"
      }
    ],
    "total": 5
  },
  "message": "Chat sessions retrieved successfully"
}
```

---

### Get Chat Session

Retrieves a specific chat session.

**Endpoint**: `GET /api/ai-chat/sessions/:id`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Path Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | Chat session UUID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "ai_version": "study",
    "title": "Study Session - John 3",
    "context_book_id": "JHN",
    "context_chapter": 3,
    "context_version_id": "ESV",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_message_at": "2024-01-15T11:00:00Z"
  },
  "message": "Chat session retrieved successfully"
}
```

---

### Update Chat Session

Updates a chat session's details.

**Endpoint**: `PATCH /api/ai-chat/sessions/:id`

**Authentication**: Required

**Rate Limit**: 50 requests/hour

#### Path Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | Chat session UUID |

#### Request Body

| Field     | Type    | Required | Description   |
| --------- | ------- | -------- | ------------- |
| title     | string  | No       | New title     |
| is_active | boolean | No       | Active status |

#### Example Request

```json
{
  "title": "Updated Study Session",
  "is_active": false
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "ai_version": "study",
    "title": "Updated Study Session",
    "context_book_id": "JHN",
    "context_chapter": 3,
    "context_version_id": "ESV",
    "is_active": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "last_message_at": "2024-01-15T11:00:00Z"
  },
  "message": "Chat session updated successfully"
}
```

---

### Delete Chat Session

Deletes a chat session and all associated messages.

**Endpoint**: `DELETE /api/ai-chat/sessions/:id`

**Authentication**: Required

**Rate Limit**: 50 requests/hour

#### Path Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | Chat session UUID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": null,
  "message": "Chat session deleted successfully"
}
```

---

### Send Message

Sends a message to the AI and receives a conversational response.

**Endpoint**: `POST /api/ai-chat/sessions/:id/messages`

**Authentication**: Required

**Rate Limit**: 50 requests/hour

#### Path Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | Chat session UUID |

#### Request Body

| Field   | Type   | Required | Description                   |
| ------- | ------ | -------- | ----------------------------- |
| message | string | Yes      | User's message (1-4000 chars) |

#### Example Request

```json
{
  "message": "I want to learn about the Trinity. Can you help me understand it?"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "aiResponse": "Hey David! I'd love to help you understand the Trinity! This is such an important and beautiful aspect of our faith. The Trinity is the doctrine that God exists as three distinct persons - the Father, the Son (Jesus), and the Holy Spirit - while remaining one God. \n\nLet me break this down for you:\n\n**The Three Persons:**\n- **God the Father**: The creator and sustainer of all things\n- **God the Son (Jesus)**: Fully God and fully human, our Savior\n- **God the Holy Spirit**: The presence of God in our lives today\n\n**Key Biblical Foundation:**\nThe Great Commission in [Matthew 28:19] shows all three persons: 'Go and make disciples... baptizing them in the name of the Father and of the Son and of the Holy Spirit.'\n\nWhat aspect of the Trinity would you like to explore first? Are you curious about how they relate to each other, or perhaps how this affects your daily faith?",
    "metadata": {
      "versesCited": ["Matthew 28:19"],
      "topics": ["Trinity", "God", "Father", "Son", "Holy Spirit"],
      "suggestedAction": {
        "type": "create_learning_plan",
        "topic": "the Trinity",
        "message": "Would you like me to create a personalized study plan for this topic?"
      }
    },
    "formattedContent": {
      "sections": [
        {
          "type": "heading",
          "content": "Understanding the Trinity"
        },
        {
          "type": "paragraph",
          "content": "Hey David! I'd love to help you understand the Trinity! This is such an important and beautiful aspect of our faith..."
        }
      ]
    },
    "tokensUsed": 150
  },
  "message": "Message sent successfully"
}
```

#### Special Features

**Learning Intent Detection**: The AI automatically detects when users want to learn about a topic and suggests creating a learning plan.

**Conversational Personality**: Responses are warm, personal, and engaging, addressing users by name and showing genuine enthusiasm.

**Metadata**: Each response includes:

- `versesCited`: Bible verses referenced
- `topics`: Topics discussed
- `suggestedAction`: Learning plan suggestions (when applicable)

#### Error Responses

- `404 Not Found`: Session not found
- `400 Bad Request`: Invalid message or session
- `429 Too Many Requests`: Rate limit exceeded

---

### Get Messages

Retrieves conversation history for a chat session.

**Endpoint**: `GET /api/ai-chat/sessions/:id/messages`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Path Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| id        | string | Chat session UUID |

#### Query Parameters

| Parameter | Type   | Description                                |
| --------- | ------ | ------------------------------------------ |
| limit     | number | Number of messages (default: 50, max: 100) |
| offset    | number | Pagination offset (default: 0)             |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174004",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "user",
        "content": "I want to learn about the Trinity",
        "metadata": null,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174005",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "assistant",
        "content": "Hey David! I'd love to help you understand the Trinity!...",
        "metadata": {
          "versesCited": ["Matthew 28:19"],
          "topics": ["Trinity", "God"],
          "suggestedAction": {
            "type": "create_learning_plan",
            "topic": "the Trinity",
            "message": "Would you like me to create a personalized study plan for this topic?"
          }
        },
        "created_at": "2024-01-15T10:30:05Z"
      }
    ],
    "total": 2
  },
  "message": "Messages retrieved successfully"
}
```

## AI Versions

### Study AI

- **Purpose**: Deep theological analysis and biblical study
- **Style**: Scholarly, comprehensive, educational
- **Best for**: Learning new concepts, detailed explanations

### Debate AI

- **Purpose**: Exploring different theological perspectives
- **Style**: Analytical, balanced, thought-provoking
- **Best for**: Understanding controversies, multiple viewpoints

### Note-Taker AI

- **Purpose**: Organizing and summarizing information
- **Style**: Structured, clear, organized
- **Best for**: Taking notes, creating summaries

### Explainer AI

- **Purpose**: Simple, clear explanations
- **Style**: Accessible, straightforward, beginner-friendly
- **Best for**: Understanding complex topics simply

## Data Types

### AIChatSession

```typescript
interface AIChatSession {
  id: string;
  user_id: string;
  ai_version: "study" | "debate" | "note-taker" | "explainer";
  title: string;
  context_book_id?: string;
  context_chapter?: number;
  context_version_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}
```

### AIChatMessage

```typescript
interface AIChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    versesCited?: string[];
    topics?: string[];
    suggestedAction?: {
      type: string;
      topic: string;
      message: string;
    };
  };
  created_at: string;
}
```

## Best Practices

1. **Session Management**: Create new sessions for different topics or contexts
2. **Context Setting**: Provide book/chapter context for more relevant responses
3. **Learning Intent**: Use phrases like "I want to learn about..." to trigger learning plan suggestions
4. **Conversation Flow**: The AI maintains context throughout the session
5. **Message Length**: Keep messages under 4000 characters for optimal processing

## Rate Limits

- **Create/Update/Delete Sessions**: 50 requests per hour
- **Send Messages**: 50 requests per hour
- **Get Sessions/Messages**: 100 requests per hour

## Notes

- AI responses are personalized based on user context and reading progress
- Learning intent detection automatically suggests creating structured study plans
- All responses include proper Bible verse formatting for frontend display
- Conversations are designed to be warm, engaging, and personally relevant

