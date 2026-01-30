# Manual Setup Checklist: Buyer–Producer Integration

**Date:** January 26, 2026  
**Status:** Tasks You Must Complete Manually  
**Note:** These are infrastructure, configuration, and testing tasks that cannot be automated.

---

## 🔐 1. Authentication & User Management

### Clerk Setup (Shared Instance)

- [ ] **Verify Clerk Account**
  - [ ] Both buyer and producer portals use the **same Clerk account**
  - [ ] Same `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in both portals
  - [ ] Same `CLERK_SECRET_KEY` in both portals

- [ ] **Test Clerk User Access**
  - [ ] Create a test producer user in Clerk
  - [ ] Verify user can log in to producer portal
  - [ ] Verify user's `userId` is accessible via `useAuth().userId`
  - [ ] Note the `userId` format (should start with `user_`)

- [ ] **User Sync Verification**
  - [ ] Verify buyer portal's `resolveMongoUserId()` works
  - [ ] Test that Clerk `userId` resolves to MongoDB User ObjectId
  - [ ] Verify user appears in buyer portal's MongoDB User collection after first login

---

## 🗄️ 2. Database Configuration

### MongoDB Setup

- [ ] **MongoDB Cluster/Connection**
  - [ ] Verify both portals connect to the **same MongoDB database**
  - [ ] Get MongoDB connection string (`MONGODB_URI`)
  - [ ] Test connection from both portals
  - [ ] Verify database name is the same (or collections are shared)

- [ ] **Database Collections**
  - [ ] Verify `users` collection exists (for Clerk user sync)
  - [ ] Verify `lots` collection exists (buyer portal)
  - [ ] Verify `bids` collection exists (buyer portal)
  - [ ] Verify `contracts` collection exists (buyer portal)
  - [ ] Verify `rfqs` collection exists (producer portal - if using)
  - [ ] Verify `producerbids` collection exists (producer portal)
  - [ ] Verify `contracts` collection exists (producer portal)

- [ ] **Database Access**
  - [ ] If using MongoDB Atlas, verify network access allows both portal IPs
  - [ ] If using local MongoDB, verify both portals can connect
  - [ ] Test read/write permissions from both portals

---

## 🔑 3. Environment Variables Configuration

### Producer Portal (.env.local)

- [ ] **Buyer Portal Connection**
  ```env
  NEXT_PUBLIC_BUYER_DASHBOARD_URL=http://localhost:3004
  # OR in production:
  # NEXT_PUBLIC_BUYER_DASHBOARD_URL=https://app.aeronomy.co
  ```
  - [ ] Set correct URL (localhost for dev, production URL for prod)
  - [ ] Test that URL is reachable

- [ ] **API Key for Buyer Portal**
  ```env
  BUYER_API_KEY=dev-api-key-123
  # OR
  NEXT_PUBLIC_BUYER_API_KEY=dev-api-key-123
  ```
  - [ ] Generate or obtain API key from buyer portal
  - [ ] Verify buyer portal accepts this API key
  - [ ] Test API key works with `GET /api/lots/external`

- [ ] **Webhook Secret (Receiving from Buyer)**
  ```env
  BUYER_WEBHOOK_SECRET=dev-webhook-secret-456
  ```
  - [ ] **CRITICAL:** Must match buyer portal's `PRODUCER_DASHBOARD_WEBHOOK_SECRET`
  - [ ] Verify both portals have the same secret value
  - [ ] Test webhook authentication works

- [ ] **Clerk Configuration**
  ```env
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  ```
  - [ ] Copy from Clerk dashboard
  - [ ] Verify same keys in both portals
  - [ ] Test authentication works

- [ ] **MongoDB Connection**
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
  ```
  - [ ] Get connection string from MongoDB Atlas or local MongoDB
  - [ ] Verify connection string is correct
  - [ ] Test connection works

---

### Buyer Portal (.env.local) - Verification

- [ ] **Producer Portal Webhook Configuration**
  ```env
  PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/lots
  # OR in production:
  # PRODUCER_DASHBOARD_WEBHOOK_URL=https://producer-portal.com/api/webhooks/lots
  
  PRODUCER_DASHBOARD_WEBHOOK_SECRET=dev-webhook-secret-456
  ```
  - [ ] **CRITICAL:** `PRODUCER_DASHBOARD_WEBHOOK_SECRET` must match producer portal's `BUYER_WEBHOOK_SECRET`
  - [ ] Verify webhook URL is correct (producer portal base URL + `/api/webhooks/lots`)
  - [ ] Test webhook URL is reachable from buyer portal

- [ ] **Bid Webhook URL (Optional)**
  ```env
  PRODUCER_DASHBOARD_BID_WEBHOOK_URL=http://localhost:3000/api/webhooks/bids
  # OR use same base URL:
  PRODUCER_DASHBOARD_URL=http://localhost:3000
  ```
  - [ ] Set if buyer portal uses separate bid webhook URL
  - [ ] Verify URL is correct

