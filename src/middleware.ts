import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/public(.*)",
    "/marketplace",
    "/onboarding",
    "/api/onboarding-status",
    "/api/organization-settings",
]);

export default clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();

    // Protect all routes except public ones
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    // If user is logged in and not on onboarding/auth pages, check if they need onboarding
    if (userId && !request.nextUrl.pathname.startsWith("/onboarding") &&
        !request.nextUrl.pathname.startsWith("/sign-") &&
        !request.nextUrl.pathname.startsWith("/api/")) {

        try {
            // Check onboarding status via internal API call
            const baseUrl = request.nextUrl.origin;
            const response = await fetch(`${baseUrl}/api/onboarding-status`, {
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.onboardingComplete) {
                    // Redirect to onboarding if not complete
                    return NextResponse.redirect(new URL("/onboarding", request.url));
                }
            }
        } catch (error) {
            // If there's an error checking status, let them through
            // (they can be redirected later or shown onboarding from client-side)
            console.error("Error checking onboarding status:", error);
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

