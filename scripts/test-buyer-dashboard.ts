/**
 * Test script for Buyer Dashboard API connection
 * 
 * Usage:
 *   npx ts-node scripts/test-buyer-dashboard.ts
 * 
 * Or add to package.json:
 *   "test:buyer-api": "ts-node scripts/test-buyer-dashboard.ts"
 */

import {
  checkBuyerDashboardConnection,
  testBuyerDashboardAPI,
  sendBidToBuyerDashboard,
} from "../src/lib/webhooks/buyer-bid-service";

async function runTests() {
  console.log("🚀 Starting Buyer Dashboard API Tests\n");
  console.log("=" .repeat(60));

  // Test 1: Check connection
  console.log("\n📡 Test 1: Checking Buyer Dashboard connection...");
  const isConnected = await checkBuyerDashboardConnection();

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

  const testBid = {
    lotId: `test_${Date.now()}`,
    producerName: "Test Producer (Delete Me)",
    producerEmail: "test@example.com",
    volume: 1000,
    volumeUnit: "MT" as const,
    pricePerUnit: 2000,
    currency: "USD" as const,
    notes: "This is a test bid from the Producer Dashboard setup script. You can safely delete this bid.",
    status: "pending" as const,
  };

  const result = await sendBidToBuyerDashboard(testBid);

  if (!result.success) {
    console.error(`\n❌ FAILED: ${result.error}`);
    console.error("\nPossible issues:");
    console.error("  1. API key doesn't match");
    console.error("  2. Buyer Dashboard /api/bids endpoint has errors");
    console.error("  3. Database connection issue in Buyer Dashboard");
    process.exit(1);
  }

  console.log("✅ Test bid submitted successfully!");
  console.log("\nBid details:");
  console.log(`  - Bid ID: ${result.bid?._id || "N/A"}`);
  console.log(`  - Lot ID: ${testBid.lotId}`);
  console.log(`  - Producer: ${testBid.producerName}`);
  console.log(`  - Volume: ${testBid.volume} ${testBid.volumeUnit}`);
  console.log(`  - Price: ${testBid.currency} ${testBid.pricePerUnit}/${testBid.volumeUnit}`);

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
}

// Run tests
runTests().catch((error) => {
  console.error("\n💥 Unexpected error during tests:");
  console.error(error);
  process.exit(1);
});




























