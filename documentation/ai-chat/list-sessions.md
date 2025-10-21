# List AI Chat Sessions

Retrieves all AI chat sessions for the authenticated user with optional filtering.

## Endpoint

**GET** `/api/ai-chat/sessions`

## Authentication

Required - Bearer token

## Query Parameters

| Parameter  | Type    | Required | Description                                |
| ---------- | ------- | -------- | ------------------------------------------ |
| ai_version | string  | No       | Filter by AI version                       |
| is_active  | boolean | No       | Filter by active status                    |
| limit      | number  | No       | Number of sessions to return (default: 20) |
| offset     | number  | No       | Number of sessions to skip (default: 0)    |

## Response

```typescript
{
  success: boolean;
  data: Array<{
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
    message_count: number;
  }>;
  message: string;
}
```

## Example with TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";

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
  message_count: number;
}

interface ListSessionsParams {
  ai_version?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export const useListChatSessions = (params?: ListSessionsParams) => {
  return useQuery({
    queryKey: ["ai-chat-sessions", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params?.ai_version)
        searchParams.append("ai_version", params.ai_version);
      if (params?.is_active !== undefined)
        searchParams.append("is_active", params.is_active.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.offset)
        searchParams.append("offset", params.offset.toString());

      const response = await fetch(`/api/ai-chat/sessions?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch chat sessions");
      }

      return response.json() as Promise<{
        success: true;
        data: ChatSession[];
        message: string;
      }>;
    },
  });
};

// Usage in component
const { data, isLoading, error } = useListChatSessions({
  is_active: true,
  limit: 10,
});
```

## Response Example

```json
{
  "success": true,
  "data": [
    {
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
      "last_message_at": "2025-10-21T11:45:00Z",
      "message_count": 12
    },
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "user_id": "user-uuid",
      "ai_version": "debate",
      "title": "Debate Chat - 10/20/2025",
      "context_book_id": null,
      "context_chapter": null,
      "context_version_id": null,
      "is_active": false,
      "created_at": "2025-10-20T14:20:00Z",
      "updated_at": "2025-10-20T16:30:00Z",
      "last_message_at": "2025-10-20T16:30:00Z",
      "message_count": 8
    }
  ],
  "message": "Retrieved 2 chat sessions"
}
```

## Filtering Options

### By AI Version

```typescript
// Get only Study AI sessions
const studySessions = useListChatSessions({ ai_version: "study" });

// Get only Debate AI sessions
const debateSessions = useListChatSessions({ ai_version: "debate" });
```

### By Active Status

```typescript
// Get only active sessions
const activeSessions = useListChatSessions({ is_active: true });

// Get only inactive sessions
const inactiveSessions = useListChatSessions({ is_active: false });
```

### Pagination

```typescript
// Get first 10 sessions
const firstPage = useListChatSessions({ limit: 10, offset: 0 });

// Get next 10 sessions
const secondPage = useListChatSessions({ limit: 10, offset: 10 });
```

## Sorting

Sessions are automatically sorted by:

1. **last_message_at** (descending) - Most recently active first
2. **created_at** (descending) - Newest sessions first

## Status Codes

- `200` - Sessions retrieved successfully
- `401` - Unauthorized (invalid or missing token)
- `500` - Internal Server Error

## Notes

- Sessions are ordered by most recent activity
- Message count includes both user and AI messages
- Inactive sessions are included but can be filtered out
- Context information shows what the user was reading when session was created
- Sessions can be reactivated by updating the `is_active` field
