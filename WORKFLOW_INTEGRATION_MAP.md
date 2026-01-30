# Workflow Integration Map: Buyer ↔ Producer Portal

**Date:** January 26, 2026  
**Status:** Analysis & Planning Phase

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: LOT → BID → CONTRACT               │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Buyer Creates Lot
───────────────────────────
[Buyer Portal]                    [Producer Portal]
     │                                    │
     │ 1. Buyer creates lot              │
     │    (status: draft)                │
     │                                    │
     │ 2. Buyer publishes lot            │
     │    (status: published)            │
     │                                    │
     │ 3. Send webhook                    │
     │    POST /api/webhooks/lots         │───┐
     │    Event: lot.published            │   │
     │    Secret: MARKETPLACE_WEBHOOK_    │   │
     │            SECRET                  │   │
     │                                    │   │
     │ 4. Show notification                │   │
     │    "Your lot is now visible..."    │   │
     │                                    │   │
     │                                    │◄──┘
     │                                    │
     │                                    │ 5. Receive webhook
     │                                    │    Store lot in DB
     │                                    │    (transform to Tender/Lot)
     │                                    │
     │                                    │ 6. Lot appears in
     │                                    │    Producer marketplace


STEP 2: Producer Views & Bids
───────────────────────────────
[Buyer Portal]                    [Producer Portal]
     │                                    │
     │                                    │ 1. Producer views
     │                                    │    marketplace
     │                                    │
     │                                    │ 2. Fetch lots
     │    GET /api/lots/external          │◄──┐
     │    ?status=published               │   │
     │    Header: X-API-Key               │   │
     │                                    │   │
     │                                    │   │
     │◄───────────────────────────────────┘   │
     │    Response: { lots: [...] }           │
     │                                        │
     │                                        │ 3. Producer sees
     │                                        │    lot details
     │                                        │
     │                                        │ 4. Producer creates bid
     │                                        │    (5-step wizard)
     │                                        │
     │                                        │ 5. Submit bid
     │    POST /api/bids                      │───┐
     │    Header: X-API-Key                   │   │
     │    Body: {                             │   │
     │      lotId,                            │   │
     │      externalBidId,                   │   │
     │      bidderName,                      │   │
     │      volume,                          │   │
     │      pricing,                         │   │
     │      ...                              │   │
     │    }                                   │   │
     │                                        │   │
     │◄───────────────────────────────────────┘   │
     │    Response: { bid: {...} }                │
     │                                             │
     │ 6. Store bid in DB                          │
     │    Set source: 'producer-dashboard'         │
     │    Set status: 'pending'                   │
     │                                             │
     │ 7. Show notification                        │
     │    "New bid received on [Lot Name]"         │
     │                                             │
     │                                             │ 8. Bid stored
     │                                             │    in ProducerBid
     │                                             │    status: 'submitted'


STEP 3: Buyer Accepts Bid → Contract
─────────────────────────────────────
[Buyer Portal]                    [Producer Portal]
     │                                    │
     │ 1. Buyer views bid                 │
     │    (from producer)                │
     │                                    │
     │ 2. Buyer accepts bid               │
     │    PUT /api/bids/[id]              │
     │    { status: 'accepted' }          │
     │                                    │
     │ 3. Create contract                 │
     │    POST /api/contracts             │
     │    {                               │
     │      lotId,                        │
     │      bidId,                        │
     │      sellerOrgId,                  │
     │      buyerOrgId,                   │
     │      contractNumber,               │
     │      volume,                       │
     │      pricing,                       │
     │      terms,                         │
     │      ...                           │
     │    }                               │
     │                                    │
     │ 4. Send webhook                    │
     │    POST /api/webhooks/bids         │───┐
     │    Event: bid.accepted             │   │
     │    Payload: {                      │   │
     │      event: 'bid.accepted',        │   │
     │      bid: {...},                   │   │
     │      lot: {...},                   │   │
     │      contract: {...}               │   │
     │    }                               │   │
     │    Secret: BUYER_WEBHOOK_SECRET    │   │
     │                                    │   │
     │                                    │◄──┘
     │                                    │
     │                                    │ 5. Receive webhook
     │                                    │    Update ProducerBid
     │                                    │    status: 'won'
     │                                    │
     │                                    │ 6. Create Contract
     │                                    │    (if contract data
     │                                    │     provided)
     │                                    │
     │                                    │ 7. Contract appears
     │                                    │    in Producer contracts
     │                                    │    page


