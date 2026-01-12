"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AirportMap } from "@/components/airport-map";

interface DashboardStats {
  actionRequired: {
    rfqsClosingSoon: number;
    bidsAwaitingApproval: number;
    certificatesExpiringSoon: number;
    deliveriesDueThisWeek: number;
    unallocatedBatches: number;
  };
  thisMonth: {
    scheduledDeliveries: number;
    scheduledVolume: number;
    productionVolume: number;
  };
  capacityStatus: {
    totalAnnualCapacity: number;
    commitmentsByYear: Record<number, number>;
    pendingBidsByYear: Record<number, number>;
  };
  pipeline: {
    openRFQs: number;
    bidsInProgress: number;
    bidsSubmitted: number;
    bidsAwaitingDecision: number;
    submittedBidsCount: number;
  };
  contractHealth: {
    activeContracts: number;
    atRiskContracts: number;
    onTrackContracts: number;
    totalContractValue: number;
    nextDeliveries: Array<{
      counterparty: string;
      date: string;
      volume: number;
    }>;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllActions, setShowAllActions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Build action items from stats
  const actionItems = stats
    ? [
      stats.actionRequired.rfqsClosingSoon > 0 && {
        label: `${stats.actionRequired.rfqsClosingSoon} RFQs closing in 7 days`,
        href: "/opportunities",
        type: "urgent",
      },
      stats.actionRequired.bidsAwaitingApproval > 0 && {
        label: `${stats.actionRequired.bidsAwaitingApproval} Bids awaiting your approval`,
        href: "/bids?tab=pending",
        type: "warning",
      },
      stats.actionRequired.certificatesExpiringSoon > 0 && {
        label: `${stats.actionRequired.certificatesExpiringSoon} Certificate${stats.actionRequired.certificatesExpiringSoon > 1 ? "s" : ""} expiring in 30 days`,
        href: "/compliance",
        type: "warning",
      },
      stats.actionRequired.deliveriesDueThisWeek > 0 && {
        label: `${stats.actionRequired.deliveriesDueThisWeek} Deliveries due this week`,
        href: "/contracts",
        type: "info",
      },
      stats.actionRequired.unallocatedBatches > 0 && {
        label: `${stats.actionRequired.unallocatedBatches} Unallocated production batches`,
        href: "/production",
        type: "info",
      },
    ].filter(Boolean) as Array<{ label: string; href: string; type: string }>
    : [];

  const visibleActions = showAllActions ? actionItems : actionItems.slice(0, 4);

  // Calculate capacity data
  const currentYear = new Date().getFullYear();
  const capacityData = stats
    ? [currentYear, currentYear + 1, currentYear + 2].map((year) => {
      const committed = stats.capacityStatus.commitmentsByYear[year] || 0;
      const pending = stats.capacityStatus.pendingBidsByYear[year] || 0;
      const total = stats.capacityStatus.totalAnnualCapacity || 50000;
      const committedPercent = Math.round((committed / total) * 100);
      const available = total - committed;
      return { year, committed: committedPercent, available, pending };
    })
    : [];

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    return `€${value.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading dashboard...</p>
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
          <h3 className="text-lg font-semibold text-[#181818]">Failed to load dashboard</h3>
          <p className="mt-1 text-sm text-[#706e6b]">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const productionPercentage =
    stats && stats.thisMonth.scheduledVolume > 0
      ? Math.round((stats.thisMonth.productionVolume / stats.thisMonth.scheduledVolume) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#181818]">Home</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Daily command center — see what needs attention, take action
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#706e6b]">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchStats}
              className="rounded-lg p-2 text-[#706e6b] hover:bg-[#f3f2f2] hover:text-[#181818]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/opportunities/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create RFQ
          </Link>
          <Link
            href="/production?action=log"
            className="inline-flex items-center gap-2 rounded-lg border border-[#0176d3] bg-white px-4 py-2.5 text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Production
          </Link>
          <Link
            href="/compliance?action=upload"
            className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-semibold text-[#181818] transition-all hover:bg-[#f3f2f2]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Certificate
          </Link>
        </div>
      </div>

      {/* Global SAF Activity Map - Full width */}
      <AirportMap />

      {/* Widget Grid - 2 columns on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Widget 1: Action Required */}
        <div className="rounded-xl border-2 border-[#ff9800]/30 bg-gradient-to-br from-[#fff8e1] to-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff9800]/20">
              <svg className="h-5 w-5 text-[#e65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#181818]">Action Required</h2>
          </div>
          {actionItems.length === 0 ? (
            <div className="mt-4 rounded-lg border border-[#e5e5e5] bg-white px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5e9]">
                <svg className="h-6 w-6 text-[#2e844a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#181818]">All caught up!</p>
              <p className="mt-1 text-xs text-[#706e6b]">No urgent actions required</p>
            </div>
          ) : (
            <>
              <ul className="mt-4 space-y-2">
                {visibleActions.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 transition-all hover:border-[#0176d3] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${item.type === "urgent"
                            ? "bg-[#c23934]"
                            : item.type === "warning"
                              ? "bg-[#ff9800]"
                              : item.type === "success"
                                ? "bg-[#2e844a]"
                                : "bg-[#0176d3]"
                            }`}
                        />
                        <span className="text-sm font-medium text-[#181818]">{item.label}</span>
                      </div>
                      <svg className="h-4 w-4 text-[#706e6b] transition-transform group-hover:translate-x-1 group-hover:text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              {actionItems.length > 4 && (
                <button
                  onClick={() => setShowAllActions(!showAllActions)}
                  className="mt-3 text-sm font-medium text-[#0176d3] hover:underline"
                >
                  {showAllActions ? "Show less" : `Show ${actionItems.length - 4} more`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Widget 2: This Month */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0176d3]/10">
              <svg className="h-5 w-5 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#181818]">This Month</h2>
          </div>
          <dl className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-[#706e6b]">Scheduled Deliveries</dt>
              <dd className="text-sm font-semibold text-[#181818]">
                {stats?.thisMonth.scheduledDeliveries || 0} deliveries ({(stats?.thisMonth.scheduledVolume || 0).toLocaleString()} tonnes)
              </dd>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-[#706e6b]">Production vs Target</dt>
                <dd className="text-sm font-semibold text-[#181818]">
                  {(stats?.thisMonth.productionVolume || 0).toLocaleString()} / {(stats?.thisMonth.scheduledVolume || 0).toLocaleString()} tonnes ({productionPercentage}%)
                </dd>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e5e5e5]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0176d3] to-[#2e844a] transition-all"
                  style={{ width: `${Math.min(productionPercentage, 100)}%` }}
                />
              </div>
            </div>
          </dl>
        </div>

        {/* Widget 3: Capacity Status */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9c27b0]/10">
                <svg className="h-5 w-5 text-[#9c27b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#181818]">Capacity Status</h2>
            </div>
            <Link href="/production?tab=capacity" className="text-sm font-medium text-[#0176d3] hover:underline">
              View Details →
            </Link>
          </div>
          <p className="mt-2 text-sm text-[#706e6b]">
            Total Annual Capacity:{" "}
            <span className="font-semibold text-[#181818]">
              {(stats?.capacityStatus.totalAnnualCapacity || 0).toLocaleString()} tonnes
            </span>
          </p>
          <div className="mt-4 space-y-3">
            {capacityData.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#e5e5e5] bg-[#f8f9fa] px-4 py-6 text-center">
                <p className="text-sm text-[#706e6b]">No capacity data available</p>
                <Link href="/plants/new" className="mt-2 inline-block text-sm font-medium text-[#0176d3] hover:underline">
                  Add a plant to get started →
                </Link>
              </div>
            ) : (
              capacityData.map((year) => (
                <div key={year.year}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#181818]">{year.year}</span>
                    <span className="text-[#706e6b]">
                      {year.committed}% committed •{" "}
                      <span className="font-semibold text-[#2e844a]">{year.available.toLocaleString()} available</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#e5e5e5]">
                    <div
                      className={`h-full rounded-full transition-all ${year.committed >= 80 ? "bg-[#c23934]" : year.committed >= 60 ? "bg-[#ff9800]" : "bg-[#0176d3]"
                        }`}
                      style={{ width: `${year.committed}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {capacityData.some((y) => y.pending > 0) && (
            <div className="mt-4 rounded-lg border border-[#ff9800]/30 bg-[#fff8e1] px-3 py-2">
              <p className="text-xs text-[#e65100]">
                ⚠️ Pending bids:{" "}
                {capacityData
                  .filter((y) => y.pending > 0)
                  .map((y) => `${y.pending.toLocaleString()}t in ${y.year}`)
                  .join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Widget 4: Pipeline */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2e844a]/10">
                <svg className="h-5 w-5 text-[#2e844a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#181818]">Pipeline</h2>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <Link href="/opportunities" className="group rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4 transition-all hover:border-[#0176d3] hover:shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Open RFQs</dt>
              <dd className="mt-1 text-2xl font-bold text-[#181818] group-hover:text-[#0176d3]">{stats?.pipeline.openRFQs || 0}</dd>
            </Link>
            <Link href="/bids?tab=draft" className="group rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4 transition-all hover:border-[#0176d3] hover:shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Bids in Progress</dt>
              <dd className="mt-1 text-2xl font-bold text-[#181818] group-hover:text-[#0176d3]">{stats?.pipeline.bidsInProgress || 0}</dd>
            </Link>
            <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Bids Submitted</dt>
              <dd className="mt-1 text-2xl font-bold text-[#181818]">{stats?.pipeline.bidsSubmitted || 0}</dd>
            </div>
            <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Awaiting Decision</dt>
              <dd className="mt-1 text-2xl font-bold text-[#ff9800]">{stats?.pipeline.bidsAwaitingDecision || 0}</dd>
            </div>
          </dl>
        </div>

        {/* Widget 5: Contract Health - Full width */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0176d3]/10">
                <svg className="h-5 w-5 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#181818]">Contract Health</h2>
            </div>
            <Link href="/contracts" className="text-sm font-medium text-[#0176d3] hover:underline">
              View All Contracts →
            </Link>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            {/* Summary Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] px-4 py-3">
                <span className="text-sm text-[#706e6b]">Active Contracts</span>
                <span className="text-lg font-bold text-[#181818]">{stats?.contractHealth.activeContracts || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] px-4 py-3">
                <span className="text-sm text-[#706e6b]">Total Value</span>
                <span className="text-lg font-bold text-[#181818]">{formatCurrency(stats?.contractHealth.totalContractValue || 0)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f5e9] text-xs font-bold text-[#2e844a]">
                    {stats?.contractHealth.onTrackContracts || 0}
                  </span>
                  <span className="text-sm text-[#706e6b]">On Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff3e0] text-xs font-bold text-[#e65100]">
                    {stats?.contractHealth.atRiskContracts || 0}
                  </span>
                  <span className="text-sm text-[#706e6b]">At Risk</span>
                </div>
              </div>
            </div>

            {/* Next Deliveries */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-[#706e6b]">Next Deliveries</h3>
              {!stats?.contractHealth.nextDeliveries?.length ? (
                <div className="mt-2 rounded-lg border border-dashed border-[#e5e5e5] bg-[#f8f9fa] px-4 py-6 text-center">
                  <p className="text-sm text-[#706e6b]">No upcoming deliveries</p>
                  <Link href="/contracts/new" className="mt-2 inline-block text-sm font-medium text-[#0176d3] hover:underline">
                    Create a contract to schedule deliveries →
                  </Link>
                </div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {stats.contractHealth.nextDeliveries.map((delivery, index) => (
                    <li key={index} className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#0176d3]">{formatDate(delivery.date)}</span>
                        <span className="text-sm text-[#181818]">{delivery.counterparty}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#181818]">{delivery.volume.toLocaleString()}t</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
