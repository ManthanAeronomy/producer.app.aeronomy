/**
 * Test script for Buyer Dashboard API connection (JavaScript version)
 * 
 * Usage:
 *   node scripts/test-buyer-dashboard.js
 * 
 * Or add to package.json:
 *   "test:buyer-api": "node scripts/test-buyer-dashboard.js"
 */

// Simple test without TypeScript
async function checkConnection(url) {
  try {
    const response = await fetch(`${url}/api/bids`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    return response.ok || response.status === 401;
  } catch (error) {
    return false;
  }
}

async function submitTestBid(url, apiKey) {
  const testBid = {
    lotId: `test_${Date.now()}`,
    producerName: "Test Producer (Delete Me)",
    producerEmail: "test@example.com",
    volume: 1000,
    volumeUnit: "MT",
    pricePerUnit: 2000,
    currency: "USD",
    notes: "This is a test bid from the Producer Dashboard setup script. You can safely delete this bid.",
    status: "pending",
  };

  try {
    const response = await fetch(`${url}/api/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(testBid),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function runTests() {
  console.log("🚀 Starting Buyer Dashboard API Tests\n");
  console.log("=".repeat(60));

  // Get config from environment or use defaults
  const url =
    process.env.NEXT_PUBLIC_BUYER_DASHBOARD_URL ||
    process.env.BUYER_DASHBOARD_URL ||
    "http://localhost:3000";

  const apiKey =
    process.env.NEXT_PUBLIC_BUYER_API_KEY ||
    process.env.PRODUCER_API_KEY ||
    "producer-api-key-456";

  console.log(`\n📍 Buyer Dashboard URL: ${url}`);
  console.log(`🔑 API Key: ${apiKey.slice(0, 10)}...`);

  // Test 1: Check connection
  console.log("\n📡 Test 1: Checking Buyer Dashboard connection...");
  const isConnected = await checkConnection(url);

  if (!isConnected) {
    console.error("\n❌ FAILED: Cannot connect to Buyer Dashboard");
    console.error("Make sure:");
    console.error("  1. Buyer Dashboard is running on the configured port");
    console.error("  2. Environment variables are set correctly");
    console.error("  3. /api/bids endpoint exists in Buyer Dashboard");
    process.exit(1);
  }

  console.log("✅ Connection successful!\n");

  // Test 2: Submit a test bid
  console.log("📤 Test 2: Submitting test bid...");

  try {
    const result = await submitTestBid(url, apiKey);

    console.log("✅ Test bid submitted successfully!");
    console.log("\nBid details:");
    console.log(`  - Bid ID: ${result.bid?._id || "N/A"}`);
    console.log(`  - Producer: Test Producer`);
    console.log(`  - Volume: 1000 MT`);
    console.log(`  - Price: USD 2000/MT`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("\n✅ ALL TESTS PASSED!");
    console.log("\n📋 Summary:");
    console.log("  ✓ Buyer Dashboard is accessible");
    console.log("  ✓ API authentication is working");
    console.log("  ✓ Bid submission is functional");
    console.log("\n🎉 Your Producer Dashboard is ready to send bids!");
    console.log("\n💡 Next steps:");
    console.log("  1. Check the Buyer Dashboard to see the test bid");
    console.log("  2. Delete the test bid from Buyer Dashboard");
    console.log("  3. Try submitting a real bid from the marketplace");
    console.log("\n");
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    console.error("\nPossible issues:");
    console.error("  1. API key doesn't match");
    console.error("  2. Buyer Dashboard /api/bids endpoint has errors");
    console.error("  3. Database connection issue in Buyer Dashboard");
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("\n💥 Unexpected error during tests:");
  console.error(error);
  process.exit(1);
});




























