import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import RFQ from "@/models/RFQ";
import ProducerBid from "@/models/ProducerBid";
import Contract from "@/models/Contract";
import ProductionBatch from "@/models/ProductionBatch";
import Certificate from "@/models/Certificate";
import Plant from "@/models/Plant";

export const dynamic = "force-dynamic";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const producerId = searchParams.get("producerId") || undefined;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Build base query for producer-specific data
    const producerQuery = producerId ? { producerId } : {};

    // Action Required Items
    const [
      rfqsClosingSoon,
      bidsAwaitingApproval,
      certificatesExpiringSoon,
      deliveriesDueThisWeek,
      unallocatedBatches,
    ] = await Promise.all([
      // RFQs closing in 7 days
      RFQ.countDocuments({
        status: "open",
        "terms.responseDeadline": { $lte: sevenDaysFromNow, $gte: now },
      }),
      // Bids awaiting approval
      ProducerBid.countDocuments({
        ...producerQuery,
        status: "pending_approval",
      }),
      // Certificates expiring in 30 days
      Certificate.countDocuments({
        ...producerQuery,
        status: "expiring",
      }),
      // Deliveries due this week (simplified - count contracts with upcoming deliveries)
      Contract.countDocuments({
        ...producerQuery,
        status: "active",
        "deliveries.scheduledDate": { $lte: sevenDaysFromNow, $gte: now },
        "deliveries.status": "scheduled",
      }),
      // Unallocated production batches
      ProductionBatch.countDocuments({
        status: "available",
      }),
    ]);

    // This Month Stats
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const [monthlyContracts, monthlyBatches] = await Promise.all([
      Contract.find({
        ...producerQuery,
        status: "active",
        "deliveries.scheduledDate": { $gte: startOfMonth, $lte: endOfMonth },
      }).lean(),
      ProductionBatch.find({
        productionDate: { $gte: startOfMonth, $lte: endOfMonth },
      }).lean(),
    ]);

    // Calculate monthly delivery volume
    let scheduledDeliveryVolume = 0;
    let deliveryCount = 0;
    monthlyContracts.forEach((contract) => {
      contract.deliveries?.forEach((delivery) => {
        const deliveryDate = new Date(delivery.scheduledDate);
        if (deliveryDate >= startOfMonth && deliveryDate <= endOfMonth) {
          scheduledDeliveryVolume += delivery.volume || 0;
          deliveryCount++;
        }
      });
    });

    const monthlyProductionVolume = monthlyBatches.reduce(
      (sum, b) => sum + (b.volume || 0),
      0
    );

    // Capacity Status
    const plants = await Plant.find(producerQuery).lean();
    const totalAnnualCapacity = plants.reduce(
      (sum, p) => sum + (p.annualCapacity || 0),
      0
    );

    // Get commitments by year (from contracts)
    const activeContracts = await Contract.find({
      ...producerQuery,
      status: { $in: ["active", "scheduled"] },
    }).lean();

    const commitmentsByYear: Record<number, number> = {};
    const pendingBidsByYear: Record<number, number> = {};

    // Calculate committed volume by year from contracts
    activeContracts.forEach((contract) => {
      contract.deliveries?.forEach((delivery) => {
        const year = new Date(delivery.scheduledDate).getFullYear();
        if (!commitmentsByYear[year]) commitmentsByYear[year] = 0;
        commitmentsByYear[year] += delivery.volume || 0;
      });
    });

    // Get pending bids volume by year
    const pendingBids = await ProducerBid.find({
      ...producerQuery,
      status: { $in: ["submitted", "pending_approval"] },
    }).lean();

    pendingBids.forEach((bid) => {
      bid.plantAllocations?.forEach((plantAlloc) => {
        plantAlloc.allocations?.forEach((allocation) => {
          if (!pendingBidsByYear[allocation.year])
            pendingBidsByYear[allocation.year] = 0;
          pendingBidsByYear[allocation.year] += allocation.volume || 0;
        });
      });
    });

    // Pipeline Stats
    const [openRFQs, bidsInProgress, bidsSubmitted, bidsAwaitingDecision] =
      await Promise.all([
        RFQ.countDocuments({ status: "open" }),
        ProducerBid.countDocuments({ ...producerQuery, status: "draft" }),
        ProducerBid.countDocuments({ ...producerQuery, status: "submitted" }),
        ProducerBid.countDocuments({
          ...producerQuery,
          status: "submitted",
          // Assuming bids awaiting decision are submitted but not yet won/lost
        }),
      ]);

    // Calculate potential value from submitted bids
    const submittedBidsData = await ProducerBid.find({
      ...producerQuery,
      status: "submitted",
    })
      .populate("rfqId", "volumeRequirements.totalVolume")
      .lean();

    // Contract Health
    const [activeContractsCount, atRiskContracts] = await Promise.all([
      Contract.countDocuments({ ...producerQuery, status: "active" }),
      Contract.countDocuments({ ...producerQuery, status: "at_risk" }),
    ]);

    // Get next deliveries
    const upcomingDeliveries = await Contract.find({
      ...producerQuery,
      status: "active",
      "deliveries.status": "scheduled",
    })
      .select("counterparty.companyName deliveries")
      .lean();

    const nextDeliveries: Array<{
      counterparty: string;
      date: Date;
      volume: number;
    }> = [];

    upcomingDeliveries.forEach((contract) => {
      contract.deliveries
        ?.filter((d) => d.status === "scheduled" && new Date(d.scheduledDate) >= now)
        .forEach((delivery) => {
          nextDeliveries.push({
            counterparty: contract.counterparty?.companyName || "Unknown",
            date: delivery.scheduledDate,
            volume: delivery.volume,
          });
        });
    });

    // Sort and limit next deliveries
    nextDeliveries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const topNextDeliveries = nextDeliveries.slice(0, 5);

    // Calculate total contract value
    const totalContractValue = activeContracts.reduce(
      (sum, c) => sum + (c.contractValue || 0),
      0
    );

    return NextResponse.json(
      {
        actionRequired: {
          rfqsClosingSoon,
          bidsAwaitingApproval,
          certificatesExpiringSoon,
          deliveriesDueThisWeek,
          unallocatedBatches,
        },
        thisMonth: {
          scheduledDeliveries: deliveryCount,
          scheduledVolume: scheduledDeliveryVolume,
          productionVolume: monthlyProductionVolume,
          // Note: Expected revenue would need price data
        },
        capacityStatus: {
          totalAnnualCapacity,
          commitmentsByYear,
          pendingBidsByYear,
        },
        pipeline: {
          openRFQs,
          bidsInProgress,
          bidsSubmitted,
          bidsAwaitingDecision,
          submittedBidsCount: submittedBidsData.length,
        },
        contractHealth: {
          activeContracts: activeContractsCount,
          atRiskContracts,
          onTrackContracts: activeContractsCount - atRiskContracts,
          totalContractValue,
          nextDeliveries: topNextDeliveries,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}

