# API Examples

## Complete Request/Response Examples

### 1. Create Learning Plan Flow

#### Step 1: Create Learning Plan

**Request:**

```bash
POST /api/ai-chat/learning-plans
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "topic": "The Trinity",
  "user_level": "beginner",
  "total_sessions": 3
}
```

**Response:**

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
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "learning_plan_id": "123e4567-e89b-12d3-a456-426614174000",
        "session_number": 2,
        "title": "Session 2: The Three Persons",
        "objectives": [
          "Deep dive into each person of the Trinity",
          "Understand their distinct roles",
          "Explore biblical evidence"
        ],
        "content_outline": {
          "introduction": "Review of Trinity basics",
          "main_content": "Father, Son, Holy Spirit in detail",
          "application": "Personal relationship with each",
          "conclusion": "Preparing for final session"
        },
        "is_completed": false,
        "completed_at": null,
        "notes": null,
        "chat_session_id": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174004",
        "learning_plan_id": "123e4567-e89b-12d3-a456-426614174000",
        "session_number": 3,
        "title": "Session 3: Living with the Trinity",
        "objectives": [
          "Apply Trinity understanding to daily life",
          "Explore prayer and worship",
          "Connect to Christian community"
        ],
        "content_outline": {
          "introduction": "Bringing it all together",
          "main_content": "Practical application",
          "application": "Daily Trinity awareness",
          "conclusion": "Continued growth"
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

#### Step 2: Complete First Session

**Request:**

```bash
POST /api/ai-chat/learning-plans/123e4567-e89b-12d3-a456-426614174000/sessions/123e4567-e89b-12d3-a456-426614174002/complete
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "is_completed": true,
  "notes": "Great session! I now understand the basic concept of the Trinity. The three persons are distinct but one God. Looking forward to the next session!"
}
```

**Response:**

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
      "Learn about the three persons of God",
      "Connect to biblical foundations"
    ],
    "content_outline": {
      "introduction": "What is the Trinity?",
      "main_content": "The Father, Son, and Holy Spirit",
      "application": "How this affects our faith",
      "conclusion": "Summary and next steps"
    },
    "is_completed": true,
    "completed_at": "2024-01-15T11:00:00Z",
    "notes": "Great session! I now understand the basic concept of the Trinity. The three persons are distinct but one God. Looking forward to the next session!",
    "chat_session_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "Session updated successfully"
}
```

### 2. AI Chat with Learning Intent Detection

#### Step 1: Create Chat Session

**Request:**

```bash
POST /api/ai-chat/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "ai_version": "study",
  "context_book_id": "JHN",
  "context_chapter": 3,
  "context_version_id": "ESV"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174005",
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "ai_version": "study",
    "title": "Study Session - John 3",
    "context_book_id": "JHN",
    "context_chapter": 3,
    "context_version_id": "ESV",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_message_at": "2024-01-15T10:30:00Z"
  },
  "message": "Chat session created successfully"
}
```

#### Step 2: Send Message with Learning Intent

**Request:**

```bash
POST /api/ai-chat/sessions/123e4567-e89b-12d3-a456-426614174005/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "message": "I want to learn about the Trinity. Can you help me understand it better?"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "aiResponse": "Hey David! I'd love to help you understand the Trinity! This is such an important and beautiful aspect of our faith. The Trinity is the doctrine that God exists as three distinct persons - the Father, the Son (Jesus), and the Holy Spirit - while remaining one God.\n\nLet me break this down for you:\n\n**The Three Persons:**\n- **God the Father**: The creator and sustainer of all things\n- **God the Son (Jesus)**: Fully God and fully human, our Savior\n- **God the Holy Spirit**: The presence of God in our lives today\n\n**Key Biblical Foundation:**\nThe Great Commission in [Matthew 28:19] shows all three persons: 'Go and make disciples... baptizing them in the name of the Father and of the Son and of the Holy Spirit.'\n\n**Why This Matters:**\nUnderstanding the Trinity helps us:\n- Know God more deeply\n- Pray more effectively\n- Understand our salvation better\n- Connect with the Christian community\n\nWhat aspect of the Trinity would you like to explore first? Are you curious about how they relate to each other, or perhaps how this affects your daily faith?",
    "metadata": {
      "versesCited": ["Matthew 28:19"],
      "topics": ["Trinity", "God", "Father", "Son", "Holy Spirit"],
      "suggestedAction": {
        "type": "create_learning_plan",
        "topic": "the Trinity",
        "message": "Would you like me to create a personalized study plan for this topic?"
      }
    },
    "formattedContent": {
      "sections": [
        {
          "type": "heading",
          "content": "Understanding the Trinity"
        },
        {
          "type": "paragraph",
          "content": "Hey David! I'd love to help you understand the Trinity! This is such an important and beautiful aspect of our faith..."
        },
        {
          "type": "list",
          "content": "The Three Persons:\n- God the Father: The creator and sustainer of all things\n- God the Son (Jesus): Fully God and fully human, our Savior\n- God the Holy Spirit: The presence of God in our lives today"
        }
      ]
    },
    "tokensUsed": 250
  },
  "message": "Message sent successfully"
}
```

### 3. Progress Tracking Flow

#### Get Dashboard Summary

**Request:**

```bash
GET /api/ai-chat/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "firstName": "David",
      "level": 5,
      "xp": 1250,
      "xpToNextLevel": 250,
      "streak": 7
    },
    "learningPlans": {
      "active": 2,
      "completed": 3,
      "totalSessions": 15,
      "completedSessions": 12
    },
    "recentActivity": [
      {
        "type": "session_completed",
        "timestamp": "2024-01-15T11:00:00Z",
        "data": {
          "sessionTitle": "Introduction to the Trinity",
          "planTitle": "Understanding the Trinity",
          "xpEarned": 50
        }
      },
      {
        "type": "plan_created",
        "timestamp": "2024-01-15T10:30:00Z",
        "data": {
          "planTitle": "Understanding the Trinity",
          "topic": "The Trinity",
          "xpEarned": 25
        }
      },
      {
        "type": "chat_message",
        "timestamp": "2024-01-15T10:30:00Z",
        "data": {
          "messageLength": 45,
          "topics": ["Trinity"],
          "xpEarned": 10
        }
      }
    ],
    "achievements": {
      "total": 8,
      "recent": [
        {
          "achievement_key": "ai_first_plan",
          "name": "Learning Journey Starter",
          "description": "Created your first AI learning plan",
          "icon": "🎓",
          "points": 50,
          "tier": "bronze",
          "unlocked_at": "2024-01-15T10:30:00Z"
        },
        {
          "achievement_key": "ai_chat_streak_7",
          "name": "Consistent Learner",
          "description": "7-day AI chat streak",
          "icon": "🔥",
          "points": 75,
          "tier": "bronze",
          "unlocked_at": "2024-01-15T09:00:00Z"
        }
      ]
    },
    "goals": {
      "active": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174006",
          "goal_type": "weekly_sessions",
          "goal_target": { "sessions": 5, "period": "week" },
          "current_progress": { "sessions": 3 },
          "status": "active",
          "start_date": "2024-01-15",
          "end_date": "2024-01-22",
          "reward_xp": 100
        }
      ],
      "progress": {
        "weekly_sessions": 0.6,
        "monthly_plans": 0.75
      }
    },
    "stats": {
      "totalChatMessages": 45,
      "totalPlansCompleted": 3,
      "favoriteTopics": ["Trinity", "Salvation", "Prayer"],
      "averageSessionLength": 15.5,
      "totalStudyTime": 180
    }
  },
  "message": "Dashboard summary retrieved successfully"
}
```

### 4. Error Handling Examples

#### Authentication Error

**Request:**

```bash
GET /api/ai-chat/sessions
Authorization: Bearer invalid-token
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789"
    }
  }
}
```

#### Validation Error

**Request:**

```bash
POST /api/ai-chat/learning-plans
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "topic": "",
  "user_level": "invalid_level"
}
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "errors": [
        {
          "field": "topic",
          "message": "Topic is required and must be 1-255 characters"
        },
        {
          "field": "user_level",
          "message": "User level must be one of: beginner, intermediate, advanced"
        }
      ]
    }
  }
}
```

#### Rate Limit Error

**Request:**

```bash
POST /api/ai-chat/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "ai_version": "study"
}
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 50,
      "remaining": 0,
      "resetTime": "2024-01-15T11:30:00Z"
    }
  }
}
```

### 5. Pagination Examples

#### List Learning Plans with Pagination

**Request:**

```bash
GET /api/ai-chat/learning-plans?limit=5&offset=10&status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174007",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "title": "Understanding Salvation",
        "topic": "Salvation",
        "description": "A comprehensive study of salvation...",
        "user_level": "beginner",
        "total_sessions": 4,
        "completed_sessions": 2,
        "status": "active",
        "created_at": "2024-01-14T10:30:00Z",
        "updated_at": "2024-01-14T10:30:00Z",
        "completed_at": null
      }
    ],
    "total": 25,
    "pagination": {
      "total": 25,
      "limit": 5,
      "offset": 10,
      "hasMore": true
    }
  },
  "message": "Learning plans retrieved successfully"
}
```

## JavaScript/TypeScript Examples

### Using Fetch API

```javascript
// Create a learning plan
async function createLearningPlan(topic, userLevel = "beginner") {
  const response = await fetch("/api/ai-chat/learning-plans", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      user_level: userLevel,
      total_sessions: 3,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

// Send a chat message
async function sendChatMessage(sessionId, message) {
  const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}

// Get dashboard summary
async function getDashboardSummary() {
  const response = await fetch("/api/ai-chat/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
}
```

### Using Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api/ai-chat",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Create learning plan
const createPlan = async (topic, userLevel) => {
  try {
    const response = await api.post("/learning-plans", {
      topic,
      user_level: userLevel,
      total_sessions: 3,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response.data.error.message);
  }
};

// Complete session
const completeSession = async (planId, sessionId, notes) => {
  try {
    const response = await api.post(
      `/learning-plans/${planId}/sessions/${sessionId}/complete`,
      {
        is_completed: true,
        notes,
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(error.response.data.error.message);
  }
};
```

## Best Practices

1. **Always handle errors** - Check the `success` field and handle errors appropriately
2. **Use pagination** - For list endpoints, always implement pagination
3. **Cache responses** - Dashboard and profile data can be cached for better performance
4. **Rate limiting** - Implement client-side rate limiting to avoid hitting limits
5. **Authentication** - Store and refresh tokens securely
6. **Progress tracking** - Update UI based on progress and achievements
7. **Error recovery** - Implement retry logic for network errors
8. **User feedback** - Show loading states and success/error messages

