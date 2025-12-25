# 🎯 What to Add to Buyer Dashboard (Port 3000)

The Producer Dashboard is trying to send bids to your Buyer Dashboard, but the endpoint doesn't exist yet. Here's exactly what you need to add.

## 📁 Files to Create in Buyer Dashboard Project

### 1. Create Bid Model: `models/Bid.ts` or `models/Bid.js`

```typescript
import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    lotId: {
      type: String,
      required: true,
      index: true,
    },
    producerName: {
      type: String,
      required: true,
    },
    producerEmail: {
      type: String,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    volumeUnit: {
      type: String,
      enum: ["MT", "gal"],
      default: "MT",
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },
    notes: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
bidSchema.index({ lotId: 1, createdAt: -1 });
bidSchema.index({ status: 1, createdAt: -1 });
bidSchema.index({ producerEmail: 1 });

const Bid = mongoose.models.Bid || mongoose.model("Bid", bidSchema);

export default Bid;
```

### 2. Create API Route: `app/api/bids/route.ts` (or `pages/api/bids.ts` if using Pages Router)

**For App Router (Next.js 13+):**

```typescript
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // Your MongoDB connection utility
import Bid from "@/models/Bid";

// GET /api/bids - List all bids
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const lotId = searchParams.get("lotId");
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    if (lotId) query.lotId = lotId;
    if (status) query.status = status;

    const bids = await Bid.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bids, count: bids.length }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

// POST /api/bids - Create a new bid
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get("authorization");
    const expectedApiKey = process.env.PRODUCER_API_KEY || "producer-api-key-456";

    if (expectedApiKey) {
      const token = authHeader?.replace("Bearer ", "");
      if (token !== expectedApiKey) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid API key" },
          { status: 401 }
        );
      }
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "lotId",
      "producerName",
      "producerEmail",
      "volume",
      "pricePerUnit",
      "notes",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate volume and price are positive
    if (body.volume <= 0 || body.pricePerUnit <= 0) {
      return NextResponse.json(
        { error: "Volume and price must be positive numbers" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.producerEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Create bid
    const newBid = await Bid.create({
      lotId: body.lotId,
      producerName: body.producerName,
      producerEmail: body.producerEmail,
      volume: Number(body.volume),
      volumeUnit: body.volumeUnit || "MT",
      pricePerUnit: Number(body.pricePerUnit),
      currency: body.currency || "USD",
      notes: body.notes,
      status: body.status || "pending",
    });

    console.log(`✅ New bid received from ${body.producerName} for lot ${body.lotId}`);

    return NextResponse.json(
      {
        bid: newBid,
        message: "Bid received successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create bid" },
      { status: 500 }
    );
  }
}
```

**For Pages Router (Next.js 12 and earlier):**

Create `pages/api/bids.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Bid from "@/models/Bid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectDB();

      const { lotId, status } = req.query;

      const query: any = {};
      if (lotId) query.lotId = lotId;
      if (status) query.status = status;

      const bids = await Bid.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ bids, count: bids.length });
    } catch (error) {
      console.error("Error fetching bids:", error);
      return res.status(500).json({ error: "Failed to fetch bids" });
    }
  }

  if (req.method === "POST") {
    try {
      // Verify API key
      const authHeader = req.headers.authorization;
      const expectedApiKey = process.env.PRODUCER_API_KEY || "producer-api-key-456";

      if (expectedApiKey) {
        const token = authHeader?.replace("Bearer ", "");
        if (token !== expectedApiKey) {
          return res.status(401).json({ error: "Unauthorized - Invalid API key" });
        }
      }

      await connectDB();

      const body = req.body;

      // Validate required fields
      const requiredFields = [
        "lotId",
        "producerName",
        "producerEmail",
        "volume",
        "pricePerUnit",
        "notes",
      ];

      const missingFields = requiredFields.filter((field) => !body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Validate volume and price
      if (body.volume <= 0 || body.pricePerUnit <= 0) {
        return res.status(400).json({
          error: "Volume and price must be positive numbers",
        });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.producerEmail)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Create bid
      const newBid = await Bid.create({
        lotId: body.lotId,
        producerName: body.producerName,
        producerEmail: body.producerEmail,
        volume: Number(body.volume),
        volumeUnit: body.volumeUnit || "MT",
        pricePerUnit: Number(body.pricePerUnit),
        currency: body.currency || "USD",
        notes: body.notes,
        status: body.status || "pending",
      });

      console.log(`✅ New bid received from ${body.producerName} for lot ${body.lotId}`);

      return res.status(201).json({
        bid: newBid,
        message: "Bid received successfully",
      });
    } catch (error: any) {
      console.error("Error creating bid:", error);
      return res.status(500).json({
        error: error.message || "Failed to create bid",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
```

