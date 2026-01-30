/**
 * JWT Utility for Inter-Dashboard Authentication
 *
 * Used for secure communication between Producer Dashboard and Buyer Dashboard.
 * Tokens are short-lived (5 minutes by default) and include request-specific claims.
 */

import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

// Configuration
const JWT_SECRET = process.env.INTER_DASHBOARD_JWT_SECRET || process.env.MARKETPLACE_API_KEY || "dev-jwt-secret-change-in-production";
const TOKEN_EXPIRY = process.env.JWT_TOKEN_EXPIRY_SECONDS
    ? parseInt(process.env.JWT_TOKEN_EXPIRY_SECONDS)
    : 300; // 5 minutes default

export interface InterDashboardTokenPayload {
    iss: string; // Issuer (e.g., "cist.aeronomy.co")
    aud: string; // Audience (e.g., "app.aeronomy.co")
    sub: string; // Subject (e.g., "inter-dashboard-auth")
    action?: string; // Action type (e.g., "submit_bid", "fetch_lots")
    requestId?: string; // Unique request identifier
    userId?: string; // User ID making the request
    orgId?: string; // Organization ID
}

/**
 * Generate a signed JWT token for inter-dashboard communication
 */
export function signInterDashboardToken(
    payload: Partial<InterDashboardTokenPayload>,
    options?: { expiresIn?: number }
): string {
    const fullPayload: InterDashboardTokenPayload = {
        iss: process.env.NEXT_PUBLIC_APP_URL || "producer-dashboard",
        aud: process.env.NEXT_PUBLIC_BUYER_DASHBOARD_URL || "buyer-dashboard",
        sub: "inter-dashboard-auth",
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...payload,
    };

    const signOptions: SignOptions = {
        expiresIn: options?.expiresIn || TOKEN_EXPIRY,
        algorithm: "HS256",
    };

    return jwt.sign(fullPayload, JWT_SECRET, signOptions);
}

/**
 * Verify and decode a JWT token from another dashboard
 */
export function verifyInterDashboardToken(
    token: string
): InterDashboardTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ["HS256"],
        }) as JwtPayload & InterDashboardTokenPayload;

        return decoded;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            console.warn("JWT token has expired");
        } else if (error.name === "JsonWebTokenError") {
            console.warn("Invalid JWT token:", error.message);
        } else {
            console.error("JWT verification error:", error);
        }
        return null;
    }
}

/**
 * Extract token from Authorization header
 * Supports both "Bearer <token>" and raw token formats
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;

    if (authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }

    // Could be a raw token or API key
    return authHeader;
}

/**
 * Validate request authentication (JWT or API key fallback)
 * Returns { valid: true, payload } for JWT or { valid: true, isApiKey: true } for API key
 */
export function validateInterDashboardAuth(
    authHeader: string | null,
    apiKeyHeader: string | null
): {
    valid: boolean;
    payload?: InterDashboardTokenPayload;
    isApiKey?: boolean;
    error?: string;
} {
    // Try JWT first (from Authorization header)
    const token = extractTokenFromHeader(authHeader);
    if (token && token.includes(".")) {
        // Looks like a JWT (has dots)
        const payload = verifyInterDashboardToken(token);
        if (payload) {
            return { valid: true, payload };
        }
        return { valid: false, error: "Invalid or expired JWT token" };
    }

    // Fallback to API key
    const apiKey = apiKeyHeader || token;
    const expectedApiKey = process.env.BUYER_WEBHOOK_SECRET || process.env.MARKETPLACE_WEBHOOK_SECRET;

    if (apiKey && expectedApiKey && apiKey === expectedApiKey) {
        return { valid: true, isApiKey: true };
    }

    // Also check against the standard API key
    const standardApiKey = process.env.MARKETPLACE_API_KEY;
    if (apiKey && standardApiKey && apiKey === standardApiKey) {
        return { valid: true, isApiKey: true };
    }

    return { valid: false, error: "No valid JWT or API key provided" };
}

/**
 * Generate headers for inter-dashboard API calls
 */
export function getInterDashboardHeaders(action?: string): HeadersInit {
    const token = signInterDashboardToken({ action });

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Source": "producer-dashboard",
    };
}
