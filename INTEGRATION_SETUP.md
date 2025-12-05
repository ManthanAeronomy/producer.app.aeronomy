# Marketplace Integration Setup Guide

Quick setup guide for integrating the Aeronomy Marketplace (localhost:3004) with this Producer Dashboard.

## Quick Start

### Step 1: Configure Environment Variables

Create or update `.env.local` in the **Producer Dashboard project** (this project):

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Marketplace Integration (Port 3004 - to receive lots from marketplace)
MARKETPLACE_BASE_URL=http://localhost:3004
MARKETPLACE_WEBHOOK_SECRET=dev-secret-key-123
MARKETPLACE_API_KEY=dev-api-key-123

# Buyer Dashboard Integration (Port 3000 - to send bids to buyer)
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_BUYER_API_KEY=producer-api-key-456
```

**Important:** 
- The `MARKETPLACE_WEBHOOK_SECRET` must match `PRODUCER_DASHBOARD_WEBHOOK_SECRET` in the Marketplace project.
- The `NEXT_PUBLIC_BUYER_API_KEY` must match the API key configured in the Buyer Dashboard project.

### Step 2: Webhook Endpoint

The webhook endpoint is already created at `app/api/webhooks/lots/route.ts`. It will:

- Receive webhook events from the Marketplace
- Verify the webhook secret
- Sync lots to your MongoDB database
- Handle `lot.created`, `lot.updated`, and `lot.deleted` events

### Step 3: Start Both Projects

```bash
# Terminal 1: Marketplace (if you have access)
cd aeronomy-marketplace
npm run dev
# Runs on http://localhost:3004

# Terminal 2: Producer Dashboard (this project)
cd aeronomy
npm run dev
# Runs on http://localhost:3000 (or your configured port)
```

### Step 4: Configure Marketplace Webhook

In the **Marketplace project**, ensure `.env.local` includes:

```env
# Producer Dashboard Webhook (Local)
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=dev-secret-key-123

# Optional: API Key for external endpoint
PRODUCER_DASHBOARD_API_KEY=dev-api-key-123
```

**Note:** Update `PRODUCER_DASHBOARD_WEBHOOK_URL` if your Producer Dashboard runs on a different port.

### Step 5: Test the Integration

1. **Create a lot** in the Marketplace (http://localhost:3004/dashboard)
2. **Check Producer Dashboard console** - you should see webhook logs:
   ```
   📥 Received lot.created for lot: [Lot Name]
   ✅ Synced lot: [Lot Name]
   ```
3. **Verify lot appears** in Producer Dashboard marketplace page

## How It Works

### Webhook Flow (Receiving Lots from Marketplace)

1. Marketplace creates/updates/deletes a lot
2. Marketplace sends webhook POST to `http://localhost:3000/api/webhooks/lots` (this Producer Dashboard)
3. Producer Dashboard verifies webhook secret
4. Producer Dashboard transforms and saves lot to MongoDB
5. Lot appears in Producer Dashboard marketplace

### Bid Submission Flow (Sending Bids to Buyer Dashboard)

