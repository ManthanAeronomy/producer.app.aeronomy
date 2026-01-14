"use client";

import { useState } from "react";
import Link from "next/link";

type DealStatus = "draft" | "pending" | "executed" | "active" | "completed" | "terminated";

interface Deal {
  id: string;
  dealNumber: string;
  producerName: string;
  lotName: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  agreedPrice: number;
  currency: "USD" | "EUR" | "GBP";
  totalValue: number;
  carbonIntensity: number;
  deliveryLocation: string;
  deliveryWindow: string;
  contractStartDate: string;
  contractEndDate?: string;
  status: DealStatus;
  deliveredVolume: number;
  milestones: {
    description: string;
    dueDate: string;
    status: "pending" | "completed" | "overdue";
  }[];
  createdAt: string;
}

const initialDeals: Deal[] = [
  {
    id: "deal-001",
    dealNumber: "DEAL-2025-001",
    producerName: "GreenSky Bio Fuels",
    lotName: "JFK Q4 2025 Supply",
    volume: 18000,
    volumeUnit: "MT",
    agreedPrice: 2120,
    currency: "USD",
    totalValue: 38160000,
    carbonIntensity: 23,
    deliveryLocation: "JFK, New York",
    deliveryWindow: "Oct - Dec 2025",
    contractStartDate: "2025-01-15",
    contractEndDate: "2025-12-31",
    status: "active",
    deliveredVolume: 4500,
    milestones: [
      { description: "Contract execution", dueDate: "2025-01-15", status: "completed" },
      { description: "First delivery", dueDate: "2025-10-01", status: "pending" },
      { description: "Quality certification", dueDate: "2025-09-15", status: "pending" },
    ],
    createdAt: "2025-01-10",
  },
  {
    id: "deal-002",
    dealNumber: "DEAL-2025-002",
    producerName: "BlueHarmony SAF",
    lotName: "LHR EU Mandate Supply",
    volume: 22000,
    volumeUnit: "MT",
    agreedPrice: 2260,
    currency: "EUR",
    totalValue: 49720000,
    carbonIntensity: 21,
    deliveryLocation: "LHR, London",
    deliveryWindow: "Jan - Mar 2026",
    contractStartDate: "2026-01-01",
    contractEndDate: "2026-03-31",
    status: "executed",
    deliveredVolume: 0,
    milestones: [
      { description: "Final contract review", dueDate: "2025-12-20", status: "pending" },
      { description: "Payment terms finalized", dueDate: "2025-12-25", status: "pending" },
      { description: "Delivery schedule confirmed", dueDate: "2025-12-15", status: "overdue" },
    ],
    createdAt: "2024-12-05",
  },
  {
    id: "deal-003",
    dealNumber: "DEAL-2024-045",
    producerName: "Aurora Renewables",
    lotName: "APAC Regional Supply",
    volume: 9500,
    volumeUnit: "MT",
    agreedPrice: 2050,
    currency: "USD",
    totalValue: 19475000,
    carbonIntensity: 26,
    deliveryLocation: "SIN, Singapore",
    deliveryWindow: "Mar - May 2025",
    contractStartDate: "2025-03-01",
    contractEndDate: "2025-05-31",
    status: "pending",
    deliveredVolume: 0,
    milestones: [
      { description: "Due diligence completion", dueDate: "2025-01-20", status: "pending" },
      { description: "Legal review", dueDate: "2025-01-25", status: "pending" },
    ],
    createdAt: "2024-12-20",
  },
  {
    id: "deal-004",
    dealNumber: "DEAL-2024-038",
    producerName: "Neste SAF",
    lotName: "West Coast Q3 2024",
    volume: 12000,
    volumeUnit: "MT",
    agreedPrice: 2080,
    currency: "USD",
    totalValue: 24960000,
    carbonIntensity: 22,
    deliveryLocation: "LAX, Los Angeles",
    deliveryWindow: "Jul - Sep 2024",
    contractStartDate: "2024-07-01",
    contractEndDate: "2024-09-30",
    status: "completed",
    deliveredVolume: 12000,
    milestones: [
      { description: "Contract execution", dueDate: "2024-06-15", status: "completed" },
      { description: "First delivery", dueDate: "2024-07-01", status: "completed" },
      { description: "Final delivery", dueDate: "2024-09-30", status: "completed" },
      { description: "Final payment", dueDate: "2024-10-15", status: "completed" },
    ],
    createdAt: "2024-06-10",
  },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [filter, setFilter] = useState<DealStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDeals = deals.filter((deal) => {
    const matchesFilter = filter === "all" || deal.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      deal.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.dealNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.lotName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    active: deals.filter((d) => d.status === "active").length,
    pending: deals.filter((d) => d.status === "pending").length,
    executed: deals.filter((d) => d.status === "executed").length,
    completed: deals.filter((d) => d.status === "completed").length,
    totalValue: deals
      .filter((d) => d.status === "active" || d.status === "executed")
      .reduce((sum, d) => sum + d.totalValue, 0),
  };

  const getStatusBadge = (status: DealStatus) => {
    const styles = {
      draft: "bg-[#e5e5e5] text-[#706e6b]",
      pending: "bg-[#fff3e0] text-[#e65100]",
      executed: "bg-[#e8f5e9] text-[#2e844a]",
      active: "bg-[#e3f2fd] text-[#0176d3]",
      completed: "bg-[#f3e5f5] text-[#9c27b0]",
      terminated: "bg-[#ffebee] text-[#c23934]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMilestoneStatusBadge = (status: "pending" | "completed" | "overdue") => {
    const styles = {
      pending: "bg-[#fff3e0] text-[#e65100]",
      completed: "bg-[#e8f5e9] text-[#2e844a]",
      overdue: "bg-[#ffebee] text-[#c23934]",
    };
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (value: number, currency: string) => {
    const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    return `${symbol}${value.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Deal Management</p>
            <h1 className="text-3xl font-bold text-[#181818]">SAF Supply Deals</h1>
            <p className="mt-1 text-base text-[#706e6b]">Track and manage all SAF procurement deals</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Active Deals</p>
          <p className="mt-2 text-3xl font-bold text-[#0176d3]">{stats.active}</p>
          <p className="text-sm text-[#706e6b]">Currently delivering</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Pending</p>
          <p className="mt-2 text-3xl font-bold text-[#ff9800]">{stats.pending}</p>
          <p className="text-sm text-[#706e6b]">Awaiting execution</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Executed</p>
          <p className="mt-2 text-3xl font-bold text-[#2e844a]">{stats.executed}</p>
          <p className="text-sm text-[#706e6b]">Ready to deliver</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Completed</p>
          <p className="mt-2 text-3xl font-bold text-[#9c27b0]">{stats.completed}</p>
          <p className="text-sm text-[#706e6b]">Finalized</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Total Value</p>
          <p className="mt-2 text-3xl font-bold text-[#181818]">
            {formatCurrency(stats.totalValue, "USD")}
          </p>
          <p className="text-sm text-[#706e6b]">Active + Executed</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "executed", "active", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  filter === status
                    ? "bg-[#0176d3] text-white shadow-sm"
                    : "border border-[#e5e5e5] text-[#706e6b] hover:bg-[#f3f2f2]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[#c9c9c9] py-2 pl-10 pr-4 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20 lg:w-64"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-[#706e6b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No deals found</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            {searchTerm ? "Try adjusting your search or filters" : "No deals match the current filter"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDeals.map((deal) => {
            const deliveryProgress =
              deal.volume > 0 ? Math.round((deal.deliveredVolume / deal.volume) * 100) : 0;
            const overdueMilestones = deal.milestones.filter((m) => m.status === "overdue").length;

            return (
              <div
                key={deal.id}
                className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#0176d3]">{deal.dealNumber}</span>
                      {getStatusBadge(deal.status)}
                      {overdueMilestones > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ffebee] px-2.5 py-1 text-xs font-semibold text-[#c23934]">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {overdueMilestones} overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#181818]">{deal.producerName}</h3>
                      <span className="text-[#706e6b]">•</span>
                      <span className="text-sm text-[#706e6b]">{deal.lotName}</span>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-5">
                      <div>
                        <p className="text-xs text-[#706e6b]">Volume</p>
                        <p className="font-semibold text-[#181818]">
                          {deal.volume.toLocaleString()} {deal.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Price</p>
                        <p className="font-semibold text-[#181818]">
                          {deal.currency} {deal.agreedPrice.toLocaleString()}/{deal.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Total Value</p>
                        <p className="font-semibold text-[#181818]">
                          {formatCurrency(deal.totalValue, deal.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">CI Score</p>
                        <p className="font-semibold text-[#2e844a]">{deal.carbonIntensity} gCO₂e/MJ</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Delivery</p>
                        <p className="font-semibold text-[#181818]">{deal.deliveryLocation}</p>
                      </div>
                    </div>

                    {deal.status === "active" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#706e6b]">Delivery Progress</span>
                          <span className="font-semibold text-[#181818]">
                            {deal.deliveredVolume.toLocaleString()} / {deal.volume.toLocaleString()} {deal.volumeUnit} ({deliveryProgress}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#e5e5e5]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0176d3] to-[#2e844a]"
                            style={{ width: `${deliveryProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {deal.milestones.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                          Milestones
                        </p>
                        <div className="mt-2 space-y-2">
                          {deal.milestones.slice(0, 3).map((milestone, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                {milestone.status === "completed" ? (
                                  <svg className="h-4 w-4 text-[#2e844a]" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className={`h-4 w-4 ${
                                      milestone.status === "overdue" ? "text-[#c23934]" : "text-[#706e6b]"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                <span className="text-[#181818]">{milestone.description}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#706e6b]">{formatDate(milestone.dueDate)}</span>
                                {getMilestoneStatusBadge(milestone.status)}
                              </div>
                            </div>
                          ))}
                          {deal.milestones.length > 3 && (
                            <p className="text-xs text-[#706e6b]">
                              + {deal.milestones.length - 3} more milestones
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-sm text-[#706e6b]">
                      <span>Contract: {formatDate(deal.contractStartDate)}</span>
                      {deal.contractEndDate && (
                        <>
                          <span>→</span>
                          <span>{formatDate(deal.contractEndDate)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href={`/airline/deals/${deal.id}`}
                      className="rounded-lg border border-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
                    >
                      View Details
                    </Link>
                    {deal.status === "active" && (
                      <Link
                        href={`/airline/deliveries?deal=${deal.id}`}
                        className="rounded-lg bg-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#014486]"
                      >
                        Track Deliveries
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}












