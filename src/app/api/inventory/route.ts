import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const airline = searchParams.get("airline") || "default-airline";
    const status = searchParams.get("status");
    const location = searchParams.get("location");

    const query: any = { airline };
    if (status && status !== "all") {
      query.status = status;
    }
    if (location && location !== "all") {
      query.airportCode = location;
    }

    const inventory = await Inventory.find(query).sort({ receivedDate: -1 });

    return NextResponse.json({ inventory }, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      airline = "default-airline",
      productName,
      productType,
      producerName,
      producerId,
      batchNumber,
      totalVolume,
      volumeUnit = "MT",
      carbonIntensity,
      ghgReduction,
      certifications = [],
      pathway,
      feedstock,
      storageLocation,
      airportCode,
      receivedDate,
      expiryDate,
      purchasePrice,
      currency = "USD",
      status = "available",
    } = body;

    // Validate required fields
    if (!productName || !productType || !producerName || !batchNumber || !totalVolume || !carbonIntensity || !ghgReduction || !pathway || !feedstock || !storageLocation || !receivedDate || !purchasePrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const inventoryItem = new Inventory({
      airline,
      productName,
      productType,
      producerName,
      producerId,
      batchNumber,
      totalVolume,
      allocatedVolume: 0,
      availableVolume: totalVolume,
      volumeUnit,
      carbonIntensity,
      ghgReduction,
      certifications,
      pathway,
      feedstock,
      storageLocation,
      airportCode,
      receivedDate,
      expiryDate,
      purchasePrice,
      currency,
      status,
      qualityCheckStatus: "pending",
    });

    await inventoryItem.save();

    return NextResponse.json(
      { message: "Inventory item created successfully", item: inventoryItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create inventory item" },
      { status: 500 }
    );
  }
}





