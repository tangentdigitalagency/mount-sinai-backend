# Send Message to AI

Send a message to the AI and receive a contextual, personalized response.

## Endpoint

**POST** `/api/ai-chat/sessions/:id/messages`

## Authentication

Required - Bearer token

## Request Parameters

| Parameter | Type   | Location | Required | Description  |
| --------- | ------ | -------- | -------- | ------------ |
| id        | string | URL      | Yes      | Session UUID |

## Request Body

```typescript
{
  content: string; // User's message (min 1 character)
}
```

## Response

```typescript
{
  success: boolean;
  data: {
    aiResponse: string;
    metadata: {
      versesCited?: string[];
      theologicalTopics?: string[];
      crossReferences?: string[];
      sourcesCited?: string[];
      confidence?: number;
    };
    formattedContent: {
      text: string;
      format: "markdown" | "html" | "plain";
      sections?: Array<{
        type: string;
        content: string;
        metadata?: Record<string, unknown>;
      }>;
    };
    tokensUsed: number;
  };
  message: string;
}
```

## Example with TanStack Query

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SendMessageRequest {
  content: string;
}

interface AIResponse {
  aiResponse: string;
  metadata: {
    versesCited?: string[];
    theologicalTopics?: string[];
    crossReferences?: string[];
    sourcesCited?: string[];
    confidence?: number;
  };
  formattedContent: {
    text: string;
    format: "markdown" | "html" | "plain";
    sections?: Array<{
      type: string;
      content: string;
      metadata?: Record<string, unknown>;
    }>;
  };
  tokensUsed: number;
}

export const useSendMessage = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await fetch(
        `/api/ai-chat/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      return response.json() as Promise<{
        success: true;
        data: AIResponse;
        message: string;
      }>;
    },
    onSuccess: () => {
      // Invalidate and refetch messages for this session
      queryClient.invalidateQueries({
        queryKey: ["ai-chat-messages", sessionId],
      });
      // Also invalidate session data to update last_message_at
      queryClient.invalidateQueries({
        queryKey: ["ai-chat-session", sessionId],
      });
    },
  });
};

// Usage in component
const sendMessageMutation = useSendMessage(sessionId);

const handleSendMessage = (content: string) => {
  sendMessageMutation.mutate({ content });
};
```

## Response Example

```json
{
  "success": true,
  "data": {
    "aiResponse": "Based on your question about salvation, let me explain the biblical foundation...",
    "metadata": {
      "versesCited": ["Ephesians 2:8-9", "Romans 3:23-24", "John 3:16"],
      "theologicalTopics": ["salvation", "grace", "faith"],
      "crossReferences": ["Romans 5:8", "Titus 3:5"],
      "sourcesCited": ["Systematic Theology by Wayne Grudem"],
      "confidence": 0.9
    },
    "formattedContent": {
      "text": "## Biblical Foundation\n\n**Ephesians 2:8-9** clearly states...",
      "format": "markdown",
      "sections": [
        {
          "type": "heading",
          "content": "Biblical Foundation"
        },
        {
          "type": "paragraph",
          "content": "Ephesians 2:8-9 clearly states..."
        }
      ]
    },
    "tokensUsed": 1250
  },
  "message": "Message sent successfully"
}
```

## AI Context Features

The AI has access to:

- **Full conversation history** for context continuity
- **User's notes and highlights** from current reading
- **Reading progress** and current book/chapter
- **Learning profile** with theological preferences
- **Cross-references** and trusted theological sources

## Response Formatting

AI responses include:

- **Markdown formatting** (bold, italics, headers, lists)
- **Verse references** in [Book Chapter:Verse] format
- **Cross-references** to related passages
- **Theological source citations**
- **Structured sections** for easy reading

## Learning Features

- **Automatic insight extraction** from conversations
- **User preference learning** over time
- **Personalized responses** based on study style
- **Context-aware recommendations**

## Status Codes

- `200` - Message sent successfully
- `400` - Invalid request data or session not active
- `401` - Unauthorized (invalid or missing token)
- `404` - Session not found
- `500` - Internal Server Error

## Notes

- Messages are saved with both user and AI responses
- AI learning insights are extracted asynchronously
- Token usage is tracked for cost monitoring
- Responses are formatted for frontend rendering
- Full conversation history is maintained for context