STEP 4: Counter-Bid Flow (Optional)
────────────────────────────────────
[Buyer Portal]                    [Producer Portal]
     │                                    │
     │ 1. Buyer creates counter-bid       │
     │    POST /api/bids/[id]/counter     │
     │    {                               │
     │      volume,                       │
     │      pricePerUnit,                 │
     │      message,                      │
     │      ...                           │
     │    }                               │
     │                                    │
     │ 2. Send webhook                    │
     │    POST /api/webhooks/bids         │───┐
     │    Event: bid.counter_offer        │   │
     │    Payload: {                      │   │
     │      event: 'bid.counter_offer',   │   │
     │      bid: {...},                   │   │
     │      counterOffer: {...}           │   │
     │    }                               │   │
     │                                    │   │
     │                                    │◄──┘
     │                                    │
     │                                    │ 3. Receive webhook
     │                                    │    Update ProducerBid
     │                                    │    status: 'counter_offer'
     │                                    │    Store counterOffer data
     │                                    │
     │                                    │ 4. Producer views
     │                                    │    counter-offer
     │                                    │
     │                                    │ 5. Producer accepts
     │                                    │    counter-bid
     │                                    │
     │    POST /api/bids/[id]/accept-    │───┐
     │         counter                    │   │
     │    { accept: true }                │   │
     │                                    │   │
     │◄───────────────────────────────────┘   │
     │    Response: { success: true }         │
     │                                         │
     │ 6. Update bid with accepted             │
     │    counter-offer terms                  │
     │                                         │
     │ 7. Create contract (same as Step 3)      │
     │                                         │
     │ 8. Send contract webhook                │
     │    (same as Step 3)                      │
```

---

## 🔌 API Endpoints Required

### Buyer Portal → Producer Portal (Webhooks)

| Endpoint | Method | Event | Purpose | Status |
|----------|--------|-------|---------|--------|
| `/api/webhooks/lots` | POST | `lot.published` | Notify producer of new lot | ✅ Exists |
| `/api/webhooks/lots` | POST | `lot.updated` | Notify producer of lot changes | ✅ Exists |
| `/api/webhooks/lots` | POST | `lot.deleted` | Notify producer of lot removal | ✅ Exists |
| `/api/webhooks/bids` | POST | `bid.accepted` | Notify producer bid was accepted | ✅ Exists |
| `/api/webhooks/bids` | POST | `bid.rejected` | Notify producer bid was rejected | ✅ Exists |
| `/api/webhooks/bids` | POST | `bid.counter_offer` | Notify producer of counter-offer | ✅ Exists |
| `/api/webhooks/contracts` | POST | `contract.created` | Notify producer of new contract | ❓ Unknown |

### Producer Portal → Buyer Portal (API Calls)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/lots/external` | GET | Fetch published lots | ✅ Exists (code) |
| `/api/bids` | POST | Submit bid to buyer | ✅ Exists (code) |
| `/api/bids/[id]/accept-counter` | POST | Accept counter-bid | ❓ Unknown |

---

## 🔐 Authentication & Secrets

### Buyer Portal Environment Variables Needed

```env
# Producer Portal Webhook Configuration
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=dev-webhook-secret-456

# API Key for Producer Portal to call Buyer Portal
PRODUCER_API_KEY=dev-api-key-123

# Buyer Portal Webhook Secret (for receiving webhooks from producer)
BUYER_WEBHOOK_SECRET=dev-webhook-secret-456
```

### Producer Portal Environment Variables (Current)

