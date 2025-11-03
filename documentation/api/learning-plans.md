# Learning Plans API

## Overview

Learning Plans allow users to create structured, AI-generated study plans for biblical topics. Each plan consists of multiple sessions with clear objectives and progressive content.

## Endpoints

### Create Learning Plan

Creates a new personalized learning plan for a biblical topic.

**Endpoint**: `POST /api/ai-chat/learning-plans`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Request Body

| Field          | Type   | Required | Description                                        |
| -------------- | ------ | -------- | -------------------------------------------------- |
| topic          | string | Yes      | Topic to learn (1-255 chars)                       |
| user_level     | enum   | No       | beginner/intermediate/advanced (default: beginner) |
| total_sessions | number | No       | Number of sessions (default: 3)                    |

#### Example Request

```json
{
  "topic": "The Trinity",
  "user_level": "beginner",
  "total_sessions": 3
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174001",
      "title": "Understanding the Trinity: A Beginner's Journey",
      "topic": "The Trinity",
      "description": "A comprehensive study of the Trinity tailored for beginner level learners.",
      "user_level": "beginner",
      "total_sessions": 3,
      "completed_sessions": 0,
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "completed_at": null
    },
    "sessions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "learning_plan_id": "123e4567-e89b-12d3-a456-426614174000",
        "session_number": 1,
        "title": "Session 1: Introduction to the Trinity",
        "objectives": [
          "Understand the basic concept of the Trinity",
          "Learn about the three persons of God",
          "Connect to biblical foundations"
        ],
        "content_outline": {
          "introduction": "What is the Trinity?",
          "main_content": "The Father, Son, and Holy Spirit",
          "application": "How this affects our faith",
          "conclusion": "Summary and next steps"
        },
        "is_completed": false,
        "completed_at": null,
        "notes": null,
        "chat_session_id": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "message": "Learning plan created successfully"
}
```

#### Error Responses

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `429 Too Many Requests`: Rate limit exceeded

---

### List Learning Plans

Retrieves user's learning plans with optional filtering.

**Endpoint**: `GET /api/ai-chat/learning-plans`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Query Parameters

| Parameter | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| status    | string | Filter by status (active/completed/paused/cancelled) |
| limit     | number | Number of results (default: 20, max: 100)            |
| offset    | number | Pagination offset (default: 0)                       |

#### Example Request

```
GET /api/ai-chat/learning-plans?status=active&limit=10&offset=0
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "title": "Understanding the Trinity: A Beginner's Journey",
        "topic": "The Trinity",
        "description": "A comprehensive study of the Trinity...",
        "user_level": "beginner",
        "total_sessions": 3,
        "completed_sessions": 1,
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "completed_at": null
      }
    ],
    "total": 5
  },
  "message": "Learning plans retrieved successfully"
}
```

---

### Get Learning Plan

Retrieves a specific learning plan with all sessions and progress information.