- [ ] **API Key for Producer Portal**
  ```env
  PRODUCER_DASHBOARD_API_KEY=dev-api-key-123
  ```
  - [ ] Set if buyer portal requires API key for external access
  - [ ] Must match producer portal's `BUYER_API_KEY` (if used)

---

## 🌐 4. Network & Deployment Configuration

### Local Development

- [ ] **Port Configuration**
  - [ ] Producer portal runs on port 3000 (or configured port)
  - [ ] Buyer portal runs on port 3004 (or configured port)
  - [ ] Both ports are accessible
  - [ ] No firewall blocking connections

- [ ] **CORS Configuration**
  - [ ] Verify buyer portal allows requests from producer portal origin
  - [ ] Check `next.config.js` or middleware for CORS settings
  - [ ] Test cross-origin requests work

### Production Deployment

- [ ] **Domain Configuration**
  - [ ] Producer portal deployed and accessible
  - [ ] Buyer portal deployed at `app.aeronomy.co` (or configured domain)
  - [ ] Both domains have valid SSL certificates
  - [ ] Update environment variables with production URLs

- [ ] **Webhook URLs**
  - [ ] Update `PRODUCER_DASHBOARD_WEBHOOK_URL` with production URL
  - [ ] Update `NEXT_PUBLIC_BUYER_DASHBOARD_URL` with production URL
  - [ ] Test webhooks work in production

- [ ] **Network Access**
  - [ ] Verify buyer portal can reach producer portal webhook endpoints
  - [ ] Verify producer portal can reach buyer portal API endpoints
  - [ ] Check firewall/security group rules allow communication

---

## 🧪 5. Integration Testing

### Test 1: Lot Creation & Visibility

- [ ] **Step 1: Create Lot in Buyer Portal**
  - [ ] Log in to buyer portal
  - [ ] Create a new lot/tender
  - [ ] Publish the lot (set status to "published")
  - [ ] **Verify:** See notification "Your lot is now visible to producers"

- [ ] **Step 2: Verify Webhook Sent**
  - [ ] Check buyer portal logs for webhook sent to producer portal
  - [ ] Check producer portal logs for webhook received
  - [ ] **Verify:** Producer portal receives `lot.published` event

- [ ] **Step 3: Verify Lot in Producer Portal**
  - [ ] Log in to producer portal
  - [ ] Navigate to marketplace/opportunities
  - [ ] **Verify:** Lot appears in the list
  - [ ] **Verify:** Lot details are correct (volume, pricing, delivery, compliance)

---

### Test 2: Bid Submission

- [ ] **Step 1: Submit Bid from Producer Portal**
  - [ ] Log in to producer portal as test user
  - [ ] Navigate to marketplace
  - [ ] Click "Submit Bid" on a lot
  - [ ] Fill in bid form (volume, price, notes)
  - [ ] Submit bid

- [ ] **Step 2: Verify Bid Sent to Buyer Portal**
  - [ ] Check network tab in browser dev tools
  - [ ] **Verify:** Request to `POST /api/bids` includes `bidderId` = Clerk `userId` (starts with `user_`)
  - [ ] **Verify:** Request includes `externalBidId` (ProducerBid ID)
  - [ ] **Verify:** Response is 201 Created

- [ ] **Step 3: Verify Bid in Buyer Portal**
  - [ ] Log in to buyer portal
  - [ ] Navigate to bids received
  - [ ] **Verify:** Bid appears in the list
  - [ ] **Verify:** Bid shows producer name, volume, pricing
  - [ ] **Verify:** Bid has correct `bidderId` (Clerk userId)

---

### Test 3: Bid Acceptance → Contract

- [ ] **Step 1: Accept Bid in Buyer Portal**
  - [ ] In buyer portal, view the bid from producer
  - [ ] Click "Accept Bid"
  - [ ] **Verify:** Contract is created automatically
  - [ ] **Verify:** Contract has contract number

- [ ] **Step 2: Verify Webhook Sent**
  - [ ] Check buyer portal logs for `bid.accepted` webhook sent
  - [ ] Check producer portal logs for webhook received
  - [ ] **Verify:** Producer portal receives `bid.accepted` event with contract data

- [ ] **Step 3: Verify Contract in Producer Portal**
  - [ ] Log in to producer portal
  - [ ] Navigate to contracts page
  - [ ] **Verify:** Contract appears in the list
  - [ ] **Verify:** Contract status is "active" or "draft"
  - [ ] **Verify:** Contract has `buyerContractId`, `buyerBidId`, `lotId` populated
  - [ ] **Verify:** Contract details match (volume, pricing, terms)

---

### Test 4: Counter-Bid Flow (If Implemented)

- [ ] **Step 1: Send Counter-Offer from Buyer Portal**
  - [ ] In buyer portal, view a bid
  - [ ] Click "Counter Offer" or similar
  - [ ] Enter counter-offer terms (price, volume, message)
  - [ ] Submit counter-offer

- [ ] **Step 2: Verify Counter-Offer Webhook**
  - [ ] Check buyer portal logs for `bid.counter_offer` webhook sent
  - [ ] Check producer portal logs for webhook received
  - [ ] **Verify:** Producer portal receives `bid.counter_offer` event

