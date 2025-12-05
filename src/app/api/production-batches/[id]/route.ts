import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import ProductionBatch from "@/models/ProductionBatch";

// GET /api/production-batches/[id] - Get a single production batch by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const batch = await ProductionBatch.findById(id)
      .populate("plantId")
      .lean();

    if (!batch) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching production batch:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch production batch",
      },
      { status: 500 }
    );
  }
}

// PUT /api/production-batches/[id] - Update a production batch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    const updatedBatch = await ProductionBatch.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedBatch) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch: updatedBatch }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating production batch:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update production batch",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/production-batches/[id] - Delete a production batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const batch = await ProductionBatch.findById(id);

    if (!batch) {
      return NextResponse.json(
        { error: "Production batch not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if batch has allocations
    if (batch.allocatedVolume > 0) {
      return NextResponse.json(
        { error: "Cannot delete batch with existing allocations" },
        { status: 400 }
      );
    }

    await ProductionBatch.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Production batch deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting production batch:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete production batch",
      },
      { status: 500 }
    );
  }
}









