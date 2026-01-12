/**
 * Buyer Dashboard Bid Submission Service
 * 
 * This service handles sending bids/offers from the Producer Dashboard
 * to the Buyer Dashboard API.
 */

export interface BidSubmissionData {
  lotId: string;
  producerName: string;
  producerEmail: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  pricePerUnit: number;
  currency: "USD" | "EUR" | "GBP";
  totalPrice?: number;
  notes: string;
  paymentTerms?: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  externalBidId?: string;
  status?: "pending" | "accepted" | "rejected" | "withdrawn";
}

export interface BidSubmissionResult {
  success: boolean;
  bid?: any;
  error?: string;
}

/**
 * Get Buyer Dashboard configuration from environment
 */
function getBuyerDashboardConfig() {
  const url =
    process.env.NEXT_PUBLIC_BUYER_DASHBOARD_URL ||
    process.env.BUYER_DASHBOARD_URL ||
    "http://localhost:3000";

  const apiKey =
    process.env.NEXT_PUBLIC_BUYER_API_KEY ||
    process.env.PRODUCER_API_KEY ||
    "producer-api-key-456";

  return { url, apiKey };
}

/**
 * Send a bid to the Buyer Dashboard
 * 
 * @param bidData - The bid data to submit
 * @returns Promise with success status and bid data or error
 */
export async function sendBidToBuyerDashboard(
  bidData: BidSubmissionData
): Promise<BidSubmissionResult> {
  const { url, apiKey } = getBuyerDashboardConfig();

  try {
    // Validate required fields
    const requiredFields: (keyof BidSubmissionData)[] = [
      "lotId",
      "producerName",
      "producerEmail",
      "volume",
      "pricePerUnit",
      "notes",
    ];

    const missingFields = requiredFields.filter(
      (field) => !bidData[field]
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    // Calculate total price if not provided
    const totalPrice =
      bidData.totalPrice || bidData.volume * bidData.pricePerUnit;

    // Prepare payload
    const payload = {
      lotId: bidData.lotId,
      producerName: bidData.producerName,
      producerEmail: bidData.producerEmail,
      volume: bidData.volume,
      volumeUnit: bidData.volumeUnit || "MT",
      pricePerUnit: bidData.pricePerUnit,
      currency: bidData.currency || "USD",
      totalPrice,
      notes: bidData.notes,
      paymentTerms: bidData.paymentTerms || "",
      deliveryDate: bidData.deliveryDate || "",
      deliveryLocation: bidData.deliveryLocation || "",
      externalBidId: bidData.externalBidId || `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: bidData.status || "pending",
    };

    console.log(
      `📤 Sending bid to Buyer Dashboard: ${url}/api/bids`
    );

    // Send request to Buyer Dashboard
    const response = await fetch(`${url}/api/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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

      console.error(`❌ Bid submission failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();

    console.log(
      `✅ Bid submitted successfully to Buyer Dashboard (Bid ID: ${result.bid?._id || "unknown"})`
    );

    return {
      success: true,
      bid: result.bid,
    };
  } catch (error: any) {
    console.error("❌ Error submitting bid to Buyer Dashboard:", error);

    return {
      success: false,
      error:
        error.message ||
        "Network error: Could not connect to Buyer Dashboard",
    };
  }
}

/**
 * Check if Buyer Dashboard is available and responding
 * 
 * @returns Promise<boolean> - true if Buyer Dashboard is available
 */
export async function checkBuyerDashboardConnection(): Promise<boolean> {
  const { url } = getBuyerDashboardConfig();

  try {
    console.log(`🔍 Checking Buyer Dashboard connection: ${url}`);

    // Try to fetch the bids endpoint with a HEAD or GET request
    const response = await fetch(`${url}/api/bids`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Short timeout to fail fast
      signal: AbortSignal.timeout(5000),
    });

    const isAvailable = response.ok || response.status === 401; // 401 means endpoint exists but needs auth

    if (isAvailable) {
      console.log(`✅ Buyer Dashboard is available at ${url}`);
    } else {
      console.warn(
        `⚠️ Buyer Dashboard responded with status ${response.status}`
      );
    }

    return isAvailable;
  } catch (error: any) {
    console.error(
      `❌ Cannot connect to Buyer Dashboard at ${url}:`,
      error.message
    );
    return false;
  }
}

/**
 * Get all bids submitted to Buyer Dashboard (optional - for tracking)
 * 
 * @param lotId - Optional lot ID to filter bids
 * @returns Promise with list of bids
 */
export async function getBidsFromBuyerDashboard(lotId?: string): Promise<{
  success: boolean;
  bids?: any[];
  error?: string;
}> {
  const { url, apiKey } = getBuyerDashboardConfig();

  try {
    const queryParams = lotId ? `?lotId=${lotId}` : "";
    const endpoint = `${url}/api/bids${queryParams}`;

    console.log(`📥 Fetching bids from Buyer Dashboard: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch bids (${response.status})`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();

    console.log(
      `✅ Retrieved ${result.bids?.length || 0} bids from Buyer Dashboard`
    );

    return {
      success: true,
      bids: result.bids || [],
    };
  } catch (error: any) {
    console.error("❌ Error fetching bids from Buyer Dashboard:", error);

    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Update a bid status in Buyer Dashboard (e.g., withdraw a bid)
 * 
 * @param bidId - The ID of the bid to update
 * @param status - New status
 * @returns Promise with success status
 */
export async function updateBidInBuyerDashboard(
  bidId: string,
  status: "pending" | "accepted" | "rejected" | "withdrawn"
): Promise<BidSubmissionResult> {
  const { url, apiKey } = getBuyerDashboardConfig();

  try {
    console.log(
      `🔄 Updating bid ${bidId} in Buyer Dashboard to status: ${status}`
    );

    const response = await fetch(`${url}/api/bids/${bidId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to update bid (${response.status})`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const result = await response.json();

    console.log(`✅ Bid ${bidId} updated successfully`);

    return {
      success: true,
      bid: result.bid,
    };
  } catch (error: any) {
    console.error("❌ Error updating bid in Buyer Dashboard:", error);

    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

/**
 * Test the Buyer Dashboard API connection with a mock bid
 * Useful for debugging and setup verification
 * 
 * @returns Promise with test result
 */
export async function testBuyerDashboardAPI(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  console.log("🧪 Testing Buyer Dashboard API...");

  // First check connection
  const isConnected = await checkBuyerDashboardConnection();

  if (!isConnected) {
    return {
      success: false,
      message: "Cannot connect to Buyer Dashboard. Make sure it's running on the configured port.",
    };
  }

  // Try to submit a test bid
  const testBid: BidSubmissionData = {
    lotId: `test_${Date.now()}`,
    producerName: "Test Producer",
    producerEmail: "test@example.com",
    volume: 1000,
    volumeUnit: "MT",
    pricePerUnit: 2000,
    currency: "USD",
    notes: "This is a test bid. Please ignore or delete.",
    status: "pending",
  };

  const result = await sendBidToBuyerDashboard(testBid);

  if (result.success) {
    return {
      success: true,
      message: "✅ Buyer Dashboard API is working correctly!",
      details: result.bid,
    };
  } else {
    return {
      success: false,
      message: `❌ Buyer Dashboard API test failed: ${result.error}`,
      details: result.error,
    };
  }
}



