### 3. Add Environment Variable to Buyer Dashboard `.env.local`

```env
# API Key for Producer Dashboard to submit bids
PRODUCER_API_KEY=producer-api-key-456

# MongoDB Connection (if not already set)
MONGODB_URI=your_mongodb_connection_string_here
```

### 4. MongoDB Connection Utility (if you don't have one)

Create `lib/mongodb.ts` or `lib/mongodb.js`:

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

## 🧪 Testing the Endpoint

### Test with curl:

```bash
curl -X POST http://localhost:3000/api/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer producer-api-key-456" \
  -d '{
    "lotId": "test123",
    "producerName": "ABC Biofuels",
    "producerEmail": "contact@abcbiofuels.com",
    "volume": 5000,
    "volumeUnit": "MT",
    "pricePerUnit": 2100,
    "currency": "USD",
    "notes": "HEFA-based SAF from waste cooking oil. CORSIA certified.",
    "status": "pending"
  }'
```

Expected response:
```json
{
  "bid": {
    "_id": "507f1f77bcf86cd799439011",
    "lotId": "test123",
    "producerName": "ABC Biofuels",
    "producerEmail": "contact@abcbiofuels.com",
    "volume": 5000,
    "volumeUnit": "MT",
    "pricePerUnit": 2100,
    "currency": "USD",
    "notes": "HEFA-based SAF from waste cooking oil. CORSIA certified.",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Bid received successfully"
}
```

## 📋 Checklist

- [ ] Create `models/Bid.ts` (or `.js`)
- [ ] Create `app/api/bids/route.ts` (or `pages/api/bids.ts` for Pages Router)
- [ ] Create `lib/mongodb.ts` (if you don't have it)
- [ ] Add `PRODUCER_API_KEY=producer-api-key-456` to Buyer Dashboard `.env.local`
- [ ] Restart Buyer Dashboard dev server
- [ ] Test with curl command above
- [ ] Try submitting a bid from Producer Dashboard

## 🔍 Debugging

### Check if endpoint exists:
```bash
curl http://localhost:3000/api/bids
```

Should return: `{"bids": [], "count": 0}`

### Check if authorization works:
```bash
# Without auth (should fail)
curl -X POST http://localhost:3000/api/bids \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Expected: {"error": "Unauthorized - Invalid API key"}
```

### Check Buyer Dashboard console:
When a bid is submitted, you should see:
```
✅ New bid received from ABC Biofuels for lot 507f1f77bcf86cd799439011
```

## 🎨 Display Bids in Buyer Dashboard (Optional)

Create a page to view bids: `app/bids/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";

interface Bid {
  _id: string;
  lotId: string;
  producerName: string;
  producerEmail: string;
  volume: number;
  volumeUnit: string;
  pricePerUnit: number;
  currency: string;
  notes: string;
  status: string;
  createdAt: string;
}

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bids")
      .then((res) => res.json())
      .then((data) => {
        setBids(data.bids);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bids:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading bids...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Received Bids</h1>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div key={bid._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{bid.producerName}</h3>
                <p className="text-sm text-gray-600">{bid.producerEmail}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                {bid.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Volume:</span>
                <span className="ml-2 font-semibold">
                  {bid.volume.toLocaleString()} {bid.volumeUnit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Price:</span>
                <span className="ml-2 font-semibold">
                  {bid.currency} {bid.pricePerUnit.toLocaleString()}/{bid.volumeUnit}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Lot ID:</span>
                <span className="ml-2 font-mono text-xs">{bid.lotId}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-600">Notes:</span>
              <p className="mt-1 text-sm">{bid.notes}</p>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Submitted: {new Date(bid.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      {bids.length === 0 && (
        <p className="text-gray-500 text-center py-8">No bids received yet</p>
      )}
    </div>
  );
}
```

---

Once you've added these files to your Buyer Dashboard project, restart the server and try submitting a bid again! 🚀





















