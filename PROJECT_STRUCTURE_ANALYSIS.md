# Aeronomy SAF Producer Platform - Project Structure Analysis

## Executive Summary

**Aeronomy** is a comprehensive B2B platform for Sustainable Aviation Fuel (SAF) producers to manage their business operations from opportunity discovery through contract fulfillment. The platform implements a dual-persona system supporting both **Producer** and **Airline/Buyer** perspectives, enabling end-to-end workflow management for the SAF supply chain.

**Technology Stack:**
- **Framework:** Next.js 16.0.2 (App Router)
- **Frontend:** React 19.2.0, TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** MongoDB with Mongoose 8.0.0
- **Maps:** react-simple-maps 3.0.0

---

## 1. Project Architecture Overview

### 1.1 Application Type
- **Full-Stack Next.js Application** using the App Router architecture
- **Server-Side Rendering (SSR)** with API Routes for backend functionality
- **Client Components** for interactive UI elements
- **Database-Driven** with MongoDB as the primary data store

### 1.2 Core Principle
The platform follows the **"Money-Making Loop"** workflow:
```
Find Opportunities → Bid Profitably → Win Contracts → Deliver & Prove It → Get Paid
```

### 1.3 Dual-Persona System
The application supports two distinct user perspectives:

**Producer View** (`/dashboard`, `/opportunities`, `/bids`, etc.)
- Manage RFQs and bidding process
- Track contracts and deliveries
- Monitor production and compliance
- Capacity planning

**Airline/Buyer View** (`/buyer/*`)
- Post tenders/lots on marketplace
- Review producer profiles
- Manage contracts from buyer perspective
- Compliance hub for supplier verification

---

## 2. Directory Structure

```
aeronomy/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/               # Backend API endpoints
│   │   ├── [pages]/           # Frontend pages
│   │   ├── buyer/             # Airline-specific pages
│   │   ├── layout.tsx         # Root layout with navigation
│   │   └── page.tsx            # Root redirect to /dashboard
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility libraries and services
│   ├── models/                # Mongoose database schemas
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── scripts/                   # Utility scripts
└── [config files]            # Next.js, TypeScript, package.json
```

---

## 3. Frontend Structure (`src/app/`)

### 3.1 Producer Pages

#### **Dashboard** (`/dashboard`)
- **Purpose:** Command center with 5 fixed widgets
- **Widgets:**
  1. Action Required (RFQs closing, approvals needed, certificates expiring)
  2. This Month (deliveries, revenue, production targets)
  3. Capacity Status (annual capacity, commitments, availability)
  4. Pipeline (open RFQs, bids in progress, submitted bids)
  5. Contract Health (active contracts, on-track status, next deliveries)
- **Quick Actions Bar:** Create RFQ, Log Production, Upload Certificate
- **Data Source:** `/api/dashboard/stats`

#### **Opportunities** (`/opportunities`)
- **Purpose:** Find and evaluate RFQs, decide what to bid on
- **Tabs:** Open, Watching, My RFQs, Closed
- **Features:**
  - Filter by delivery year, volume range, geography, fuel type
  - Fit status logic (Good fit / Possible / Cannot fulfill)
  - RFQ detail view with qualification checks
- **Data Source:** `/api/rfqs`

#### **Create RFQ** (`/opportunities/new`)
- **Purpose:** Manual RFQ entry for deals outside platform
- **Sections:** Buyer Info, Volume Requirements, Fuel Specs, Pricing, Terms, Certifications

#### **Bids** (`/bids`)
- **Purpose:** Build, approve, and track bids
- **Tabs:** Draft, Pending Approval, Submitted, Decided
- **Data Source:** `/api/producer-bids`

#### **Bid Builder** (`/bids/new`)
- **Purpose:** 5-step wizard for creating bids
- **Steps:**
  1. Supply Source (plant allocation)
  2. Pricing (indexed/fixed, margin analysis)
  3. Terms (delivery schedule, payment, penalties)
  4. Documents (compliance certificates)
  5. Review & Submit (approval workflow)
