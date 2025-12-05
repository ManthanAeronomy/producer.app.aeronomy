import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

export const dynamic = "force-dynamic";

// GET /api/certificates - List all certificates with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const producerId = searchParams.get("producerId") || undefined;
    const status = searchParams.get("status") || undefined;
    const certificateType = searchParams.get("type") || undefined;

    // Build query
    const query: Record<string, unknown> = {};

    if (producerId) {
      query.producerId = producerId;
    }

    if (status) {
      query.status = status;
    }

    if (certificateType) {
      query.certificateType = certificateType;
    }

    const certificates = await Certificate.find(query)
      .sort({ expiryDate: 1 })
      .lean();

    // Calculate summary
    const valid = certificates.filter((c) => c.status === "valid").length;
    const expiring = certificates.filter((c) => c.status === "expiring").length;
    const expired = certificates.filter((c) => c.status === "expired").length;

    return NextResponse.json(
      {
        certificates,
        summary: {
          total: certificates.length,
          valid,
          expiring,
          expired,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch certificates",
      },
      { status: 500 }
    );
  }
}

// POST /api/certificates - Create a new certificate
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
        { error: "Certificate name is required" },
        { status: 400 }
      );
    }

    if (!body.certificateType) {
      return NextResponse.json(
        { error: "Certificate type is required" },
        { status: 400 }
      );
    }

    if (!body.issuingBody) {
      return NextResponse.json(
        { error: "Issuing body is required" },
        { status: 400 }
      );
    }

    if (!body.certificateNumber) {
      return NextResponse.json(
        { error: "Certificate number is required" },
        { status: 400 }
      );
    }

    if (!body.issueDate || !body.expiryDate) {
      return NextResponse.json(
        { error: "Issue date and expiry date are required" },
        { status: 400 }
      );
    }

    if (!body.fileUrl || !body.fileKey) {
      return NextResponse.json(
        { error: "File URL and file key are required" },
        { status: 400 }
      );
    }

    const newCertificate = await Certificate.create(body);

    return NextResponse.json({ certificate: newCertificate }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create certificate",
      },
      { status: 500 }
    );
  }
}









