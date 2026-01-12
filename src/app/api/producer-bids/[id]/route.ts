import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import ProducerBid from "@/models/ProducerBid";

// GET /api/producer-bids/[id] - Get a single producer bid by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const bid = await ProducerBid.findById(id)
      .populate("rfqId")
      .lean();

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    return NextResponse.json({ bid }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching producer bid:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch producer bid",
      },
      { status: 500 }
    );
  }
}

// PUT /api/producer-bids/[id] - Update a producer bid
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    const existingBid = await ProducerBid.findById(id);

    if (!existingBid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Prevent editing submitted bids (allow only status changes)
    if (
      existingBid.status === "submitted" &&
      Object.keys(body).some((key) => key !== "status")
    ) {
      return NextResponse.json(
        { error: "Cannot edit submitted bids. Create a revision instead." },
        { status: 400 }
      );
    }

    const updatedBid = await ProducerBid.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ bid: updatedBid }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating producer bid:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update producer bid",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/producer-bids/[id] - Delete a producer bid (only drafts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const bid = await ProducerBid.findById(id);

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (bid.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft bids can be deleted" },
        { status: 400 }
      );
    }

    await ProducerBid.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Bid deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting producer bid:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete producer bid",
      },
      { status: 500 }
    );
  }
}






