- [ ] **Step 3: Verify Counter-Offer in Producer Portal**
  - [ ] Log in to producer portal
  - [ ] Navigate to bids page
  - [ ] **Verify:** Bid shows "Counter-Offer Received" status
  - [ ] **Verify:** Counter-offer details are displayed
  - [ ] **Verify:** "Accept Counter-Offer" button is visible

- [ ] **Step 4: Accept Counter-Offer**
  - [ ] Click "Accept Counter-Offer" in producer portal
  - [ ] **Verify:** API call to buyer portal `POST /api/bids/[id]/accept-counter`
  - [ ] **Verify:** Contract is created/updated in buyer portal
  - [ ] **Verify:** Contract appears in both portals

---

## 🔍 6. Debugging & Troubleshooting

### Common Issues to Check

- [ ] **Webhook Authentication Fails**
  - [ ] Verify `BUYER_WEBHOOK_SECRET` matches `PRODUCER_DASHBOARD_WEBHOOK_SECRET`
  - [ ] Check webhook headers include `Authorization: Bearer <secret>`
  - [ ] Test webhook endpoint manually with correct secret

- [ ] **Bid Submission Fails**
  - [ ] Verify `clerkUserId` is being sent (check network tab)
  - [ ] Verify Clerk `userId` is valid (starts with `user_`)
  - [ ] Check buyer portal logs for error messages
  - [ ] Verify API key is correct (if required)

- [ ] **Contract Not Created**
  - [ ] Verify webhook payload includes `contract` data
  - [ ] Check producer portal logs for contract creation errors
  - [ ] Verify Contract model has all required fields
  - [ ] Check MongoDB connection is working

- [ ] **Lot Not Appearing in Producer Portal**
  - [ ] Verify webhook was sent from buyer portal
  - [ ] Check producer portal logs for webhook received
  - [ ] Verify lot transformation logic works
  - [ ] Check if lot is stored in producer portal database

---

## 📝 7. Documentation & Knowledge Transfer

- [ ] **Document Environment Variables**
  - [ ] Create `.env.example` file with all required variables
  - [ ] Document which secrets must match between portals
  - [ ] Document production vs development URLs

- [ ] **Document API Endpoints**
  - [ ] List all webhook endpoints and their events
  - [ ] Document payload formats
  - [ ] Document authentication requirements

- [ ] **Document Testing Procedures**
  - [ ] Create step-by-step testing guide
  - [ ] Document expected behaviors
  - [ ] Document troubleshooting steps

---

## 🚀 8. Production Readiness

### Pre-Production Checklist

- [ ] **Security**
  - [ ] All secrets are strong and unique
  - [ ] API keys are rotated and secure
  - [ ] Webhook secrets are different from development
  - [ ] Environment variables are not committed to git

- [ ] **Monitoring**
  - [ ] Set up logging for webhook events
  - [ ] Set up error tracking (e.g., Sentry)
  - [ ] Set up monitoring for API calls
  - [ ] Set up alerts for failed webhooks

- [ ] **Backup & Recovery**
  - [ ] MongoDB backups are configured
  - [ ] Recovery procedures are documented
  - [ ] Test restore procedures

- [ ] **Performance**
  - [ ] Test webhook delivery times
  - [ ] Test API response times
  - [ ] Verify no rate limiting issues
  - [ ] Load test if needed

---

## ✅ Final Verification

- [ ] **End-to-End Workflow Test**
  1. [ ] Buyer creates and publishes lot
  2. [ ] Producer sees lot in marketplace
  3. [ ] Producer submits bid
  4. [ ] Buyer sees bid
  5. [ ] Buyer accepts bid
  6. [ ] Contract created in both portals
  7. [ ] Both parties can view contract

- [ ] **All Tests Pass**
  - [ ] Test 1: Lot Creation ✅
  - [ ] Test 2: Bid Submission ✅
  - [ ] Test 3: Bid Acceptance ✅
  - [ ] Test 4: Counter-Bid (if implemented) ✅

- [ ] **Documentation Complete**
  - [ ] Environment variables documented
  - [ ] API endpoints documented
  - [ ] Testing procedures documented
  - [ ] Troubleshooting guide created

---

## 🆘 Support & Resources

### If You Get Stuck

1. **Check Logs**
   - Producer portal: Check server logs and browser console
   - Buyer portal: Check server logs and browser console
   - MongoDB: Check connection logs

2. **Verify Configuration**
   - Double-check all environment variables
   - Verify secrets match between portals
   - Test API endpoints manually (Postman/curl)

3. **Test Incrementally**
   - Test webhook authentication first
   - Test API calls separately
   - Test each workflow step individually

4. **Reference Documentation**
   - `IMPLEMENTATION_GUIDE.md` - Code implementation details
   - `IMPLEMENTATION_STATUS.md` - Current status
   - `WORKFLOW_INTEGRATION_MAP.md` - Visual workflow
   - Buyer–Producer Workflow Integration Spec - Full specification

---

**Last Updated:** January 26, 2026  
**Status:** Ready for Manual Setup  
**Priority:** Complete in order listed above
