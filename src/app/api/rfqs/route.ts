import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import RFQ from "@/models/RFQ";

export const dynamic = "force-dynamic";

// GET /api/rfqs - List all RFQs with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const year = searchParams.get("year") || undefined;
    const fuelType = searchParams.get("fuelType") || undefined;
    const producerId = searchParams.get("producerId") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (year) {
      query["volumeRequirements.breakdown.year"] = parseInt(year);
    }

    if (fuelType) {
      query["fuelSpecifications.fuelType"] = fuelType;
    }

    if (producerId) {
      query.producerId = producerId;
    }

    const rfqs = await RFQ.find(query)
      .sort({ "terms.responseDeadline": 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ rfqs }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching RFQs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch RFQs" },
      { status: 500 }
    );
  }
}

// POST /api/rfqs - Create a new RFQ
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validation
    if (!body.buyerInfo?.companyName) {
      return NextResponse.json(
        { error: "Buyer company name is required" },
        { status: 400 }
      );
    }

    if (!body.volumeRequirements?.totalVolume) {
      return NextResponse.json(
        { error: "Total volume is required" },
        { status: 400 }
      );
    }

    if (!body.fuelSpecifications?.fuelType) {
      return NextResponse.json(
        { error: "Fuel type is required" },
        { status: 400 }
      );
    }

    if (!body.terms?.responseDeadline) {
      return NextResponse.json(
        { error: "Response deadline is required" },
        { status: 400 }
      );
    }

    const newRFQ = await RFQ.create(body);

    return NextResponse.json({ rfq: newRFQ }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating RFQ:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create RFQ" },
      { status: 500 }
    );
  }
}









