# API Documentation

This directory contains documentation for all API endpoints.

## Purpose

These documentation files are written for frontend developers using React, TypeScript, and TanStack Query to consume the API.

## Documentation Template

Each endpoint should be documented with the following structure:

### Endpoint Name

**HTTP Method:** `GET/POST/PUT/PATCH/DELETE`

**Endpoint:** `/api/resource`

**Description:** Brief description of what the endpoint does.

**Authentication:** Required/Optional

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param1 | string | Yes | Description |
| param2 | number | No | Description |

**Request Body:**

```typescript
{
  field1: string;
  field2: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    // response structure
  };
}
```

**Example Request:**

```typescript
// TanStack Query example
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: async () => {
    const response = await fetch(`/api/resource/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
});
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Example Files

- `get-users.md` - Get all users
- `create-user.md` - Create a new user
- `update-user.md` - Update user information

