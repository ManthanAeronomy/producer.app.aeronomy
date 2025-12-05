import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import type { CreateBidInput } from "@/types/tender";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenderId = searchParams.get("tenderId");

    if (tenderId) {
      const bids = await dataStore.getBidsByTenderId(tenderId);
      return NextResponse.json({ bids }, { status: 200 });
    }

    const bids = await dataStore.getAllBids();
    return NextResponse.json({ bids }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBidInput = await request.json();

    // Validation
    if (
      !body.tenderId ||
      body.volume === undefined ||
      body.price === undefined ||
      !body.notes
    ) {
      return NextResponse.json(
        { error: "Missing required fields: tenderId, volume, price, notes" },
        { status: 400 }
      );
    }

    // Verify tender exists
    const tender = await dataStore.getTenderById(body.tenderId);
    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    // Validate volume and price are positive
    if (body.volume <= 0 || body.price <= 0) {
      return NextResponse.json(
        { error: "Volume and price must be positive numbers" },
        { status: 400 }
      );
    }

    const newBid = await dataStore.createBid(body);
    return NextResponse.json({ bid: newBid }, { status: 201 });
  } catch (error) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: "Failed to create bid" },
      { status: 500 }
    );
  }
}

