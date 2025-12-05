import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Contract from "@/models/Contract";

// POST /api/contracts/[id]/deliveries - Log a delivery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    const contract = await Contract.findById(id);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Find the delivery to update
    const deliveryIndex = body.deliveryIndex;
    if (
      deliveryIndex === undefined ||
      deliveryIndex < 0 ||
      deliveryIndex >= contract.deliveries.length
    ) {
      return NextResponse.json(
        { error: "Invalid delivery index" },
        { status: 400 }
      );
    }

    // Update the delivery
    const delivery = contract.deliveries[deliveryIndex];
    delivery.status = "delivered";
    delivery.actualDate = body.actualDate || new Date();
    delivery.actualVolume = body.actualVolume || delivery.volume;
    delivery.batchIds = body.batchIds || [];
    delivery.billOfLading = body.billOfLading;
    delivery.deliveryNote = body.deliveryNote;

    // Update delivered volume on contract
    contract.deliveredVolume = (contract.deliveredVolume || 0) + (delivery.actualVolume || delivery.volume);

    await contract.save();

    return NextResponse.json({ contract }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error logging delivery:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to log delivery",
      },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id]/deliveries - Add new delivery to schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    // Validation
    if (!body.scheduledDate || !body.location || !body.volume) {
      return NextResponse.json(
        { error: "Scheduled date, location, and volume are required" },
        { status: 400 }
      );
    }

    const newDelivery = {
      scheduledDate: new Date(body.scheduledDate),
      location: body.location,
      volume: body.volume,
      volumeUnit: body.volumeUnit || "MT",
      status: "scheduled",
    };

    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      {
        $push: {
          deliveries: newDelivery,
          activityLog: {
            timestamp: new Date(),
            description: `New delivery scheduled: ${body.volume}t on ${body.scheduledDate}`,
            userId: body.userId || "system",
          },
        },
      },
      { new: true }
    ).lean();

    if (!updatedContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({ contract: updatedContract }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error adding delivery:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add delivery",
      },
      { status: 500 }
    );
  }
}

