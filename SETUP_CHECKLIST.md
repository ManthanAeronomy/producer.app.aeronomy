# ✅ Bid Submission Setup Checklist

Quick checklist to get bid submission working between Producer Dashboard and Buyer Dashboard.

## Producer Dashboard (Port 3004) ✅ Already Done

- [x] Bid service created (`src/lib/webhooks/buyer-bid-service.ts`)
- [x] Marketplace updated to use bid service
- [x] Bid modal form created
- [x] Test scripts created
- [ ] **Add environment variables** (see below)
- [ ] **Restart dev server after adding env vars**

### Environment Variables to Add

Open `.env.local` and add:

```env
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_BUYER_API_KEY=producer-api-key-456
```

## Buyer Dashboard (Port 3000) ⚠️ You Need to Do This

Follow `BUYER_DASHBOARD_SETUP.md` to add these 3 files:

### 1. Create `models/Bid.ts` (or `.js`)

```typescript
import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  lotId: { type: String, required: true },
  producerName: { type: String, required: true },
  producerEmail: { type: String, required: true },
  volume: { type: Number, required: true },
  volumeUnit: { type: String, default: "MT" },
  pricePerUnit: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  notes: { type: String, required: true },
  status: { type: String, default: "pending" },
}, { timestamps: true });

export default mongoose.models.Bid || mongoose.model("Bid", bidSchema);
```

### 2. Create `app/api/bids/route.ts` (or `pages/api/bids.ts`)

See full code in `BUYER_DASHBOARD_SETUP.md` (lines 46-124)

Quick version:
- POST handler to create bids
- GET handler to list bids
- API key validation
- MongoDB integration

### 3. Add to Buyer Dashboard `.env.local`

```env
PRODUCER_API_KEY=producer-api-key-456
MONGODB_URI=your_mongodb_connection_string
```

## Testing

### 1. Test Connection

```bash
# In Producer Dashboard directory
node scripts/test-buyer-dashboard.js
```

Expected: `✅ ALL TESTS PASSED!`

### 2. Test Manual Submission

1. Open `http://localhost:3004/marketplace`
2. Click "Submit Bid" on any lot
3. Fill the form
4. Submit
5. Check Buyer Dashboard for the bid

### 3. Test with curl

```bash
curl -X POST http://localhost:3000/api/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer producer-api-key-456" \
  -d '{
    "lotId": "test123",
    "producerName": "Test",
    "producerEmail": "test@test.com",
    "volume": 1000,
    "volumeUnit": "MT",
    "pricePerUnit": 2000,
    "currency": "USD",
    "notes": "Test bid"
  }'
```

Expected: `{"bid": {...}, "message": "Bid received successfully"}`

## Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "Failed to submit bid" | Make sure Buyer Dashboard is running on port 3000 |
| "Unauthorized" | Check API key matches in both `.env.local` files |
| "Cannot connect" | Start Buyer Dashboard: `npm run dev` |
| Test script fails | Make sure you set env variables and restarted server |

## Files Created for You

```
✅ src/lib/webhooks/buyer-bid-service.ts    - Bid service
✅ src/app/marketplace/page.tsx              - Updated marketplace
✅ scripts/test-buyer-dashboard.js           - Test script (JS)
✅ scripts/test-buyer-dashboard.ts           - Test script (TS)
✅ BUYER_DASHBOARD_SETUP.md                  - Setup guide
✅ README_BID_SUBMISSION.md                  - Complete docs
✅ QUICK_START_BIDS.md                       - Quick start
✅ SETUP_CHECKLIST.md                        - This file
```

## What You Need to Do

1. **Producer Dashboard:**
   - [ ] Add 2 environment variables to `.env.local`
   - [ ] Restart dev server: `npm run dev`

2. **Buyer Dashboard:**
   - [ ] Create `models/Bid.ts`
   - [ ] Create `app/api/bids/route.ts`
   - [ ] Add `PRODUCER_API_KEY` to `.env.local`
   - [ ] Restart dev server: `npm run dev`

3. **Test:**
   - [ ] Run: `node scripts/test-buyer-dashboard.js`
   - [ ] Submit a bid from marketplace
   - [ ] Verify bid appears in Buyer Dashboard

## Time Estimate

- Producer Dashboard setup: **2 minutes**
- Buyer Dashboard setup: **10 minutes**
- Testing: **5 minutes**
- **Total: ~15-20 minutes**

---

Once you complete this checklist, bid submission will work! 🎉

For detailed instructions, see:
- `BUYER_DASHBOARD_SETUP.md` - Full setup guide
- `README_BID_SUBMISSION.md` - Complete documentation
- `QUICK_START_BIDS.md` - Minimal quick start



























