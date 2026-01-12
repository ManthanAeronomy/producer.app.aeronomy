import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import ProductionBatch from "@/models/ProductionBatch";
import Contract from "@/models/Contract";

// POST /api/production-batches/[id]/allocate - Allocate batch volume to a contract
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    // Validation
    if (!body.contractId || !body.contractNumber || !body.volume) {
      return NextResponse.json(
        { error: "Contract ID, contract number, and volume are required" },
        { status: 400 }
      );
    }

    const batch = await ProductionBatch.findById(id);

    if (!batch) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 }
      );
    }

    // Check available volume
    if (body.volume > batch.availableVolume) {
      return NextResponse.json(
        {
          error: `Insufficient volume. Available: ${batch.availableVolume}t, Requested: ${body.volume}t`,
        },
        { status: 400 }
      );
    }

    // Verify contract exists
    const contract = await Contract.findById(body.contractId);
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Add allocation
    batch.allocations.push({
      contractId: body.contractId,
      contractNumber: body.contractNumber,
      volume: body.volume,
      allocatedAt: new Date(),
    });

    await batch.save();

    // Add activity to contract
    await Contract.findByIdAndUpdate(body.contractId, {
      $push: {
        activityLog: {
          timestamp: new Date(),
          description: `Batch ${batch.batchNumber} allocated: ${body.volume}t`,
          userId: body.userId || "system",
        },
      },
    });

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error allocating batch:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to allocate batch",
      },
      { status: 500 }
    );
  }
}






