1. Producer views lots in Producer Dashboard marketplace (http://localhost:3004/marketplace)
2. Producer clicks "Submit Bid" on a lot
3. Modal opens with bid form (producer info, volume, price, notes)
4. Producer submits bid
5. Producer Dashboard sends bid to Buyer Dashboard API (`http://localhost:3000/api/bids`)
6. Bid appears in Buyer Dashboard for review

### API Polling (Alternative for Receiving Lots)

The Producer Dashboard also polls the Marketplace API on each request to `/api/tenders`:

- Fetches lots from `http://localhost:3004/api/lots`
- Merges with local MongoDB lots
- Supports external endpoint with authentication: `/api/lots/external?orgId=YOUR_ORG_ID`

## Troubleshooting

### Webhook not received?

1. **Check both projects are running:**

   ```bash
   # Marketplace should be on port 3004
   curl http://localhost:3004/api/health/mongodb
   
   # Producer Dashboard webhook endpoint
   curl -X POST http://localhost:3000/api/webhooks/lots \
     -H "Authorization: Bearer dev-secret-key-123" \
     -H "Content-Type: application/json" \
     -d '{"event":"lot.created","lot":{"_id":"test","title":"Test Lot"}}'
   ```

2. **Check environment variables match:**

   - Marketplace: `PRODUCER_DASHBOARD_WEBHOOK_SECRET`
   - Producer Dashboard: `MARKETPLACE_WEBHOOK_SECRET`
   - They must be **identical**

3. **Check Producer Dashboard logs** for webhook errors:

   ```bash
   # Look for webhook-related logs in console
   # Should see: "📥 Received..." or "❌ Webhook error"
   ```

4. **Verify webhook URL is correct:**

   - Must match your Producer Dashboard port (default: 3000)
   - Check Marketplace `.env.local`: `PRODUCER_DASHBOARD_WEBHOOK_URL`

### Port Conflicts?

If Producer Dashboard uses a different port (e.g., 3000):

```env
# Marketplace .env.local
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/lots
```

### CORS Issues?

If you see CORS errors, make sure:

- Both projects are on `localhost` (same origin for development)
- Webhook endpoint accepts POST requests
- No CORS middleware blocking requests

### Lots not appearing?

1. **Check MongoDB connection:**

   ```bash
   # Verify MONGODB_URI is set correctly
   # Check MongoDB is running
   ```

2. **Check webhook logs:**

   ```bash
   # Look for transformation errors
   # Check if lots are being saved to database
   ```

3. **Manually test webhook:**

   ```bash
   curl -X POST http://localhost:3000/api/webhooks/lots \
     -H "Authorization: Bearer dev-secret-key-123" \
     -H "Content-Type: application/json" \
     -d '{
       "event": "lot.created",
       "lot": {
         "_id": "507f1f77bcf86cd799439011",
         "title": "Test Lot",
         "airlineName": "Test Airline",
         "volume": {"amount": 1000, "unit": "MT"},
         "pricing": {"price": 1000, "currency": "USD"},
         "delivery": {"deliveryLocation": "Test Location"},
         "status": "published"
       }
     }'
   ```

## API Endpoints

### Webhook Endpoint

- **URL:** `POST /api/webhooks/lots`
- **Auth:** Bearer token (must match `MARKETPLACE_WEBHOOK_SECRET`)
- **Payload:**
  ```json
  {
    "event": "lot.created" | "lot.updated" | "lot.deleted",
    "lot": { /* lot object */ },
    "organization": { /* optional */ }
  }
  ```

### Tenders API

- **URL:** `GET /api/tenders`
- **Description:** Fetches lots from both MongoDB and Marketplace API
- **Query Params:**
  - `status` - Filter by status
  - `airline` - Filter by airline
  - `minPrice` / `maxPrice` - Price range
  - `search` - Search in airline/lotName/location
  - `longTerm` - Filter long-term lots

## Environment Variables Reference

### Required

- `MONGODB_URI` - MongoDB connection string

### Optional (with defaults)

**Marketplace Integration (Receiving Lots):**
- `MARKETPLACE_BASE_URL` - Marketplace base URL (default: `http://localhost:3004`)
- `MARKETPLACE_WEBHOOK_SECRET` - Webhook secret (default: `dev-secret-key-123`)
- `MARKETPLACE_API_KEY` - API key for external endpoint (default: `dev-api-key-123`)

**Buyer Dashboard Integration (Sending Bids):**
- `NEXT_PUBLIC_BUYER_DASHBOARD_URL` - Buyer Dashboard base URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_BUYER_API_KEY` - API key for submitting bids (default: `producer-api-key-456`)

## Next Steps

1. **Set up authentication** - Add Clerk or other auth provider
2. **Add error handling** - Implement retry logic for webhooks
3. **Set up monitoring** - Add logging and alerting for webhook failures
4. **Add tests** - Write integration tests for webhook endpoint
5. **Production setup** - Configure production webhook URLs and secrets

## Support

For issues or questions:
- Check Marketplace project documentation
- Review webhook logs in console
- Verify environment variables are set correctly
- Test webhook endpoint manually with curl

