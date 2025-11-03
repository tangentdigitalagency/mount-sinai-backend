# AI Chat & Learning Journey API Documentation

## Overview

This API provides comprehensive AI-powered biblical study features including conversational chat, personalized learning plans, progress tracking, and gamification.

## Base URL

```
https://your-api-domain.com/api/ai-chat
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limits

- **General endpoints**: 100 requests per hour
- **Learning profile endpoints**: 20 requests per hour
- **Chat endpoints**: 50 requests per hour

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Endpoints Overview

### Chat Sessions

- `POST /sessions` - Create new chat session
- `GET /sessions` - List user's chat sessions
- `GET /sessions/:id` - Get specific session
- `PATCH /sessions/:id` - Update session
- `DELETE /sessions/:id` - Delete session

### Chat Messages

- `POST /sessions/:id/messages` - Send message to AI
- `GET /sessions/:id/messages` - Get conversation history

### Learning Plans

- `POST /learning-plans` - Create new learning plan
- `GET /learning-plans` - List user's learning plans
- `GET /learning-plans/:id` - Get specific plan with sessions
- `PATCH /learning-plans/:id` - Update learning plan
- `DELETE /learning-plans/:id` - Delete learning plan
- `POST /learning-plans/:planId/sessions/:sessionId/complete` - Complete session

### Learning Profiles

- `GET /learning-profile` - Get user's AI learning profile
- `PATCH /learning-profile` - Update learning profile
- `DELETE /learning-profile/:id` - Delete specific insight

## Quick Start

1. **Create a chat session**:

   ```bash
   POST /api/ai-chat/sessions
   {
     "ai_version": "study",
     "context_book_id": "JHN",
     "context_chapter": 3
   }
   ```

2. **Send a message**:

   ```bash
   POST /api/ai-chat/sessions/{sessionId}/messages
   {
     "message": "I want to learn about the Trinity"
   }
   ```

3. **Create a learning plan**:
   ```bash
   POST /api/ai-chat/learning-plans
   {
     "topic": "The Trinity",
     "user_level": "beginner",
     "total_sessions": 3
   }
   ```

## Error Codes

| Code                  | HTTP Status | Description                       |
| --------------------- | ----------- | --------------------------------- |
| `UNAUTHORIZED`        | 401         | Missing or invalid authentication |
| `FORBIDDEN`           | 403         | Insufficient permissions          |
| `NOT_FOUND`           | 404         | Resource not found                |
| `VALIDATION_ERROR`    | 400         | Invalid request data              |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                 |
| `INTERNAL_ERROR`      | 500         | Server error                      |

## Pagination

List endpoints support pagination:

```
GET /api/ai-chat/learning-plans?limit=20&offset=0
```

Response includes pagination info:

```json
{
  "success": true,
  "data": {
    "plans": [...],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## Webhooks (Future)

Webhook support for real-time updates will be added in future versions.

## Support

For API support, contact: api-support@mountsinai.app