```env
# Buyer Portal Configuration
NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3004
MARKETPLACE_WEBHOOK_SECRET=dev-secret-key-123
BUYER_WEBHOOK_SECRET=dev-webhook-secret-456
BUYER_API_KEY=dev-api-key-123
```

**⚠️ IMPORTANT:** Secrets must match between portals!

---

## 📊 Data Flow Summary

### Lot Creation Flow
```
Buyer Portal                    Producer Portal
     │                                │
     │── lot.published webhook ──────▶│
     │                                │── Store lot
     │                                │── Show in marketplace
     │                                │
     │◄── GET /api/lots/external ─────│
     │                                │
```

### Bid Submission Flow
```
Producer Portal                 Buyer Portal
     │                                │
     │── POST /api/bids ─────────────▶│
     │                                │── Store bid
     │                                │── Show notification
     │                                │
     │◄── Response: { bid } ─────────│
     │                                │
```

### Bid Acceptance → Contract Flow
```
Buyer Portal                    Producer Portal
     │                                │
     │── Accept bid                  │
     │── Create contract             │
     │                                │
     │── bid.accepted webhook ──────▶│
     │    + contract data            │── Update bid status
     │                                │── Create contract
     │                                │
```

### Counter-Bid Flow
```
Buyer Portal                    Producer Portal
     │                                │
     │── Create counter-bid          │
     │                                │
     │── bid.counter_offer webhook ──▶│
     │                                │── Update bid
     │                                │── Show counter-offer
     │                                │
     │                                │── Accept counter-bid
     │◄── POST /api/bids/[id]/       │
     │    accept-counter              │
     │                                │
     │── Create contract             │
     │── Send contract webhook        │
```

---

## ✅ What We Know Works (Producer Portal)

1. ✅ **Webhook Receiver:** `/api/webhooks/lots` - Receives lot webhooks from buyer
2. ✅ **Webhook Receiver:** `/api/webhooks/bids` - Receives bid status updates
3. ✅ **Bid Submission:** `lib/webhooks/buyer-bid-service.ts` - Sends bids to buyer portal
4. ✅ **Lot Fetching:** `/api/marketplace/lots` - Fetches lots from buyer portal
5. ✅ **Contract Creation:** Can create contracts from accepted bids (webhook handler)

---

## ❓ What We Need to Know (Buyer Portal)

1. ❓ **Webhook Sending:** Does buyer portal have a service to send webhooks?
2. ❓ **Bid Reception:** Does `/api/bids` accept external bids from producer portal?
3. ❓ **Contract Webhook:** Does buyer portal send contract webhooks?
4. ❓ **Counter-Bid:** Is counter-bid functionality implemented?
5. ❓ **Notifications:** How are notifications displayed to buyers?
6. ❓ **API Endpoints:** Which endpoints exist vs. need to be created?

---

## 🎯 Implementation Priority

### Phase 1: Core Workflow (Critical)
1. ✅ Lot webhook sending (when lot published)
2. ❓ Bid reception endpoint (`POST /api/bids`)
3. ❓ Bid acceptance → Contract creation
4. ❓ Contract webhook to producer

### Phase 2: Counter-Bid Flow
1. ❓ Counter-bid creation endpoint
2. ❓ Counter-bid webhook to producer
3. ❓ Producer accept counter-bid endpoint

### Phase 3: Notifications & UX
1. ❓ On-screen notifications for buyers
2. ❓ Notification center/UI
3. ❓ Email notifications (optional)

### Phase 4: Error Handling & Reliability
1. ❓ Webhook retry logic
2. ❓ Error logging/monitoring
3. ❓ Webhook delivery confirmation

---

## 📝 Next Steps

1. **Answer Integration Questions** (see `INTEGRATION_QUESTIONS.md`)
2. **Review Buyer Portal Code** to identify existing vs. missing pieces
3. **Create Implementation Plan** with specific code changes
4. **Provide Code Examples** for missing endpoints/services
5. **Create Testing Checklist** for end-to-end workflow
6. **Document API Contracts** with payload examples

---

**Status:** Awaiting answers to integration questions to proceed with implementation plan.
