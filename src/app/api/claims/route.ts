import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Claim from "@/models/Claim";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const airline = searchParams.get("airline") || "default-airline";
    const status = searchParams.get("status");
    const claimType = searchParams.get("claimType");
    const reportingYear = searchParams.get("reportingYear");

    const query: any = { airline };
    if (status && status !== "all") {
      query.status = status;
    }
    if (claimType && claimType !== "all") {
      query.claimType = claimType;
    }
    if (reportingYear) {
      query.reportingYear = parseInt(reportingYear);
    }

    const claims = await Claim.find(query)
      .sort({ submittedDate: -1, createdAt: -1 });

    return NextResponse.json({ claims }, { status: 200 });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
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
      claimType,
      volumeClaimed,
      volumeUnit = "MT",
      claimPeriod,
      reportingYear,
      reportingQuarter,
      batchNumbers = [],
      inventoryItemIds = [],
      carbonIntensity,
      ghgReduction,
      totalEmissionsAvoided,
      scheme,
      certificationBody,
      certificateNumber,
      routes = [],
      creditsGenerated,
      creditUnit,
      creditValue,
      creditCurrency,
      notes,
    } = body;

    // Validate required fields
    if (!claimType || !volumeClaimed || !claimPeriod || !reportingYear || !carbonIntensity || !ghgReduction || !totalEmissionsAvoided || !scheme || !certificationBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const claim = new Claim({
      airline,
      claimType,
      volumeClaimed,
      volumeUnit,
      claimPeriod,
      reportingYear,
      reportingQuarter,
      batchNumbers,
      inventoryItemIds,
      carbonIntensity,
      ghgReduction,
      totalEmissionsAvoided,
      scheme,
      certificationBody,
      certificateNumber,
      verificationStatus: "pending",
      routes,
      creditsGenerated,
      creditUnit,
      creditValue,
      creditCurrency,
      status: "draft",
      supportingDocs: [],
      auditTrail: [
        {
          action: "Claim created",
          performedBy: "system",
          timestamp: new Date(),
          notes: "Initial claim creation",
        },
      ],
      notes,
    });

    await claim.save();

    return NextResponse.json(
      { message: "Claim created successfully", claim },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create claim" },
      { status: 500 }
    );
  }
}