- **Data Sources:** `/api/producer-bids`, `/api/plants`

#### **Contracts** (`/contracts`)
- **Purpose:** Manage won deals, track deliveries, get paid
- **Tabs:** Active, Scheduled, Completed, Cancelled
- **View:** Card-based list with status indicators
- **Features:** Next delivery preview, outstanding invoices
- **Data Source:** `/api/contracts`

#### **Production** (`/production`)
- **Purpose:** Track production batches and capacity planning
- **Tabs:** Production Batches, Capacity Planning
- **Features:**
  - Log production batches
  - Allocate batches to contracts
  - Capacity visualization by year
- **Data Sources:** `/api/production-batches`, `/api/plants`

#### **Compliance** (`/compliance`)
- **Purpose:** Manage certifications and prove compliance
- **Tabs:** Certificates, Plants & Products, Claims
- **Features:**
  - Upload and track certificates
  - Plant and product management
  - Carbon emission claims for delivered SAF
- **Data Sources:** `/api/certificates`, `/api/plants`, `/api/products`

#### **Settings** (`/settings`)
- **Purpose:** System configuration
- **Tabs:** Company Profile, Users & Roles, Approval Rules, Notifications
- **Status:** Partially implemented (still uses demo data)

#### **Marketplace** (`/marketplace`)
- **Purpose:** Legacy marketplace for bidding on tenders
- **Status:** Maintained for backward compatibility
- **Data Source:** `/api/tenders`

### 3.2 Airline/Buyer Pages

#### **Buyer Marketplace** (`/buyer/marketplace`)
- **Purpose:** Post tenders/lots and monitor responses
- **Features:** Post lots, view bid responses, activity stream

#### **Buyer Contracts** (`/buyer/contracts`)
- **Purpose:** View contracts from airline perspective

#### **Buyer Producers** (`/buyer/producers`)
- **Purpose:** View producer profiles, compliance checks, capacity
- **Features:** Producer directory, compliance verification, document requests

### 3.3 Layout & Navigation

#### **Root Layout** (`layout.tsx`)
- **Structure:**
  - Top navigation bar with logo
  - Sidebar navigation (context-aware: producer vs buyer)
  - Notification center
  - Account menu with persona switching
  - Main content area

#### **Navigation Component** (`components/sidebar-nav.tsx`)
- **Producer Nav:** Home, Opportunities, Bids, Contracts, Production, Compliance, Settings
- **Buyer Nav:** Marketplace, Contracts, Compliance Hub, Producers
- **Dynamic:** Switches based on route path (`/buyer/*`)

---

## 4. Backend API Structure (`src/app/api/`)

### 4.1 Core Business Entities

#### **RFQs** (`/api/rfqs`)
- `GET /api/rfqs` - List RFQs with filters (status, year, fuelType, producerId)
- `POST /api/rfqs` - Create new RFQ
- `GET /api/rfqs/[id]` - Get single RFQ
- `PUT /api/rfqs/[id]` - Update RFQ
- `DELETE /api/rfqs/[id]` - Delete RFQ

#### **Producer Bids** (`/api/producer-bids`)
- `GET /api/producer-bids` - List bids with filters (status, rfqId, producerId)
- `POST /api/producer-bids` - Create new bid
- `GET /api/producer-bids/[id]` - Get single bid
- `PUT /api/producer-bids/[id]` - Update bid
- `DELETE /api/producer-bids/[id]` - Delete bid

