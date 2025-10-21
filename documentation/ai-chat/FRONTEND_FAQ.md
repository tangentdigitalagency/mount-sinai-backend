# AI Chat System - Frontend FAQ

## 🤔 Frontend Questions Answered

### 1. **Authentication: How do we get the token?**

✅ **Answer**: Use your existing auth system - no separate flow needed!

```typescript
// Your existing auth method works perfectly
const authToken = await getAuthToken(); // Your current auth system

// Include in AI Chat API requests
const response = await fetch("/api/ai-chat/sessions", {
  headers: {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  },
});
```

**The AI Chat API integrates seamlessly with your existing Supabase auth system.**

### 2. **Real-time Updates: WebSockets or polling?**

✅ **Answer**: Neither! Simple HTTP requests with immediate responses.

```typescript
// Send message and get AI response immediately
const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, {
  method: "POST",
  body: JSON.stringify({ content: "What does John 3:16 mean?" }),
});

const { data } = await response.json();
// AI response is immediately available in data.aiResponse
// No WebSockets, no polling, no streaming needed!
```

**The system is designed for simplicity - send message, get response, done!**

### 3. **Message Pagination: Full endpoint documentation**

✅ **Answer**: Complete documentation now available!

**Endpoint**: `GET /api/ai-chat/sessions/:id/messages`

**Query Parameters**:

- `limit` (optional): Number of messages (default: 50, max: 100)
- `offset` (optional): Messages to skip (default: 0)

**Response Format**:

```typescript
{
  "success": true,
  "data": {
    "messages": [...], // Array of messages
    "pagination": {
      "limit": 50,
      "offset": 0,
      "has_more": false,
      "total": 25
    }
  }
}
```

**See**: `documentation/ai-chat/get-messages.md` for complete details.

### 4. **Error Handling: What error codes to expect?**

✅ **Answer**: Comprehensive error handling implemented!

**Common Error Codes**:

- `400` - Invalid request data
- `401` - User not authenticated
- `403` - Access denied (user doesn't own session)
- `404` - Chat session not found
- `429` - Rate limit exceeded
- `500` - Internal server error

**Error Response Format**:

```typescript
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": "Additional details"
}
```

**See**: `documentation/ai-chat/FRONTEND_INTEGRATION.md` for complete error handling guide.

### 5. **Rate Limiting: What are the limits?**

✅ **Answer**: Rate limiting implemented with clear limits!

**Rate Limits**:

- **Message sending**: 10 messages per minute per user
- **Session creation**: 5 sessions per hour per user
- **Learning profile updates**: 20 updates per hour per user
- **General endpoints**: 30 requests per minute per user

**Rate Limit Headers**:

```typescript
{
  'X-RateLimit-Limit': '10',
  'X-RateLimit-Remaining': '7',
  'X-RateLimit-Reset': '1640995200'
}
```

**Rate limiting is disabled in development mode.**

### 6. **File Attachments: Can users attach files?**

✅ **Answer**: Text-only messages for now.

**Current Support**:

- ✅ **Text messages** with theological questions
- ✅ **Verse references** and biblical citations
- ❌ **File uploads** (images, documents) - not supported

**Future Considerations**: File attachments can be added later if needed.

### 7. **Session Management: How do we handle cleanup?**

✅ **Answer**: Manual session management with no automatic cleanup.

**Session Lifecycle**:

```typescript
// 1. Create session
const session = await createSession({
  ai_version: "study",
  title: "Genesis Study",
});

// 2. Use session (send messages)
await sendMessage(session.id, "What does this mean?");

// 3. Update session context
await updateSession(session.id, {
  context_book_id: "matthew",
  context_chapter: 5,
});

// 4. Delete session (optional)
await deleteSession(session.id);
```

**Session States**:

- `is_active: true` - Can send messages
- `is_active: false` - Cannot send messages (archived)
- **No automatic cleanup** - sessions persist indefinitely
- **Manual cleanup** - users delete sessions they no longer need

### 8. **Context Updates: Can we update session context?**

✅ **Answer**: Yes! Dynamic context updates supported.

**Update Session Context**:

```typescript
// Update when user changes reading
await updateSession(sessionId, {
  context_book_id: "matthew",
  context_chapter: 5,
  context_version_id: "esv",
});

// AI will now know user is reading Matthew 5
```

**Context Fields**:

- `context_book_id` - Current book (e.g., 'genesis', 'matthew')
- `context_chapter` - Current chapter number
- `context_version_id` - Bible version (e.g., 'esv', 'niv')

**Context Impact**:

- AI responses reference current book/chapter
- Greeting messages mention current reading
- Cross-references are relevant to current context
- Learning profile adapts to reading patterns

## 🚀 Implementation Summary

### **No Complex Infrastructure Needed**

- ❌ No WebSockets
- ❌ No streaming
- ❌ No polling
- ❌ No real-time updates
- ✅ Simple HTTP requests
- ✅ Immediate responses
- ✅ Standard REST API

### **Authentication Integration**

- ✅ Uses existing auth system
- ✅ Same Bearer token
- ✅ No separate auth flow

### **Rate Limiting**

- ✅ Implemented and configured
- ✅ Clear limits documented
- ✅ Headers included in responses
- ✅ Disabled in development

### **Error Handling**

- ✅ Comprehensive error codes
- ✅ Consistent error format
- ✅ Frontend-friendly messages

### **Session Management**

- ✅ Manual session lifecycle
- ✅ Context updates supported
- ✅ No automatic cleanup
- ✅ User-controlled deletion

## 📚 Complete Documentation

All questions are now fully documented:

1. **`FRONTEND_INTEGRATION.md`** - Complete integration guide
2. **`get-messages.md`** - Message pagination documentation
3. **`FRONTEND_FAQ.md`** - This FAQ document
4. **Individual endpoint docs** - Each API endpoint documented

## 🎯 Ready for Frontend Implementation

The AI Chat system is designed to be **simple, fast, and reliable** without complex real-time infrastructure. Perfect for straightforward frontend integration!
