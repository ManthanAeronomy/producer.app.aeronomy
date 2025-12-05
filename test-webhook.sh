#!/bin/bash

# Test script for webhook endpoint
# Usage: ./test-webhook.sh [port]
# Default port: 3000

PORT=${1:-3000}
SECRET=${MARKETPLACE_WEBHOOK_SECRET:-dev-secret-key-123}

echo "🧪 Testing webhook endpoint on http://localhost:${PORT}/api/webhooks/lots"
echo "Using secret: ${SECRET}"
echo ""

# Test webhook with sample lot.created event
curl -X POST "http://localhost:${PORT}/api/webhooks/lots" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "lot.created",
    "lot": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Test Lot from Marketplace",
      "airlineName": "Test Airline",
      "volume": {
        "amount": 1000,
        "unit": "MT"
      },
      "pricing": {
        "price": 1000000,
        "pricePerUnit": 1000,
        "currency": "USD"
      },
      "delivery": {
        "deliveryLocation": "Test Location",
        "deliveryWindow": "Q1 2025"
      },
      "compliance": {
        "sustainabilityScore": 30
      },
      "type": "contract",
      "status": "published",
      "publishedAt": "2025-01-15T00:00:00Z"
    },
    "organization": {
      "id": "test-org"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Check your console logs for: '📥 Received lot.created' and '✅ Synced lot'"















