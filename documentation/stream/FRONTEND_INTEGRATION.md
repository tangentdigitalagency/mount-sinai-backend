# Stream Chat - Frontend Integration Guide

## Overview

This document provides comprehensive guidance for integrating Stream Chat into your frontend application. Stream Chat enables real-time messaging functionality with WebSocket connections, push notifications, and a rich chat UI.

## 🔐 Authentication

### How to Get the Stream Token

The Stream Chat integration uses your existing authentication system:

```typescript
// 1. Get your existing auth token (Supabase)
const authToken = await getAuthToken(); // Your existing auth method

// 2. Request Stream Chat token from backend
const response = await fetch("/api/stream/token", {
  headers: {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  },
});

const { data } = await response.json();
// data.token: Stream Chat JWT token
// data.user: User data formatted for Stream
// data.isNewUser: Whether this is first-time Stream sync
```

**The backend handles all Stream authentication** - you just need to get the token once and use it to connect to Stream Chat.

### Token Lifecycle

```typescript
// Get token when user needs to use chat
const getStreamToken = async () => {
  const response = await fetch("/api/stream/token", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Stream token");
  }

  const { data } = await response.json();
  return data.token; // Use this token to connect to Stream
};
```

**Token Management:**
- ✅ **Generate on demand** - Request token when user needs chat
- ✅ **Backend manages** - Server handles token creation and user sync
- ✅ **No token storage** - Don't store tokens in frontend (generate fresh each time)
- ✅ **DAU protection** - Backend tracks user sync to prevent duplicate DAU counts

## 🚀 Quick Start

### 1. Install Stream Chat Client SDK

```bash
npm install stream-chat
# or
yarn add stream-chat
```

### 2. Initialize Stream Client

```typescript
import { StreamChat } from "stream-chat";

// Get Stream API key from environment (public key, safe to expose)
const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || "your_api_key";

// Initialize client (use your API key, not secret - secret is backend only)
const client = StreamChat.getInstance(STREAM_API_KEY);
```

### 3. Get Token and Connect User

```typescript
const connectToStream = async () => {
  // 1. Get Stream token from your backend
  const tokenResponse = await fetch("/api/stream/token", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const { data } = await tokenResponse.json();
  const { token, user } = data;

  // 2. Connect user to Stream Chat
  await client.connectUser(
    {
      id: user.id,
      name: user.name,
      image: user.image,
      email: user.email,
      // Add any custom fields
      ...user,
    },
    token
  );

  return client;
};
```

### 4. Use Stream Chat Components

```typescript
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

const ChatInterface = () => {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const initStream = async () => {
      const streamClient = await connectToStream();
      setClient(streamClient);

      // Create or get a channel
      const channelId = "messaging:general";
      const channel = streamClient.channel("messaging", channelId, {
        name: "General Chat",
      });
      await channel.watch();
      setChannel(channel);
    };

    initStream();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, []);

  if (!client || !channel) {
    return <div>Connecting to chat...</div>;
  }

  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <Window>
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </Chat>
  );
};
```

## 📡 Real-time Features

### ✅ WebSocket Connection

Stream Chat uses **WebSocket connections** for real-time messaging:

```typescript
// Client automatically handles WebSocket connection
await client.connectUser(user, token);

// Connection is maintained automatically
// Messages arrive in real-time via WebSocket
```

### ✅ Real-time Message Updates

```typescript
// Messages update in real-time automatically
// No polling needed - WebSocket handles everything

const channel = client.channel("messaging", "channel-id");
await channel.watch();

// Listen to new messages
channel.on("message.new", (event) => {
  console.log("New message:", event.message);
  // Update your UI
});
```

### ✅ Typing Indicators

```typescript
// Typing indicators work automatically with Stream Chat
// Users see when others are typing

channel.on("typing.start", (event) => {
  console.log(`${event.user.name} is typing...`);
});

channel.on("typing.stop", (event) => {
  console.log(`${event.user.name} stopped typing`);
});
```

### ✅ Online Status

```typescript
// User online/offline status
client.on("presence.changed", (event) => {
  console.log("User status changed:", event);
});
```

## 🔄 API Endpoint

### GET /api/stream/token

**Description**: Get or create Stream Chat token for authenticated user.

**Authentication**: Required (Bearer token in Authorization header)

**Request**:
```typescript
GET /api/stream/token
Headers: {
  Authorization: "Bearer <your-auth-token>"
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    token: "stream_jwt_token",
    user: {
      id: "user-uuid",
      name: "First Last",
      email: "user@example.com",
      image: "https://example.com/avatar.jpg",
      username: "username",
      first_name: "First",
      last_name: "Last",
      avatar_type: "upload"
    },
    isNewUser: true // false if user already existed in Stream
  },
  message: "Stream Chat token created successfully"
}
```

**Error Responses**:
```typescript
// 401 - Not authenticated
{
  success: false,
  error: "User not authenticated"
}

// 503 - Stream service unavailable
{
  success: false,
  error: "Stream Chat service is currently unavailable. Please try again later."
}

// 500 - Server error
{
  success: false,
  error: "Failed to get Stream Chat token"
}
```

## ⚠️ Error Handling

### Standard Error Response Format

```typescript
{
  success: false,
  error: "Error message",
  statusCode: 503
}
```

