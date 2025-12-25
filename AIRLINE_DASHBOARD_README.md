# Airline SAF Operations Center - Complete Dashboard

## Overview

The Airline SAF Operations Center is a comprehensive dashboard for airlines to manage their entire Sustainable Aviation Fuel (SAF) procurement, inventory, compliance, and claiming operations. This system provides end-to-end visibility and control over the SAF supply chain from procurement to delivery verification and carbon credit claiming.

## Features

### 1. **Main Dashboard** (`/airline`)
- **Overview Stats**: Real-time KPIs across all operations
  - Active RFQs and bids received
  - Live lots and total volume posted
  - Active deals and total value
  - Inventory levels and locations
  - Compliance rate and certificate status
  - Claims and credits generated
  - Delivery tracking

- **Action Items**: Prioritized alerts and pending tasks
  - Procurement actions (closing RFQs, bids to review, deals to execute)
  - Inventory & delivery alerts (expiring batches, quality checks)
  - Compliance status and expiring certificates
  - Claims and credits pending review

- **Tab Navigation**: Quick access to all modules
  - Overview, Procurement, Lot Posting, Deals, Inventory, Compliance, Claims, Deliveries

### 2. **Procurement Module** (`/airline/procurement`)
Manage Request for Quotations (RFQs) and tender processes.

**Features:**
- Create and publish RFQs with detailed specifications
- Track all RFQs (draft, open, closed, awarded)
- Monitor bid submissions from producers
- Set target prices, CI targets, and certification requirements
- Filter by status and search functionality
- Urgent notifications for closing RFQs
- View bids and award contracts

**Key Data:**
- RFQ number, title, and status
- Volume, target price, and CI requirements
- Delivery location and window
- Bids received count
- Closing dates with urgency indicators

### 3. **Lot Posting** (`/buyer/marketplace`)
Post SAF lots for producers to bid on.

**Features:**
- Create new lots with delivery specifications
- Track live, draft, and awarded lots
- Monitor bid activity
- Set carbon intensity targets
- Manage lot lifecycle (publish, pause, award)
- Recent producer activity feed
- Publishing checklist

**Key Data:**
- Lot name and airport/region
- Volume and unit (MT/gal)
- Target price and currency
- CI target (gCO₂e/MJ)
- Delivery window
- Bids received

### 4. **Deals Management** (`/airline/deals`)
Track and manage all SAF supply deals from negotiation to completion.

**Features:**
- View all deals across lifecycle stages
- Track deal status (pending, executed, active, completed)
- Monitor milestones and next steps
- View delivery progress for active deals
- Filter by status and search
- Identify overdue milestones

**Key Data:**
- Deal number and producer name
- Volume and pricing details
- Total contract value
- Carbon intensity score
- Delivery location and window
- Milestones with status tracking
- Delivery progress percentage

### 5. **Inventory Management** (`/airline/inventory`)
Complete SAF inventory tracking across all locations.

**Features:**
- Real-time inventory levels by location
- Batch tracking with quality status
- Allocation management
- Expiry tracking and alerts
- Quality check status (pending, passed, failed)
- Filter by status and location
- Certifications and pathway tracking

**Key Data:**
- Batch numbers and producer details
- Total, allocated, and available volumes
- Storage locations and airport codes
- Carbon intensity and GHG reduction
- Received and expiry dates
- Purchase price
- Quality check status
- Certifications (ISCC EU, CORSIA, RSB, etc.)

**Inventory Status:**
- `in_transit`: En route to destination
- `available`: Ready for allocation
- `allocated`: Assigned to flights/routes
- `depleted`: Fully consumed
- `expired`: Past shelf life

### 6. **Compliance Module** (`/compliance`)
Shared with producer dashboard - track certifications and compliance documents.

**Features:**
- Certificate management (ISCC EU, CORSIA, RSB, ASTM D7566, RED II)
- Expiry tracking and notifications
- Plant and product certification status
- Upload and manage compliance documents
- Filter by type and status

### 7. **Claims & Credits** (`/airline/claims`)
Submit and track sustainability claims and carbon credits.

