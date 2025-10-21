# Get All Notes

Retrieves all notes for the authenticated user with complete data including verse references and tags.

## Endpoint

**GET** `/api/notes`

## Authentication

Required - Bearer token

## Request Parameters

None

## Headers

```
Authorization: Bearer <jwt_token>
```

## Response

```typescript
{
  success: boolean;
  data: Array<{
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
  }>;
  message: string;
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

export const useGetAllNotes = (token: string) => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch notes");
      }

      return response.json() as Promise<{
        success: true;
        data: NoteWithData[];
        message: string;
      }>;
    },
    enabled: !!token,
  });
};

// Usage in component
const { data, isLoading, error } = useGetAllNotes(authToken);
```

## Response Example

```json
{
  "success": true,
  "data": [
    {
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
  ],
  "message": "Retrieved 1 note"
}
```

## Status Codes

- `200` - Success
- `401` - Unauthorized (invalid or missing token)
- `500` - Internal Server Error

## Notes

- Notes are returned in descending order by creation date (newest first)
- Each note includes all associated verse references
- Each note includes all associated tags with colors
- `verse_count` and `tag_count` are calculated for convenience
- The `content` field uses TipTap JSON format for rich text editing
