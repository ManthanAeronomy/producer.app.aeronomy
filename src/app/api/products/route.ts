import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

// GET /api/products - List all products with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const producerId = searchParams.get("producerId") || undefined;
    const plantId = searchParams.get("plantId") || undefined;
    const pathway = searchParams.get("pathway") || undefined;
    const status = searchParams.get("status") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (producerId) {
      query.producerId = producerId;
    }

    if (plantId) {
      query.plantId = plantId;
    }

    if (pathway) {
      query.pathway = pathway;
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate("plantId", "name location")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
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
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!body.pathway) {
      return NextResponse.json(
        { error: "Pathway is required" },
        { status: 400 }
      );
    }

    if (!body.feedstock) {
      return NextResponse.json(
        { error: "Feedstock is required" },
        { status: 400 }
      );
    }

    if (!body.plantId || !body.plantName) {
      return NextResponse.json(
        { error: "Plant ID and name are required" },
        { status: 400 }
      );
    }

    if (body.ghgReduction === undefined || body.ghgReduction < 0) {
      return NextResponse.json(
        { error: "GHG reduction must be a non-negative number" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create(body);

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    );
  }
}









