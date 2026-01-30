import { NextRequest, NextResponse } from "next/server";
import { signInterDashboardToken } from "@/lib/jwt";

/**
 * Proxy endpoint to fetch lots from Buyer Dashboard
 * This avoids CORS issues by making server-to-server requests
 * Uses JWT tokens for secure authentication
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const buyerUrl = process.env.NEXT_PUBLIC_BUYER_DASHBOARD_URL || "http://localhost:3004";

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get("status") || "published";

        // Generate JWT token for secure authentication
        const jwtToken = signInterDashboardToken({
            action: "fetch_lots",
        });

        console.log(`📥 Proxying lots request to: ${buyerUrl}/api/lots/external?status=${status}`);

        const response = await fetch(`${buyerUrl}/api/lots/external?status=${status}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`, // JWT for secure auth
                "X-API-Key": process.env.BUYER_API_KEY || "dev-api-key-123", // Fallback
            },
            // Add timeout
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            let errorMessage = `Failed to fetch lots from buyer dashboard (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = `${errorMessage}: ${response.statusText}`;
            }
            console.error(`❌ ${errorMessage}`);
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        const data = await response.json();
        console.log(`✅ Fetched ${data.lots?.length || 0} lots from buyer dashboard`);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("❌ Error proxying lots request:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch lots from marketplace" },
            { status: 500 }
        );
    }
}
