# Progress Tracking API

## Overview

The Progress Tracking API provides comprehensive insights into user learning progress, growth metrics, and personalized encouragement based on AI interactions and learning activities.

## Endpoints

### Get Progress Summary

Retrieves comprehensive progress overview for the user.

**Endpoint**: `GET /api/ai-chat/progress`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Query Parameters

| Parameter    | Type   | Description                               |
| ------------ | ------ | ----------------------------------------- |
| period       | string | week/month/year/all_time (default: month) |
| metric_types | array  | Specific metrics to include               |

#### Example Request

```
GET /api/ai-chat/progress?period=month&metric_types=knowledge_growth,application_growth
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "overview": {
      "plansCompleted": 3,
      "sessionsCompleted": 12,
      "totalXPEarned": 450,
      "currentStreak": 7,
      "longestStreak": 15
    },
    "timeline": [
      {
        "date": "2024-01-15",
        "plansCompleted": 1,
        "sessionsCompleted": 3,
        "xpEarned": 150
      },
      {
        "date": "2024-01-14",
        "plansCompleted": 0,
        "sessionsCompleted": 2,
        "xpEarned": 100
      }
    ],
    "topicBreakdown": {
      "Trinity": {
        "plansCreated": 1,
        "plansCompleted": 1,
        "timeSpent": 120
      },
      "Salvation": {
        "plansCreated": 2,
        "plansCompleted": 1,
        "timeSpent": 90
      }
    },
    "growthMetrics": {
      "knowledgeGrowth": 0.75,
      "applicationGrowth": 0.6,
      "engagementScore": 0.85
    }
  },
  "message": "Progress summary retrieved successfully"
}
```

---

### Get Learning Profile

Retrieves user's AI learning profile with insights and preferences.

**Endpoint**: `GET /api/ai-chat/learning-profile`

**Authentication**: Required

**Rate Limit**: 20 requests/hour

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "theologicalPreference": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "category": "theological_preference",
        "insight_key": "denomination",
        "insight_value": "Baptist",
        "confidence_score": 0.85,
        "source": "auto",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "studyStyle": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "category": "study_style",
        "insight_key": "preferred_depth",
        "insight_value": "beginner",
        "confidence_score": 0.9,
        "source": "auto",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "questionPatterns": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "category": "question_patterns",
        "insight_key": "common_topics",
        "insight_value": "Trinity, Salvation, Prayer",
        "confidence_score": 0.8,
        "source": "auto",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "interests": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174004",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "category": "interests",
        "insight_key": "biblical_books",
        "insight_value": "John, Romans, Psalms",
        "confidence_score": 0.75,
        "source": "auto",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "message": "Learning profile retrieved successfully"
}
```

---

### Update Learning Profile

Updates specific learning profile insights.

**Endpoint**: `PATCH /api/ai-chat/learning-profile`

**Authentication**: Required

**Rate Limit**: 20 requests/hour

#### Request Body

| Field    | Type  | Required | Description              |
| -------- | ----- | -------- | ------------------------ |
| insights | array | Yes      | Array of insight updates |

#### Example Request

```json
{
  "insights": [
    {
      "category": "theological_preference",
      "insight_key": "denomination",
      "insight_value": "Methodist",
      "confidence_score": 0.95,
      "source": "manual"
    }
  ]
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "updated": 1,
    "insights": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174001",
        "category": "theological_preference",
        "insight_key": "denomination",
        "insight_value": "Methodist",
        "confidence_score": 0.95,
        "source": "manual",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T12:00:00Z"
      }
    ]
  },
  "message": "Learning profile updated successfully"
}
```

---

### Delete Learning Profile Insight

Deletes a specific learning profile insight.

**Endpoint**: `DELETE /api/ai-chat/learning-profile/:id`

**Authentication**: Required

**Rate Limit**: 20 requests/hour

#### Path Parameters

| Parameter | Type   | Description  |
| --------- | ------ | ------------ |
| id        | string | Insight UUID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": null,
  "message": "Learning profile insight deleted successfully"
}
```

---

### Get Dashboard Summary

