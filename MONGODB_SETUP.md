# MongoDB Setup Guide

This guide will help you set up MongoDB for the Aeronomy SAF Dashboard.

## Prerequisites

- Node.js installed
- MongoDB database (local or MongoDB Atlas)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install mongoose and other required dependencies.

### 2. Set Up MongoDB Connection

Create a `.env.local` file in the root directory:

```bash
# MongoDB Connection (Required)
MONGODB_URI=your_mongodb_connection_string_here

# Marketplace Integration (Optional - for webhook and API polling)
MARKETPLACE_BASE_URL=http://localhost:3004
MARKETPLACE_WEBHOOK_SECRET=dev-secret-key-123
MARKETPLACE_API_KEY=dev-api-key-123
```

#### For Local MongoDB:
```bash
MONGODB_URI=mongodb://localhost:27017/aeronomy
```

#### For MongoDB Atlas:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aeronomy?retryWrites=true&w=majority
```

#### Marketplace Integration:
If you're integrating with the Aeronomy Marketplace, add these variables (see `INTEGRATION_SETUP.md` for details):
```bash
MARKETPLACE_BASE_URL=http://localhost:3004
MARKETPLACE_WEBHOOK_SECRET=dev-secret-key-123
MARKETPLACE_API_KEY=dev-api-key-123
```

### 3. Seed Initial Data (Optional)

After setting up your MongoDB connection, you can seed the database with initial lot data by making a POST request to:

```bash
curl -X POST http://localhost:3000/api/seed
```

Or visit the endpoint in your browser after starting the dev server.

### 4. Start the Development Server

```bash
npm run dev
```

The application will automatically connect to MongoDB when API routes are accessed.

## Database Models

The application uses the following Mongoose models:

### 1. **Lot** (Tenders)
- Stores airline tender/lot information
- Fields: airline, lotName, volume, pricePerUnit, currency, ciScore, location, deliveryWindow, etc.
- Status: open, closed, awarded

### 2. **Deal** (Contracts)
- Stores executed SAF offtake agreements
- Fields: lotId, producerId, airline, volume, agreedPrice, milestones, etc.
- Status: draft, pending, executed, active, completed, terminated

### 3. **ComplianceDoc** (Compliance Documents)
- Stores sustainability certifications and audit documentation
- Fields: documentType, title, certificationBody, issueDate, expiryDate, fileUrl, etc.
- Types: sustainability_certification, audit_report, emissions_disclosure, etc.

### 4. **Bid**
- Stores producer bids on tenders
- Fields: tenderId, producerId, volume, price, notes, status, etc.
- Status: submitted, under_review, accepted, rejected, withdrawn

## API Endpoints

### Tenders
- `GET /api/tenders` - List all open tenders
- `POST /api/tenders` - Create a new tender
- `GET /api/tenders/[id]` - Get a specific tender
- `PUT /api/tenders/[id]` - Update a tender
- `DELETE /api/tenders/[id]` - Delete a tender

### Bids
- `GET /api/bids` - List all bids (optional `?tenderId=xxx` filter)
- `POST /api/bids` - Submit a new bid

### Seed
- `POST /api/seed` - Seed initial lot data

### Webhooks
- `POST /api/webhooks/lots` - Receive webhook events from Marketplace (see `INTEGRATION_SETUP.md`)

## Troubleshooting

### Connection Issues

If you encounter connection errors:

1. Verify your `MONGODB_URI` is correct in `.env.local`
2. Ensure MongoDB is running (if using local instance)
3. Check network connectivity (if using MongoDB Atlas)
4. Verify database user permissions

### Environment Variables

Make sure `.env.local` is in your `.gitignore` (it should be by default) and never commit it to version control.

## Next Steps

After setting up MongoDB:

1. Add authentication (Clerk) to associate data with users
2. Implement file upload for compliance documents
3. Add more sophisticated querying and filtering
4. Set up database indexes for performance optimization




