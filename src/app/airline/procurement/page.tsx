"use client";

import { useState } from "react";
import Link from "next/link";

type RFQStatus = "draft" | "open" | "closed" | "awarded" | "cancelled";

interface RFQItem {
  id: string;
  rfqNumber: string;
  title: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  targetPrice: number;
  currency: "USD" | "EUR" | "GBP";
  deliveryLocation: string;
  deliveryWindow: string;
  ciTarget: number;
  certificationRequirements: string[];
  bidsReceived: number;
  closingDate: string;
  status: RFQStatus;
  createdAt: string;
}

const initialRFQs: RFQItem[] = [
  {
    id: "rfq-001",
    rfqNumber: "RFQ-2025-001",
    title: "Transatlantic SAF Supply - Q2 2025",
    volume: 15000,
    volumeUnit: "MT",
    targetPrice: 2150,
    currency: "USD",
    deliveryLocation: "JFK, New York",
    deliveryWindow: "Apr - Jun 2025",
    ciTarget: 25,
    certificationRequirements: ["ISCC EU", "CORSIA"],
    bidsReceived: 8,
    closingDate: "2025-01-20",
    status: "open",
    createdAt: "2024-12-10",
  },
  {
    id: "rfq-002",
    rfqNumber: "RFQ-2025-002",
    title: "EU Mandate Compliance - LHR Hub",
    volume: 22000,
    volumeUnit: "MT",
    targetPrice: 2280,
    currency: "EUR",
    deliveryLocation: "LHR, London",
    deliveryWindow: "Jan - Mar 2026",
    ciTarget: 22,
    certificationRequirements: ["ISCC EU", "RED II"],
    bidsReceived: 12,
    closingDate: "2025-01-15",
    status: "open",
    createdAt: "2024-12-05",
  },
  {
    id: "rfq-003",
    rfqNumber: "RFQ-2024-045",
    title: "APAC Regional Supply",
    volume: 9500,
    volumeUnit: "MT",
    targetPrice: 2050,
    currency: "USD",
    deliveryLocation: "SIN, Singapore",
    deliveryWindow: "Mar - May 2025",
    ciTarget: 27,
    certificationRequirements: ["ISCC CORSIA", "RSB"],
    bidsReceived: 15,
    closingDate: "2024-12-20",
    status: "closed",
    createdAt: "2024-11-15",
  },
];

export default function ProcurementPage() {
  const [rfqs, setRFQs] = useState<RFQItem[]>(initialRFQs);
  const [filter, setFilter] = useState<RFQStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesFilter = filter === "all" || rfq.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    open: rfqs.filter((r) => r.status === "open").length,
    draft: rfqs.filter((r) => r.status === "draft").length,
    closed: rfqs.filter((r) => r.status === "closed").length,
    totalBids: rfqs.reduce((sum, r) => sum + r.bidsReceived, 0),
  };

  const getStatusBadge = (status: RFQStatus) => {
    const styles = {
      draft: "bg-[#e5e5e5] text-[#706e6b]",
      open: "bg-[#e8f5e9] text-[#2e844a]",
      closed: "bg-[#e3f2fd] text-[#0176d3]",
      awarded: "bg-[#f3e5f5] text-[#9c27b0]",
      cancelled: "bg-[#ffebee] text-[#c23934]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilClosing = (closingDate: string) => {
    const diff = new Date(closingDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Procurement</p>
            <h1 className="text-3xl font-bold text-[#181818]">Request for Quotations</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Manage your SAF procurement RFQs and tender processes
            </p>
          </div>
          <Link
            href="/airline/procurement/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create RFQ
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Open RFQs</p>
          <p className="mt-2 text-3xl font-bold text-[#2e844a]">{stats.open}</p>
          <p className="text-sm text-[#706e6b]">Active tenders</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Draft RFQs</p>
          <p className="mt-2 text-3xl font-bold text-[#706e6b]">{stats.draft}</p>
          <p className="text-sm text-[#706e6b]">Pending publication</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Total Bids</p>
          <p className="mt-2 text-3xl font-bold text-[#0176d3]">{stats.totalBids}</p>
          <p className="text-sm text-[#706e6b]">Across all RFQs</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Closed RFQs</p>
          <p className="mt-2 text-3xl font-bold text-[#181818]">{stats.closed}</p>
          <p className="text-sm text-[#706e6b]">Under evaluation</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "draft", "open", "closed", "awarded"] as const).map((status) => (
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
              placeholder="Search RFQs..."
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

      {/* RFQs List */}
      {filteredRFQs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No RFQs found</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            {searchTerm
              ? "Try adjusting your search or filters"
              : "Create your first RFQ to start procurement"}
          </p>
          {!searchTerm && (
            <Link
              href="/airline/procurement/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create RFQ
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRFQs.map((rfq) => {
            const daysUntilClosing = getDaysUntilClosing(rfq.closingDate);
            const isUrgent = daysUntilClosing <= 2 && rfq.status === "open";

            return (
              <div
                key={rfq.id}
                className={`rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  isUrgent
                    ? "border-[#ff9800]/50 bg-gradient-to-r from-[#fff8e1] to-white"
                    : "border-[#e5e5e5] bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#0176d3]">{rfq.rfqNumber}</span>
                      {getStatusBadge(rfq.status)}
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ff9800] px-2.5 py-1 text-xs font-semibold text-white">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Closes in {daysUntilClosing}d
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[#181818]">{rfq.title}</h3>

                    <div className="mt-3 grid gap-3 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-[#706e6b]">Volume</p>
                        <p className="font-semibold text-[#181818]">
                          {rfq.volume.toLocaleString()} {rfq.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Target Price</p>
                        <p className="font-semibold text-[#181818]">
                          {rfq.currency} {rfq.targetPrice.toLocaleString()}/{rfq.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Delivery</p>
                        <p className="font-semibold text-[#181818]">{rfq.deliveryLocation}</p>
                        <p className="text-xs text-[#706e6b]">{rfq.deliveryWindow}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">CI Target</p>
                        <p className="font-semibold text-[#181818]">{rfq.ciTarget} gCO₂e/MJ</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#706e6b]">Required:</span>
                      {rfq.certificationRequirements.map((cert, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[#e3f2fd] px-2 py-0.5 text-xs font-medium text-[#0176d3]"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-[#706e6b]">
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="font-semibold text-[#181818]">{rfq.bidsReceived}</span> bids
                      </div>
                      <span>•</span>
                      <span>Closing: {formatDate(rfq.closingDate)}</span>
                      <span>•</span>
                      <span>Created: {formatDate(rfq.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href={`/airline/procurement/${rfq.id}`}
                      className="rounded-lg border border-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
                    >
                      View Details
                    </Link>
                    {rfq.bidsReceived > 0 && (
                      <Link
                        href={`/airline/procurement/${rfq.id}/bids`}
                        className="rounded-lg bg-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#014486]"
                      >
                        Review Bids ({rfq.bidsReceived})
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












