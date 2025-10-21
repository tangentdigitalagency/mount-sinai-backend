# Get AI Chat Session

Retrieves a specific AI chat session with recent messages and context snapshots.

## Endpoint

**GET** `/api/ai-chat/sessions/:id`

## Authentication

Required - Bearer token

## Request Parameters

| Parameter | Type   | Location | Required | Description  |
| --------- | ------ | -------- | -------- | ------------ |
| id        | string | URL      | Yes      | Session UUID |

## Response

```typescript
{
  success: boolean;
  data: {
    id: string;
    user_id: string;
    ai_version: string;
    title: string;
    context_book_id: string | null;
    context_chapter: number | null;
    context_version_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_message_at: string;
    messages: Array<{
      id: string;
      session_id: string;
      role: "user" | "assistant" | "system";
      content: string;
      formatted_content: Record<string, unknown> | null;
      metadata: Record<string, unknown> | null;
      tokens_used: number | null;
      created_at: string;
    }>;
    context_snapshots: Array<{
      id: string;
      session_id: string;
      context_type: string;
      context_data: Record<string, unknown>;
      created_at: string;
    }>;
    message_count: number;
  }
  message: string;
}
```

## Example with TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";

interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  formatted_content: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  tokens_used: number | null;
  created_at: string;
}

interface ContextSnapshot {
  id: string;
  session_id: string;
  context_type: string;
  context_data: Record<string, unknown>;
  created_at: string;
}

interface ChatSession {
  id: string;
  user_id: string;
  ai_version: string;
  title: string;
  context_book_id: string | null;
  context_chapter: number | null;
  context_version_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages: ChatMessage[];
  context_snapshots: ContextSnapshot[];
  message_count: number;
}

export const useGetChatSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["ai-chat-session", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/ai-chat/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch chat session");
      }

      return response.json() as Promise<{
        success: true;
        data: ChatSession;
        message: string;
      }>;
    },
    enabled: !!sessionId,
  });
};

// Usage in component
const { data, isLoading, error } = useGetChatSession(sessionId);
```

## Response Example

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-uuid",
    "ai_version": "study",
    "title": "Study Chat - 10/21/2025",
    "context_book_id": "GEN",
    "context_chapter": 1,
    "context_version_id": "ESV",
    "is_active": true,
    "created_at": "2025-10-21T10:30:00Z",
    "updated_at": "2025-10-21T11:45:00Z",
    "last_message_at": "2025-10-21T11:45:00Z",
    "messages": [
      {
        "id": "msg-1",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "assistant",
        "content": "Hello! I'm your Study AI assistant...",
        "formatted_content": {
          "text": "## Welcome to Study AI\n\nHello! I'm your Study AI assistant...",
          "format": "markdown"
        },
        "metadata": {
          "versesCited": [],
          "theologicalTopics": [],
          "confidence": 0.8
        },
        "tokens_used": 150,
        "created_at": "2025-10-21T10:30:00Z"
      },
      {
        "id": "msg-2",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "user",
        "content": "What does Genesis 1:1 mean?",
        "formatted_content": null,
        "metadata": null,
        "tokens_used": 0,
        "created_at": "2025-10-21T10:35:00Z"
      },
      {
        "id": "msg-3",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "role": "assistant",
        "content": "Genesis 1:1 is the foundational verse...",
        "formatted_content": {
          "text": "## Genesis 1:1 - The Foundation\n\n**Genesis 1:1** is the foundational verse...",
          "format": "markdown"
        },
        "metadata": {
          "versesCited": ["Genesis 1:1", "John 1:1"],
          "theologicalTopics": ["creation", "trinity"],
          "crossReferences": ["John 1:1", "Hebrews 11:3"],
          "sourcesCited": ["ESV Study Bible"],
          "confidence": 0.9
        },
        "tokens_used": 450,
        "created_at": "2025-10-21T10:35:30Z"
      }
    ],
    "context_snapshots": [
      {
        "id": "snapshot-1",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "context_type": "notes",
        "context_data": [
          {
            "id": "note-1",
            "title": "Genesis Study Notes",
            "content": { "type": "doc", "content": [] }
          }
        ],
        "created_at": "2025-10-21T10:30:00Z"
      },
      {
        "id": "snapshot-2",
        "session_id": "123e4567-e89b-12d3-a456-426614174000",
        "context_type": "highlights",
        "context_data": [
          {
            "id": "highlight-1",
            "book_name": "Genesis",
            "chapter": 1,
            "verse_number": 1,
            "verse_text": "In the beginning, God created the heavens and the earth."
          }
        ],
        "created_at": "2025-10-21T10:30:00Z"
      }
    ],
    "message_count": 3
  },
  "message": "Chat session retrieved successfully"
}
```

## Message History

The response includes:

- **Last 50 messages** from the conversation
- **Chronological order** (oldest to newest)
- **Both user and AI messages**
- **Formatted content** for rendering
- **Metadata** including verses cited and sources

## Context Snapshots

Shows the user's context when the session was created:

- **Notes**: User's biblical notes
- **Highlights**: Highlighted verses
- **Bookmarks**: Saved verses
- **Reading Progress**: Current reading position
- **Verse Interactions**: Likes, cross-references, etc.

## Message Formatting

AI messages include:

- **formatted_content**: Markdown-formatted text for display
- **metadata**: Verses cited, theological topics, sources
- **tokens_used**: OpenAI token usage for cost tracking

## Status Codes

- `200` - Session retrieved successfully
- `401` - Unauthorized (invalid or missing token)
- `404` - Session not found or doesn't belong to user
- `500` - Internal Server Error

## Notes

- Only returns last 50 messages for performance
- Use GET `/api/ai-chat/sessions/:id/messages` for full message history with pagination
- Context snapshots show the state when session was created
- Messages are in chronological order (oldest first)
- AI responses include rich metadata for enhanced display
