# Integration Questions: Buyer ↔ Producer Portal Workflow

**Date:** January 26, 2026  
**Goal:** Understand what needs to be built on Buyer Portal to enable the complete workflow

---

## Workflow Overview

1. **Buyer submits lot** → Notification on buyer side → Lot visible to producers
2. **Producer views lot** → Sees all details → Can bid
3. **Producer bids** → Bid sent to buyer portal → Buyer can accept → Creates contract → Contract shared to producer
4. **Counter-bids** → Producer can accept counter-bid → Same contract flow

---

## 🔍 Critical Questions for Buyer Portal

### 1. Lot Creation & Webhook Infrastructure

**Question 1.1:** When a buyer creates/publishes a lot on the buyer portal:
- ✅ Does the buyer portal already send a webhook to the producer portal?
- ❓ What is the webhook URL configured in buyer portal's environment?
- ❓ What webhook events are currently sent? (`lot.created`, `lot.published`, `lot.updated`, `lot.deleted`?)

**Question 1.2:** Buyer Portal Notification:
- ❓ When a lot is published, how does the buyer get notified on-screen?
- ❓ Is there a notification system already implemented? (toast, notification center, etc.)
- ❓ What notification message should appear? (e.g., "Your lot is now visible to producers on the platform")

**Question 1.3:** Lot Visibility:
- ✅ Producer portal has `/api/marketplace/lots` that fetches from buyer portal's `/api/lots/external`
- ❓ Does `/api/lots/external` on buyer portal exist and work correctly?
- ❓ Does it require authentication or API key?
- ❓ What filters/query params does it support? (`status=published`?)

---

### 2. Bid Submission & Reception

**Question 2.1:** Bid Reception Endpoint:
- ✅ Producer portal sends bids to buyer portal via `POST /api/bids` with `X-API-Key` header
- ❓ Does buyer portal's `/api/bids` endpoint exist and accept external bids?
- ❓ What authentication does it use? (API key, Bearer token, both?)
- ❓ What is the expected payload format? (Does it match what producer portal sends?)

**Question 2.2:** Bid Storage:
- ❓ When a bid is received from producer portal, does it:
  - Create a new Bid document in buyer portal's database?
  - Link it to the Lot?
  - Set `source: 'producer-dashboard'` or similar?
  - Store the `externalBidId` for tracking?

**Question 2.3:** Bid Notification:
- ❓ When a bid is received, does the buyer get notified?
- ❓ How? (on-screen notification, email, both?)
- ❓ What information is shown? (producer name, lot title, bid amount?)

---

### 3. Bid Acceptance & Contract Creation

**Question 3.1:** Bid Acceptance Flow:
- ❓ When buyer accepts a bid on buyer portal:
  - Does it update the Bid status to `"accepted"`?
  - Does it automatically create a Contract?
  - Or is contract creation a separate step?

**Question 3.2:** Contract Creation:
- ❓ When a contract is created from an accepted bid:
  - What data is included? (lot details, bid details, buyer/seller info, terms, etc.)
  - Does it generate a contract number? (format?)
  - What is the initial contract status? (`"draft"`, `"pending_signature"`, `"active"`?)

**Question 3.3:** Contract Webhook to Producer:
- ❓ When a contract is created, does buyer portal send a webhook to producer portal?
- ❓ What is the webhook endpoint? (`/api/webhooks/contracts`?)
- ❓ What is the webhook payload structure?
- ❓ What authentication/secret is used?

**Question 3.4:** Contract Data Synchronization:
- ❓ What contract fields need to be synchronized between portals?
  - Contract number
  - Buyer/seller information
  - Volume, pricing, terms
  - Delivery schedule
  - Status
  - Signatures
  - Documents

---

### 4. Counter-Bid Flow

**Question 4.1:** Counter-Bid Creation:
- ❓ Can buyers create counter-bids on buyer portal?
- ❓ If yes, what is the flow?
  - Buyer views bid → Clicks "Counter Offer" → Enters new terms → Submits
- ❓ What data is in a counter-bid? (volume, price, terms, message?)

**Question 4.2:** Counter-Bid Webhook:
- ❓ When a counter-bid is created, does buyer portal send webhook to producer?
- ❓ What event name? (`bid.counter_offer`?)
- ❓ What is the payload structure?

**Question 4.3:** Producer Accepts Counter-Bid:
- ❓ When producer accepts a counter-bid:
  - Does producer portal send a webhook to buyer portal?
  - What event? (`bid.counter_accepted`?)
  - Does it automatically create a contract?
  - Or does buyer need to confirm?

---

### 5. Webhook Infrastructure on Buyer Portal

**Question 5.1:** Webhook Sending Service:
- ❓ Does buyer portal have a webhook service/library for sending webhooks?
- ❓ Where is it located? (`lib/webhooks/`?)
- ❓ What webhook URLs are configured?
  - Producer Dashboard URL: `PRODUCER_DASHBOARD_WEBHOOK_URL`?
  - Producer Dashboard Secret: `PRODUCER_DASHBOARD_WEBHOOK_SECRET`?

**Question 5.2:** Webhook Events Currently Sent:
- ❓ What webhook events does buyer portal currently send?
  - `lot.created`
  - `lot.published`
  - `lot.updated`
  - `lot.deleted`
  - `bid.received` (when external bid comes in)
  - `bid.accepted`
  - `bid.rejected`
  - `bid.counter_offer`
  - `contract.created`
  - `contract.updated`
  - Others?

