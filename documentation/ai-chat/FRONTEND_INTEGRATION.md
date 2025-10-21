# AI Chat System - Frontend Integration Guide

## Overview

This document addresses common frontend integration questions and provides comprehensive guidance for implementing the AI Chat System.

## 🔐 Authentication

### How to Get the Token

The AI Chat API uses the **same authentication system** as your existing app:

```typescript
// Use your existing auth system
const authToken = await getAuthToken(); // Your existing auth method

// Include in API requests
const response = await fetch("/api/ai-chat/sessions", {
  headers: {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  },
});
```

**No separate auth flow needed** - the AI Chat API integrates with your existing Supabase auth system.

## 📡 Real-time Updates

### ❌ No WebSockets Required

The AI Chat system is designed for **simple HTTP requests**:

- **Send Message**: `POST /api/ai-chat/sessions/:id/messages`
- **Get Response**: AI response comes back immediately in the same HTTP response
- **No streaming, no WebSockets, no polling needed**

### Response Flow

```typescript
// Send message
const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ content: "What does John 3:16 mean?" }),
});

// AI response is immediately available
const { data } = await response.json();
console.log(data.aiResponse); // Full AI response with formatting
console.log(data.metadata); // Verses cited, sources, etc.
```

## 📄 Message Pagination

### GET Messages Endpoint

```typescript
// Get messages with pagination
const response = await fetch(
  `/api/ai-chat/sessions/${sessionId}/messages?limit=20&offset=0`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const { data } = await response.json();
// data.messages: Array of messages
// data.pagination: { limit, offset, has_more, total }
```

### Pagination Parameters

- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `offset` (optional): Number of messages to skip (default: 0)

## ⚠️ Error Handling

### Standard Error Response Format

```typescript
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": "Additional error details"
}
```

### Common Error Codes

| Status | Error                      | Description                                   |
| ------ | -------------------------- | --------------------------------------------- |
| 400    | Invalid request data       | Missing required fields or invalid format     |
| 401    | User not authenticated     | Missing or invalid auth token                 |
| 403    | Access denied              | User doesn't own the session                  |
| 404    | Chat session not found     | Session doesn't exist or user doesn't own it  |
| 400    | Chat session is not active | Trying to send message to inactive session    |
| 429    | Rate limit exceeded        | Too many requests (see rate limiting section) |
| 500    | Internal server error      | OpenAI API error or database error            |

### Frontend Error Handling

```typescript
try {
  const response = await fetch("/api/ai-chat/sessions/123/messages", {
    method: "POST",
    body: JSON.stringify({ content: "Hello" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle error
  console.error("Chat error:", error.message);
}
```

## 🚦 Rate Limiting

### Current Limits

- **Message sending**: 10 messages per minute per user
- **Session creation**: 5 sessions per hour per user
- **Learning profile updates**: 20 updates per hour per user

### Rate Limit Headers

```typescript
// Response headers include rate limit info
{
  'X-RateLimit-Limit': '10',
  'X-RateLimit-Remaining': '7',
  'X-RateLimit-Reset': '1640995200'
}
```

### Handling Rate Limits

```typescript
if (response.status === 429) {
  const resetTime = response.headers.get("X-RateLimit-Reset");
  const remaining = response.headers.get("X-RateLimit-Remaining");

  // Show user-friendly message
  showError(`Rate limit exceeded. Try again in ${resetTime} seconds.`);
}
```

## 📎 File Attachments

### ❌ Text-Only Messages

The AI Chat system is **text-only**:

- ✅ **Supported**: Text messages, verse references, theological questions
- ❌ **Not Supported**: Images, documents, file uploads

### Future Considerations

If file attachments are needed later, we can extend the system to support:

- Image analysis for biblical artwork
- Document uploads for study materials
- Audio messages for accessibility

## 🗂️ Session Management

### Session Lifecycle

```typescript
// 1. Create session
const session = await createSession({
  ai_version: "study",
  title: "Genesis Study",
  context_book_id: "genesis",
  context_chapter: 1,
});

// 2. Send messages
await sendMessage(session.id, "What does this verse mean?");

// 3. Update session
await updateSession(session.id, { title: "Genesis 1-3 Study" });

// 4. Delete session (optional)
await deleteSession(session.id);
```

### Session Cleanup

- **No automatic cleanup** - sessions persist indefinitely
- **Manual cleanup** - users can delete sessions they no longer need
- **Inactive sessions** - marked as `is_active: false` but not deleted
- **Data retention** - all messages and context snapshots preserved

### Session States

```typescript
interface SessionState {
  is_active: boolean; // Can send messages
  last_message_at: string; // Last activity
  created_at: string; // When created
  updated_at: string; // Last modified
}
```

## 🔄 Context Updates

### ✅ Dynamic Context Updates

Yes! You can update session context when users change their reading:

```typescript
// Update session context
await updateSession(sessionId, {
  context_book_id: "matthew",
  context_chapter: 5,
  context_version_id: "esv",
});

// AI will now know user is reading Matthew 5
```

### Context Fields

```typescript
interface SessionContext {
  context_book_id?: string; // 'genesis', 'matthew', etc.
  context_chapter?: number; // Chapter number
  context_version_id?: string; // 'esv', 'niv', etc.
}
```

### Context Impact

- **AI responses** will reference the current book/chapter
- **Greeting messages** will mention the current reading
- **Cross-references** will be relevant to current context
- **Learning profile** adapts to reading patterns

## 🎯 Implementation Examples

### Complete Chat Flow

```typescript
// 1. Create session
const session = await createSession({
  ai_version: "study",
  context_book_id: "john",
  context_chapter: 3,
});

// 2. Send message and get immediate response
const response = await sendMessage(session.id, "Explain John 3:16");

// 3. Display formatted response
const { aiResponse, metadata, formattedContent } = response.data;
displayMessage({
  content: aiResponse,
  formatted: formattedContent.markdown,
  verses: metadata.versesCited,
  sources: metadata.sourcesCited,
});

// 4. Continue conversation
const followUp = await sendMessage(session.id, "What about the context?");
```

### React Hook Example

```typescript
const useAIChat = (sessionId: string) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/ai-chat/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content }),
        }
      );

      const { data } = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
```

## 🔧 Technical Notes

### Response Format

```typescript
interface AIResponse {
  aiResponse: string; // Raw AI response
  metadata: {
    versesCited: string[];
    sourcesCited: string[];
    theologicalTopics: string[];
    confidence: number;
  };
  formattedContent: {
    text: string;
    format: "markdown";
    sections: Array<{
      type: string;
      content: string;
    }>;
  };
  tokensUsed: number;
}
```

### Performance Considerations

- **Response time**: 2-5 seconds for AI responses
- **Token usage**: Monitored and logged
- **Context size**: Automatically managed (recent messages + user data)
- **Caching**: Session data cached for faster responses

## 🚀 Getting Started

1. **Authentication**: Use your existing auth system
2. **Create Session**: Start with a specific AI version
3. **Send Messages**: Simple POST requests
4. **Handle Responses**: Display formatted content
5. **Manage Sessions**: Update context as needed

The system is designed to be **simple, fast, and reliable** without complex real-time infrastructure!
