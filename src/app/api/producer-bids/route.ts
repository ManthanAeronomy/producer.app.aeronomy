import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import ProducerBid from "@/models/ProducerBid";

export const dynamic = "force-dynamic";

// GET /api/producer-bids - List all producer bids with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const producerId = searchParams.get("producerId") || undefined;
    const rfqId = searchParams.get("rfqId") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (producerId) {
      query.producerId = producerId;
    }

    if (rfqId) {
      query.rfqId = rfqId;
    }

    const bids = await ProducerBid.find(query)
      .populate("rfqId", "buyerInfo.companyName volumeRequirements.totalVolume")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bids }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching producer bids:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch producer bids",
      },
      { status: 500 }
    );
  }
}

// POST /api/producer-bids - Create a new producer bid
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validation
    if (!body.rfqId) {
      return NextResponse.json(
        { error: "RFQ ID is required" },
        { status: 400 }
      );
    }

    if (!body.producerId || !body.producerName) {
      return NextResponse.json(
        { error: "Producer ID and name are required" },
        { status: 400 }
      );
    }

    if (!body.supplyAllocation || body.supplyAllocation.length === 0) {
      return NextResponse.json(
        { error: "At least one supply allocation is required" },
        { status: 400 }
      );
    }

    if (!body.pricingOffer?.type) {
      return NextResponse.json(
        { error: "Pricing offer type is required" },
        { status: 400 }
      );
    }

    // Get the latest version for this RFQ from this producer
    const latestBid = await ProducerBid.findOne({
      rfqId: body.rfqId,
      producerId: body.producerId,
    })
      .sort({ version: -1 })
      .lean();

    const newVersion = latestBid ? (latestBid.version || 1) + 1 : 1;

    // If creating a new version, mark previous as superseded
    if (latestBid && body.status !== "draft") {
      await ProducerBid.findByIdAndUpdate(latestBid._id, {
        status: "superseded",
      });
    }

    const newBid = await ProducerBid.create({
      ...body,
      version: newVersion,
    });

    return NextResponse.json({ bid: newBid }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating producer bid:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create producer bid",
      },
      { status: 500 }
    );
  }
}