### Common Error Codes

| Status | Error                      | Description                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| 401    | User not authenticated     | Missing or invalid auth token                   |
| 503    | Stream service unavailable | Stream Chat API is down or unreachable        |
| 500    | Internal server error      | Backend error (check logs)                     |
| 429    | Rate limit exceeded        | Too many requests (see rate limiting section)   |

### Frontend Error Handling

```typescript
const getStreamToken = async () => {
  try {
    const response = await fetch("/api/stream/token", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 503) {
        // Stream service is down
        showError("Chat service is temporarily unavailable. Please try again later.");
        return null;
      }
      
      throw new Error(error.error);
    }

    const { data } = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error getting Stream token:", error);
    showError("Failed to connect to chat. Please try again.");
    return null;
  }
};
```

## 🚦 Rate Limiting

### Current Limits

- **Token requests**: General rate limit (30 requests per minute per user)

### Rate Limit Headers

```typescript
// Response headers include rate limit info
{
  'X-RateLimit-Limit': '30',
  'X-RateLimit-Remaining': '25',
  'X-RateLimit-Reset': '1640995200'
}
```

### Handling Rate Limits

```typescript
if (response.status === 429) {
  const resetTime = response.headers.get("X-RateLimit-Reset");
  
  showError(`Too many requests. Try again in ${resetTime} seconds.`);
}
```

## 🎯 Implementation Examples

### Complete Integration Flow

```typescript
import { StreamChat } from "stream-chat";
import { useState, useEffect } from "react";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export const useStreamChat = () => {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const connect = async (authToken: string) => {
    try {
      // 1. Get Stream token from backend
      const tokenResponse = await fetch("/api/stream/token", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || "Failed to get Stream token");
      }

      const { data } = await tokenResponse.json();
      const { token, user } = data;

      // 2. Initialize Stream client
      const streamClient = StreamChat.getInstance(STREAM_API_KEY);

      // 3. Connect user
      await streamClient.connectUser(user, token);

      setClient(streamClient);
      setIsConnected(true);
      setError(null);

      return streamClient;
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
      throw err;
    }
  };

  const disconnect = async () => {
    if (client) {
      await client.disconnectUser();
      setClient(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return { client, isConnected, error, connect, disconnect };
};
```

### React Hook Example

```typescript
const ChatApp = () => {
  const authToken = useAuthToken(); // Your existing auth hook
  const { client, isConnected, error, connect, disconnect } = useStreamChat();
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (authToken && !isConnected) {
      connect(authToken);
    }
  }, [authToken, isConnected]);

  useEffect(() => {
    if (client && !channel) {
      const initChannel = async () => {
        const channelId = "messaging:general";
        const newChannel = client.channel("messaging", channelId, {
          name: "General Chat",
        });
        await newChannel.watch();
        setChannel(newChannel);
      };

      initChannel();
    }
  }, [client, channel]);

  if (!isConnected || !channel) {
    return <div>Connecting to chat...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <Window>
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </Chat>
  );
};
```

### TypeScript Types

```typescript
interface StreamTokenResponse {
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
      avatar_type?: string;
      [key: string]: unknown;
    };
    isNewUser: boolean;
  };
  message: string;
}

interface StreamErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}
```

## 🔧 Technical Notes

### Token Generation Strategy

- **On-demand**: Generate token when user needs chat access
- **Backend managed**: Server handles token creation and user sync
- **DAU protection**: Backend tracks user sync to prevent duplicate counts
- **No caching**: Don't cache tokens in frontend (request fresh each time)

### User Synchronization

- **Automatic sync**: Backend automatically syncs user data to Stream
- **First-time setup**: First token request creates user in Stream
- **Profile updates**: Subsequent requests update user data if profile changed

### Connection Management

- **WebSocket lifecycle**: Stream client handles connection automatically
- **Reconnection**: Stream client automatically reconnects on network issues
- **Cleanup**: Always disconnect user when component unmounts

### Performance Considerations

- **Connection time**: ~500ms to connect user
- **Token generation**: ~200ms (backend request)
- **WebSocket latency**: Real-time (<100ms for messages)
- **Message delivery**: Reliable delivery with automatic retry

## 🚀 Getting Started

1. **Install Stream Chat SDK**: `npm install stream-chat stream-chat-react`
2. **Get API key**: Add `NEXT_PUBLIC_STREAM_API_KEY` to your environment
3. **Get token**: Call `/api/stream/token` endpoint with auth token
4. **Connect user**: Use token to connect user to Stream Chat
5. **Use components**: Use Stream Chat React components for UI

The backend handles all authentication and user management - the frontend just needs to get the token and connect!

## 📚 Additional Resources

- [Stream Chat React Documentation](https://getstream.io/chat/docs/react/)
- [Stream Chat JavaScript SDK](https://getstream.io/chat/docs/js/)
- [Stream Chat UI Components](https://getstream.io/chat/docs/react/)

## 🎯 Key Points

- ✅ **Backend handles auth** - Frontend just requests token
- ✅ **Real-time WebSocket** - Automatic connection management
- ✅ **DAU protection** - Backend tracks user sync
- ✅ **Simple integration** - Just get token and connect
- ✅ **Error handling** - Friendly error messages for users

