# Get Messages - AI Chat API

## Endpoint

```
GET /api/ai-chat/sessions/:id/messages
```

## Description

Retrieves the message history for a specific AI chat session with pagination support.

## Authentication

Requires Bearer token authentication.

## Request Parameters

| Parameter | Type   | Location | Required | Description  |
| --------- | ------ | -------- | -------- | ------------ |
| id        | string | URL      | Yes      | Session UUID |

## Query Parameters

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| limit     | number | No       | Number of messages to return (default: 50) |
| offset    | number | No       | Number of messages to skip (default: 0)    |

## Response

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-123",
        "session_id": "session-456",
        "role": "user",
        "content": "What does John 3:16 mean?",
        "formatted_content": null,
        "metadata": null,
        "tokens_used": null,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg-124",
        "session_id": "session-456",
        "role": "assistant",
        "content": "John 3:16 is one of the most well-known verses in the Bible...",
        "formatted_content": {
          "text": "**John 3:16** is one of the most well-known verses in the Bible...",
          "format": "markdown",
          "sections": [
            {
              "type": "paragraph",
              "content": "**John 3:16** is one of the most well-known verses..."
            }
          ]
        },
        "metadata": {
          "versesCited": ["John 3:16", "Romans 5:8"],
          "sourcesCited": ["ESV Study Bible", "Matthew Henry Commentary"],
          "theologicalTopics": ["salvation", "grace", "eternal life"],
          "confidence": 0.95
        },
        "tokens_used": 150,
        "created_at": "2024-01-15T10:30:05Z"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "has_more": false,
      "total": 2
    }
  },
  "message": "Retrieved 2 messages"
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "User not authenticated",
  "statusCode": 401
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied",
  "statusCode": 403
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "Chat session not found",
  "statusCode": 404
}
```

## Frontend Integration

### Basic Usage

```typescript
const getMessages = async (sessionId: string, limit = 50, offset = 0) => {
  const response = await fetch(
    `/api/ai-chat/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};
```

### React Hook Example

```typescript
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  formatted_content?: {
    text: string;
    format: "markdown";
    sections: Array<{
      type: string;
      content: string;
    }>;
  };
  metadata?: {
    versesCited: string[];
    sourcesCited: string[];
    theologicalTopics: string[];
    confidence: number;
  };
  tokens_used?: number;
  created_at: string;
}

interface MessagesResponse {
  messages: Message[];
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
    total: number;
  };
}

export const useGetMessages = (sessionId: string, limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ["ai-chat-messages", sessionId, limit, offset],
    queryFn: async (): Promise<MessagesResponse> => {
      const response = await fetch(
        `/api/ai-chat/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!sessionId,
  });
};
```

### Pagination Implementation

```typescript
const ChatMessages = ({ sessionId }: { sessionId: string }) => {
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading, error } = useGetMessages(sessionId, limit, offset);

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.messages.map((message) => (
        <div key={message.id} className={`message ${message.role}`}>
          {message.role === "assistant" && message.formatted_content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(message.formatted_content.text),
              }}
            />
          ) : (
            <div>{message.content}</div>
          )}

          {message.metadata && (
            <div className="metadata">
              <div>Verses: {message.metadata.versesCited.join(", ")}</div>
              <div>Sources: {message.metadata.sourcesCited.join(", ")}</div>
            </div>
          )}
        </div>
      ))}

      {data?.pagination.has_more && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
};
```

## Message Format

### User Messages

- **role**: `"user"`
- **content**: Plain text user input
- **formatted_content**: `null`
- **metadata**: `null`
- **tokens_used**: `null`

### AI Assistant Messages

- **role**: `"assistant"`
- **content**: Raw AI response text
- **formatted_content**: Markdown-formatted version with sections
- **metadata**: Rich metadata including verses, sources, topics
- **tokens_used**: Number of tokens consumed

### System Messages

- **role**: `"system"`
- **content**: System-generated content (greetings, etc.)
- **formatted_content**: May include formatting
- **metadata**: System metadata
- **tokens_used**: Usually `null`

## Pagination Details

### Default Behavior

- **Default limit**: 50 messages
- **Maximum limit**: 100 messages
- **Order**: Messages returned in chronological order (oldest first)
- **Offset**: Number of messages to skip from the beginning

### Pagination Object

```typescript
interface Pagination {
  limit: number; // Number of messages requested
  offset: number; // Number of messages skipped
  has_more: boolean; // Whether more messages are available
  total: number; // Total number of messages in session
}
```

### Pagination Strategies

#### Load More Pattern

```typescript
const [messages, setMessages] = useState([]);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const response = await getMessages(sessionId, 20, offset);
  setMessages((prev) => [...prev, ...response.messages]);
  setOffset((prev) => prev + 20);
  setHasMore(response.pagination.has_more);
};
```

#### Infinite Scroll Pattern

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["messages", sessionId],
    queryFn: ({ pageParam = 0 }) => getMessages(sessionId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
  });
```

## Performance Considerations

- **Message limit**: Keep limit reasonable (20-50 messages) for better performance
- **Caching**: Messages are cached by the frontend query library
- **Real-time updates**: No WebSocket needed - use polling or manual refresh
- **Memory usage**: Consider implementing message virtualization for long conversations

## Error Handling

### Common Error Scenarios

1. **Session not found**: User doesn't own the session or session doesn't exist
2. **Authentication failed**: Invalid or expired token
3. **Rate limiting**: Too many requests (429 status)
4. **Server error**: Database or AI service issues (500 status)

### Error Recovery

```typescript
const handleError = (error: Error) => {
  if (error.message.includes("not found")) {
    // Redirect to sessions list
    router.push("/ai-chat/sessions");
  } else if (error.message.includes("authenticated")) {
    // Redirect to login
    router.push("/login");
  } else {
    // Show error message and retry option
    showError("Failed to load messages. Please try again.");
  }
};
```

## Notes

- Messages are returned in chronological order (oldest first)
- AI responses include rich metadata for enhanced display
- Formatted content uses markdown for easy rendering
- Token usage is tracked for monitoring and optimization
- Pagination supports both "load more" and infinite scroll patterns
