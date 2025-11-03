# Error Handling

## Overview

The API uses consistent error responses with detailed information to help developers understand and handle errors appropriately.

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "additionalInfo": "..."
    }
  }
}
```

## Error Codes

### Authentication Errors

| Code            | HTTP Status | Description                              |
| --------------- | ----------- | ---------------------------------------- |
| `UNAUTHORIZED`  | 401         | Missing or invalid authentication token  |
| `TOKEN_EXPIRED` | 401         | Authentication token has expired         |
| `INVALID_TOKEN` | 401         | Malformed or invalid token format        |
| `FORBIDDEN`     | 403         | Valid token but insufficient permissions |

### Validation Errors

| Code                     | HTTP Status | Description                            |
| ------------------------ | ----------- | -------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Invalid request data format or values  |
| `MISSING_REQUIRED_FIELD` | 400         | Required field is missing              |
| `INVALID_FIELD_VALUE`    | 400         | Field value is invalid or out of range |
| `INVALID_ENUM_VALUE`     | 400         | Enum field has invalid value           |

### Resource Errors

| Code                | HTTP Status | Description                               |
| ------------------- | ----------- | ----------------------------------------- |
| `NOT_FOUND`         | 404         | Requested resource does not exist         |
| `RESOURCE_CONFLICT` | 409         | Resource already exists or conflicts      |
| `RESOURCE_LOCKED`   | 423         | Resource is locked and cannot be modified |

### Rate Limiting

| Code                  | HTTP Status | Description                            |
| --------------------- | ----------- | -------------------------------------- |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests, rate limit exceeded |
| `QUOTA_EXCEEDED`      | 429         | API quota exceeded for the period      |

### Server Errors

| Code                  | HTTP Status | Description                     |
| --------------------- | ----------- | ------------------------------- |
| `INTERNAL_ERROR`      | 500         | Internal server error           |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable |
| `DATABASE_ERROR`      | 500         | Database operation failed       |
| `AI_SERVICE_ERROR`    | 500         | AI service unavailable or error |

## Detailed Error Examples

### Authentication Errors

#### Missing Token

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is required",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789"
    }
  }
}
```

#### Expired Token

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Authentication token has expired",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "expiredAt": "2024-01-15T09:30:00Z"
    }
  }
}
```

#### Insufficient Permissions

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "requiredPermission": "learning_plans:write"
    }
  }
}
```

### Validation Errors

#### Missing Required Fields

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "errors": [
        {
          "field": "topic",
          "message": "Topic is required and must be 1-255 characters",
          "value": ""
        },
        {
          "field": "user_level",
          "message": "User level must be one of: beginner, intermediate, advanced",
          "value": "expert"
        }
      ]
    }
  }
}
```

#### Invalid Field Values

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FIELD_VALUE",
    "message": "Field value is invalid",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "field": "total_sessions",
      "message": "Total sessions must be between 1 and 10",
      "value": 15,
      "constraints": {
        "min": 1,
        "max": 10
      }
    }
  }
}
```

### Resource Errors

#### Resource Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Learning plan not found",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "resourceType": "learning_plan",
      "resourceId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

#### Resource Conflict

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "Learning plan already exists for this topic",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "conflictingResource": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "topic": "The Trinity",
        "status": "active"
      }
    }
  }
}
```

### Rate Limiting Errors

#### Rate Limit Exceeded

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "limit": 50,
      "remaining": 0,
      "resetTime": "2024-01-15T11:30:00Z",
      "retryAfter": 3600
    }
  }
}
```

#### Quota Exceeded

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "API quota exceeded for this month",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "quota": 1000,
      "used": 1000,
      "resetTime": "2024-02-01T00:00:00Z"
    }
  }
}
```

### Server Errors

#### Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "errorId": "err_123456789"
    }
  }
}
```

#### AI Service Error

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "AI service is temporarily unavailable",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "service": "openai",
      "retryAfter": 300
    }
  }
}
```

#### Database Error

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed",
    "details": {
      "timestamp": "2024-01-15T10:30:00Z",
      "requestId": "req_123456789",
      "operation": "insert",
      "table": "ai_learning_plans"
    }
  }
}
```

## Error Handling Best Practices

### Client-Side Error Handling