Retrieves comprehensive dashboard data for the frontend.

**Endpoint**: `GET /api/ai-chat/dashboard`

**Authentication**: Required

**Rate Limit**: 100 requests/hour

#### Success Response (200 OK)

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
          "planTitle": "Understanding the Trinity"
        }
      },
      {
        "type": "plan_created",
        "timestamp": "2024-01-15T10:30:00Z",
        "data": {
          "planTitle": "Learning about Salvation",
          "topic": "Salvation"
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
          "unlocked_at": "2024-01-15T10:30:00Z"
        }
      ]
    },
    "goals": {
      "active": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "goal_type": "weekly_sessions",
          "goal_target": { "sessions": 5, "period": "week" },
          "current_progress": { "sessions": 3 },
          "status": "active",
          "end_date": "2024-01-22"
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
      "favoriteTopics": ["Trinity", "Salvation", "Prayer"]
    }
  },
  "message": "Dashboard summary retrieved successfully"
}
```

## Progress Metrics

### Knowledge Growth

- **Description**: Measures depth and complexity of theological understanding
- **Range**: 0.0 - 1.0
- **Calculation**: Based on conversation depth, topic complexity, and engagement

### Application Growth

- **Description**: Measures practical application of biblical concepts
- **Range**: 0.0 - 1.0
- **Calculation**: Based on application indicators in user messages

### Engagement Score

- **Description**: Overall engagement with AI learning features
- **Range**: 0.0 - 1.0
- **Calculation**: Based on message frequency, session length, and interaction quality

### Study Streak

- **Description**: Consecutive days of AI chat engagement
- **Tracking**: Daily interaction with AI chat system
- **Milestones**: 7, 30, 100 days

## Learning Profile Categories

### Theological Preference

- **denomination**: User's denominational background
- **theological_stance**: Conservative, moderate, liberal
- **focus_areas**: Specific theological interests

### Study Style

- **preferred_depth**: beginner, intermediate, advanced
- **learning_pace**: slow, moderate, fast
- **content_preference**: practical, theoretical, mixed

### Question Patterns

- **common_topics**: Frequently discussed topics
- **question_types**: analytical, practical, theological
- **complexity_level**: Simple, moderate, complex

### Interests

- **biblical_books**: Favorite books of the Bible
- **theological_topics**: Areas of interest
- **study_methods**: Preferred learning approaches

## Data Types

### AIUserProgress

```typescript
interface AIUserProgress {
  id: string;
  user_id: string;
  metric_type: string;
  metric_value: Record<string, unknown>;
  recorded_at: string;
  created_at: string;
}
```

### DashboardSummary

```typescript
interface DashboardSummary {
  user: {
    firstName: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: number;
  };
  learningPlans: {
    active: number;
    completed: number;
    totalSessions: number;
    completedSessions: number;
  };
  recentActivity: Array<{
    type: string;
    timestamp: string;
    data: Record<string, unknown>;
  }>;
  achievements: {
    total: number;
    recent: Array<unknown>;
  };
  goals: {
    active: Array<AIUserGoal>;
    progress: Record<string, unknown>;
  };
  stats: {
    totalChatMessages: number;
    totalPlansCompleted: number;
    favoriteTopics: string[];
  };
}
```

## Best Practices

1. **Regular Progress Checks**: Monitor progress weekly to track growth
2. **Profile Updates**: Keep learning profile current for better personalization
3. **Goal Setting**: Set realistic goals based on your schedule
4. **Streak Maintenance**: Engage daily to maintain study streaks
5. **Insight Review**: Regularly review and update learning insights

## Rate Limits

- **Progress/Profile Endpoints**: 20 requests per hour
- **Dashboard Endpoint**: 100 requests per hour
- **Update Operations**: 10 requests per hour

## Notes

- Progress metrics are automatically calculated based on AI interactions
- Learning profile insights improve over time with more interactions
- Dashboard data is cached for 5 minutes to improve performance
- All metrics are normalized to 0.0-1.0 scale for consistency
- Streak tracking resets if no interaction for 24+ hours

