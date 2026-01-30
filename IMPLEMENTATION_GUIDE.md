# Producer Portal Implementation Guide
## Buyer–Producer Workflow Integration

**Date:** January 26, 2026  
**Status:** Implementation Required  
**Based on:** Buyer–Producer Workflow Integration Spec

---

## 🎯 Overview

This guide provides **specific code changes** needed on the Producer Portal to fully implement the buyer–producer workflow integration. The spec assumes:
- **Same MongoDB database** (different clusters = different deployments)
- **Shared Clerk instance** (same Clerk keys)
- **Producer sends Clerk `userId` as `bidderId`** when submitting bids

---

## ✅ What's Already Working

1. ✅ `/api/webhooks/lots` - Receives lot webhooks from buyer portal
2. ✅ `/api/webhooks/bids` - Receives bid status updates
3. ✅ `lib/webhooks/buyer-bid-service.ts` - Sends bids to buyer portal
4. ✅ `/api/marketplace/lots` - Fetches lots from buyer portal
5. ✅ Contract creation from `bid.accepted` webhook

---

## ❌ Critical Issues to Fix

### Issue 1: Missing Clerk `userId` in Bid Submission

**Problem:** `buyer-bid-service.ts` line 88 sets `bidderId` to `externalBidId` instead of the actual Clerk `userId`.

**Current Code:**
```typescript
bidderId: bidData.externalBidId || `producer_${Date.now()}`,
```

**Required:** `bidderId` must be the **Clerk `userId`** of the logged-in producer user.

---

## 🔧 Implementation Tasks

### Task 1: Fix Bid Submission to Include Clerk `userId`

**File:** `src/lib/webhooks/buyer-bid-service.ts`

**Changes:**

1. **Update `BidSubmissionData` interface** to include `clerkUserId`:
```typescript
export interface BidSubmissionData {
  lotId: string;
  clerkUserId: string;  // ADD THIS - Clerk userId of producer
  producerName: string;
  producerEmail: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  pricePerUnit: number;
  currency: "USD" | "EUR" | "GBP";
  totalPrice?: number;
  notes: string;
  paymentTerms?: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  externalBidId?: string;  // ProducerBid._id
  status?: "pending" | "accepted" | "rejected" | "withdrawn";
}
```

2. **Update `sendBidToBuyerDashboard` function** to use `clerkUserId`:
```typescript
// Prepare payload matching Buyer Dashboard API format
const payload = {
  lotId: bidData.lotId,
  bidderId: bidData.clerkUserId,  // FIX: Use Clerk userId, not externalBidId
  bidderName: bidData.producerName,
  bidderEmail: bidData.producerEmail,
  volume: {
    amount: bidData.volume,
    unit: bidData.volumeUnit === "MT" ? "MT" : "gallons",
  },
  pricing: {
    price: totalPrice,
    currency: bidData.currency || "USD",
    pricePerUnit: bidData.pricePerUnit,
  },
  message: bidData.notes,
  deliveryDate: bidData.deliveryDate || "",
  deliveryLocation: bidData.deliveryLocation || "",
  externalBidId: bidData.externalBidId || `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  status: bidData.status || "pending",
};
```

3. **Update validation** to require `clerkUserId`:
```typescript
const requiredFields: (keyof BidSubmissionData)[] = [
  "lotId",
  "clerkUserId",  // ADD THIS
  "producerName",
  "producerEmail",
  "volume",
  "pricePerUnit",
  "notes",
];
```

---

### Task 2: Update Bid Submission Callers to Pass Clerk `userId`

**Files to Update:**
- `src/app/marketplace/page.tsx`
- `src/app/bids/new/page.tsx` (if it submits bids)
- Any other components that call `sendBidToBuyerDashboard`

**Example Fix for `marketplace/page.tsx`:**

```typescript
import { useAuth } from "@clerk/nextjs";

