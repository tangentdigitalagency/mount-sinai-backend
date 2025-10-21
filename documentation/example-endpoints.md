# Example API Endpoints

This document demonstrates the example endpoints for the Mount Sinai Backend API.

## Get All Items

**HTTP Method:** `GET`

**Endpoint:** `/api/example`

**Description:** Retrieves a list of all items. This is a public endpoint and does not require authentication.

**Authentication:** Not required

**Request Parameters:** None

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: {
    items: Array<{
      id: string;
      name: string;
      description?: string;
      quantity: number;
    }>;
  };
}
```

**Example Request with TanStack Query:**

```typescript
import { useQuery } from '@tanstack/react-query';

export const useGetItems = () => {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/example');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      return response.json();
    },
  });
};

// Usage in component
const { data, isLoading, error } = useGetItems();
```

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

---

## Get Item by ID

**HTTP Method:** `GET`

**Endpoint:** `/api/example/:id`

**Description:** Retrieves a single item by its ID. Requires authentication.

**Authentication:** Required (Bearer token)

**Request Parameters:**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| id        | string | Yes      | Item ID (URL param) |

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    id: string;
    name: string;
    userId: string;
  };
}
```

**Example Request with TanStack Query:**

```typescript
import { useQuery } from '@tanstack/react-query';

export const useGetItem = (id: string, token: string) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/example/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }
      return response.json();
    },
    enabled: !!id && !!token,
  });
};

// Usage in component
const { data, isLoading, error } = useGetItem(itemId, authToken);
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized (invalid or missing token)
- `404` - Item not found
- `500` - Internal Server Error

---

## Create Item

**HTTP Method:** `POST`

**Endpoint:** `/api/example`

**Description:** Creates a new item. Requires authentication and user/admin role.

**Authentication:** Required (Bearer token)

**Required Roles:** `admin`, `user`

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  name: string;        // Required, 1-100 characters
  description?: string; // Optional
  quantity: number;     // Required, positive integer
}
```

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    userId: string;
  };
}
```

**Example Request with TanStack Query:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateItemData {
  name: string;
  description?: string;
  quantity: number;
}

export const useCreateItem = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateItemData) => {
      const response = await fetch('http://localhost:3000/api/example', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

// Usage in component
const createItem = useCreateItem(authToken);

const handleSubmit = (formData: CreateItemData) => {
  createItem.mutate(formData, {
    onSuccess: (data) => {
      console.log('Item created:', data);
    },
    onError: (error) => {
      console.error('Error creating item:', error);
    },
  });
};
```

**Validation Errors:**

If validation fails, the API returns a `400` status with details:

```typescript
{
  success: false;
  error: "Validation Error";
  details: [
    {
      path: "name";
      message: "String must contain at least 1 character(s)";
    }
  ];
}
```

**Status Codes:**

- `201` - Created successfully
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

