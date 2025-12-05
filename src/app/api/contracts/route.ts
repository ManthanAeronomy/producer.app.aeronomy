import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Contract from "@/models/Contract";

export const dynamic = "force-dynamic";

// GET /api/contracts - List all contracts with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const producerId = searchParams.get("producerId") || undefined;
    const counterparty = searchParams.get("counterparty") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (producerId) {
      query.producerId = producerId;
    }

    if (counterparty) {
      query["counterparty.companyName"] = {
        $regex: counterparty,
        $options: "i",
      };
    }

    const contracts = await Contract.find(query)
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch contracts",
      },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validation
    if (!body.counterparty?.companyName) {
      return NextResponse.json(
        { error: "Counterparty company name is required" },
        { status: 400 }
      );
    }

    if (!body.producerId || !body.producerName) {
      return NextResponse.json(
        { error: "Producer ID and name are required" },
        { status: 400 }
      );
    }

    if (!body.totalVolume || body.totalVolume <= 0) {
      return NextResponse.json(
        { error: "Total volume must be a positive number" },
        { status: 400 }
      );
    }

    if (!body.contractValue || body.contractValue <= 0) {
      return NextResponse.json(
        { error: "Contract value must be a positive number" },
        { status: 400 }
      );
    }

    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Auto-generate contract number if not provided
    if (!body.contractNumber) {
      const year = new Date().getFullYear();
      const count = await Contract.countDocuments({
        contractNumber: { $regex: `^SAF-${year}` },
      });
      body.contractNumber = `SAF-${year}-${String(count + 1).padStart(3, "0")}`;
    }

    // Add creation activity log entry
    body.activityLog = [
      {
        timestamp: new Date(),
        description: "Contract created",
        userId: body.createdBy || "system",
      },
    ];

    const newContract = await Contract.create(body);

    return NextResponse.json({ contract: newContract }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create contract",
      },
      { status: 500 }
    );
  }
}









