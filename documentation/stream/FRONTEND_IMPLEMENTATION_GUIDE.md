# Stream Chat - Frontend Implementation Guide

## 🚨 Important: Real-time Chat with WebSockets

Stream Chat uses **WebSocket connections** for real-time messaging. Unlike the AI Chat system, this requires persistent connections and real-time updates.

## ✅ Correct Frontend Implementation

### 1. Setup Stream Client (One-time)

```typescript
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

// Initialize client once (singleton pattern)
const client = StreamChat.getInstance(STREAM_API_KEY);

export { client };
```

### 2. Get Token and Connect User

```typescript
const connectToStream = async (authToken: string) => {
  // 1. Get Stream token from backend
  const response = await fetch("/api/stream/token", {
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get Stream token");
  }

  const { data } = await response.json();
  const { token, user } = data;

  // 2. Connect user to Stream
  await client.connectUser(user, token);

  return client;
};
```

### 3. Create or Get Channel

```typescript
const getChannel = async (client: StreamChat, channelId: string) => {
  // Create or get a channel
  const channel = client.channel("messaging", channelId, {
    name: "General Chat",
    members: [client.userID], // Add current user as member
  });

  // Watch the channel (this sets up the WebSocket connection)
  await channel.watch();

  return channel;
};
```

### 4. React Component Example

```typescript
import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Window,
  ChannelHeader,
} from "stream-chat-react";
import { client } from "./stream-client";
import { connectToStream, getChannel } from "./stream-helpers";

const ChatInterface = ({ authToken }: { authToken: string }) => {
  const [streamClient, setStreamClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initStream = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Connect to Stream
        const connectedClient = await connectToStream(authToken);
        setStreamClient(connectedClient);

        // Create or get channel
        const channelId = "messaging:general";
        const newChannel = await getChannel(connectedClient, channelId);
        setChannel(newChannel);

        setIsConnecting(false);
      } catch (err: any) {
        setError(err.message || "Failed to connect to chat");
        setIsConnecting(false);
      }
    };

    if (authToken) {
      initStream();
    }

    // Cleanup on unmount
    return () => {
      if (streamClient) {
        streamClient.disconnectUser();
      }
    };
  }, [authToken]);

  if (isConnecting) {
    return <div>Connecting to chat...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!streamClient || !channel) {
    return <div>Not connected</div>;
  }

  return (
    <Chat client={streamClient}>
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </Chat>
  );
};
```

### 5. Send Messages

```typescript
// Messages are sent automatically via MessageInput component
// Or manually:

const sendMessage = async (channel: any, text: string) => {
  await channel.sendMessage({
    text,
  });
};
```

### 6. Listen to Real-time Updates

```typescript
// Listen to new messages
channel.on("message.new", (event) => {
  console.log("New message:", event.message);
  // Update UI if needed
});

// Listen to typing indicators
channel.on("typing.start", (event) => {
  console.log(`${event.user.name} is typing...`);
});

channel.on("typing.stop", (event) => {
  console.log(`${event.user.name} stopped typing`);
});

// Listen to user presence changes
streamClient.on("presence.changed", (event) => {
  console.log("User presence:", event);
});
```

## ❌ Common Mistakes to Avoid

### 1. Don't Create Multiple Client Instances

```typescript
// ❌ WRONG - Don't do this
const client1 = StreamChat.getInstance(API_KEY);
const client2 = StreamChat.getInstance(API_KEY);
const client3 = new StreamChat(API_KEY); // Don't use 'new'

// ✅ CORRECT - Use singleton
const client = StreamChat.getInstance(API_KEY);
```

### 2. Don't Forget to Disconnect

```typescript
// ❌ WRONG - Memory leak
useEffect(() => {
  connectToStream();
  // Forgot to disconnect!
}, []);

// ✅ CORRECT - Always cleanup
useEffect(() => {
  const client = await connectToStream();
  
  return () => {
    client.disconnectUser();
  };
}, []);
```

### 3. Don't Connect Multiple Times

```typescript
// ❌ WRONG - Multiple connections
useEffect(() => {
  connectToStream(); // Called on every render
}, []); // Empty deps but connectToStream might change

// ✅ CORRECT - Connect once
useEffect(() => {
  let isConnected = false;
  
  const connect = async () => {
    if (isConnected) return;
    isConnected = true;
    await connectToStream();
  };
  
  connect();
}, []);
```

### 4. Don't Call watch() Multiple Times

