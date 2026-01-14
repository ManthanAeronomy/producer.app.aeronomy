import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OrganizationSettings from "@/models/OrganizationSettings";

// Check if onboarding is complete for the current user
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get organization ID from query params or use default
        const organizationId =
            request.nextUrl.searchParams.get("organizationId") || "default";

        const settings = await OrganizationSettings.findOne({ organizationId });

        // If no settings exist, onboarding is not complete
        if (!settings) {
            return NextResponse.json({
                onboardingComplete: false,
                organizationId,
            });
        }

        return NextResponse.json({
            onboardingComplete: settings.onboardingComplete || false,
            organizationId: settings.organizationId,
        });
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        return NextResponse.json(
            { error: "Failed to check onboarding status" },
            { status: 500 }
        );
    }
}
