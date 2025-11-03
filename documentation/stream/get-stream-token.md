# Get Stream Chat Token

## Endpoint

`GET /api/stream/token`

## Description

Get or create a Stream Chat JWT token for the authenticated user. The backend handles user synchronization with Stream Chat, token generation, and DAU tracking to prevent duplicate user creation.

## Authentication

**Required**: Bearer token in Authorization header

```typescript
Headers: {
  Authorization: "Bearer <your-auth-token>"
}
```

## Request

```http
GET /api/stream/token HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**No request body required**

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDU2Nzg5MCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://example.com/avatar.jpg",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_type": "upload"
    },
    "isNewUser": true
  },
  "message": "Stream Chat token created successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | Stream Chat JWT token to use for connecting |
| `user` | object | User data formatted for Stream Chat |
| `user.id` | string | User UUID (same as auth.users.id) |
| `user.name` | string? | Full name (first + last name or username) |
| `user.email` | string? | User email address |
| `user.image` | string? | Profile picture URL |
| `user.username` | string? | Username |
| `user.first_name` | string? | First name |
| `user.last_name` | string? | Last name |
| `user.avatar_type` | string? | Avatar type ("upload" or "generated") |
| `isNewUser` | boolean | `true` if this is first-time Stream sync, `false` if user already existed |

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "error": "User not authenticated"
}
```

**Cause**: Missing or invalid authentication token

### 503 Service Unavailable

```json
{
  "success": false,
  "error": "Stream Chat service is currently unavailable. Please try again later."
}
```

**Cause**: Stream Chat API is down or unreachable

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to get Stream Chat token"
}
```

**Cause**: Backend error (check server logs)

## Usage Examples

### JavaScript/TypeScript

```typescript
const getStreamToken = async (authToken: string) => {
  const response = await fetch("/api/stream/token", {
    method: "GET",
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
  return data.token;
};
```

### React Hook

```typescript
import { useState } from "react";
import { StreamChat } from "stream-chat";

const useStreamConnection = (authToken: string) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get Stream token
      const response = await fetch("/api/stream/token", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get Stream token");
      }

      const { data } = await response.json();
      const { token, user } = data;

      // Initialize Stream client
      const streamClient = StreamChat.getInstance(STREAM_API_KEY);

      // Connect user
      await streamClient.connectUser(user, token);

      setClient(streamClient);
      return streamClient;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { client, connect, loading, error };
};
```

### Complete Integration Example

```typescript
import { StreamChat } from "stream-chat";
import { useEffect, useState } from "react";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const useStreamChat = (authToken: string) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get Stream token
        const tokenResponse = await fetch("/api/stream/token", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to get Stream token");
        }

        const { data } = await tokenResponse.json();

        // 2. Initialize and connect
        const streamClient = StreamChat.getInstance(STREAM_API_KEY!);
        await streamClient.connectUser(data.user, data.token);
        setClient(streamClient);

        // 3. Create or get channel
        const channelId = "messaging:general";
        const newChannel = streamClient.channel("messaging", channelId, {
          name: "General Chat",
        });
        await newChannel.watch();
        setChannel(newChannel);
      } catch (error) {
        console.error("Stream connection error:", error);
      }
    };

    if (authToken) {
      init();
    }

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [authToken]);

  return { client, channel };
};
```

## Notes

### Token Lifecycle

- **First request**: Creates user in Stream, returns `isNewUser: true`
- **Subsequent requests**: Refreshes token, updates user data if changed, returns `isNewUser: false`
- **Token usage**: Use token immediately to connect - don't store in frontend
- **Token expiration**: Tokens are long-lived but can be refreshed on demand

### DAU Protection

The backend tracks user sync to prevent duplicate daily active user (DAU) counts:
- Checks if user already exists in Stream
- Only creates new Stream user on first token request
- Subsequent requests just refresh token and update user data

### User Data Synchronization

The backend automatically syncs all available user data from Supabase:
- Basic fields: `id`, `name`, `email`, `image`
- Profile fields: `username`, `first_name`, `last_name`
- Avatar fields: `avatar_type`, `profile_picture_url`
- All custom fields from Supabase users table

### Error Handling

```typescript
try {
  const response = await fetch("/api/stream/token", {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) {
    if (response.status === 503) {
      // Stream service is down
      showError("Chat service is temporarily unavailable. Please try again later.");
      return null;
    }

    const error = await response.json();
    throw new Error(error.error);
  }

  const { data } = await response.json();
  return data.token;
} catch (error) {
  console.error("Error getting Stream token:", error);
  showError("Failed to connect to chat. Please try again.");
  return null;
}
```

## Rate Limiting

Token requests are rate-limited:
- **Limit**: 30 requests per minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Status**: 429 if limit exceeded

## Related Documentation

- [Frontend Integration Guide](./FRONTEND_INTEGRATION.md)
- [Frontend Implementation Guide](./FRONTEND_IMPLEMENTATION_GUIDE.md)
- [Frontend FAQ](./FRONTEND_FAQ.md)