```javascript
async function handleApiCall(apiFunction) {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;

      switch (errorData.error.code) {
        case "UNAUTHORIZED":
        case "TOKEN_EXPIRED":
          // Redirect to login
          redirectToLogin();
          break;

        case "RATE_LIMIT_EXCEEDED":
          // Show rate limit message
          showRateLimitMessage(errorData.error.details.retryAfter);
          break;

        case "VALIDATION_ERROR":
          // Show field-specific errors
          showValidationErrors(errorData.error.details.errors);
          break;

        case "NOT_FOUND":
          // Show not found message
          showNotFoundMessage();
          break;

        default:
          // Show generic error
          showErrorMessage(errorData.error.message);
      }
    } else if (error.request) {
      // Network error
      showNetworkErrorMessage();
    } else {
      // Other error
      showGenericErrorMessage();
    }
  }
}
```

### Retry Logic

```javascript
async function retryApiCall(apiFunction, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (error.response?.data?.error?.code === "RATE_LIMIT_EXCEEDED") {
        const retryAfter = error.response.data.error.details.retryAfter;
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          continue;
        }
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff for other errors
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

### Error Logging

```javascript
function logError(error, context) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      code: error.response?.data?.error?.code,
      message: error.response?.data?.error?.message,
      details: error.response?.data?.error?.details,
    },
  };

  // Log to your error tracking service
  console.error("API Error:", errorInfo);

  // Send to error tracking service
  if (window.errorTracker) {
    window.errorTracker.captureException(error, { extra: errorInfo });
  }
}
```

## HTTP Status Codes

| Status Code | Description           | Common Error Codes                           |
| ----------- | --------------------- | -------------------------------------------- |
| 400         | Bad Request           | `VALIDATION_ERROR`, `MISSING_REQUIRED_FIELD` |
| 401         | Unauthorized          | `UNAUTHORIZED`, `TOKEN_EXPIRED`              |
| 403         | Forbidden             | `FORBIDDEN`                                  |
| 404         | Not Found             | `NOT_FOUND`                                  |
| 409         | Conflict              | `RESOURCE_CONFLICT`                          |
| 422         | Unprocessable Entity  | `VALIDATION_ERROR`                           |
| 423         | Locked                | `RESOURCE_LOCKED`                            |
| 429         | Too Many Requests     | `RATE_LIMIT_EXCEEDED`, `QUOTA_EXCEEDED`      |
| 500         | Internal Server Error | `INTERNAL_ERROR`, `DATABASE_ERROR`           |
| 503         | Service Unavailable   | `SERVICE_UNAVAILABLE`, `AI_SERVICE_ERROR`    |

## Error Recovery Strategies

### Authentication Errors

- **Token Expired**: Refresh token or redirect to login
- **Invalid Token**: Clear stored token and redirect to login
- **Missing Token**: Prompt user to log in

### Rate Limiting

- **Rate Limit Exceeded**: Implement exponential backoff
- **Quota Exceeded**: Show upgrade message or wait for reset

### Validation Errors

- **Field Errors**: Highlight invalid fields and show specific messages
- **Missing Fields**: Show required field indicators

### Resource Errors

- **Not Found**: Show appropriate "not found" message
- **Conflict**: Show conflict resolution options

### Server Errors

- **Temporary Errors**: Implement retry logic with backoff
- **Persistent Errors**: Show maintenance message or contact support

## Monitoring and Debugging

### Request ID

Every error response includes a `requestId` that can be used for debugging:

```javascript
// Include request ID in support requests
const requestId = error.response?.data?.error?.details?.requestId;
console.log(`Error request ID: ${requestId}`);
```

### Error Tracking

Implement error tracking to monitor API errors:

```javascript
// Track errors for monitoring
function trackApiError(error, endpoint, method) {
  const errorData = {
    endpoint,
    method,
    status: error.response?.status,
    code: error.response?.data?.error?.code,
    message: error.response?.data?.error?.message,
    timestamp: new Date().toISOString(),
  };

  // Send to your analytics service
  analytics.track("api_error", errorData);
}
```

## Support

For API support and error reporting:

- **Email**: api-support@mountsinai.app
- **Documentation**: https://docs.mountsinai.app
- **Status Page**: https://status.mountsinai.app

When reporting errors, include:

- Request ID from error response
- Timestamp of the error
- Endpoint and method
- Request payload (if applicable)
- Steps to reproduce

