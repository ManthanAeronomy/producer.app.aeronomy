import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import RFQ from "@/models/RFQ";

// GET /api/rfqs/[id] - Get a single RFQ by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const rfq = await RFQ.findById(id).lean();

    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    return NextResponse.json({ rfq }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching RFQ:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch RFQ" },
      { status: 500 }
    );
  }
}

// PUT /api/rfqs/[id] - Update an RFQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    const updatedRFQ = await RFQ.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedRFQ) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    return NextResponse.json({ rfq: updatedRFQ }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating RFQ:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update RFQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/rfqs/[id] - Delete an RFQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const deletedRFQ = await RFQ.findByIdAndDelete(id);

    if (!deletedRFQ) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "RFQ deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting RFQ:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete RFQ" },
      { status: 500 }
    );
  }
}
















