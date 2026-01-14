import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OrganizationSettings from "@/models/OrganizationSettings";

// Validate API key for cross-origin requests only
// Internal requests (same origin) are allowed without API key
function validateApiKey(request: NextRequest): boolean {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host") || "";

    // Check if request is from the same domain (internal request)
    const isLocalhost = origin?.includes("localhost") || origin?.includes("127.0.0.1") ||
        host.includes("localhost") || host.includes("127.0.0.1");
    const isSameDomain = origin?.includes("aeronomy.co") || host.includes("aeronomy.co");

    // Allow internal requests (no origin header, localhost, or same production domain)
    if (!origin || isLocalhost || isSameDomain) {
        return true;
    }

    // Allow requests from the same app (check referer)
    if (referer && (referer.includes("localhost") || referer.includes("127.0.0.1") || referer.includes("aeronomy.co"))) {
        return true;
    }

    // For cross-origin requests from other domains, require API key
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.ORGANIZATION_API_KEY;

    // If no API key is configured, allow all requests (for development)
    if (!expectedApiKey) {
        return true;
    }

    return apiKey === expectedApiKey;
}

// GET: Retrieve organization settings
export async function GET(request: NextRequest) {
    try {
        // Validate API key for external requests
        if (!validateApiKey(request)) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid API key" },
                { status: 401 }
            );
        }

        await connectDB();

        // Get organization ID from query params or use default
        const organizationId =
            request.nextUrl.searchParams.get("organizationId") || "default";

        const settings = await OrganizationSettings.findOne({ organizationId });

        // If no settings exist, return empty data (user needs to complete onboarding)
        if (!settings) {
            return NextResponse.json({
                organizationId,
                companyName: "",
                legalName: "",
                registrationNumber: "",
                vatNumber: "",
                address: "",
                website: "",
                onboardingComplete: false,
                primaryContact: {
                    name: "",
                    email: "",
                    phone: "",
                },
                updatedAt: null,
            });
        }

        return NextResponse.json({
            organizationId: settings.organizationId,
            companyName: settings.companyName,
            legalName: settings.legalName,
            registrationNumber: settings.registrationNumber,
            vatNumber: settings.vatNumber,
            address: settings.address,
            website: settings.website,
            onboardingComplete: settings.onboardingComplete,
            primaryContact: settings.primaryContact,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error("Error fetching organization settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch organization settings" },
            { status: 500 }
        );
    }
}

// PUT: Update organization settings
export async function PUT(request: NextRequest) {
    try {
        // Validate API key
        if (!validateApiKey(request)) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid API key" },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const organizationId = body.organizationId || "default";

        // Find and update, or create if doesn't exist
        const settings = await OrganizationSettings.findOneAndUpdate(
            { organizationId },
            {
                $set: {
                    companyName: body.companyName,
                    legalName: body.legalName,
                    registrationNumber: body.registrationNumber,
                    vatNumber: body.vatNumber,
                    address: body.address,
                    website: body.website,
                    onboardingComplete: body.onboardingComplete,
                    primaryContact: body.primaryContact,
                },
            },
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json({
            organizationId: settings.organizationId,
            companyName: settings.companyName,
            legalName: settings.legalName,
            registrationNumber: settings.registrationNumber,
            vatNumber: settings.vatNumber,
            address: settings.address,
            website: settings.website,
            onboardingComplete: settings.onboardingComplete,
            primaryContact: settings.primaryContact,
            updatedAt: settings.updatedAt,
        });
    } catch (error) {
        console.error("Error updating organization settings:", error);
        return NextResponse.json(
            { error: "Failed to update organization settings" },
            { status: 500 }
        );
    }
}

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": process.env.CORS_ALLOWED_ORIGIN || "*",
            "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
        },
    });
}
