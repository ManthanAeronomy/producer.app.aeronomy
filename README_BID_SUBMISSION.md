# 📨 Producer Dashboard → Buyer Dashboard Bid Submission

Complete guide for setting up and using bid submission from Producer Dashboard to Buyer Dashboard.

## 🎯 Overview

This Producer Dashboard can send bids/offers to a separate Buyer Dashboard. When a producer views lots in the marketplace and wants to submit a bid, the bid is sent to the Buyer Dashboard API for review.

```
┌──────────────────────┐         ┌──────────────────────┐
│ Producer Dashboard   │         │  Buyer Dashboard     │
│  (Port 3004)         │  ─────▶ │   (Port 3000)        │
│                      │   Bid   │                      │
│  - View Lots         │         │  - Receive Bids      │
│  - Submit Bids       │         │  - Review Offers     │
│  - Track Status      │         │  - Accept/Reject     │
└──────────────────────┘         └──────────────────────┘
```

## ✅ What's Already Done

I've created the following files for you:

1. **`src/lib/webhooks/buyer-bid-service.ts`** - Service to send bids to Buyer Dashboard
2. **`src/app/marketplace/page.tsx`** - Updated to use the bid service
3. **`scripts/test-buyer-dashboard.js`** - Test script to verify setup
4. **`BUYER_DASHBOARD_SETUP.md`** - Guide for what to add to Buyer Dashboard

## 🚀 Quick Setup (2 Steps)

### Step 1: Add Environment Variables

Add these to your `.env.local` file in the **Producer Dashboard**:

```env
# Buyer Dashboard Configuration
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_BUYER_API_KEY=producer-api-key-456
```

### Step 2: Set Up Buyer Dashboard

Follow the guide in `BUYER_DASHBOARD_SETUP.md` to add:
1. Bid model (`models/Bid.ts`)
2. API endpoint (`app/api/bids/route.ts`)
3. Environment variable (`PRODUCER_API_KEY`)

## 🧪 Test the Setup

After setting everything up, run the test script:

```bash
node scripts/test-buyer-dashboard.js
```

Expected output:
```
🚀 Starting Buyer Dashboard API Tests

============================================================

📡 Test 1: Checking Buyer Dashboard connection...
✅ Connection successful!

📤 Test 2: Submitting test bid...
✅ Test bid submitted successfully!

Bid details:
  - Bid ID: 507f1f77bcf86cd799439011
  - Producer: Test Producer
  - Volume: 1000 MT
  - Price: USD 2000/MT

============================================================

✅ ALL TESTS PASSED!
```

## 📖 How to Use

### Submit a Bid from the Marketplace

1. **Navigate to Marketplace**
   ```
   http://localhost:3004/marketplace
   ```

2. **Click "Submit Bid"** on any lot

3. **Fill out the bid form:**
   - Producer Name (e.g., "ABC Biofuels Inc.")
   - Email Address (e.g., "contact@abcbiofuels.com")
   - Volume (pre-filled from lot)
   - Price per unit (pre-filled from lot)
   - Notes (required - describe your offer)

4. **Click "Submit Bid to Buyer"**

5. **Check Buyer Dashboard** to see your bid

### Programmatic Usage

You can also use the service directly in your code:

```typescript
import { sendBidToBuyerDashboard } from '@/lib/webhooks/buyer-bid-service';

async function submitBid() {
  const result = await sendBidToBuyerDashboard({
    lotId: "507f1f77bcf86cd799439011",
    producerName: "ABC Biofuels Inc.",
    producerEmail: "contact@abcbiofuels.com",
    volume: 5000,
    volumeUnit: "MT",
    pricePerUnit: 2100,
    currency: "USD",
    notes: "HEFA-based SAF from waste cooking oil. CORSIA certified.",
  });

  if (result.success) {
    console.log("✅ Bid submitted:", result.bid);
  } else {
    console.error("❌ Error:", result.error);
  }
}
```

## 🔧 API Reference

### Service Functions

#### `sendBidToBuyerDashboard(bidData)`

Sends a bid to the Buyer Dashboard.

**Parameters:**
- `lotId` (string, required) - ID of the lot
- `producerName` (string, required) - Producer company name
- `producerEmail` (string, required) - Producer email
- `volume` (number, required) - Bid volume
- `volumeUnit` ("MT" | "gal") - Volume unit
- `pricePerUnit` (number, required) - Price per unit
- `currency` ("USD" | "EUR" | "GBP") - Currency
- `notes` (string, required) - Additional information
- `status` (string, optional) - Default: "pending"

**Returns:**
```typescript
{
  success: boolean;
  bid?: any;      // Bid object if successful
  error?: string; // Error message if failed
}
```

#### `checkBuyerDashboardConnection()`

Checks if Buyer Dashboard is available.

**Returns:** `Promise<boolean>`

#### `getBidsFromBuyerDashboard(lotId?)`

Retrieves bids from Buyer Dashboard (optional: filter by lot).

#### `updateBidInBuyerDashboard(bidId, status)`

Updates a bid status (e.g., withdraw).

#### `testBuyerDashboardAPI()`

Runs a complete API test.

## 📁 File Structure

