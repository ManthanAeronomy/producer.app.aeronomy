import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Contract from "@/models/Contract";

// GET /api/contracts/[id] - Get a single contract by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const contract = await Contract.findById(id)
      .populate("sourceBidId")
      .populate("sourceRfqId")
      .lean();

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({ contract }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch contract",
      },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id] - Update a contract
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    // Add activity log entry for the update
    const activityEntry = {
      timestamp: new Date(),
      description: body.activityDescription || "Contract updated",
      userId: body.updatedBy || "system",
    };

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        $set: { ...body, updatedAt: new Date() },
        $push: { activityLog: activityEntry },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({ contract: updatedContract }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating contract:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update contract",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[id] - Delete a contract (soft delete by setting status to cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Soft delete - set status to cancelled
    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        $set: { status: "cancelled" },
        $push: {
          activityLog: {
            timestamp: new Date(),
            description: "Contract cancelled",
            userId: "system",
          },
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json(
      { message: "Contract cancelled successfully", contract: updatedContract },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error cancelling contract:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to cancel contract",
      },
      { status: 500 }
    );
  }
}
