**Features:**
- Create claims for multiple schemes (CORSIA, EU RED II, CA LCFS, D-RINs)
- Track claim lifecycle (draft, submitted, under review, approved)
- Verification status monitoring
- Route-based reporting
- Batch linking to inventory
- Credits generated and value tracking
- Supporting documentation management
- Audit trail

**Key Data:**
- Claim number and type
- Reporting period and year/quarter
- Volume claimed and scheme
- GHG reduction and emissions avoided
- Credits generated and value
- Verification status
- Routes and volume allocation
- Linked batches

**Claim Types:**
- `carbon_credit`: General carbon credits
- `corsia`: CORSIA compliance credits
- `red_ii`: EU RED II compliance
- `lcfs`: California Low Carbon Fuel Standard
- `rins`: D-RINs (US Renewable Identification Numbers)
- `book_and_claim`: Book and claim credits

### 8. **Delivery Management** (`/airline/deliveries`)
Track and verify all incoming SAF deliveries.

**Features:**
- Delivery schedule tracking
- Real-time shipment tracking
- Quality check management
- Invoice and payment tracking
- Volume verification
- Certificate verification
- Storage location assignment
- Transport method tracking

**Key Data:**
- Delivery number and deal reference
- Scheduled and actual delivery dates
- Volume (planned vs actual)
- Delivery location and storage
- Quality check status and notes
- Transport method and tracking number
- Invoice details and payment status
- Bill of lading and delivery notes

**Delivery Status:**
- `scheduled`: Planned for future
- `in_transit`: Currently shipping
- `delivered`: Arrived at location
- `quality_check`: Undergoing QC
- `accepted`: Passed QC, added to inventory
- `rejected`: Failed QC
- `invoiced`: Invoice generated
- `paid`: Payment completed

## Database Models

### Inventory Model
```typescript
{
  airline: string
  productName: string
  productType: "HEFA" | "FT" | "ATJ" | "SIP" | "Other"
  producerName: string
  batchNumber: string (unique)
  totalVolume: number
  allocatedVolume: number
  availableVolume: number
  volumeUnit: "MT" | "gal"
  carbonIntensity: number
  ghgReduction: number
  certifications: string[]
  pathway: string
  feedstock: string
  storageLocation: string
  airportCode: string
  receivedDate: Date
  expiryDate: Date
  purchasePrice: number
  currency: "USD" | "EUR" | "GBP"
  status: InventoryStatus
  qualityCheckStatus: "pending" | "passed" | "failed"
  allocations: Array<{
    flightNumber: string
    route: string
    allocatedVolume: number
    allocatedDate: Date
    usedDate: Date
    status: "planned" | "used" | "cancelled"
  }>
}
```

### Claim Model
```typescript
{
  airline: string
  claimType: ClaimType
  volumeClaimed: number
  volumeUnit: "MT" | "gal"
  claimPeriod: { start: Date, end: Date }
  reportingYear: number
  reportingQuarter: "Q1" | "Q2" | "Q3" | "Q4"
  batchNumbers: string[]
  inventoryItemIds: ObjectId[]
  carbonIntensity: number
  ghgReduction: number
  totalEmissionsAvoided: number
  scheme: string
  certificationBody: string
  certificateNumber: string
  verificationStatus: "pending" | "verified" | "rejected" | "expired"
  verificationDate: Date
  creditsGenerated: number
  creditUnit: string
  creditValue: number
  creditCurrency: "USD" | "EUR" | "GBP"
  routes: Array<{
    origin: string
    destination: string
    volumeUsed: number
    flightCount: number
  }>
  supportingDocs: Array<{
    name: string
    type: string
    url: string
    uploadedAt: Date
  }>
  status: ClaimStatus
  auditTrail: Array<{
    action: string
    performedBy: string
    timestamp: Date
    notes: string
  }>
}
```

## API Routes

### Inventory APIs
- `GET /api/inventory` - Get all inventory items
  - Query params: `airline`, `status`, `location`
- `POST /api/inventory` - Create new inventory item
- `GET /api/inventory/[id]` - Get specific item
- `PATCH /api/inventory/[id]` - Update inventory item
- `POST /api/inventory/[id]/allocate` - Allocate volume

