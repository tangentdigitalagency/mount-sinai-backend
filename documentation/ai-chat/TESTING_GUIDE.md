# AI Chat API Testing Guide

## Quick Test with cURL

### 1. Create a Chat Session

```bash
curl -X POST "https://your-api.com/api/ai-chat/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ai_version": "study",
    "title": "Test Chat",
    "context_book_id": "john",
    "context_chapter": 3
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "user_id": "user-uuid",
    "ai_version": "study",
    "title": "Test Chat",
    "context_book_id": "john",
    "context_chapter": 3,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_message_at": "2024-01-15T10:30:00Z"
  },
  "message": "Chat session created successfully"
}
```

### 2. Send a Message

```bash
curl -X POST "https://your-api.com/api/ai-chat/sessions/SESSION_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What does John 3:16 mean?"
  }'
```

**Expected Response** (Single Response):

```json
{
  "success": true,
  "data": {
    "aiResponse": "John 3:16 is one of the most well-known verses in the Bible...",
    "metadata": {
      "versesCited": ["John 3:16", "Romans 5:8"],
      "sourcesCited": ["ESV Study Bible", "Matthew Henry Commentary"],
      "theologicalTopics": ["salvation", "grace", "eternal life"],
      "confidence": 0.95
    },
    "formattedContent": {
      "text": "**John 3:16** is one of the most well-known verses...",
      "format": "markdown",
      "sections": [
        {
          "type": "paragraph",
          "content": "**John 3:16** is one of the most well-known verses..."
        }
      ]
    },
    "tokensUsed": 150
  },
  "message": "Message sent successfully"
}
```

### 3. Get Message History

```bash
curl -X GET "https://your-api.com/api/ai-chat/sessions/SESSION_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "session_id": "session-uuid",
        "role": "user",
        "content": "What does John 3:16 mean?",
        "formatted_content": null,
        "metadata": null,
        "tokens_used": null,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg-2",
        "session_id": "session-uuid",
        "role": "assistant",
        "content": "John 3:16 is one of the most well-known verses...",
        "formatted_content": {
          "text": "**John 3:16** is one of the most well-known verses...",
          "format": "markdown"
        },
        "metadata": {
          "versesCited": ["John 3:16"],
          "sourcesCited": ["ESV Study Bible"],
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

## Frontend Testing

### Test the Correct Flow

```typescript
// Test function to verify single response
const testChatFlow = async () => {
  console.log("1. Creating session...");
  const session = await createSession({
    ai_version: "study",
    title: "Test Chat",
  });
  console.log("Session created:", session.id);

  console.log("2. Sending message...");
  const startTime = Date.now();

  const response = await sendMessage(session.id, "What does John 3:16 mean?");

  const endTime = Date.now();
  console.log(`Response received in ${endTime - startTime}ms`);
  console.log("AI Response:", response.aiResponse);
  console.log("Metadata:", response.metadata);

  // Verify single response
  console.log("✅ Single response received");
  console.log("✅ No streaming or WebSocket needed");
  console.log("✅ Complete AI response in one response");
};

testChatFlow();
```

### Test Error Handling

```typescript
const testErrorHandling = async () => {
  try {
    // Test invalid session
    await sendMessage("invalid-session-id", "Hello");
  } catch (error) {
    console.log("✅ Error handled correctly:", error.message);
  }

  try {
    // Test rate limiting
    for (let i = 0; i < 15; i++) {
      await sendMessage(sessionId, `Message ${i}`);
    }
  } catch (error) {
    console.log("✅ Rate limit handled correctly:", error.message);
  }
};
```

## Performance Testing

### Response Time Test

```typescript
const testResponseTime = async () => {
  const times = [];

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await sendMessage(sessionId, `Test message ${i}`);
    const end = Date.now();
    times.push(end - start);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`Average response time: ${avgTime}ms`);

  // Should be 2-5 seconds typically
  if (avgTime > 10000) {
    console.warn("⚠️ Response time is slower than expected");
  } else {
    console.log("✅ Response time is acceptable");
  }
};
```

## Common Issues to Check

### 1. Double Messages

- ✅ **Correct**: Single HTTP request → Single response
- ❌ **Wrong**: Multiple requests or WebSocket connections

### 2. Typing Indicators

- ✅ **Correct**: Show loading indicator while waiting for response
- ❌ **Wrong**: Show typing indicator after receiving response

### 3. Response Format

- ✅ **Correct**: `data.aiResponse` contains complete AI message
- ❌ **Wrong**: Expecting streaming or partial responses

### 4. Error Handling

- ✅ **Correct**: Handle 400, 401, 403, 404, 429, 500 errors
- ❌ **Wrong**: Not handling errors or showing generic messages

## Debugging Tips

### 1. Check Network Tab

- Look for single POST request to `/api/ai-chat/sessions/:id/messages`
- Verify response contains complete AI message
- Check for any WebSocket connections (should be none)

### 2. Check Console Logs

```typescript
const sendMessage = async (sessionId: string, content: string) => {
  console.log("Sending message:", content);

  const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  console.log("Response status:", response.status);
  const data = await response.json();
  console.log("Response data:", data);

  // Should see single response with complete AI message
  return data;
};
```

### 3. Verify Response Structure

```typescript
const verifyResponse = (response) => {
  console.log("Response structure check:");
  console.log("- success:", response.success);
  console.log("- data.aiResponse:", typeof response.data.aiResponse);
  console.log("- data.metadata:", response.data.metadata);
  console.log("- data.formattedContent:", response.data.formattedContent);

  // All should be present and complete
  if (response.success && response.data.aiResponse) {
    console.log("✅ Response structure is correct");
  } else {
    console.log("❌ Response structure is incorrect");
  }
};
```

The key is: **Simple HTTP requests with immediate, complete responses** - no complex real-time infrastructure needed!
