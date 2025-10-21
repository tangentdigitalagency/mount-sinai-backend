# Get Note by ID

Retrieves a specific note by ID with complete data including verse references and tags.

## Endpoint

**GET** `/api/notes/:id`

## Authentication

Required - Bearer token

## Request Parameters

| Parameter | Type   | Location | Required | Description |
| --------- | ------ | -------- | -------- | ----------- |
| id        | string | URL      | Yes      | Note UUID   |

## Headers

```
Authorization: Bearer <jwt_token>
```

## Response

```typescript
{
  success: boolean;
  data: {
    id: string;
    user_id: string;
    title: string;
    content: Record<string, unknown>; // TipTap JSON format
    tags: string[];
    created_at: string;
    updated_at: string;
    verse_references: Array<{
      id: string;
      note_id: string;
      user_id: string;
      book_id: string;
      book_name: string;
      chapter: number;
      verse_number: number;
      verse_text: string;
      version_id: string;
      version_abbreviation: string;
      verse_id: string;
      is_quoted: boolean | null;
      created_at: string;
    }>;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
    verse_count: number;
    tag_count: number;
  };
}
```

## Example with TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";

interface NoteWithData {
  id: string;
  user_id: string;
  title: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  verse_references: Array<{
    id: string;
    book_name: string;
    chapter: number;
    verse_number: number;
    verse_text: string;
    version_abbreviation: string;
    is_quoted: boolean | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  verse_count: number;
  tag_count: number;
}

export const useGetNoteById = (noteId: string, token: string) => {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch note");
      }

      return response.json() as Promise<{
        success: true;
        data: NoteWithData;
      }>;
    },
    enabled: !!noteId && !!token,
  });
};

// Usage in component
const { data, isLoading, error } = useGetNoteById(noteId, authToken);
```

## Response Example

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-uuid",
    "title": "Prayer and Faith",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Notes about prayer..."
            }
          ]
        }
      ]
    },
    "created_at": "2025-10-21T10:30:00Z",
    "updated_at": "2025-10-21T10:30:00Z",
    "verse_references": [
      {
        "id": "ref-uuid",
        "book_name": "Matthew",
        "chapter": 6,
        "verse_number": 9,
        "verse_text": "After this manner therefore pray ye...",
        "version_abbreviation": "KJV",
        "is_quoted": true
      }
    ],
    "tags": [
      {
        "id": "tag-uuid",
        "name": "Prayer",
        "color": "#3B82F6"
      }
    ],
    "verse_count": 1,
    "tag_count": 1
  }
}
```

## Status Codes

- `200` - Success
- `401` - Unauthorized (invalid or missing token)
- `404` - Note not found (or doesn't belong to user)
- `500` - Internal Server Error

## Security

- Users can only access their own notes
- Attempting to access another user's note returns 404 (not 403 to avoid information disclosure)
- All queries are filtered by `user_id` to ensure data isolation

## Notes

- The `content` field uses TipTap JSON format for rich text editing
- All verse references and tags are included in the response
- `verse_count` and `tag_count` are calculated for convenience
