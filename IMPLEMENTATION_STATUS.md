# Implementation Status: Buyer–Producer Workflow Integration

**Date:** January 26, 2026  
**Status:** Phase 1 Complete - Critical Fixes Applied

---

## ✅ Completed (Phase 1 - Critical Fixes)

### 1. Fixed `bidderId` to Use Clerk `userId` ✅

**File:** `src/lib/webhooks/buyer-bid-service.ts`

**Changes:**
- ✅ Added `clerkUserId: string` to `BidSubmissionData` interface (REQUIRED field)
- ✅ Updated `sendBidToBuyerDashboard()` to use `bidData.clerkUserId` for `bidderId` (was incorrectly using `externalBidId`)
- ✅ Added `clerkUserId` to required fields validation
- ✅ Updated test function to include `clerkUserId`

**Impact:** Producer portal now correctly sends Clerk `userId` to buyer portal, allowing buyer portal to resolve the user via `resolveMongoUserId()`.

---

### 2. Updated Marketplace Page to Pass Clerk `userId` ✅

**File:** `src/app/marketplace/page.tsx`

**Changes:**
- ✅ Added `useAuth()` hook import from `@clerk/nextjs`
- ✅ Get `userId` from `useAuth()`
- ✅ Pass `clerkUserId: userId` when calling `sendBidToBuyerDashboard()`
- ✅ Added validation to ensure user is logged in before submitting bid

**Impact:** Marketplace bid submissions now include the correct Clerk `userId`.

---

### 3. Enhanced Bid Webhook Handler ✅

**File:** `src/app/api/webhooks/bids/route.ts`

**Changes:**
- ✅ Enhanced `bid.counter_offer` handler to store `buyerBidId` in counter-offer data (needed for `acceptCounterBid()`)
- ✅ Enhanced `bid.accepted` contract creation to:
  - Store `buyerContractId`, `buyerBidId` references
  - Map contract fields properly (volume, pricing, dates, status)
  - Generate contract number if not provided
  - Link to ProducerBid and RFQ/Lot

**Impact:** Contracts are now properly created and linked between portals. Counter-offers can be accepted.

---

### 4. Added Counter-Bid Acceptance Function ✅

**File:** `src/lib/webhooks/buyer-bid-service.ts`

**Changes:**
- ✅ Added `acceptCounterBid()` function
- ✅ Calls buyer portal's `POST /api/bids/[id]/accept-counter` endpoint
- ✅ Handles errors and returns success/error status

**Impact:** Producer can now accept counter-offers from buyers.

---

## ⚠️ Still Required (Phase 2 - Counter-Bid UI)

### 1. Create Counter-Bid Acceptance UI Component

**Status:** ❌ Not Implemented  
**Priority:** High  
**File:** `src/components/counter-bid-acceptance.tsx` (new file)

**Required:**
- Component to display counter-offer details
- "Accept Counter-Offer" button
- Calls `acceptCounterBid()` function
- Shows success/error feedback

**Reference:** See `IMPLEMENTATION_GUIDE.md` Task 5 for code example.

---

### 2. Update Bids Page to Show Counter-Offers

**Status:** ❌ Not Implemented  
**Priority:** High  
**File:** `src/app/bids/page.tsx`

**Required:**
- Check for `status === "counter_offer"` in bid list
- Display `CounterBidAcceptance` component for counter-offers
- Refresh bids list after acceptance

**Reference:** See `IMPLEMENTATION_GUIDE.md` Task 8 for code example.

---

## 📋 Optional Enhancements (Phase 3)

### 1. Contract Model Updates

**Status:** ⚠️ Partially Complete  
**File:** `src/models/Contract.ts`

**Current:** Contract model may need these fields verified:
- `buyerContractId?: string` - ✅ Used in webhook handler
- `buyerBidId?: string` - ✅ Used in webhook handler
- `lotId?: string` - ✅ Used in webhook handler

**Action:** Verify Contract model has these fields. If not, add them.

---

### 2. Other Bid Submission Points

**Status:** ⚠️ Needs Verification  
**Files to Check:**
- `src/app/bids/new/page.tsx` - If this submits bids directly

**Action:** If any other components call `sendBidToBuyerDashboard()`, ensure they pass `clerkUserId`.

---

### 3. Environment Variables

**Status:** ⚠️ Needs Verification  
**File:** `.env.local`

**Required Variables:**
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
```

**Action:** Verify all environment variables are set correctly and match buyer portal configuration.

---

## 🧪 Testing Checklist

### Phase 1 Tests (Critical - Do First)

- [ ] **Test Bid Submission with Clerk `userId`**
  1. Log in as producer user (Clerk)
  2. Navigate to marketplace
  3. Submit a bid
  4. **Verify:** Network tab shows `bidderId` = Clerk `userId` (starts with `user_`)
  5. **Verify:** Buyer portal receives bid with correct `bidderId`

- [ ] **Test Bid Acceptance → Contract**
  1. In buyer portal, accept a producer's bid
  2. **Verify:** Producer portal receives `bid.accepted` webhook
  3. **Verify:** Contract created in producer portal
  4. **Verify:** Contract has `buyerContractId`, `buyerBidId`, `lotId` populated

### Phase 2 Tests (After UI Implementation)

- [ ] **Test Counter-Bid Flow**
  1. In buyer portal, send counter-offer on a bid
  2. **Verify:** Producer portal receives `bid.counter_offer` webhook
  3. **Verify:** Counter-offer displayed in producer portal bids page
  4. **Verify:** "Accept Counter-Offer" button works
  5. **Verify:** Contract created after acceptance

### Phase 3 Tests (Optional)

- [ ] **Test Lot Syncing**
  1. In buyer portal, publish a new lot
  2. **Verify:** Producer portal receives `lot.published` webhook
  3. **Verify:** Lot appears in producer portal marketplace

---

## 🚨 Known Issues

### Issue 1: Counter-Bid UI Not Implemented

**Status:** ⚠️ Blocking counter-bid acceptance workflow  
**Solution:** Implement `CounterBidAcceptance` component and integrate into bids page.

### Issue 2: Buyer Portal Counter-Bid Endpoint May Not Exist

**Status:** ⚠️ Unknown  
**Note:** Buyer portal may need to implement `POST /api/bids/[id]/accept-counter` endpoint.  
**Reference:** See spec section 7.3 for buyer-side implementation needed.

### Issue 3: Environment Variables May Not Match

**Status:** ⚠️ Needs Verification  
**Solution:** Verify `BUYER_WEBHOOK_SECRET` matches buyer portal's `PRODUCER_DASHBOARD_WEBHOOK_SECRET`.

---

## 📚 Related Documentation

- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md` - Detailed implementation steps
- **Integration Spec:** Buyer–Producer Workflow Integration Spec (provided by user)
- **Workflow Map:** `WORKFLOW_INTEGRATION_MAP.md` - Visual workflow diagrams
- **Integration Questions:** `INTEGRATION_QUESTIONS.md` - Questions for buyer portal

---

## 🎯 Next Steps

1. **Immediate (Phase 2):**
   - Create `CounterBidAcceptance` component
   - Update bids page to show counter-offers
   - Test counter-bid acceptance flow

2. **Verification:**
   - Check other bid submission points (if any)
   - Verify Contract model fields
   - Verify environment variables

3. **Testing:**
   - Run Phase 1 tests
   - Run Phase 2 tests (after UI implementation)
   - End-to-end workflow testing

---

**Last Updated:** January 26, 2026  
**Status:** Phase 1 Complete ✅ | Phase 2 Pending ⚠️