#### **Contracts** (`/api/contracts`)
- `GET /api/contracts` - List contracts with filters (status, producerId, counterparty)
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/[id]` - Get single contract
- `PUT /api/contracts/[id]` - Update contract
- `DELETE /api/contracts/[id]` - Soft delete (set status to cancelled)
- `POST /api/contracts/[id]/deliveries` - Log delivery for contract
- `PUT /api/contracts/[id]/deliveries` - Add new delivery to schedule

#### **Production Batches** (`/api/production-batches`)
- `GET /api/production-batches` - List batches with filters (plantId, status, year)
- `POST /api/production-batches` - Create new batch
- `GET /api/production-batches/[id]` - Get single batch
- `PUT /api/production-batches/[id]` - Update batch
- `DELETE /api/production-batches/[id]` - Delete batch
- `POST /api/production-batches/[id]/allocate` - Allocate batch to contract

#### **Plants** (`/api/plants`)
- `GET /api/plants` - List plants with filters (producerId, location)
- `POST /api/plants` - Create new plant
- `GET /api/plants/[id]` - Get single plant
- `PUT /api/plants/[id]` - Update plant
- `DELETE /api/plants/[id]` - Delete plant

#### **Certificates** (`/api/certificates`)
- `GET /api/certificates` - List certificates with filters (type, status, producerId)
- `POST /api/certificates` - Upload new certificate
- `GET /api/certificates/[id]` - Get single certificate
- `PUT /api/certificates/[id]` - Update certificate
- `DELETE /api/certificates/[id]` - Delete certificate

#### **Products** (`/api/products`)
- `GET /api/products` - List products with filters (producerId, pathway, feedstock)
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### 4.2 Dashboard & Aggregation

#### **Dashboard Stats** (`/api/dashboard/stats`)
- `GET /api/dashboard/stats` - Aggregated statistics for dashboard widgets
- **Returns:**
  - Action Required items (RFQs closing, approvals, certificates, deliveries, batches)
  - This Month stats (deliveries, production volume)
  - Capacity Status (total capacity, commitments by year, pending bids)
  - Pipeline stats (open RFQs, bids in progress, submitted)
  - Contract Health (active contracts, at-risk, next deliveries)

### 4.3 Legacy & Integration

#### **Tenders** (`/api/tenders`)
- Legacy API for marketplace tenders
- `GET /api/tenders` - List tenders
- `POST /api/tenders` - Create tender
- `GET /api/tenders/[id]` - Get single tender
- `PUT /api/tenders/[id]` - Update tender
- `DELETE /api/tenders/[id]` - Delete tender

#### **Bids** (`/api/bids`)
- Legacy bid API (different from ProducerBid)
- Used for marketplace bidding

#### **Webhooks** (`/api/webhooks/lots`)
- Receives webhook notifications for lot updates
- Integrates with external marketplace systems

#### **Seed** (`/api/seed`)
- Database seeding endpoint (development only)

---

## 5. Data Models (`src/models/`)

### 5.1 Core MVP Models

#### **RFQ** (`RFQ.ts`)
- **Purpose:** Request for Quotation from buyers
- **Key Fields:**
  - Buyer information (company, contact, email, source)
  - Volume requirements (total, breakdown by year/location)
  - Fuel specifications (type, feedstock, min GHG reduction)
  - Pricing structure (indexed/fixed/hybrid)
  - Terms (incoterms, payment, response deadline)
  - Required certifications
  - Status (open, watching, closed, awarded)
  - Fit status (good, possible, cannot, pending)

#### **ProducerBid** (`ProducerBid.ts`)
- **Purpose:** Producer's bid response to RFQ
- **Key Fields:**
  - Bid number and version
  - Plant allocations (which plants fulfill which volumes)
  - Blended GHG reduction
  - Pricing (indexed/fixed, premium, currency)
  - Estimated value and margin
  - Terms (incoterms, payment, delivery schedule, penalties)
  - Attached documents
  - Approval workflow (approvers, status, mode)
  - Status (draft, pending_approval, submitted, won, lost, withdrawn)

#### **Contract** (`Contract.ts`)
- **Purpose:** Won deals/contracts
- **Key Fields:**
  - Contract number
  - Linked RFQ and bid IDs
  - Buyer information (company, legal entity, contacts)
  - Volume and pricing (total, delivered, pricing type)
  - Dates (signature, effective, end)
  - Terms (incoterms, payment, tolerance, penalties)
  - Deliveries array (scheduled dates, actual dates, volumes, status)
  - Documents (signed contract, additional docs)
  - Status (draft, scheduled, active, completed, cancelled)
  - Financial tracking (outstanding invoices)

#### **Plant** (`Plant.ts`)
- **Purpose:** Production facilities
- **Key Fields:**
  - Name, location, country
  - Pathway (HEFA, AtJ, PtL, FT)
  - Feedstock types
  - Annual capacity
  - Typical GHG reduction
  - Certifications (ISCC EU, CORSIA, ASTM D7566, etc.)
  - Status

#### **ProductionBatch** (`ProductionBatch.ts`)
- **Purpose:** Individual production runs
- **Key Fields:**
  - Batch number
  - Production date
  - Plant reference
  - Volume produced
  - Feedstock details (type, supplier, origin)
  - Quality metrics (GHG reduction, certifications)
  - Allocation (allocated volume, available volume)
  - Status (available, partially_allocated, fully_allocated)

#### **Product** (`Product.ts`)
- **Purpose:** SAF products produced
- **Key Fields:**
  - Name, pathway, feedstock
  - GHG reduction percentage
  - Plant reference
  - Specifications (ASTM compliance, etc.)
  - Eligible schemes (ISCC EU, CORSIA, RED II)

#### **Certificate** (`Certificate.ts`)
- **Purpose:** Compliance certificates
- **Key Fields:**
  - Name, type (ISCC EU, CORSIA, RSB, ASTM, etc.)
  - Issuer, certificate number
  - Issue and expiry dates
  - File URL and key
  - Applies to (plant, product, or company-wide)
  - Status (valid, expiring, expired)

### 5.2 Legacy Models

#### **Lot** (`Lot.ts`)
- Legacy tender/lot model for marketplace

#### **Bid** (`Bid.ts`)
- Legacy bid model for marketplace bidding

#### **Deal** (`Deal.ts`)
- Legacy deal/contract model

#### **ComplianceDoc** (`ComplianceDoc.ts`)
- Legacy compliance document model

### 5.3 Model Index (`index.ts`)
- Centralized export for all models
- Used for easier imports across the application

---

## 6. Libraries & Utilities (`src/lib/`)

### 6.1 Database

#### **MongoDB Connection** (`mongodb.ts`)
- **Purpose:** Singleton MongoDB connection management
- **Features:**
  - Caches connection to prevent multiple connections in Next.js dev mode
  - Uses global variable for connection caching
  - Environment variable: `MONGODB_URI`

### 6.2 Data Access

#### **Data Store** (`data-store.ts`)
- **Purpose:** Centralized data access layer for legacy models
- **Operations:**
  - Tender/Lot CRUD
  - Bid CRUD
  - Deal CRUD
  - ComplianceDoc CRUD
- **Note:** New MVP models use direct Mongoose queries in API routes

### 6.3 API Client

#### **API Client** (`api-client.ts`)
- **Purpose:** Client-side functions for API interactions
- **Functions:** Fetch tenders, submit bids, etc.

### 6.4 Data Transformation

#### **Lots Transformer** (`lots-transformer.ts`)
- **Purpose:** Transform external API lot data to internal Tender format
- Used for marketplace integration

#### **Seed Data** (`seed-data.ts`)
- **Purpose:** Database seeding utilities
- **Status:** Legacy, may be deprecated

### 6.5 Webhooks

#### **Buyer Bid Service** (`webhooks/buyer-bid-service.ts`)
- **Purpose:** Send bid data to buyer dashboard
- **Features:**
  - API key authentication
  - Data validation
  - Error handling
- **Environment Variables:**
  - `NEXT_PUBLIC_BUYER_DASHBOARD_URL`
  - `MARKETPLACE_WEBHOOK_SECRET`

---

## 7. Components (`src/components/`)

### 7.1 Navigation

#### **SidebarNav** (`sidebar-nav.tsx`)
- **Type:** Client Component
- **Purpose:** Main navigation menu
- **Features:**
  - Dynamic navigation based on route (producer vs buyer)
  - Active link highlighting
  - Icon support for each nav item

### 7.2 User Interface

#### **AccountMenu** (`account-menu.tsx`)
- **Type:** Client Component
- **Purpose:** User account dropdown menu
- **Features:**
  - Persona switching (Producer ↔ Airline)
  - Quick shortcuts based on current persona
  - Account details display
  - Click-outside-to-close functionality

#### **NotificationCenter** (`notification-center.tsx`)
- **Type:** Client Component
- **Purpose:** Notification bell and dropdown
- **Features:**
  - Notification list
  - Mark as read functionality
  - Badge count

---

## 8. Type Definitions (`src/types/`)

### 8.1 Tender Types (`tender.ts`)
- TypeScript interfaces for tender/bid data structures
- Used by legacy marketplace components

---

## 9. Configuration Files

### 9.1 Next.js Config (`next.config.ts`)
- Minimal configuration
- Uses default Next.js settings

### 9.2 TypeScript Config (`tsconfig.json`)
- **Target:** ES2017
- **Module:** ESNext
- **JSX:** react-jsx
- **Path Aliases:** `@/*` → `./src/*`
- **Strict Mode:** Enabled

### 9.3 Package Dependencies

#### **Production Dependencies:**
- `next` 16.0.2 - React framework
- `react` 19.2.0 - UI library
- `react-dom` 19.2.0 - React DOM renderer
- `mongoose` 8.0.0 - MongoDB ODM
- `react-simple-maps` 3.0.0 - Map visualization

#### **Development Dependencies:**
- `typescript` 5 - Type checking
- `tailwindcss` 4 - CSS framework
- `@tailwindcss/postcss` 4 - PostCSS plugin
- `eslint` 9 - Linting
- `eslint-config-next` 16.0.2 - Next.js ESLint config

---

## 10. Data Flow Architecture

### 10.1 Producer Workflow

```
1. Dashboard → View action items and stats
   ↓
2. Opportunities → Browse RFQs, filter, evaluate fit
   ↓
3. Create Bid → 5-step wizard (Supply → Pricing → Terms → Documents → Review)
   ↓
4. Approval Workflow → Internal approval if required
   ↓
5. Submit Bid → Sent to buyer
   ↓
6. Contract Creation → When bid is won, create contract
   ↓
7. Production → Log batches, allocate to contracts
   ↓
8. Deliveries → Log deliveries, upload documents
   ↓
9. Invoicing → Generate statements, track payments
```

### 10.2 Airline Workflow

```
1. Marketplace → Post tenders/lots
   ↓
2. Receive Bids → Review producer bids
   ↓
3. Producer Profiles → Check compliance, capacity
   ↓
4. Award Contract → Select winning bid
   ↓
5. Contract Management → Track deliveries, payments
```

### 10.3 API Request Flow

```
Frontend Component
  ↓ (fetch/API call)
API Route Handler (/api/*)
  ↓ (connectMongoDB)
MongoDB Connection
  ↓ (Mongoose query)
Database Model (Model.find/create/update)
  ↓ (response)
API Route Handler
  ↓ (JSON response)
Frontend Component
  ↓ (state update)
UI Update
```

---

## 11. Key Features & Capabilities

### 11.1 Producer Features

✅ **RFQ Management**
- Browse and filter RFQs
- Manual RFQ entry
- Fit status calculation
- Qualification checks

✅ **Bid Management**
- 5-step bid builder wizard
- Plant allocation
- Margin analysis
- Approval workflow
- Bid versioning

✅ **Contract Management**
- Contract creation from winning bids
- Delivery scheduling
- Delivery logging
- Document management
- Financial tracking

✅ **Production Management**
- Batch logging
- Batch allocation to contracts
- Capacity planning
- Capacity visualization

✅ **Compliance Management**
- Certificate upload and tracking
- Plant and product management
- Expiry monitoring
- Claims tracking

✅ **Dashboard**
- Action items
- Monthly stats
- Capacity status
- Pipeline overview
- Contract health

### 11.2 Airline Features

✅ **Marketplace**
- Post tenders/lots
- Monitor bid responses
- Activity tracking

✅ **Producer Directory**
- View producer profiles
- Compliance checks
- Capacity verification
- Document requests

✅ **Contract Management**
- View contracts from buyer perspective
- Track deliveries
- Payment management

### 11.3 System Features

✅ **Dual Persona Support**
- Switch between Producer and Airline views
- Context-aware navigation
- Persona-specific features

✅ **Real-Time Data**
- All data stored in MongoDB
- No fake/demo data (as per recent refactoring)
- API-driven architecture

---

## 12. Environment Variables

Required environment variables (typically in `.env.local`):

```env
MONGODB_URI=mongodb://...              # MongoDB connection string
NEXT_PUBLIC_BUYER_DASHBOARD_URL=...   # Buyer dashboard API URL
MARKETPLACE_WEBHOOK_SECRET=...        # Webhook secret for marketplace integration
```

---

## 13. Current State & Status

### 13.1 Completed Features
- ✅ Full MVP blueprint implementation
- ✅ Database schemas for all core entities
- ✅ API routes for CRUD operations
- ✅ Frontend pages for all modules
- ✅ Dashboard with real-time stats
- ✅ Bid builder wizard
- ✅ Contract management
- ✅ Production batch tracking
- ✅ Compliance certificate management
- ✅ Dual-persona navigation
- ✅ Removal of fake data (migrated to database)

### 13.2 Partially Implemented
- ⚠️ Settings page (still uses demo data for users/approval rules)
- ⚠️ Contract delivery logging (some fields need schema updates)
- ⚠️ Airline compliance hub (needs producer list integration)

### 13.3 Known Issues
- Type errors in dashboard stats route (fixed: plantAllocations structure)
- Contract delivery schema needs additional fields (blendedGHGReduction, allocatedBatches, etc.)
- Settings page needs API integration for users and approval rules

---

## 14. Development Workflow

### 14.1 Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### 14.2 Database Setup

1. Ensure MongoDB is running (local or cloud)
2. Set `MONGODB_URI` in `.env.local`
3. Database will be created automatically on first connection
4. Use `/api/seed` endpoint for initial data (if needed)

### 14.3 Code Organization Principles

- **API Routes:** Handle all database operations
- **Pages:** Fetch data from API routes, render UI
- **Components:** Reusable UI elements
- **Models:** Database schemas and types
- **Lib:** Utility functions and services

---

## 15. Future Enhancements

### Potential Improvements:
1. **Authentication & Authorization**
   - User authentication system
   - Role-based access control
   - Multi-tenant support

2. **File Upload**
   - S3/cloud storage integration
   - Document management system
   - Certificate file storage

3. **Notifications**
   - Real-time notifications
   - Email notifications
   - In-app notification system

4. **Reporting & Analytics**
   - Advanced reporting
   - Export functionality
   - Business intelligence dashboards

5. **Integration Enhancements**
   - Enhanced webhook system
   - API rate limiting
   - External system integrations

6. **UI/UX Improvements**
   - Enhanced mobile responsiveness
   - Advanced filtering and search
   - Data visualization improvements

---

## 16. Conclusion

The Aeronomy SAF Producer Platform is a well-structured, full-stack Next.js application implementing a comprehensive MVP blueprint for SAF producers. The codebase follows modern Next.js patterns with clear separation of concerns, database-driven architecture, and support for dual user personas (Producer and Airline).

The platform successfully implements the core "money-making loop" workflow, providing producers with tools to discover opportunities, create profitable bids, manage contracts, track production, and maintain compliance. The recent migration from fake data to real database-backed data ensures the application is production-ready for real-world use.

**Key Strengths:**
- Clean architecture with clear separation
- Comprehensive API coverage
- Real database integration
- Dual-persona support
- Modern tech stack

**Areas for Enhancement:**
- Complete Settings module integration
- Enhanced file upload system
- Authentication system
- Real-time notifications
- Advanced reporting capabilities

---

*Last Updated: Based on current codebase analysis*
*Analysis Date: Current*









