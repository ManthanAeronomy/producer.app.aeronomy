import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import type { UpdateTenderInput } from "@/types/tender";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tender = await dataStore.getTenderById(id);
    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ tender }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tender:", error);
    return NextResponse.json(
      { error: "Failed to fetch tender" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateTenderInput = await request.json();
    const updatedTender = await dataStore.updateTender(id, body);

    if (!updatedTender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tender: updatedTender }, { status: 200 });
  } catch (error) {
    console.error("Error updating tender:", error);
    return NextResponse.json(
      { error: "Failed to update tender" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await dataStore.deleteTender(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting tender:", error);
    return NextResponse.json(
      { error: "Failed to delete tender" },
      { status: 500 }
    );
  }
}