```
aeronomy/
├── src/
│   ├── app/
│   │   └── marketplace/
│   │       └── page.tsx              # Marketplace with bid modal
│   └── lib/
│       └── webhooks/
│           └── buyer-bid-service.ts  # Bid submission service
├── scripts/
│   ├── test-buyer-dashboard.js       # Test script (JavaScript)
│   └── test-buyer-dashboard.ts       # Test script (TypeScript)
├── BUYER_DASHBOARD_SETUP.md          # Setup guide for Buyer Dashboard
├── QUICK_START_BIDS.md               # Quick start guide
└── README_BID_SUBMISSION.md          # This file
```

## 🐛 Troubleshooting

### Error: "Failed to submit bid"

**Cause:** Buyer Dashboard is not responding or endpoint doesn't exist.

**Solution:**
1. Make sure Buyer Dashboard is running: `curl http://localhost:3000`
2. Verify `/api/bids` endpoint exists (see `BUYER_DASHBOARD_SETUP.md`)
3. Check Buyer Dashboard console for errors

### Error: "Unauthorized - Invalid API key"

**Cause:** API key mismatch between Producer and Buyer dashboards.

**Solution:**
1. Producer Dashboard `.env.local`: `NEXT_PUBLIC_BUYER_API_KEY=producer-api-key-456`
2. Buyer Dashboard `.env.local`: `PRODUCER_API_KEY=producer-api-key-456`
3. Make sure they **match exactly**
4. Restart both servers after changing env variables

### Error: "Cannot connect to Buyer Dashboard"

**Cause:** Buyer Dashboard is not running or wrong URL.

**Solution:**
1. Start Buyer Dashboard: `npm run dev` (should be on port 3000)
2. Check the URL in `.env.local`: `NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3000`
3. Try: `curl http://localhost:3000/api/bids`

### Bid submits but doesn't appear in Buyer Dashboard

**Cause:** Database issue or API not saving bids.

**Solution:**
1. Check Buyer Dashboard console logs
2. Verify MongoDB is connected
3. Check if Bid model was created correctly
4. Test with curl:
   ```bash
   curl -X POST http://localhost:3000/api/bids \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer producer-api-key-456" \
     -d '{"lotId":"test","producerName":"Test","producerEmail":"test@test.com","volume":1000,"pricePerUnit":2000,"notes":"Test"}'
   ```

### Run the test script fails

**Solution:**
1. Make sure you're in the project root: `cd aeronomy`
2. Install dependencies: `npm install`
3. Set environment variables in `.env.local`
4. Start Buyer Dashboard first
5. Run: `node scripts/test-buyer-dashboard.js`

## 🔒 Security Notes

- **API Keys:** In production, use secure API keys and rotate them regularly
- **HTTPS:** Always use HTTPS in production, not HTTP
- **Authentication:** Consider implementing OAuth or JWT for better security
- **Rate Limiting:** Add rate limiting to prevent abuse
- **Validation:** The service validates all fields before sending

## 📊 Data Flow

```
1. User fills bid form in marketplace
   ↓
2. Frontend calls handleBidSubmit()
   ↓
3. Calls sendBidToBuyerDashboard()
   ↓
4. Service validates data
   ↓
5. POST request to Buyer Dashboard /api/bids
   ↓
6. Buyer Dashboard validates API key
   ↓
7. Buyer Dashboard saves to MongoDB
   ↓
8. Returns bid object
   ↓
9. Producer sees success message
```

## 🎨 Customization

### Change API endpoint

Update `buyer-bid-service.ts`:

```typescript
function getBuyerDashboardConfig() {
  const url = process.env.NEXT_PUBLIC_BUYER_DASHBOARD_URL || "http://localhost:3000";
  // Change default URL here ^^^
}
```

### Add more bid fields

1. Update `BidSubmissionData` interface in `buyer-bid-service.ts`
2. Update bid form in `marketplace/page.tsx`
3. Update Buyer Dashboard Bid model

### Custom error messages

Modify error handling in `handleBidSubmit()` in `marketplace/page.tsx`.

## 📚 Related Documentation

- `BUYER_DASHBOARD_SETUP.md` - Complete setup guide for Buyer Dashboard
- `QUICK_START_BIDS.md` - Quick 2-minute setup guide
- `BID_SUBMISSION_CHANGES.md` - Detailed changelog
- `ENV_SETUP_BIDS.md` - Environment variable guide

## ✨ Features

- ✅ Modal bid form with validation
- ✅ Pre-filled values from lot
- ✅ Email validation
- ✅ API key authentication
- ✅ Error handling and user feedback
- ✅ Success confirmations
- ✅ Test scripts for verification
- ✅ Comprehensive logging
- ✅ Duplicate prevention (via externalBidId)
- ✅ Total price calculation

## 🎉 Next Steps

1. ✅ Set up environment variables
2. ✅ Add Buyer Dashboard endpoint
3. ✅ Run test script
4. ✅ Submit a test bid
5. 🔄 Add bid management UI
6. 🔄 Add bid status tracking
7. 🔄 Add email notifications
8. 🔄 Add bid history page

## 💡 Tips

- Always test with the test script first
- Check both Producer and Buyer Dashboard logs
- Use the browser console to debug frontend issues
- Test with curl to isolate backend issues
- Keep API keys in sync between projects

---

Need help? Check the troubleshooting section or review `BUYER_DASHBOARD_SETUP.md` for more details.





















