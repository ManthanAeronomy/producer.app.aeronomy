import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import ProductionBatch from "@/models/ProductionBatch";

export const dynamic = "force-dynamic";

// GET /api/production-batches - List all production batches with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const plantId = searchParams.get("plantId") || undefined;
    const status = searchParams.get("status") || undefined;
    const year = searchParams.get("year") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (plantId) {
      query.plantId = plantId;
    }

    if (status) {
      query.status = status;
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31T23:59:59`);
      query.productionDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const batches = await ProductionBatch.find(query)
      .sort({ productionDate: -1 })
      .lean();

    // Calculate summary stats
    const totalProduced = batches.reduce((sum, b) => sum + b.volume, 0);
    const totalAllocated = batches.reduce((sum, b) => sum + b.allocatedVolume, 0);
    const totalAvailable = batches.reduce((sum, b) => sum + b.availableVolume, 0);

    return NextResponse.json(
      {
        batches,
        summary: {
          totalProduced,
          totalAllocated,
          totalAvailable,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching production batches:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch production batches",
      },
      { status: 500 }
    );
  }
}

// POST /api/production-batches - Create a new production batch
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validation
    if (!body.plantId || !body.plantName) {
      return NextResponse.json(
        { error: "Plant ID and name are required" },
        { status: 400 }
      );
    }

    if (!body.productionDate) {
      return NextResponse.json(
        { error: "Production date is required" },
        { status: 400 }
      );
    }

    if (!body.volume || body.volume <= 0) {
      return NextResponse.json(
        { error: "Volume must be a positive number" },
        { status: 400 }
      );
    }

    if (!body.feedstockType) {
      return NextResponse.json(
        { error: "Feedstock type is required" },
        { status: 400 }
      );
    }

    if (body.ghgReduction === undefined || body.ghgReduction < 0) {
      return NextResponse.json(
        { error: "GHG reduction must be a non-negative number" },
        { status: 400 }
      );
    }

    // Auto-generate batch number if not provided
    if (!body.batchNumber) {
      const year = new Date(body.productionDate).getFullYear();
      const count = await ProductionBatch.countDocuments({
        batchNumber: { $regex: `^B-${year}` },
      });
      body.batchNumber = `B-${year}-${String(count + 1).padStart(3, "0")}`;
    }

    const newBatch = await ProductionBatch.create(body);

    return NextResponse.json({ batch: newBatch }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating production batch:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create production batch",
      },
      { status: 500 }
    );
  }
}