**Question 5.3:** Webhook Reliability:
- ❓ Is there retry logic for failed webhooks?
- ❓ Is there webhook logging/monitoring?
- ❓ Are webhooks sent synchronously or asynchronously?

---

### 6. API Endpoints Needed on Buyer Portal

**Question 6.1:** Existing Endpoints:
- ❓ Which of these endpoints already exist on buyer portal?
  - `GET /api/lots/external` - Public lot listing for producer portal
  - `POST /api/bids` - Accept external bids from producer portal
  - `PUT /api/bids/[id]` - Update bid status (accept/reject)
  - `POST /api/bids/[id]/counter` - Create counter-bid
  - `POST /api/contracts` - Create contract from accepted bid
  - `POST /api/webhooks/contracts` - Send contract webhook to producer
  - Others?

**Question 6.2:** Missing Endpoints:
- ❓ Which endpoints need to be created?
- ❓ What is the priority order?

---

### 7. Authentication & Security

**Question 7.1:** API Key Configuration:
- ❓ What API key does buyer portal expect from producer portal?
  - Environment variable: `PRODUCER_API_KEY`?
  - Header: `X-API-Key` or `Authorization: Bearer`?
  - What is the current value in buyer portal's `.env.local`?

**Question 7.2:** Webhook Secret:
- ❓ What webhook secret does buyer portal use to authenticate webhooks TO producer portal?
  - Environment variable: `PRODUCER_DASHBOARD_WEBHOOK_SECRET`?
  - What is the current value?
  - Does it match producer portal's `BUYER_WEBHOOK_SECRET`?

**Question 7.3:** CORS Configuration:
- ❓ Does buyer portal have CORS configured for producer portal's origin?
- ❓ What origins are allowed?
- ❓ Is it configured in `next.config.js` or middleware?

---

### 8. Data Models & Schema

**Question 8.1:** Bid Model:
- ❓ Does buyer portal's Bid model have:
  - `externalBidId` field? (to track producer portal's bid ID)
  - `source` field? (to identify if bid came from producer portal)
  - `bidderId` field? (MongoDB User ObjectId or external ID?)
  - `bidderName` and `bidderEmail` fields? (for external bids)

**Question 8.2:** Contract Model:
- ❓ Does buyer portal's Contract model have:
  - `externalContractId` or `producerContractId`? (to link to producer portal)
  - `sellerOrgId` and `buyerOrgId`? (to identify organizations)
  - `lotId` and `bidId` references?
  - All necessary fields for synchronization?

**Question 8.3:** Lot Model:
- ❓ Does buyer portal's Lot model have all fields that producer portal needs?
- ❓ Are there any field name mismatches that need transformation?

---

### 9. Notification System

**Question 9.1:** Real-time Notifications:
- ❓ Does buyer portal have a notification system?
- ❓ How are notifications stored? (Database, in-memory, external service?)
- ❓ How are notifications displayed? (Notification center, toast, both?)

**Question 9.2:** Notification Events:
- ❓ What events trigger notifications?
  - Lot published → "Your lot is now visible to producers"
  - Bid received → "New bid received on [Lot Name]"
  - Bid accepted → "Your bid has been accepted"
  - Contract created → "Contract [Contract Number] has been created"
  - Counter-bid received → "Counter-offer received on [Lot Name]"

**Question 9.3:** Notification API:
- ❓ Is there a notification API endpoint?
- ❓ Can it be called from webhook handlers to create notifications?

---

### 10. Current State & What Works

**Question 10.1:** What Already Works:
- ❓ What parts of the workflow currently work end-to-end?
  - Can producer portal fetch lots from buyer portal? ✅ (based on code)
  - Can producer portal submit bids to buyer portal? ✅ (code exists)
  - Can buyer portal receive bids? ❓
  - Can buyer portal send webhooks to producer portal? ❓
  - Can contracts be created and synced? ❓

**Question 10.2:** What's Broken/Missing:
- ❓ What specific parts don't work?
- ❓ What error messages or issues are you seeing?
- ❓ What's the biggest blocker right now?

**Question 10.3:** Testing:
- ❓ Have you tested the integration between portals?
- ❓ What test scenarios have you run?
- ❓ What test scenarios are failing?

---

## 📋 Summary Checklist

Based on your answers, I'll create a detailed implementation plan. Here's what I need to know:

### Infrastructure
- [ ] Webhook sending service exists?
- [ ] Webhook URLs/secrets configured?
- [ ] API endpoints for external access exist?
- [ ] Authentication/API keys configured?

### Functionality
- [ ] Lot webhooks sent when published?
- [ ] Bid reception endpoint works?
- [ ] Bid acceptance creates contract?
- [ ] Contract webhook sent to producer?
- [ ] Counter-bid flow implemented?
- [ ] Notification system exists?

### Data Models
- [ ] Bid model has external tracking fields?
- [ ] Contract model has sync fields?
- [ ] Lot model matches producer expectations?

### Testing
- [ ] End-to-end workflow tested?
- [ ] Webhook delivery verified?
- [ ] Error handling tested?

---

## 🎯 Next Steps

Once you answer these questions, I will:

1. **Create a detailed implementation plan** for buyer portal
2. **Identify exact code changes needed** (endpoints, webhooks, services)
3. **Provide code examples** for missing pieces
4. **Create a testing checklist** for the workflow
5. **Document the integration** with API specs and payload examples

---

**Please answer these questions, and I'll provide a complete implementation guide!**