### Claims APIs
- `GET /api/claims` - Get all claims
  - Query params: `airline`, `status`, `claimType`, `reportingYear`
- `POST /api/claims` - Create new claim
- `GET /api/claims/[id]` - Get specific claim
- `PATCH /api/claims/[id]` - Update claim
- `POST /api/claims/[id]/submit` - Submit claim for review
- `POST /api/claims/[id]/verify` - Verify claim

## Navigation Structure

The airline dashboard is accessible via `/airline` and includes:

1. **Main Dashboard** - `/airline`
2. **Procurement** - `/airline/procurement`
3. **Lot Posting** - `/buyer/marketplace`
4. **Deals** - `/airline/deals`
5. **Inventory** - `/airline/inventory`
6. **Compliance** - `/compliance`
7. **Claims** - `/airline/claims`
8. **Deliveries** - `/airline/deliveries`

## Integration Points

### Existing Systems
The airline dashboard integrates with existing components:

1. **Lot Posting** - Uses existing `/buyer/marketplace` for lot management
2. **Compliance** - Shares `/compliance` module with producer dashboard
3. **Contract Management** - Links to existing contract models
4. **Deal Management** - Uses Deal model from core system

### New Components
- Inventory tracking system (new)
- Claims and carbon credits module (new)
- Delivery verification system (new)
- Enhanced procurement RFQ management (new)

## User Flows

### 1. Procurement to Delivery Flow
1. Create RFQ in Procurement module
2. Review bids from producers
3. Award deal and create contract
4. Track deal progress and milestones
5. Monitor delivery in Deliveries module
6. Conduct quality check on arrival
7. Add to inventory upon acceptance
8. Allocate to flights/routes

### 2. Compliance and Claiming Flow
1. Receive SAF delivery with certificates
2. Verify compliance documents
3. Add to inventory with certifications
4. Use SAF on flights (allocate from inventory)
5. Create claim for reporting period
6. Link batches and routes to claim
7. Submit claim for verification
8. Track approval and credit generation

### 3. Inventory Management Flow
1. Receive delivery notification
2. Quality check and verification
3. Accept and add to inventory
4. Monitor expiry dates
5. Allocate to flights based on requirements
6. Track usage and depletion
7. Claim credits for used volume

## Best Practices

### Procurement
- Set realistic CI targets based on market availability
- Allow sufficient time for bid submission (7-14 days minimum)
- Clearly specify certification requirements upfront
- Monitor market pricing trends

### Inventory Management
- Conduct quality checks within 48 hours of delivery
- Set up alerts for batches expiring within 30 days
- Maintain buffer inventory for operational continuity
- Track allocations carefully to avoid over-commitment

### Claims & Credits
- Submit claims quarterly for optimal processing
- Maintain complete documentation (certificates, delivery notes, usage records)
- Link batches to specific routes for accurate reporting
- Track verification status and follow up on pending reviews
- Keep audit trail for regulatory compliance

### Deliveries
- Verify volume immediately upon delivery
- Document any discrepancies in delivery notes
- Complete quality checks before adding to inventory
- Process invoices promptly to maintain supplier relationships

## Technical Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk (from existing system)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with consistent design system

## Environment Variables

Required for full functionality:
```env
MONGODB_URI=<your-mongodb-connection-string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-key>
CLERK_SECRET_KEY=<clerk-secret>
```

## Future Enhancements

1. **Advanced Analytics**
   - Price trend analysis
   - CI score optimization recommendations
   - Inventory optimization algorithms
   - Claims value maximization

2. **Automation**
   - Automated quality check scheduling
   - Auto-allocation based on flight schedules
   - Automated claim generation from usage data
   - Smart RFQ recommendations

3. **Integrations**
   - ERP system integration
   - Flight operations system linking
   - Automated invoicing
   - Real-time pricing feeds

4. **Reporting**
   - Custom report builder
   - Regulatory compliance reports
   - ESG reporting
   - Executive dashboards

## Support

For questions or issues:
- Review existing documentation
- Check API error messages for specific issues
- Verify database connections and model schemas
- Ensure all required fields are provided in forms

## Version

Current Version: 1.0.0
Last Updated: December 2024





