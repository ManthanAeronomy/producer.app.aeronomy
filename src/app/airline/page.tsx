"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AirlineDashboardStats {
  procurement: {
    activeRFQs: number;
    bidsReceived: number;
    avgResponseTime: number;
  };
  lots: {
    liveCount: number;
    totalVolume: number;
    awaitingBids: number;
  };
  deals: {
    active: number;
    totalValue: number;
    pendingExecution: number;
  };
  inventory: {
    totalVolume: number;
    availableVolume: number;
    locations: number;
    expiringBatches: number;
  };
  compliance: {
    validCertificates: number;
    expiringCertificates: number;
    complianceRate: number;
  };
  claims: {
    submitted: number;
    approved: number;
    totalCredits: number;
    pendingReview: number;
  };
  deliveries: {
    scheduledThisMonth: number;
    completedThisMonth: number;
    pendingQualityCheck: number;
    overdueDeliveries: number;
  };
}

type TabType = "overview" | "procurement" | "lots" | "deals" | "inventory" | "compliance" | "claims" | "deliveries";

export default function AirlineDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<AirlineDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from API
    setStats({
      procurement: {
        activeRFQs: 12,
        bidsReceived: 45,
        avgResponseTime: 3.2,
      },
      lots: {
        liveCount: 8,
        totalVolume: 75000,
        awaitingBids: 3,
      },
      deals: {
        active: 15,
        totalValue: 125000000,
        pendingExecution: 4,
      },
      inventory: {
        totalVolume: 42500,
        availableVolume: 18200,
        locations: 6,
        expiringBatches: 2,
      },
      compliance: {
        validCertificates: 24,
        expiringCertificates: 3,
        complianceRate: 98.5,
      },
      claims: {
        submitted: 18,
        approved: 14,
        totalCredits: 25000,
        pendingReview: 4,
      },
      deliveries: {
        scheduledThisMonth: 22,
        completedThisMonth: 18,
        pendingQualityCheck: 3,
        overdueDeliveries: 1,
      },
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading airline dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "procurement", label: "Procurement", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "lots", label: "Lot Posting", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { id: "deals", label: "Deals", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "inventory", label: "Inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "compliance", label: "Compliance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { id: "claims", label: "Claims", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "deliveries", label: "Deliveries", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-gradient-to-r from-[#0176d3] to-[#014486] p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Airline SAF Operations Center</h1>
            <p className="mt-1 text-base text-white/90">
              Complete procurement, inventory, and compliance management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/airline/procurement/new"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#0176d3] shadow-sm transition-all hover:bg-[#f3f2f2]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New RFQ
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#0176d3] shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="grid gap-6">
          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Active RFQs</p>
                  <p className="mt-1 text-3xl font-bold text-[#181818]">{stats.procurement.activeRFQs}</p>
                  <p className="mt-1 text-xs text-[#706e6b]">{stats.procurement.bidsReceived} bids received</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0176d3]/10">
                  <svg className="h-6 w-6 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Live Lots</p>
                  <p className="mt-1 text-3xl font-bold text-[#181818]">{stats.lots.liveCount}</p>
                  <p className="mt-1 text-xs text-[#706e6b]">{stats.lots.totalVolume.toLocaleString()} MT posted</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2e844a]/10">
                  <svg className="h-6 w-6 text-[#2e844a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Active Deals</p>
                  <p className="mt-1 text-3xl font-bold text-[#181818]">{stats.deals.active}</p>
                  <p className="mt-1 text-xs text-[#706e6b]">{formatCurrency(stats.deals.totalValue)} value</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9c27b0]/10">
                  <svg className="h-6 w-6 text-[#9c27b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Inventory</p>
                  <p className="mt-1 text-3xl font-bold text-[#181818]">{stats.inventory.availableVolume.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-[#706e6b]">MT available • {stats.inventory.locations} locations</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff9800]/10">
                  <svg className="h-6 w-6 text-[#ff9800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Procurement Actions */}
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#181818]">Procurement Actions</h2>
                <Link href="/airline/procurement" className="text-sm font-medium text-[#0176d3] hover:underline">
                  View All →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#c23934]" />
                    <span className="text-sm font-medium text-[#181818]">3 RFQs closing in 48 hours</span>
                  </div>
                  <svg className="h-4 w-4 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#ff9800]" />
                    <span className="text-sm font-medium text-[#181818]">12 new bids to review</span>
                  </div>
                  <svg className="h-4 w-4 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#0176d3]" />
                    <span className="text-sm font-medium text-[#181818]">4 deals pending execution</span>
                  </div>
                  <svg className="h-4 w-4 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Inventory & Deliveries */}
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#181818]">Inventory & Deliveries</h2>
                <Link href="/airline/inventory" className="text-sm font-medium text-[#0176d3] hover:underline">
                  View All →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {stats.inventory.expiringBatches > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-[#ff9800]/30 bg-[#fff8e1] p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#ff9800]" />
                      <span className="text-sm font-medium text-[#181818]">{stats.inventory.expiringBatches} batches expiring soon</span>
                    </div>
                    <svg className="h-4 w-4 text-[#e65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#0176d3]" />
                    <span className="text-sm font-medium text-[#181818]">{stats.deliveries.scheduledThisMonth} deliveries scheduled this month</span>
                  </div>
                  <svg className="h-4 w-4 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {stats.deliveries.pendingQualityCheck > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#ff9800]" />
                      <span className="text-sm font-medium text-[#181818]">{stats.deliveries.pendingQualityCheck} pending quality check</span>
                    </div>
                    <svg className="h-4 w-4 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#181818]">Compliance Status</h2>
                <Link href="/airline/compliance" className="text-sm font-medium text-[#0176d3] hover:underline">
                  View All →
                </Link>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#706e6b]">Overall Compliance Rate</span>
                  <span className="text-2xl font-bold text-[#2e844a]">{stats.compliance.complianceRate}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e5e5e5]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2e844a] to-[#4caf50]"
                    style={{ width: `${stats.compliance.complianceRate}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3 text-center">
                    <p className="text-2xl font-bold text-[#2e844a]">{stats.compliance.validCertificates}</p>
                    <p className="text-xs text-[#706e6b]">Valid Certificates</p>
                  </div>
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-3 text-center">
                    <p className="text-2xl font-bold text-[#ff9800]">{stats.compliance.expiringCertificates}</p>
                    <p className="text-xs text-[#706e6b]">Expiring Soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Claims & Credits */}
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#181818]">Claims & Credits</h2>
                <Link href="/airline/claims" className="text-sm font-medium text-[#0176d3] hover:underline">
                  View All →
                </Link>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#706e6b]">Total Credits Generated</span>
                  <span className="text-2xl font-bold text-[#0176d3]">{stats.claims.totalCredits.toLocaleString()}</span>
                </div>
                <p className="mt-1 text-xs text-[#706e6b]">MT CO2e avoided</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-2 text-center">
                    <p className="text-xl font-bold text-[#181818]">{stats.claims.submitted}</p>
                    <p className="text-xs text-[#706e6b]">Submitted</p>
                  </div>
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-2 text-center">
                    <p className="text-xl font-bold text-[#2e844a]">{stats.claims.approved}</p>
                    <p className="text-xs text-[#706e6b]">Approved</p>
                  </div>
                  <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-2 text-center">
                    <p className="text-xl font-bold text-[#ff9800]">{stats.claims.pendingReview}</p>
                    <p className="text-xs text-[#706e6b]">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs - Placeholder for now */}
      {activeTab !== "overview" && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0176d3]/10">
            <svg className="h-8 w-8 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#181818]">
            {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <p className="mt-2 text-sm text-[#706e6b]">
            This section is under construction. Check back soon!
          </p>
          <Link
            href={`/airline/${activeTab}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            Go to {tabs.find(t => t.id === activeTab)?.label} Module →
          </Link>
        </div>
      )}
    </div>
  );
}












