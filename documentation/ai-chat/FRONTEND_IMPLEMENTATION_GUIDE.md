# AI Chat Frontend Implementation Guide

## 🚨 Important: Single Response, No Typing Indicators

The AI Chat API is designed to return the **complete AI response immediately** in a single HTTP response. There should be **NO typing indicators** or **NO streaming** - just send the request and get the full response back.

## ✅ Correct Frontend Implementation

### 1. Send Message (Single Request/Response)

```typescript
const sendMessage = async (sessionId: string, content: string) => {
  // Show loading state
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { data } = await response.json();

    // Add BOTH user message and AI response to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content, timestamp: new Date() },
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
    showError("Failed to send message");
  } finally {
    setLoading(false);
  }
};
```

### 2. React Component Example

```typescript
const ChatInterface = ({ sessionId }: { sessionId: string }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Show loading state
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
          body: JSON.stringify({ content: userMessage }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const { data } = await response.json();

      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: userMessage,
          timestamp: new Date(),
        },
      ]);

      // Add AI response immediately
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.aiResponse,
          formattedContent: data.formattedContent,
          metadata: data.metadata,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      showError("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.role === "assistant" && message.formattedContent ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(message.formattedContent.text),
                }}
              />
            ) : (
              <div>{message.content}</div>
            )}
          </div>
        ))}

        {/* Show loading indicator ONLY while waiting for response */}
        {loading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button onClick={handleSendMessage} disabled={loading || !input.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
```

## ❌ Common Mistakes to Avoid

### 1. Don't Show Typing Indicator After Response

```typescript
// ❌ WRONG - Don't do this
const handleSendMessage = async () => {
  setLoading(true);
  const response = await sendMessage();
  setLoading(false);

  // ❌ Don't add typing indicator here
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content: "...", isTyping: true },
  ]);

  // ❌ Don't simulate typing delay
  setTimeout(() => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: response.data.aiResponse },
    ]);
  }, 2000);
};
```

### 2. Don't Add Messages Twice

```typescript
// ❌ WRONG - Don't do this
const handleSendMessage = async () => {
  // Add user message
  setMessages((prev) => [...prev, { role: "user", content: input }]);

  const response = await sendMessage();

  // ❌ Don't add AI response here if it's already in the response
  setMessages((prev) => [
    ...prev,
    { role: "assistant", content: response.data.aiResponse },
  ]);
};
```

### 3. Don't Use WebSockets or Streaming

```typescript
// ❌ WRONG - Don't use WebSockets
const socket = new WebSocket("/ws/ai-chat");
socket.onmessage = (event) => {
  // This is not needed - we get the full response immediately
};
```

## ✅ Correct Flow

1. **User types message** → Show in chat immediately
2. **User clicks send** → Show loading indicator
3. **API call** → Wait for response (2-5 seconds)
4. **Response received** → Hide loading, show AI response immediately
5. **Done** → Ready for next message

## 🎯 Key Points

- **Single HTTP request** → **Single response** with complete AI message
- **No streaming** → No WebSockets, no polling
- **No typing simulation** → Just show loading indicator while waiting
- **Immediate display** → Show both user message and AI response at once
- **Fast response** → 2-5 seconds typical response time

## 🚀 Performance Tips

### 1. Optimize Loading States

```typescript
// Show loading only while waiting for API response
const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

const handleSendMessage = async () => {
  setIsWaitingForResponse(true);
  try {
    const response = await sendMessage();
    // Handle response immediately
  } finally {
    setIsWaitingForResponse(false);
  }
};
```

### 2. Debounce Input

```typescript
// Prevent multiple rapid requests
const [isSending, setIsSending] = useState(false);

const handleSendMessage = async () => {
  if (isSending) return;

  setIsSending(true);
  try {
    await sendMessage();
  } finally {
    setIsSending(false);
  }
};
```

### 3. Error Handling

```typescript
const handleSendMessage = async () => {
  try {
    const response = await sendMessage();
    // Success - add messages to chat
  } catch (error) {
    // Show error message to user
    showError("Failed to send message. Please try again.");
  }
};
```

## 📱 Mobile Considerations

- **Touch-friendly** input area
- **Keyboard handling** for mobile devices
- **Scroll to bottom** when new messages arrive
- **Optimistic updates** for better UX

The key is: **Simple HTTP requests with immediate responses** - no complex real-time infrastructure needed!