**Endpoint**: `GET /api/ai-chat/learning-plans/:id`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Path Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| id        | string | Learning plan UUID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174001",
      "title": "Understanding the Trinity: A Beginner's Journey",
      "topic": "The Trinity",
      "description": "A comprehensive study of the Trinity...",
      "user_level": "beginner",
      "total_sessions": 3,
      "completed_sessions": 1,
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "completed_at": null
    },
    "sessions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "learning_plan_id": "123e4567-e89b-12d3-a456-426614174000",
        "session_number": 1,
        "title": "Session 1: Introduction to the Trinity",
        "objectives": [
          "Understand the basic concept of the Trinity",
          "Learn about the three persons of God"
        ],
        "content_outline": { ... },
        "is_completed": true,
        "completed_at": "2024-01-15T11:00:00Z",
        "notes": "Great session! I understand the basics now.",
        "chat_session_id": "123e4567-e89b-12d3-a456-426614174003",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T11:00:00Z"
      }
    ],
    "progress": {
      "completedSessions": 1,
      "totalSessions": 3,
      "percentage": 33
    }
  },
  "message": "Learning plan retrieved successfully"
}
```

#### Error Responses

- `404 Not Found`: Learning plan not found
- `403 Forbidden`: Plan belongs to another user

---

### Update Learning Plan

Updates a learning plan's details.

**Endpoint**: `PATCH /api/ai-chat/learning-plans/:id`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Path Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| id        | string | Learning plan UUID |

#### Request Body

| Field       | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| title       | string | No       | New title                         |
| description | string | No       | New description                   |
| status      | enum   | No       | active/completed/paused/cancelled |

#### Example Request

```json
{
  "title": "Updated Trinity Study Plan",
  "status": "paused"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "title": "Updated Trinity Study Plan",
    "topic": "The Trinity",
    "description": "A comprehensive study of the Trinity...",
    "user_level": "beginner",
    "total_sessions": 3,
    "completed_sessions": 1,
    "status": "paused",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "completed_at": null
  },
  "message": "Learning plan updated successfully"
}
```

---

### Delete Learning Plan

Deletes a learning plan and all associated sessions.

**Endpoint**: `DELETE /api/ai-chat/learning-plans/:id`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Path Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| id        | string | Learning plan UUID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": null,
  "message": "Learning plan deleted successfully"
}
```

#### Error Responses

- `404 Not Found`: Learning plan not found
- `403 Forbidden`: Plan belongs to another user

---

### Complete Learning Session

Marks a learning session as completed and updates progress.

**Endpoint**: `POST /api/ai-chat/learning-plans/:planId/sessions/:sessionId/complete`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Path Parameters

| Parameter | Type   | Description           |
| --------- | ------ | --------------------- |
| planId    | string | Learning plan UUID    |
| sessionId | string | Learning session UUID |

#### Request Body

| Field        | Type    | Required | Description                       |
| ------------ | ------- | -------- | --------------------------------- |
| is_completed | boolean | No       | Mark as completed (default: true) |
| notes        | string  | No       | User's session notes              |

#### Example Request

```json
{
  "is_completed": true,
  "notes": "Great session! I learned a lot about the Trinity."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "learning_plan_id": "123e4567-e89b-12d3-a456-426614174000",
    "session_number": 1,
    "title": "Session 1: Introduction to the Trinity",
    "objectives": [
      "Understand the basic concept of the Trinity",
      "Learn about the three persons of God"
    ],
    "content_outline": { ... },
    "is_completed": true,
    "completed_at": "2024-01-15T12:00:00Z",
    "notes": "Great session! I learned a lot about the Trinity.",
    "chat_session_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  "message": "Session updated successfully"
}
```

#### Error Responses

- `404 Not Found`: Session or plan not found
- `403 Forbidden`: Session belongs to another user
- `400 Bad Request`: Invalid request data

## Data Types

### AILearningPlan

```typescript
interface AILearningPlan {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  description: string | null;
  user_level: "beginner" | "intermediate" | "advanced";
  total_sessions: number;
  completed_sessions: number;
  status: "active" | "completed" | "paused" | "cancelled";
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
```

### AILearningSession

```typescript
interface AILearningSession {
  id: string;
  learning_plan_id: string;
  session_number: number;
  title: string;
  objectives: string[];
  content_outline: Record<string, unknown> | null;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  chat_session_id: string | null;
  created_at: string;
  updated_at: string;
}
```

## Best Practices

1. **Plan Creation**: Start with 3-5 sessions for most topics
2. **Session Completion**: Always add notes to track your learning
3. **Progress Tracking**: Check plan progress regularly
4. **Status Management**: Use "paused" for temporary breaks, "cancelled" for permanent stops
5. **Chat Integration**: Link sessions to chat sessions for better context

## Rate Limits

- **Create/Update/Delete**: 20 requests per hour
- **List/Get**: 100 requests per hour
- **Complete Session**: 50 requests per hour

## Notes

- Learning plans are automatically generated using AI based on the topic and user level
- Sessions are designed to be progressive, building on previous knowledge
- Progress is automatically tracked when sessions are completed
- Plans can be linked to chat sessions for integrated learning experiences

