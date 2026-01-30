import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/public(.*)",
    "/api/webhooks(.*)",  // Allow webhook endpoints for external integrations
    "/api/tenders(.*)",   // Allow tenders API for external access
    "/api/notifications(.*)",  // Allow notifications API for authenticated users fetching via client
    "/marketplace",
    "/onboarding",
    "/api/onboarding-status",
    "/api/organization-settings",
]);

export default clerkMiddleware(async (auth, request) => {
    // Protect all routes except public ones
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
    // Note: Onboarding redirect is handled client-side via OnboardingGuard component
    // This avoids Edge Runtime fetch issues in production
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
