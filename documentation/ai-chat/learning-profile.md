# AI Learning Profile

Manages the AI's learning profile about the user, including theological preferences, study patterns, and personalized insights.

## Endpoints

### Get Learning Profile

**GET** `/api/ai-chat/learning-profile`

### Update Learning Insight

**PUT** `/api/ai-chat/learning-profile/:id`

### Delete Learning Insight

**DELETE** `/api/ai-chat/learning-profile/:id`

## Authentication

Required - Bearer token for all endpoints

## Get Learning Profile

### Response

```typescript
{
  success: boolean;
  data: {
    [category: string]: Array<{
      id: string;
      user_id: string;
      category: string;
      insight_key: string;
      insight_value: string;
      confidence_score: number; // 0.0 to 1.0
      source: "auto" | "manual";
      created_at: string;
      updated_at: string;
    }>;
  };
  message: string;
}
```

### Example with TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";

interface LearningInsight {
  id: string;
  user_id: string;
  category: string;
  insight_key: string;
  insight_value: string;
  confidence_score: number;
  source: "auto" | "manual";
  created_at: string;
  updated_at: string;
}

interface LearningProfile {
  [category: string]: LearningInsight[];
}

export const useGetLearningProfile = () => {
  return useQuery({
    queryKey: ["ai-learning-profile"],
    queryFn: async () => {
      const response = await fetch("/api/ai-chat/learning-profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch learning profile");
      }

      return response.json() as Promise<{
        success: true;
        data: LearningProfile;
        message: string;
      }>;
    },
  });
};

// Usage in component
const { data, isLoading, error } = useGetLearningProfile();
```

## Update Learning Insight

### Request Parameters

| Parameter | Type   | Location | Required | Description  |
| --------- | ------ | -------- | -------- | ------------ |
| id        | string | URL      | Yes      | Insight UUID |

### Request Body

```typescript
{
  insight_value?: string;
  confidence_score?: number; // 0.0 to 1.0
  source?: "auto" | "manual";
}
```

### Example with TanStack Query

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateInsightRequest {
  insight_value?: string;
  confidence_score?: number;
  source?: "auto" | "manual";
}

export const useUpdateLearningInsight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      insightId,
      data,
    }: {
      insightId: string;
      data: UpdateInsightRequest;
    }) => {
      const response = await fetch(
        `/api/ai-chat/learning-profile/${insightId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update learning insight");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-learning-profile"] });
    },
  });
};

// Usage in component
const updateInsightMutation = useUpdateLearningInsight();

const handleUpdateInsight = (insightId: string, newValue: string) => {
  updateInsightMutation.mutate({
    insightId,
    data: { insight_value: newValue, source: "manual" },
  });
};
```

## Response Examples

### Get Learning Profile

```json
{
  "success": true,
  "data": {
    "theological_preference": [
      {
        "id": "insight-1",
        "user_id": "user-uuid",
        "category": "theological_preference",
        "insight_key": "denominational_affiliation",
        "insight_value": "Reformed Baptist",
        "confidence_score": 0.8,
        "source": "auto",
        "created_at": "2025-10-21T10:30:00Z",
        "updated_at": "2025-10-21T10:30:00Z"
      },
      {
        "id": "insight-2",
        "user_id": "user-uuid",
        "category": "theological_preference",
        "insight_key": "primary_interests",
        "insight_value": "salvation, grace, predestination",
        "confidence_score": 0.9,
        "source": "auto",
        "created_at": "2025-10-21T10:30:00Z",
        "updated_at": "2025-10-21T10:30:00Z"
      }
    ],
    "study_style": [
      {
        "id": "insight-3",
        "user_id": "user-uuid",
        "category": "study_style",
        "insight_key": "preferred_approach",
        "insight_value": "detailed and comprehensive",
        "confidence_score": 0.7,
        "source": "auto",
        "created_at": "2025-10-21T10:30:00Z",
        "updated_at": "2025-10-21T10:30:00Z"
      }
    ],
    "question_patterns": [
      {
        "id": "insight-4",
        "user_id": "user-uuid",
        "category": "question_patterns",
        "insight_key": "common_question_types",
        "insight_value": "definitional questions, explanatory questions",
        "confidence_score": 0.6,
        "source": "auto",
        "created_at": "2025-10-21T10:30:00Z",
        "updated_at": "2025-10-21T10:30:00Z"
      }
    ]
  },
  "message": "Learning profile retrieved successfully"
}
```

## Learning Categories

### Theological Preference

- **denominational_affiliation**: User's denominational background
- **primary_interests**: Main theological topics of interest
- **doctrinal_focus**: Specific doctrines the user studies
- **interpretive_approach**: How the user approaches Scripture

### Study Style

- **preferred_approach**: How the user likes to study (detailed, concise, etc.)
- **depth_preference**: Level of theological depth preferred
- **learning_method**: Visual, auditory, kinesthetic preferences
- **study_schedule**: When and how often the user studies

### Question Patterns

- **common_question_types**: Types of questions the user asks
- **question_complexity**: Level of complexity in questions
- **follow_up_style**: How the user follows up on answers
- **clarification_needs**: Areas where the user needs more explanation

### Interests

- **biblical_books**: Favorite books of the Bible
- **historical_periods**: Interest in biblical history
- **theological_topics**: Specific theological subjects
- **practical_application**: Focus on practical vs. theoretical

## Automatic Learning

The AI automatically learns from:

- **Conversation patterns**: Question types and complexity
- **Theological topics**: Frequently discussed subjects
- **Study preferences**: Depth and style of responses preferred
- **Follow-up questions**: Areas needing clarification
- **Response feedback**: What the user finds helpful

## Manual Overrides

Users can:

- **Update insight values**: Correct or refine AI understanding
- **Adjust confidence scores**: Indicate how certain the AI should be
- **Change source to manual**: Mark insights as user-verified
- **Delete insights**: Remove incorrect or outdated information

## Status Codes

- `200` - Success
- `400` - Invalid request data
- `401` - Unauthorized (invalid or missing token)
- `404` - Insight not found
- `500` - Internal Server Error

## Notes

- Insights are grouped by category for easy organization
- Confidence scores help the AI know how certain it should be
- Auto-generated insights are updated as the AI learns more
- Manual overrides take precedence over automatic learning
- Learning profile improves AI responses over time
