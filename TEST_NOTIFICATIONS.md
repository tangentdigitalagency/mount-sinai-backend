# Test Notifications Endpoint

## Overview

This endpoint creates test notifications for all notification types and priority levels to help you test the notification system in your app.

## User ID

The test notifications will be created for user: **`cc4f7fcb-c92d-4bfd-a69e-30bb87923898`**

## Endpoint

```
POST /api/notifications/test/:userId
```

## What It Creates

### 1. Type × Priority Combinations (36 notifications)
- **Types**: `info`, `success`, `warning`, `error`, `achievement`, `system`, `social`, `reading`, `chat`
- **Priorities**: `low`, `normal`, `high`, `urgent`
- **Total**: 9 types × 4 priorities = **36 notifications**

### 2. Additional Test Scenarios (8 notifications)
- New message from John Doe (chat, normal)
- Achievement Unlocked (achievement, high)
- System Maintenance (system, normal)
- Friend Request (social, normal)
- Daily Reading Reminder (reading, normal)
- Important Warning (warning, high)
- Operation Successful (success, normal)
- Error Occurred (error, urgent)

**Total**: 36 + 8 = **44 test notifications**

## Usage

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/notifications/test/cc4f7fcb-c92d-4bfd-a69e-30bb87923898" \
  -H "Content-Type: application/json"
```

### Using the Script

```bash
# Make the script executable (already done)
chmod +x test-notifications.sh

# Run the script
./test-notifications.sh
```

Or with Node.js:

```bash
node test-notifications.js
```

### Using JavaScript/Fetch

```javascript
const userId = 'cc4f7fcb-c92d-4bfd-a69e-30bb87923898';

fetch(`http://localhost:8000/api/notifications/test/${userId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(res => res.json())
  .then(data => {
    console.log(`Created ${data.data.total_created} notifications`);
    console.log(data);
  });
```

## Response

```json
{
  "success": true,
  "data": {
    "total_created": 44,
    "notifications": [...],
    "user_id": "cc4f7fcb-c92d-4bfd-a69e-30bb87923898"
  },
  "message": "Created 44 test notifications for user cc4f7fcb-c92d-4bfd-a69e-30bb87923898"
}
```

## Notification Types

| Type | Description | Icon |
|------|-------------|------|
| `info` | General information | ℹ️ |
| `success` | Success messages | ✅ |
| `warning` | Warning messages | ⚠️ |
| `error` | Error messages | ❌ |
| `achievement` | Achievement notifications | 🏆 |
| `system` | System messages | ⚙️ |
| `social` | Social interactions | 👥 |
| `reading` | Reading-related | 📖 |
| `chat` | Chat messages | 💬 |

## Priority Levels

| Priority | Description | Use Case |
|----------|-------------|----------|
| `low` | Low priority | Informational updates |
| `normal` | Normal priority | Standard notifications |
| `high` | High priority | Important updates |
| `urgent` | Urgent priority | Critical alerts |

## Testing Checklist

After running the endpoint, check:

- [ ] All 44 notifications are created in the database
- [ ] Each notification type has the correct icon
- [ ] Each priority level is properly displayed
- [ ] Notifications are sorted correctly (by priority/date)
- [ ] Notifications link to the correct URLs
- [ ] Metadata is properly stored
- [ ] Notifications are marked as unread by default

## Cleanup

To remove test notifications, you can run:

```sql
DELETE FROM notifications 
WHERE user_id = 'cc4f7fcb-c92d-4bfd-a69e-30bb87923898' 
AND metadata->>'test' = 'true';
```

Or use your Supabase dashboard to filter and delete test notifications.

