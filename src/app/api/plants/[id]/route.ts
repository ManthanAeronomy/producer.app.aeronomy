import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Plant from "@/models/Plant";

// GET /api/plants/[id] - Get a single plant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const plant = await Plant.findById(id).lean();

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ plant }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching plant:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch plant",
      },
      { status: 500 }
    );
  }
}

// PUT /api/plants/[id] - Update a plant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();

    const updatedPlant = await Plant.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedPlant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ plant: updatedPlant }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating plant:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update plant",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/plants/[id] - Delete a plant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const deletedPlant = await Plant.findByIdAndDelete(id);

    if (!deletedPlant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Plant deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting plant:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete plant",
      },
      { status: 500 }
    );
  }
}
















