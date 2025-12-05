import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lot from "@/models/Lot";
import { transformLotToTender } from "@/lib/lots-transformer";

export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const authHeader = request.headers.get("authorization");
    const expectedSecret =
      process.env.MARKETPLACE_WEBHOOK_SECRET || "dev-secret-key-123";

    if (expectedSecret) {
      const token = authHeader?.replace("Bearer ", "");
      if (token !== expectedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    const { event, lot, organization } = payload;

    console.log(`📥 Received ${event} for lot: ${lot.title || lot.lotName}`);

    // Connect to database
    await connectDB();

    // Transform lot from Marketplace format to our format
    let transformedLot;
    try {
      // Try to transform using the transformer function if lot has expected structure
      if (lot._id && lot.title && lot.volume && lot.pricing) {
        transformedLot = transformLotToTender(lot);
      } else {
        // Fallback: manual transformation for different payload formats
        throw new Error("Using fallback transformation");
      }
    } catch (error) {
      console.warn("Using fallback lot transformation:", error);
      // If transformation fails, use direct mapping
      const lotId = lot._id || lot.id;
      const volumeAmount = lot.volume?.amount || lot.volume || 0;
      const volumeUnit = lot.volume?.unit || "MT";
      
      transformedLot = {
        id: lotId,
        airline: lot.airlineName || lot.airline || "Unknown Airline",
        lotName: lot.title || lot.lotName || "Untitled Lot",
        volume: volumeAmount,
        volumeUnit: (volumeUnit === "gal" || volumeUnit === "gallon" ? "gal" : "MT") as "MT" | "gal",
        pricePerUnit:
          lot.pricing?.pricePerUnit ||
          (volumeAmount > 0 && lot.pricing?.price
            ? lot.pricing.price / volumeAmount
            : lot.pricing?.price || lot.pricePerUnit || 0),
        currency: (lot.pricing?.currency || lot.currency || "USD") as
          | "USD"
          | "EUR"
          | "GBP",
        ciScore:
          lot.compliance?.sustainabilityScore ||
          lot.compliance?.ghgReduction ||
          lot.ciScore ||
          0,
        location: lot.delivery?.deliveryLocation || lot.location || "TBD",
        deliveryWindow:
          lot.delivery?.deliveryWindow ||
          lot.deliveryWindow ||
          "TBD",
        longTerm:
          lot.type === "contract" ||
          lot.type === "forward" ||
          lot.longTerm ||
          false,
        postedOn:
          lot.publishedAt ||
          lot.createdAt ||
          lot.postedOn ||
          new Date().toISOString().split("T")[0],
      };
    }

    // Handle different events
    switch (event) {
      case "lot.created":
      case "lot.updated":
        // Upsert lot in database
        const lotData = {
          airline: transformedLot.airline,
          lotName: transformedLot.lotName,
          volume: transformedLot.volume,
          volumeUnit: transformedLot.volumeUnit,
          pricePerUnit: transformedLot.pricePerUnit,
          currency: transformedLot.currency,
          ciScore: transformedLot.ciScore,
          location: transformedLot.location,
          deliveryWindow: transformedLot.deliveryWindow,
          longTerm: transformedLot.longTerm,
          postedOn: transformedLot.postedOn,
          status: lot.status === "published" ? "open" : "closed",
        };

        // Use the lot ID from transformed lot, or generate new ObjectId
        const lotId = transformedLot.id;
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(lotId);
        
        await Lot.findOneAndUpdate(
          isValidObjectId ? { _id: lotId } : { lotName: transformedLot.lotName, airline: transformedLot.airline },
          lotData,
          { upsert: true, new: true, runValidators: true }
        );

        console.log(`✅ Synced lot: ${transformedLot.lotName}`);
        break;

      case "lot.deleted":
        // Mark as closed
        const deleteLotId = transformedLot.id;
        const isValidDeleteId = /^[0-9a-fA-F]{24}$/.test(deleteLotId);
        
        if (isValidDeleteId) {
          await Lot.findByIdAndUpdate(deleteLotId, {
            status: "closed",
          });
        } else {
          await Lot.findOneAndUpdate(
            { lotName: transformedLot.lotName, airline: transformedLot.airline },
            { status: "closed" }
          );
        }
        console.log(`🗑️ Closed lot: ${transformedLot.lotName}`);
        break;

      default:
        console.log(`⚠️ Unknown event type: ${event}`);
    }

    return NextResponse.json({
      success: true,
      event,
      lotId: lot._id || lot.id,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

