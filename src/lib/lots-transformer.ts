import type { Tender } from "@/types/tender";

// Type for lot from the 3004 API
interface LotFromAPI {
  _id: string;
  title: string;
  airlineName?: string;
  volume: {
    amount: number;
    unit: string;
  };
  pricing: {
    price: number;
    pricePerUnit?: number;
    currency: string;
  };
  delivery?: {
    deliveryLocation?: string;
    deliveryDate?: string | Date;
    deliveryWindow?: string;
  };
  compliance?: {
    sustainabilityScore?: number;
    ghgReduction?: number;
  };
  type?: string;
  status?: string;
  publishedAt?: string | Date;
  createdAt?: string | Date;
}

/**
 * Transforms a lot from the 3004 API format to Tender format
 */
export function transformLotToTender(lot: LotFromAPI): Tender {
  // Convert volume unit from API format to Tender format
  const convertVolumeUnit = (unit: string): "MT" | "gal" => {
    const unitLower = unit.toLowerCase();
    if (unitLower.includes("metric-ton") || unitLower.includes("mt") || unitLower.includes("tonne")) {
      return "MT";
    }
    if (unitLower.includes("gallon") || unitLower.includes("gal")) {
      return "gal";
    }
    // Default to MT if unknown
    return "MT";
  };

  // Determine if long-term based on type
  const isLongTerm = lot.type === "contract" || lot.type === "forward";

  // Get price per unit (use pricing.pricePerUnit if available, otherwise calculate)
  const pricePerUnit = lot.pricing.pricePerUnit || 
    (lot.volume.amount > 0 ? lot.pricing.price / lot.volume.amount : lot.pricing.price);

  // Format delivery window
  const formatDeliveryWindow = (): string => {
    if (lot.delivery?.deliveryWindow) {
      return lot.delivery.deliveryWindow;
    }
    if (lot.delivery?.deliveryDate) {
      const date = typeof lot.delivery.deliveryDate === "string" 
        ? new Date(lot.delivery.deliveryDate) 
        : lot.delivery.deliveryDate;
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    }
    return "TBD";
  };

  // Format posted date
  const formatPostedDate = (): string => {
    const date = lot.publishedAt || lot.createdAt;
    if (!date) return new Date().toISOString().split("T")[0];
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  };

  // Get CI score (use sustainability score or GHG reduction, default to 0)
  const ciScore = lot.compliance?.sustainabilityScore || 
                  lot.compliance?.ghgReduction || 
                  0;

  // Get location
  const location = lot.delivery?.deliveryLocation || "TBD";

  // Ensure we have valid data
  if (!lot._id || !lot.title || !lot.volume || !lot.pricing) {
    throw new Error("Invalid lot data: missing required fields");
  }

  return {
    id: lot._id.toString(),
    airline: lot.airlineName || "Unknown Airline",
    lotName: lot.title,
    volume: lot.volume.amount || 0,
    volumeUnit: convertVolumeUnit(lot.volume.unit || "MT"),
    pricePerUnit: pricePerUnit,
    currency: (lot.pricing.currency as "USD" | "EUR" | "GBP") || "USD",
    ciScore: ciScore,
    location: location,
    deliveryWindow: formatDeliveryWindow(),
    longTerm: isLongTerm,
    postedOn: formatPostedDate(),
  };
}

/**
 * Fetches lots from the 3004 API and transforms them to Tender format
 * Supports both public endpoint and external endpoint with authentication
 */
export async function fetchLotsFrom3004(orgId?: string): Promise<Tender[]> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Determine endpoint and headers
    const marketplaceBaseUrl = process.env.MARKETPLACE_BASE_URL || "http://localhost:3004";
    const apiKey = process.env.MARKETPLACE_API_KEY || "dev-api-key-123";
    
    let endpoint = `${marketplaceBaseUrl}/api/lots`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Use external endpoint with auth if orgId is provided
    if (orgId) {
      endpoint = `${marketplaceBaseUrl}/api/lots/external?orgId=${orgId}`;
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers,
      // Add cache control to prevent stale data
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch lots from 3004: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    // Handle different response formats
    let lots: LotFromAPI[] = [];
    if (Array.isArray(data)) {
      lots = data;
    } else if (data.lots && Array.isArray(data.lots)) {
      lots = data.lots;
    } else if (data.data && Array.isArray(data.data)) {
      lots = data.data;
    }

    // Filter only published lots (or lots without status, assuming they're published)
    const publishedLots = lots.filter(
      (lot) => !lot.status || lot.status === "published"
    );

    // Transform to Tender format, filtering out any that fail transformation
    const transformedTenders: Tender[] = [];
    for (const lot of publishedLots) {
      try {
        transformedTenders.push(transformLotToTender(lot));
      } catch (error) {
        console.warn(`Failed to transform lot ${lot._id}:`, error);
        // Skip this lot but continue with others
      }
    }

    return transformedTenders;
  } catch (error: any) {
    // Handle timeout and network errors gracefully
    if (error.name === 'AbortError') {
      console.warn("Timeout fetching lots from 3004 (server may be unavailable)");
    } else {
      console.error("Error fetching lots from 3004:", error);
    }
    // Return empty array on error so local tenders still work
    return [];
  }
}

