"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";

type BidStatus = "draft" | "pending_approval" | "submitted" | "superseded" | "won" | "lost" | "withdrawn";

interface ProducerBid {
  _id: string;
  rfqId: {
    _id: string;
    buyerInfo: {
      companyName: string;
    };
    volumeRequirements: {
      totalVolume: number;
    };
  } | string;
  producerId: string;
  producerName: string;
  version: number;
  status: BidStatus;
  supplyAllocation: Array<{
    plantId: string;
    year: number;
    volume: number;
  }>;
  blendedGHGReduction: number;
  pricingOffer: {
    type: "Indexed" | "Fixed" | "Hybrid";
    priceIndex?: string;
    premium?: number;
    fixedPrices?: Array<{
      year: number;
      pricePerTonne: number;
    }>;
    currency: "USD" | "EUR" | "GBP";
  };
  approvals: Array<{
    approverId: string;
    approverName: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    comments?: string;
    approvedAt?: string;
  }>;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = "draft" | "pending" | "submitted" | "decided";

export default function BidsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("draft");
  const [bids, setBids] = useState<ProducerBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/producer-bids");
      if (!response.ok) {
        throw new Error("Failed to fetch bids");
      }
      const data = await response.json();
      setBids(data.bids || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError(err instanceof Error ? err.message : "Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  // Get buyer name from RFQ
  const getBuyerName = (bid: ProducerBid): string => {
    if (typeof bid.rfqId === "object" && bid.rfqId?.buyerInfo) {
      return bid.rfqId.buyerInfo.companyName;
    }
    return "Unknown Buyer";
  };

  // Get total volume from supply allocation
  const getTotalVolume = (bid: ProducerBid): number => {
    return bid.supplyAllocation?.reduce((sum, a) => sum + a.volume, 0) || 0;
  };

  // Estimate value (simplified calculation)
  const estimateValue = (bid: ProducerBid): number => {
    const volume = getTotalVolume(bid);
    if (bid.pricingOffer.type === "Fixed" && bid.pricingOffer.fixedPrices?.length) {
      const avgPrice =
        bid.pricingOffer.fixedPrices.reduce((sum, p) => sum + p.pricePerTonne, 0) /
        bid.pricingOffer.fixedPrices.length;
      return volume * avgPrice;
    }
    // For indexed, use a rough estimate
    return volume * 1200; // Placeholder price per tonne
  };

  // Generate bid number
  const getBidNumber = (bid: ProducerBid): string => {
    const year = new Date(bid.createdAt).getFullYear();
    const shortId = bid._id.slice(-4).toUpperCase();
    return `B-${year}-${shortId}`;
  };

  const filteredBids = useMemo(() => {
    switch (activeTab) {
      case "draft":
        return bids.filter((b) => b.status === "draft");
      case "pending":
        return bids.filter((b) => b.status === "pending_approval");
      case "submitted":
        return bids.filter((b) => b.status === "submitted");
      case "decided":
        return bids.filter((b) => ["won", "lost", "withdrawn"].includes(b.status));
      default:
        return bids;
    }
  }, [bids, activeTab]);

  const stats = useMemo(
    () => ({
      draft: bids.filter((b) => b.status === "draft").length,
      pending: bids.filter((b) => b.status === "pending_approval").length,
      submitted: bids.filter((b) => b.status === "submitted").length,
      decided: bids.filter((b) => ["won", "lost", "withdrawn"].includes(b.status)).length,
    }),
    [bids]
  );

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  const getStatusBadge = (status: BidStatus) => {
    const styles: Record<BidStatus, string> = {
      draft: "bg-[#f3f2f2] text-[#706e6b]",
      pending_approval: "bg-[#fff3e0] text-[#e65100]",
      submitted: "bg-[#e3f2fd] text-[#0176d3]",
      superseded: "bg-[#f3f2f2] text-[#706e6b]",
      won: "bg-[#e8f5e9] text-[#2e844a]",
      lost: "bg-[#ffebee] text-[#c23934]",
      withdrawn: "bg-[#f3f2f2] text-[#706e6b]",
    };
    const labels: Record<BidStatus, string> = {
      draft: "Draft",
      pending_approval: "Pending Approval",
      submitted: "Submitted",
      superseded: "Superseded",
      won: "Won ✓",
      lost: "Lost ✗",
      withdrawn: "Withdrawn",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleDeleteBid = async (bidId: string) => {
    if (!confirm("Are you sure you want to delete this draft bid?")) return;

    try {
      const response = await fetch(`/api/producer-bids/${bidId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete bid");
      }

      // Refresh the list
      fetchBids();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete bid");
    }
  };

  const getActions = (bid: ProducerBid) => {
    switch (bid.status) {
      case "draft":
        return (
          <>
            <Link
              href={`/bids/${bid._id}/edit`}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDeleteBid(bid._id)}
              className="rounded-lg border border-[#c23934] px-3 py-1.5 text-xs font-semibold text-[#c23934] hover:bg-[#ffebee]"
            >
              Delete
            </button>
          </>
        );
      case "pending_approval":
        return (
          <>
            <Link
              href={`/bids/${bid._id}`}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
            >
              View
            </Link>
            <button className="rounded-lg border border-[#ff9800] px-3 py-1.5 text-xs font-semibold text-[#e65100] hover:bg-[#fff3e0]">
              Remind
            </button>
          </>
        );
      case "submitted":
        return (
          <>
            <Link
              href={`/bids/${bid._id}`}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
            >
              View
            </Link>
            <Link
              href={`/bids/${bid._id}/revise`}
              className="rounded-lg border border-[#0176d3] px-3 py-1.5 text-xs font-semibold text-[#0176d3] hover:bg-[#f0f7ff]"
            >
              Revise
            </Link>
          </>
        );
      case "won":
        return (
          <>
            <Link
              href={`/bids/${bid._id}`}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
            >
              View
            </Link>
            <Link
              href={`/contracts/new?bid=${bid._id}`}
              className="rounded-lg bg-[#2e844a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#236936]"
            >
              → Contract
            </Link>
          </>
        );
      case "lost":
        return (
          <>
            <Link
              href={`/bids/${bid._id}`}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
            >
              View
            </Link>
            <Link
              href={`/bids/new?clone=${bid._id}`}
              className="rounded-lg border border-[#0176d3] px-3 py-1.5 text-xs font-semibold text-[#0176d3] hover:bg-[#f0f7ff]"
            >
              Clone
            </Link>
          </>
        );
      default:
        return (
          <Link
            href={`/bids/${bid._id}`}
            className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
          >
            View
          </Link>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading bids...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fce4ec]">
            <svg className="h-8 w-8 text-[#c23934]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">Failed to load bids</h3>
          <p className="mt-1 text-sm text-[#706e6b]">{error}</p>
          <button
            onClick={fetchBids}
            className="mt-4 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#181818]">Bids</h1>
            <p className="mt-1 text-base text-[#706e6b]">Build, approve, and track bids</p>
          </div>
          <Link
            href="/bids/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Bid
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#e5e5e5]">
          {(
            [
              { id: "draft", label: "Draft", count: stats.draft },
              { id: "pending", label: "Pending Approval", count: stats.pending },
              { id: "submitted", label: "Submitted", count: stats.submitted },
              { id: "decided", label: "Decided", count: stats.decided },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "text-[#0176d3]" : "text-[#706e6b] hover:text-[#181818]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id ? "bg-[#0176d3]/10 text-[#0176d3]" : "bg-[#f3f2f2]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0176d3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bids Table */}
      {bids.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No bids yet</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            Create your first bid to start tracking your proposals
          </p>
          <Link
            href="/bids/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Bid
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5e5e5] bg-[#f8f9fa]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">Bid #</th>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">Buyer</th>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">Volume</th>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">Est. Value</th>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">GHG Red.</th>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">Status</th>
                <th className="px-4 py-3 font-semibold text-[#706e6b]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {filteredBids.map((bid) => (
                <tr key={bid._id} className="group transition-colors hover:bg-[#f8f9fa]">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[#181818]">{getBidNumber(bid)}</div>
                    {bid.version > 1 && <span className="text-xs text-[#706e6b]">v{bid.version}</span>}
                  </td>
                  <td className="px-4 py-4 text-[#181818]">{getBuyerName(bid)}</td>
                  <td className="px-4 py-4 font-medium text-[#181818]">
                    {getTotalVolume(bid).toLocaleString()}t
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#181818]">
                    {formatCurrency(estimateValue(bid), bid.pricingOffer.currency)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-[#2e844a]">{bid.blendedGHGReduction || 0}%</span>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(bid.status)}
                    {bid.status === "pending_approval" && bid.approvals?.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        {bid.approvals.map((approver, i) => (
                          <span
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              approver.status === "approved"
                                ? "bg-[#2e844a]"
                                : approver.status === "rejected"
                                ? "bg-[#c23934]"
                                : "bg-[#ff9800]"
                            }`}
                            title={`${approver.approverName}: ${approver.status}`}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">{getActions(bid)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBids.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#706e6b]">
              <svg className="h-12 w-12 text-[#e5e5e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-3 text-sm font-medium">No bids in this category</p>
              <Link
                href="/bids/new"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0176d3] hover:underline"
              >
                Create your first bid
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
