"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";

type FitStatus = "good" | "possible" | "cannot";
type RFQSource = "Platform" | "Email" | "Phone" | "Meeting" | "RFP" | "Other";

interface RFQ {
  _id: string;
  buyerInfo: {
    companyName: string;
    contactName?: string;
    contactEmail?: string;
    source: RFQSource;
  };
  volumeRequirements: {
    totalVolume: number;
    volumeUnit: "MT" | "gal";
    breakdown: Array<{
      year: number;
      volume: number;
      deliveryLocation: string;
    }>;
  };
  fuelSpecifications: {
    fuelType: "HEFA" | "AtJ" | "PtL" | "FT" | "Other";
    feedstock: string;
    minGHGReduction: number;
    astmD7566Required: boolean;
  };
  pricingStructure: {
    type: "Indexed" | "Fixed" | "Hybrid";
    priceIndex?: string;
    premiumDiscount?: number;
    currency: "USD" | "EUR" | "GBP";
    targetPrice?: number;
  };
  terms: {
    incoterms: string;
    paymentTerms: string;
    responseDeadline: string;
    requiredCertifications: string[];
  };
  status: "open" | "watching" | "closed" | "draft";
  producerId?: string;
  createdAt: string;
  isWatching?: boolean;
}

type TabType = "open" | "watching" | "my-rfqs" | "closed";

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("open");
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFit, setSelectedFit] = useState<FitStatus[]>(["good", "possible"]);
  const [selectedYears, setSelectedYears] = useState<string[]>(["2025", "2026", "2027"]);
  const [selectedSources, setSelectedSources] = useState<RFQSource[]>(["Platform", "Email", "Phone", "Meeting", "RFP", "Other"]);
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 100000]);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  const fetchRFQs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rfqs");
      if (!response.ok) {
        throw new Error("Failed to fetch RFQs");
      }
      const data = await response.json();
      setRfqs(data.rfqs || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching RFQs:", err);
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRFQs();
  }, [fetchRFQs]);

  // Calculate fit status based on producer capabilities (simplified)
  const calculateFitStatus = (rfq: RFQ): FitStatus => {
    // For now, use a simplified logic
    // In a real app, this would compare against producer's plants and capacity
    const volume = rfq.volumeRequirements.totalVolume;
    const ghgReduction = rfq.fuelSpecifications.minGHGReduction;

    if (volume > 20000 || ghgReduction > 75) {
      return "cannot";
    }
    if (volume > 10000 || ghgReduction > 70) {
      return "possible";
    }
    return "good";
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string): number => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get delivery years from breakdown
  const getDeliveryYears = (breakdown: RFQ["volumeRequirements"]["breakdown"]): string => {
    if (!breakdown || breakdown.length === 0) return "TBD";
    const years = [...new Set(breakdown.map((b) => b.year))].sort();
    if (years.length === 1) return years[0].toString();
    return `${years[0]}-${years[years.length - 1]}`;
  };

  // Get locations from breakdown
  const getLocations = (breakdown: RFQ["volumeRequirements"]["breakdown"]): string[] => {
    if (!breakdown) return [];
    return [...new Set(breakdown.map((b) => b.deliveryLocation))];
  };

  const toggleWatch = (id: string) => {
    setWatchedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFitFilter = (fit: FitStatus) => {
    setSelectedFit((prev) =>
      prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]
    );
  };

  const filteredRFQs = useMemo(() => {
    let filtered = rfqs.map((rfq) => ({
      ...rfq,
      fitStatus: calculateFitStatus(rfq),
      closesIn: getDaysUntilDeadline(rfq.terms.responseDeadline),
      isWatching: watchedIds.has(rfq._id),
    }));

    // Tab filter
    if (activeTab === "watching") {
      filtered = filtered.filter((rfq) => rfq.isWatching);
    } else if (activeTab === "my-rfqs") {
      filtered = filtered.filter((rfq) => rfq.producerId);
    } else if (activeTab === "closed") {
      filtered = filtered.filter((rfq) => rfq.status === "closed" || rfq.closesIn <= 0);
    } else {
      filtered = filtered.filter((rfq) => rfq.status === "open" && rfq.closesIn > 0);
    }

    // Fit status filter
    filtered = filtered.filter((rfq) => selectedFit.includes(rfq.fitStatus));

    // Source filter
    filtered = filtered.filter((rfq) => selectedSources.includes(rfq.buyerInfo.source));

    // Volume filter
    filtered = filtered.filter(
      (rfq) =>
        rfq.volumeRequirements.totalVolume >= volumeRange[0] &&
        rfq.volumeRequirements.totalVolume <= volumeRange[1]
    );

    // Year filter
    filtered = filtered.filter((rfq) => {
      const years = rfq.volumeRequirements.breakdown?.map((b) => b.year.toString()) || [];
      return years.some((y) => selectedYears.includes(y) || selectedYears.includes("2028+"));
    });

    return filtered;
  }, [rfqs, activeTab, selectedFit, selectedSources, volumeRange, selectedYears, watchedIds]);

  const getFitBadge = (fit: FitStatus) => {
    switch (fit) {
      case "good":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-1 text-xs font-semibold text-[#2e844a]">
            <span className="h-2 w-2 rounded-full bg-[#2e844a]" />
            Good Fit
          </span>
        );
      case "possible":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3e0] px-2.5 py-1 text-xs font-semibold text-[#e65100]">
            <span className="h-2 w-2 rounded-full bg-[#ff9800]" />
            Possible
          </span>
        );
      case "cannot":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ffebee] px-2.5 py-1 text-xs font-semibold text-[#c23934]">
            <span className="h-2 w-2 rounded-full bg-[#c23934]" />
            Cannot Fulfill
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading opportunities...</p>
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
          <h3 className="text-lg font-semibold text-[#181818]">Failed to load opportunities</h3>
          <p className="mt-1 text-sm text-[#706e6b]">{error}</p>
          <button
            onClick={fetchRFQs}
            className="mt-4 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const openCount = rfqs.filter((r) => r.status === "open" && getDaysUntilDeadline(r.terms.responseDeadline) > 0).length;
  const watchingCount = watchedIds.size;
  const myRfqsCount = rfqs.filter((r) => r.producerId).length;
  const closedCount = rfqs.filter((r) => r.status === "closed" || getDaysUntilDeadline(r.terms.responseDeadline) <= 0).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#181818]">Opportunities</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Find and evaluate RFQs, decide what to bid on
            </p>
          </div>
          <Link
            href="/opportunities/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create RFQ
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#e5e5e5]">
          {(
            [
              { id: "open", label: "Open", count: openCount },
              { id: "watching", label: "Watching", count: watchingCount },
              { id: "my-rfqs", label: "My RFQs", count: myRfqsCount },
              { id: "closed", label: "Closed", count: closedCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-[#0176d3]"
                  : "text-[#706e6b] hover:text-[#181818]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 rounded-full bg-[#f3f2f2] px-2 py-0.5 text-xs">
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

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#181818]">Filters</h3>

              {/* Delivery Year */}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                  Delivery Year
                </p>
                <div className="mt-2 space-y-2">
                  {["2025", "2026", "2027", "2028+"].map((year) => (
                    <label key={year} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year)}
                        onChange={() =>
                          setSelectedYears((prev) =>
                            prev.includes(year)
                              ? prev.filter((y) => y !== year)
                              : [...prev, year]
                          )
                        }
                        className="h-4 w-4 rounded border-[#c9c9c9] text-[#0176d3] focus:ring-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">{year}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Volume Range */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                  Volume Range
                </p>
                <p className="mt-1 text-sm text-[#181818]">
                  {volumeRange[0].toLocaleString()} - {volumeRange[1].toLocaleString()}t
                </p>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={5000}
                  value={volumeRange[1]}
                  onChange={(e) =>
                    setVolumeRange([volumeRange[0], Number(e.target.value)])
                  }
                  className="mt-2 w-full"
                />
              </div>

              {/* Fit Status */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                  Fit Status
                </p>
                <div className="mt-2 space-y-2">
                  {(
                    [
                      { id: "good", label: "🟢 Good fit" },
                      { id: "possible", label: "🟡 Possible" },
                      { id: "cannot", label: "🔴 Cannot fulfill" },
                    ] as const
                  ).map((fit) => (
                    <label key={fit.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFit.includes(fit.id)}
                        onChange={() => toggleFitFilter(fit.id)}
                        className="h-4 w-4 rounded border-[#c9c9c9] text-[#0176d3] focus:ring-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">{fit.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                  Source
                </p>
                <div className="mt-2 space-y-2">
                  {(["Platform", "Email", "Phone", "Meeting"] as const).map((source) => (
                    <label key={source} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source)}
                        onChange={() =>
                          setSelectedSources((prev) =>
                            prev.includes(source)
                              ? prev.filter((s) => s !== source)
                              : [...prev, source]
                          )
                        }
                        className="h-4 w-4 rounded border-[#c9c9c9] text-[#0176d3] focus:ring-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFit(["good", "possible"]);
                  setSelectedYears(["2025", "2026", "2027"]);
                  setSelectedSources(["Platform", "Email", "Phone", "Meeting", "RFP", "Other"]);
                  setVolumeRange([0, 100000]);
                }}
                className="mt-6 w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm font-medium text-[#706e6b] hover:bg-[#f3f2f2]"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* RFQ List */}
        <div className="flex-1">
          {rfqs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
                <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#181818]">No opportunities yet</h3>
              <p className="mt-1 text-sm text-[#706e6b]">
                Create your first RFQ to start tracking opportunities
              </p>
              <Link
                href="/opportunities/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create RFQ
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#e5e5e5] bg-[#f8f9fa]">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Buyer</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Volume</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Delivery</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Location</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Closes In</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Fit</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredRFQs.map((rfq) => (
                    <tr key={rfq._id} className="group transition-colors hover:bg-[#f8f9fa]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleWatch(rfq._id)}
                            className={`text-lg ${rfq.isWatching ? "text-[#ff9800]" : "text-[#c9c9c9] hover:text-[#ff9800]"}`}
                          >
                            {rfq.isWatching ? "★" : "☆"}
                          </button>
                          <div>
                            <p className="font-semibold text-[#181818]">{rfq.buyerInfo.companyName}</p>
                            {rfq.producerId && (
                              <span className="text-xs text-[#706e6b]">Manual entry</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#181818]">
                        {rfq.volumeRequirements.totalVolume.toLocaleString()}
                        {rfq.volumeRequirements.volumeUnit === "MT" ? "t" : " gal"}
                      </td>
                      <td className="px-4 py-4 text-[#181818]">
                        {getDeliveryYears(rfq.volumeRequirements.breakdown)}
                      </td>
                      <td className="px-4 py-4 text-[#181818]">
                        {getLocations(rfq.volumeRequirements.breakdown).join(", ") || "TBD"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold ${
                            rfq.closesIn <= 5
                              ? "text-[#c23934]"
                              : rfq.closesIn <= 10
                              ? "text-[#ff9800]"
                              : "text-[#181818]"
                          }`}
                        >
                          {rfq.closesIn > 0 ? `${rfq.closesIn} days` : "Closed"}
                        </span>
                      </td>
                      <td className="px-4 py-4">{getFitBadge(rfq.fitStatus)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/opportunities/${rfq._id}`}
                            className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2] hover:text-[#181818]"
                          >
                            View
                          </Link>
                          {rfq.fitStatus !== "cannot" && rfq.closesIn > 0 && (
                            <Link
                              href={`/bids/new?rfq=${rfq._id}`}
                              className="rounded-lg bg-[#0176d3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#014486]"
                            >
                              Bid
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRFQs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-[#706e6b]">
                  <svg className="h-12 w-12 text-[#e5e5e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-3 text-sm font-medium">No opportunities match your filters</p>
                  <p className="mt-1 text-xs">Try adjusting your filter criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
