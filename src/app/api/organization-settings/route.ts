import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OrganizationSettings, {
    IOrganizationSettings,
} from "@/models/OrganizationSettings";

// Default organization settings (used when no settings exist)
const DEFAULT_SETTINGS = {
    organizationId: "default",
    companyName: "GreenSky Bio Fuels",
    legalName: "GreenSky Bio Fuels B.V.",
    registrationNumber: "NL-12345678",
    vatNumber: "NL123456789B01",
    address: "Europoort 123, 3198 LG Rotterdam, Netherlands",
    website: "https://greensky.bio",
    primaryContact: {
        name: "Jane Doe",
        email: "contact@greensky.bio",
        phone: "+31 10 123 4567",
    },
};

// Validate API key for cross-origin requests only
// Internal requests (same origin) are allowed without API key
function validateApiKey(request: NextRequest): boolean {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    // Allow requests from the same origin (internal requests)
    // Internal requests won't have an origin header or will match our host
    if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return true;
    }

    // Allow requests from the same app (check referer)
    if (referer && (referer.includes("localhost") || referer.includes("127.0.0.1"))) {
        return true;
    }

    // For cross-origin requests, require API key
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

        let settings = await OrganizationSettings.findOne({ organizationId });

        // If no settings exist, create default settings
        if (!settings) {
            settings = await OrganizationSettings.create({
                ...DEFAULT_SETTINGS,
                organizationId,
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
