import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { signInterDashboardToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

/**
 * POST /api/bids/submit-to-buyer
 * 
 * Server-side proxy to submit bids to the Buyer Dashboard.
 * This avoids CORS issues by making the request server-to-server.
 * Uses JWT tokens for secure authentication.
 */
export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - you must be logged in to submit a bid" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Get Buyer Dashboard configuration
        const buyerDashboardUrl =
            process.env.NEXT_PUBLIC_BUYER_DASHBOARD_URL ||
            process.env.BUYER_DASHBOARD_URL ||
            process.env.MARKETPLACE_BASE_URL ||
            "http://localhost:3004";

        // Generate JWT token for secure authentication
        const jwtToken = signInterDashboardToken({
            action: "submit_bid",
            userId: userId,
        });

        // Also keep API key as fallback for backward compatibility
        const apiKey =
            process.env.MARKETPLACE_API_KEY ||
            process.env.NEXT_PUBLIC_BUYER_API_KEY ||
            "dev-api-key-123";

        console.log(`📤 [Server Proxy] Submitting bid to Buyer Dashboard: ${buyerDashboardUrl}/api/bids`);

        // Prepare the payload for Buyer Dashboard
        const payload = {
            lotId: body.lotId,
            bidderId: userId, // Use the authenticated Clerk userId
            bidderName: body.producerName,
            bidderEmail: body.producerEmail,
            volume: {
                amount: body.volume,
                unit: body.volumeUnit === "MT" ? "MT" : "gallons",
            },
            pricing: {
                price: body.totalPrice || body.volume * body.pricePerUnit,
                currency: body.currency || "USD",
                pricePerUnit: body.pricePerUnit,
            },
            message: body.notes,
            deliveryDate: body.deliveryDate || "",
            deliveryLocation: body.deliveryLocation || "",
            externalBidId: body.externalBidId || `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: body.status || "pending",
        };

        // Make server-to-server request with JWT authentication
        const response = await fetch(`${buyerDashboardUrl}/api/bids`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`, // JWT for new secure auth
                "X-API-Key": apiKey, // Fallback for backward compatibility
                "X-Source": "producer-dashboard",
            },
            body: JSON.stringify(payload),
        });

        // Handle response
        if (!response.ok) {
            let errorMessage = `Failed to submit bid (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                errorMessage = `${errorMessage}: ${response.statusText}`;
            }

            console.error(`❌ [Server Proxy] Bid submission failed: ${errorMessage}`);
            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(`✅ [Server Proxy] Bid submitted successfully (Bid ID: ${result.bid?._id || "unknown"})`);

        return NextResponse.json({
            success: true,
            bid: result.bid,
        });
    } catch (error: any) {
        console.error("❌ [Server Proxy] Error submitting bid:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Network error: Could not connect to Buyer Dashboard",
            },
            { status: 500 }
        );
    }
}