export default function MarketplacePage() {
  const { userId } = useAuth();  // Get Clerk userId
  
  const handleBidSubmit = async () => {
    if (!userId) {
      setError("You must be logged in to submit a bid");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Send bid to buyer dashboard using the service
      const result = await sendBidToBuyerDashboard({
        lotId: activeTender.id,
        clerkUserId: userId,  // ADD THIS - Pass Clerk userId
        producerName: bidDraft.producerName,
        producerEmail: bidDraft.producerEmail,
        volume: Number(bidDraft.volume),
        volumeUnit: activeTender.volumeUnit,
        pricePerUnit: Number(bidDraft.price),
        currency: activeTender.currency,
        notes: bidDraft.notes,
        status: "pending",
      });

      // ... rest of the code
    } catch (err) {
      // ... error handling
    }
  };
}
```

---

### Task 3: Implement Counter-Bid Acceptance

**File:** `src/lib/webhooks/buyer-bid-service.ts`

**Add new function to accept counter-bids:**

```typescript
/**
 * Accept a counter-offer from buyer
 * 
 * @param bidId - Buyer's bid ID (from webhook)
 * @param acceptData - Acceptance confirmation
 * @returns Promise with success status
 */
export async function acceptCounterBid(
  bidId: string,
  acceptData: {
    accept: boolean;
    message?: string;
  }
): Promise<BidSubmissionResult> {
  const { url, apiKey } = getBuyerDashboardConfig();

  try {
    console.log(`🔄 Accepting counter-bid ${bidId} on Buyer Dashboard`);

    const response = await fetch(`${url}/api/bids/${bidId}/accept-counter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(acceptData),
    });

    if (!response.ok) {
      let errorMessage = `Failed to accept counter-bid (${response.status})`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      console.error(`❌ Counter-bid acceptance failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();

    console.log(`✅ Counter-bid ${bidId} accepted successfully`);

    return {
      success: true,
      bid: result.bid,
    };
  } catch (error: any) {
    console.error("❌ Error accepting counter-bid:", error);

    return {
      success: false,
      error: error.message || "Network error: Could not connect to Buyer Dashboard",
    };
  }
}
```

---

### Task 4: Enhance Bid Webhook Handler for Counter-Bids

**File:** `src/app/api/webhooks/bids/route.ts`

**Current code handles `bid.counter_offer` but doesn't provide UI integration. Enhance it:**

```typescript
case "bid.counter_offer":
  console.log(`🔄 Counter offer received: ${bid?.externalBidId}`);

  if (producerBid) {
    await ProducerBid.findByIdAndUpdate(producerBid._id, {
      status: "counter_offer",
      counterOffer: {
        volume: bid?.counterOffer?.volume || bid?.volume,
        pricePerUnit: bid?.counterOffer?.pricePerUnit || bid?.pricing?.pricePerUnit,
        message: bid?.counterOffer?.message || bid?.message,
        receivedAt: new Date(),
        buyerBidId: bid._id,  // Store buyer's bid ID for acceptance
      },
      updatedAt: new Date(),
    });
    
    // TODO: Trigger notification to producer user
    // TODO: Update UI to show counter-offer
  }
  break;
```

---

### Task 5: Create Counter-Bid Acceptance UI Component

**New File:** `src/components/counter-bid-acceptance.tsx`

```typescript
"use client";

import { useState } from "react";
import { acceptCounterBid } from "@/lib/webhooks/buyer-bid-service";

interface CounterBidAcceptanceProps {
  producerBidId: string;
  buyerBidId: string;
  counterOffer: {
    volume: { amount: number; unit: string };
    pricePerUnit: number;
    message?: string;
  };
  onAccept: () => void;
}

export function CounterBidAcceptance({
  producerBidId,
  buyerBidId,
  counterOffer,
  onAccept,
}: CounterBidAcceptanceProps) {
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    try {
      setAccepting(true);
      setError(null);

      const result = await acceptCounterBid(buyerBidId, {
        accept: true,
        message: "Counter-offer accepted",
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to accept counter-offer");
      }

      onAccept();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept counter-offer");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-yellow-50">
      <h3 className="font-semibold text-lg mb-2">Counter-Offer Received</h3>
      <div className="space-y-2 mb-4">
        <p><strong>Volume:</strong> {counterOffer.volume.amount} {counterOffer.volume.unit}</p>
        <p><strong>Price per Unit:</strong> ${counterOffer.pricePerUnit}</p>
        {counterOffer.message && (
          <p><strong>Message:</strong> {counterOffer.message}</p>
        )}
      </div>
      {error && (
        <div className="text-red-600 mb-2">{error}</div>
      )}
      <button
        onClick={handleAccept}
        disabled={accepting}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {accepting ? "Accepting..." : "Accept Counter-Offer"}
      </button>
    </div>
  );
}
```

---

### Task 6: Update Contract Model to Store Buyer Contract Reference

**File:** `src/models/Contract.ts`

**Ensure Contract model has fields to link to buyer portal:**

```typescript
// Add to IContract interface if not present:
buyerContractId?: string;  // Buyer portal's contract _id
buyerBidId?: string;        // Buyer portal's bid _id
lotId?: string;             // Buyer portal's lot _id
```

**Update webhook handler to store these:**

```typescript
// In /api/webhooks/bids/route.ts, bid.accepted case:
if (contractData) {
  const newContract = await Contract.create({
    producerBidId: producerBid?._id,
    buyerContractId: contractData._id,  // Store buyer's contract ID
    buyerBidId: bid._id,                  // Store buyer's bid ID
    lotId: lot?._id,                      // Store buyer's lot ID
    buyer: lot?.organization?.name || contractData.buyerName || "Unknown Buyer",
    // ... rest of contract fields
  });
}
```

---

### Task 7: Update Environment Variables

**File:** `.env.local`

**Ensure these are set correctly:**

```env
# Buyer Portal Configuration
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3004
# OR in production:
# NEXT_PUBLIC_BUYER_DASHBOARD_URL=https://app.aeronomy.co

# API Key for calling buyer portal (optional, but recommended)
BUYER_API_KEY=dev-api-key-123

# Webhook secret for receiving webhooks FROM buyer portal
# Must match buyer portal's PRODUCER_DASHBOARD_WEBHOOK_SECRET
BUYER_WEBHOOK_SECRET=dev-webhook-secret-456

# Clerk (shared with buyer portal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB (same database as buyer portal)
MONGODB_URI=mongodb+srv://...
```

---

### Task 8: Update Bid Pages to Show Counter-Offers

**File:** `src/app/bids/page.tsx`

**Add counter-offer display:**

```typescript
// In the bids list, check for counter_offer status:
{bid.status === "counter_offer" && bid.counterOffer && (
  <CounterBidAcceptance
    producerBidId={bid._id}
    buyerBidId={bid.counterOffer.buyerBidId}
    counterOffer={bid.counterOffer}
    onAccept={() => {
      // Refresh bids list
      fetchBids();
    }}
  />
)}
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Do First)
- [ ] **Fix `bidderId` in `buyer-bid-service.ts`** - Use Clerk `userId` instead of `externalBidId`
- [ ] **Update `BidSubmissionData` interface** - Add `clerkUserId` field
- [ ] **Update all bid submission callers** - Pass Clerk `userId` from `useAuth()`
- [ ] **Update validation** - Require `clerkUserId` in bid submission

### Phase 2: Counter-Bid Flow
- [ ] **Add `acceptCounterBid` function** - New function in `buyer-bid-service.ts`
- [ ] **Enhance webhook handler** - Store counter-offer data properly
- [ ] **Create `CounterBidAcceptance` component** - UI for accepting counter-bids
- [ ] **Update bids page** - Show counter-offers and acceptance UI

### Phase 3: Contract Integration
- [ ] **Update Contract model** - Add `buyerContractId`, `buyerBidId`, `lotId` fields
- [ ] **Enhance webhook handler** - Store buyer contract references
- [ ] **Add contract sync logic** - If same DB, read from buyer's contracts collection

### Phase 4: Testing & Validation
- [ ] **Test bid submission** - Verify Clerk `userId` is sent correctly
- [ ] **Test webhook reception** - Verify `bid.accepted` creates contract
- [ ] **Test counter-bid flow** - End-to-end counter-bid acceptance
- [ ] **Test lot syncing** - Verify lots appear in marketplace
- [ ] **Verify environment variables** - All secrets match buyer portal

---

## 🔍 Testing Guide

### Test 1: Bid Submission with Clerk `userId`

1. Log in as producer user (Clerk)
2. Navigate to marketplace
3. Click "Submit Bid" on a lot
4. Fill in bid form
5. Submit bid
6. **Verify in network tab:** `bidderId` in request payload = Clerk `userId` (starts with `user_`)
7. **Verify in buyer portal:** Bid appears with correct `bidderId`

### Test 2: Bid Acceptance → Contract

1. In buyer portal, accept a producer's bid
2. **Verify webhook received:** Check producer portal logs for `bid.accepted`
3. **Verify contract created:** Check producer portal contracts page
4. **Verify contract has buyer references:** `buyerContractId`, `buyerBidId`, `lotId` populated

### Test 3: Counter-Bid Flow

1. In buyer portal, send counter-offer on a bid
2. **Verify webhook received:** Check producer portal logs for `bid.counter_offer`
3. **Verify counter-offer displayed:** Check producer portal bids page
4. **Accept counter-offer:** Click "Accept Counter-Offer"
5. **Verify API call:** Check network tab for `POST /api/bids/[id]/accept-counter`
6. **Verify contract created:** Check both portals for new contract

### Test 4: Lot Syncing

1. In buyer portal, publish a new lot
2. **Verify webhook received:** Check producer portal logs for `lot.published`
3. **Verify lot appears:** Check producer portal marketplace
4. **Verify lot details:** All fields (volume, pricing, delivery, compliance) correct

---

## 🚨 Common Issues & Solutions

### Issue: "bidderId is not a valid Clerk userId"

**Cause:** Still using `externalBidId` instead of Clerk `userId`.

**Solution:** Ensure `clerkUserId` is passed from `useAuth().userId` when calling `sendBidToBuyerDashboard`.

### Issue: "Webhook authentication failed"

**Cause:** `BUYER_WEBHOOK_SECRET` doesn't match buyer portal's `PRODUCER_DASHBOARD_WEBHOOK_SECRET`.

**Solution:** Verify both `.env.local` files have the same secret value.

### Issue: "Counter-bid acceptance endpoint not found"

**Cause:** Buyer portal hasn't implemented `POST /api/bids/[id]/accept-counter` yet.

**Solution:** This is a buyer portal gap. See spec section 7.3 for buyer-side implementation needed.

### Issue: "Contract not appearing after bid acceptance"

**Cause:** Webhook handler not creating contract, or contract model missing fields.

**Solution:** 
1. Check webhook handler logs
2. Verify `contractData` is in webhook payload
3. Ensure Contract model has all required fields

---

## 📚 Related Files

- **Bid Submission:** `src/lib/webhooks/buyer-bid-service.ts`
- **Bid Webhook Handler:** `src/app/api/webhooks/bids/route.ts`
- **Lot Webhook Handler:** `src/app/api/webhooks/lots/route.ts`
- **Contract Model:** `src/models/Contract.ts`
- **ProducerBid Model:** `src/models/ProducerBid.ts`
- **Marketplace Page:** `src/app/marketplace/page.tsx`
- **Bids Page:** `src/app/bids/page.tsx`

---

## 🎯 Next Steps

1. **Start with Phase 1** - Fix the critical `bidderId` issue
2. **Test bid submission** - Verify Clerk `userId` is sent
3. **Implement counter-bid flow** - Phase 2
4. **Enhance contract integration** - Phase 3
5. **End-to-end testing** - Phase 4

---

**Status:** Ready for implementation  
**Priority:** Phase 1 is critical and must be done first