```typescript
// ❌ WRONG - Multiple watches
const channel = client.channel("messaging", "channel-id");
await channel.watch();
await channel.watch(); // Duplicate watch
await channel.watch(); // Another duplicate

// ✅ CORRECT - Watch once
const channel = client.channel("messaging", "channel-id");
await channel.watch();
```

### 5. Don't Store Token in Frontend

```typescript
// ❌ WRONG - Storing token
localStorage.setItem("stream_token", token);

// ✅ CORRECT - Request token on demand
const token = await getStreamToken();
```

## ✅ Best Practices

### 1. Connection State Management

```typescript
const useStreamConnection = (authToken: string) => {
  const [state, setState] = useState<{
    client: StreamChat | null;
    channel: any | null;
    isConnected: boolean;
    error: string | null;
  }>({
    client: null,
    channel: null,
    isConnected: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      try {
        const client = await connectToStream(authToken);
        
        if (!isMounted) return;

        const channel = await getChannel(client, "messaging:general");
        
        if (!isMounted) return;

        setState({
          client,
          channel,
          isConnected: true,
          error: null,
        });
      } catch (err: any) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            error: err.message,
            isConnected: false,
          }));
        }
      }
    };

    if (authToken) {
      connect();
    }

    return () => {
      isMounted = false;
      if (state.client) {
        state.client.disconnectUser();
      }
    };
  }, [authToken]);

  return state;
};
```

### 2. Error Handling

```typescript
const connectToStream = async (authToken: string) => {
  try {
    // Get token
    const tokenResponse = await fetch("/api/stream/token", {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!tokenResponse.ok) {
      if (tokenResponse.status === 503) {
        throw new Error("Chat service is temporarily unavailable");
      }
      throw new Error("Failed to get chat token");
    }

    const { data } = await tokenResponse.json();

    // Connect
    await client.connectUser(data.user, data.token);

    return client;
  } catch (error: any) {
    // Log error
    console.error("Stream connection error:", error);
    
    // Re-throw for component to handle
    throw error;
  }
};
```

### 3. Retry Logic

```typescript
const connectWithRetry = async (
  authToken: string,
  maxRetries = 3
): Promise<StreamChat> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await connectToStream(authToken);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on auth errors
      if (error.message.includes("authentication")) {
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError || new Error("Failed to connect after retries");
};
```

### 4. Loading States

```typescript
const ChatApp = () => {
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");

  const handleConnect = async () => {
    setConnectionState("connecting");
    
    try {
      await connectToStream(authToken);
      setConnectionState("connected");
    } catch (error) {
      setConnectionState("error");
    }
  };

  return (
    <div>
      {connectionState === "idle" && (
        <button onClick={handleConnect}>Connect to Chat</button>
      )}
      
      {connectionState === "connecting" && (
        <div>Connecting to chat...</div>
      )}
      
      {connectionState === "connected" && (
        <ChatInterface />
      )}
      
      {connectionState === "error" && (
        <div>
          <p>Failed to connect</p>
          <button onClick={handleConnect}>Retry</button>
        </div>
      )}
    </div>
  );
};
```

## 🎯 Key Points

- ✅ **WebSocket connection** - Persistent connection for real-time updates
- ✅ **Singleton client** - Use `getInstance()` not `new StreamChat()`
- ✅ **Watch channels** - Call `watch()` to receive real-time updates
- ✅ **Always disconnect** - Cleanup on component unmount
- ✅ **Request token on demand** - Don't cache tokens in frontend
- ✅ **Error handling** - Handle 503 errors gracefully
- ✅ **Connection state** - Track connection state in UI

## 🚀 Performance Tips

### 1. Lazy Load Stream Chat

```typescript
// Only load Stream Chat when user needs it
const ChatLazy = dynamic(() => import("./ChatInterface"), {
  loading: () => <div>Loading chat...</div>,
  ssr: false, // Stream Chat doesn't work with SSR
});
```

### 2. Reuse Client Instance

```typescript
// Create client once, reuse everywhere
// In a global store or context
const StreamContext = createContext<StreamChat | null>(null);
```

### 3. Optimize Channel Watching

```typescript
// Only watch channels user is actively viewing
// Unwatch when leaving channel
channel.stopWatching();
```

## 📱 Mobile Considerations

- ✅ **Touch-friendly** - Stream Chat components are mobile-optimized
- ✅ **Keyboard handling** - Automatic keyboard handling
- ✅ **Offline support** - Stream Chat handles offline gracefully
- ✅ **Push notifications** - Can integrate with push notifications

The key is: **WebSocket connection with proper cleanup** - real-time messaging with automatic connection management!

