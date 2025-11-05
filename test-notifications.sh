#!/bin/bash

# Test Notifications Script
# Creates notifications for all types and priorities for user: cc4f7fcb-c92d-4bfd-a69e-30bb87923898

USER_ID="cc4f7fcb-c92d-4bfd-a69e-30bb87923898"
BASE_URL="${API_URL:-http://localhost:8000}"

echo "🚀 Creating test notifications for user: $USER_ID"
echo "📡 API URL: $BASE_URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/notifications/test/${USER_ID}" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Success! Test notifications created!"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "📋 Check your notifications in the database or app"
else
  echo "❌ Error creating notifications"
  echo "$BODY"
  exit 1
fi

