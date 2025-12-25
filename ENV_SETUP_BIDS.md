# Environment Setup for Bid Submission

This document explains the environment variables needed for the bid submission feature to work properly.

## Producer Dashboard (Port 3004) → Buyer Dashboard (Port 3000)

When a producer submits a bid from the Producer Dashboard, it needs to send that bid to the Buyer Dashboard on port 3000.

## Required Environment Variables

Add these to your `.env.local` file in the **Producer Dashboard** project (this project):

```env
# Buyer Dashboard Integration (for submitting bids)
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_BUYER_API_KEY=producer-api-key-456
```

## Complete .env.local Example

Your complete `.env.local` should look like this:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Marketplace Integration (Port 3004 - receiving lots)
MARKETPLACE_BASE_URL=http://localhost:3004
MARKETPLACE_WEBHOOK_SECRET=dev-secret-key-123
MARKETPLACE_API_KEY=dev-api-key-123

# Buyer Dashboard Integration (Port 3000 - sending bids)
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_BUYER_API_KEY=producer-api-key-456
```

## How Bid Submission Works

1. **Producer views lots** in the marketplace at `http://localhost:3004/marketplace`
2. **Producer clicks "Submit Bid"** on any lot
3. **Modal opens** with a form asking for:
   - Producer Name
   - Producer Email
   - Volume (pre-filled with lot volume)
   - Price per unit (pre-filled with lot price)
   - Additional notes (required)
4. **Producer submits the form**
5. **Bid is sent** to the Buyer Dashboard API at `http://localhost:3000/api/bids`
6. **Bid appears** in the Buyer Dashboard for review

## Bid Payload Structure

The bid is sent to the Buyer Dashboard with the following structure:

```json
{
  "lotId": "507f1f77bcf86cd799439011",
  "producerName": "ABC Biofuels",
  "producerEmail": "contact@abcbiofuels.com",
  "volume": 5000,
  "volumeUnit": "MT",
  "pricePerUnit": 2100,
  "currency": "USD",
  "notes": "HEFA-based SAF, CORSIA certified, can deliver to multiple locations",
  "status": "pending"
}
```

## Buyer Dashboard Requirements

The Buyer Dashboard (port 3000) must have:

1. **API endpoint** at `/api/bids` that accepts POST requests
2. **Authorization check** for the Bearer token (matching `NEXT_PUBLIC_BUYER_API_KEY`)
3. **Database** to store the incoming bids

## Testing the Bid Submission

1. **Start both projects:**
   ```bash
   # Terminal 1: Buyer Dashboard
   cd buyer-dashboard
   npm run dev  # Should run on port 3000
   
   # Terminal 2: Producer Dashboard
   cd aeronomy
   npm run dev  # Should run on port 3004
   ```

2. **Open Producer Dashboard** at `http://localhost:3004/marketplace`

3. **Click "Submit Bid"** on any lot

4. **Fill out the bid form:**
   - Enter your producer name
   - Enter your email
   - Adjust volume/price if needed
   - Add notes (required field)

5. **Submit the bid**

6. **Check Buyer Dashboard** to verify the bid was received

## Troubleshooting

### Error: "Failed to submit bid"

**Possible causes:**
- Buyer Dashboard is not running on port 3000
- API key doesn't match
- Buyer Dashboard `/api/bids` endpoint doesn't exist or has errors

**Solutions:**
1. Verify Buyer Dashboard is running: `curl http://localhost:3000`
2. Check environment variables are set correctly
3. Check browser console for detailed error messages
4. Check Buyer Dashboard console for incoming request logs

### Error: "Network request failed"

**Possible causes:**
- Buyer Dashboard is not running
- Port 3000 is blocked or used by another application

**Solutions:**
1. Make sure Buyer Dashboard is running on port 3000
2. Check if another app is using port 3000: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)

### Bid submission succeeds but doesn't appear in Buyer Dashboard

**Possible causes:**
- Buyer Dashboard API returns 200 but doesn't save the bid
- Database connection issue in Buyer Dashboard

**Solutions:**
1. Check Buyer Dashboard console logs
2. Verify Buyer Dashboard database connection
3. Test the Buyer Dashboard API directly with curl:
   ```bash
   curl -X POST http://localhost:3000/api/bids \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer producer-api-key-456" \
     -d '{
       "lotId": "test123",
       "producerName": "Test Producer",
       "producerEmail": "test@example.com",
       "volume": 1000,
       "volumeUnit": "MT",
       "pricePerUnit": 2000,
       "currency": "USD",
       "notes": "Test bid",
       "status": "pending"
     }'
   ```

## Security Notes

- The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- In production, use secure API keys and HTTPS
- Consider implementing proper authentication instead of simple API keys
- Rotate API keys regularly

## Next Steps

After setting up the environment variables:

1. Restart your development server for changes to take effect
2. Test bid submission with a sample lot
3. Verify bids appear in the Buyer Dashboard
4. Set up proper authentication for production use





















