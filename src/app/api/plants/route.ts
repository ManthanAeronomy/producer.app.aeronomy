import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Plant from "@/models/Plant";

export const dynamic = "force-dynamic";

// GET /api/plants - List all plants with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const producerId = searchParams.get("producerId") || undefined;
    const status = searchParams.get("status") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (producerId) {
      query.producerId = producerId;
    }

    if (status) {
      query.status = status;
    }

    const plants = await Plant.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({ plants }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching plants:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch plants",
      },
      { status: 500 }
    );
  }
}

// POST /api/plants - Create a new plant
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validation
    if (!body.producerId) {
      return NextResponse.json(
        { error: "Producer ID is required" },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: "Plant name is required" },
        { status: 400 }
      );
    }

    if (!body.location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    if (!body.pathway) {
      return NextResponse.json(
        { error: "Pathway is required" },
        { status: 400 }
      );
    }

    if (!body.annualCapacity || body.annualCapacity <= 0) {
      return NextResponse.json(
        { error: "Annual capacity must be a positive number" },
        { status: 400 }
      );
    }

    const newPlant = await Plant.create(body);

    return NextResponse.json({ plant: newPlant }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating plant:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create plant",
      },
      { status: 500 }
    );
  }
}









