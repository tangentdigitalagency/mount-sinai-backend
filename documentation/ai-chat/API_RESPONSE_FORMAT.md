# AI Chat API Response Format

## Send Message Response

**Endpoint**: `POST /api/ai-chat/sessions/:id/messages`

**Request**:

```json
{
  "content": "What does John 3:16 mean?"
}
```

**Response** (Single HTTP Response):

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
      "text": "**John 3:16** is one of the most well-known verses in the Bible...",
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

## Frontend Implementation

### ✅ Correct Implementation

```typescript
const sendMessage = async (sessionId: string, content: string) => {
  setLoading(true);

  try {
    const response = await fetch(
      `/api/ai-chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );

    const { data } = await response.json();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: content,
        timestamp: new Date(),
      },
    ]);

    // Add AI response (single response, no typing indicator)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.aiResponse,
        formattedContent: data.formattedContent,
        metadata: data.metadata,
        timestamp: new Date(),
      },
    ]);
  } catch (error) {
    console.error("Chat error:", error);
  } finally {
    setLoading(false);
  }
};
```

### ❌ Common Mistakes

#### 1. Double Messages

```typescript
// ❌ WRONG - Don't add messages twice
const handleSendMessage = async () => {
  // Add user message
  setMessages((prev) => [...prev, { role: "user", content: input }]);

  const response = await sendMessage();

  // ❌ Don't add AI response here if backend already saves it
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content: response.data.aiResponse },
  ]);
};
```

#### 2. Typing Indicators After Response

```typescript
// ❌ WRONG - Don't show typing after getting response
const handleSendMessage = async () => {
  const response = await sendMessage();

  // ❌ Don't show typing indicator here
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content: "...", isTyping: true },
  ]);

  // ❌ Don't simulate delay
  setTimeout(() => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: response.data.aiResponse },
    ]);
  }, 2000);
};
```

#### 3. WebSocket/Streaming

```typescript
// ❌ WRONG - Don't use WebSockets
const socket = new WebSocket("/ws/ai-chat");
socket.onmessage = (event) => {
  // This is not needed - we get full response immediately
};
```

## Response Time

- **Typical response time**: 2-5 seconds
- **No streaming**: Complete response in single HTTP response
- **No WebSockets**: Simple HTTP POST/GET requests
- **No polling**: Just send request, get response

## Error Handling

```typescript
const sendMessage = async (sessionId: string, content: string) => {
  try {
    const response = await fetch(
      `/api/ai-chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
```

## Key Points

1. **Single HTTP request** → **Single response** with complete AI message
2. **No streaming** → No WebSockets, no polling, no typing indicators
3. **Immediate display** → Show both user message and AI response at once
4. **Fast response** → 2-5 seconds typical response time
5. **Simple implementation** → Just HTTP requests, no complex real-time infrastructure

The backend saves both the user message and AI response to the database, but the frontend should only display them once in the UI.
