# Create AI Chat Session

Creates a new AI chat session with personalized greeting and context snapshot.

## Endpoint

**POST** `/api/ai-chat/sessions`

## Authentication

Required - Bearer token

## Request Body

```typescript
{
  ai_version: "study" | "debate" | "note-taker" | "explainer" | "custom";
  title?: string; // Optional - auto-generated if not provided
  context_book_id?: string; // Optional - current book being read
  context_chapter?: number; // Optional - current chapter
  context_version_id?: string; // Optional - Bible version
}
```

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
  }
  message: string;
}
```

## Example with TanStack Query

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateSessionRequest {
  ai_version: "study" | "debate" | "note-taker" | "explainer" | "custom";
  title?: string;
  context_book_id?: string;
  context_chapter?: number;
  context_version_id?: string;
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
}

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionRequest) => {
      const response = await fetch("/api/ai-chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create chat session");
      }

      return response.json() as Promise<{
        success: true;
        data: ChatSession;
        message: string;
      }>;
    },
    onSuccess: () => {
      // Invalidate and refetch chat sessions list
      queryClient.invalidateQueries({ queryKey: ["ai-chat-sessions"] });
    },
  });
};

// Usage in component
const createSessionMutation = useCreateChatSession();

const handleCreateSession = (aiVersion: string) => {
  createSessionMutation.mutate({
    ai_version: aiVersion,
    context_book_id: currentBook,
    context_chapter: currentChapter,
    context_version_id: currentVersion,
  });
};
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
    "updated_at": "2025-10-21T10:30:00Z",
    "last_message_at": "2025-10-21T10:30:00Z"
  },
  "message": "Chat session created successfully"
}
```

## AI Versions

- **study**: Deep theological analysis with original language insights
- **debate**: Structured argumentation with multiple perspectives
- **note-taker**: Study organization and note-taking assistance
- **explainer**: Clear, accessible explanations of biblical concepts
- **custom**: Adaptable to user's specific needs

## Features

- **Auto-generated titles**: If no title provided, generates based on AI version and date
- **Context snapshots**: Captures user's notes, highlights, and bookmarks at session creation
- **Personalized greeting**: AI generates contextual welcome message
- **Context awareness**: AI knows user's current reading progress and study materials

## Status Codes

- `201` - Session created successfully
- `400` - Invalid request data
- `401` - Unauthorized (invalid or missing token)
- `500` - Internal Server Error

## Notes

- Session is automatically set as active
- Context snapshot includes user's notes, highlights, bookmarks, and reading progress
- AI greeting is personalized based on current reading context
- Session title can be updated later via PATCH endpoint
