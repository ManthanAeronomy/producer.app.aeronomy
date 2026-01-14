"use client";

import { useState } from "react";
import Link from "next/link";

type ClaimType = "carbon_credit" | "corsia" | "red_ii" | "lcfs" | "rins" | "book_and_claim";
type ClaimStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "credited";
type VerificationStatus = "pending" | "verified" | "rejected" | "expired";

interface Claim {
  id: string;
  claimNumber: string;
  claimType: ClaimType;
  volumeClaimed: number;
  volumeUnit: "MT" | "gal";
  reportingPeriod: {
    start: string;
    end: string;
  };
  reportingYear: number;
  reportingQuarter: string;
  batchNumbers: string[];
  carbonIntensity: number;
  ghgReduction: number;
  totalEmissionsAvoided: number;
  scheme: string;
  certificationBody: string;
  certificateNumber?: string;
  verificationStatus: VerificationStatus;
  verificationDate?: string;
  creditsGenerated?: number;
  creditUnit?: string;
  creditValue?: number;
  creditCurrency?: "USD" | "EUR" | "GBP";
  status: ClaimStatus;
  submittedDate?: string;
  approvedDate?: string;
  rejectionReason?: string;
  routes: Array<{
    origin: string;
    destination: string;
    volumeUsed: number;
  }>;
  createdAt: string;
}

const initialClaims: Claim[] = [
  {
    id: "claim-001",
    claimNumber: "CLAIM-2024-Q4-001",
    claimType: "corsia",
    volumeClaimed: 5000,
    volumeUnit: "MT",
    reportingPeriod: {
      start: "2024-10-01",
      end: "2024-12-31",
    },
    reportingYear: 2024,
    reportingQuarter: "Q4",
    batchNumbers: ["BATCH-GS-2024-098", "BATCH-BH-2024-105"],
    carbonIntensity: 22,
    ghgReduction: 78,
    totalEmissionsAvoided: 3900,
    scheme: "CORSIA",
    certificationBody: "ISCC System",
    certificateNumber: "CORSIA-2024-12345",
    verificationStatus: "verified",
    verificationDate: "2024-12-20",
    creditsGenerated: 3900,
    creditUnit: "MT CO2e",
    creditValue: 234000,
    creditCurrency: "USD",
    status: "approved",
    submittedDate: "2024-12-10",
    approvedDate: "2024-12-22",
    routes: [
      { origin: "JFK", destination: "LHR", volumeUsed: 2000 },
      { origin: "JFK", destination: "CDG", volumeUsed: 1500 },
      { origin: "LAX", destination: "NRT", volumeUsed: 1500 },
    ],
    createdAt: "2024-12-05",
  },
  {
    id: "claim-002",
    claimNumber: "CLAIM-2024-Q4-002",
    claimType: "red_ii",
    volumeClaimed: 8000,
    volumeUnit: "MT",
    reportingPeriod: {
      start: "2024-10-01",
      end: "2024-12-31",
    },
    reportingYear: 2024,
    reportingQuarter: "Q4",
    batchNumbers: ["BATCH-BH-2024-122", "BATCH-NS-2024-098"],
    carbonIntensity: 20,
    ghgReduction: 80,
    totalEmissionsAvoided: 6400,
    scheme: "EU RED II",
    certificationBody: "Control Union",
    verificationStatus: "pending",
    status: "under_review",
    submittedDate: "2024-12-15",
    routes: [
      { origin: "LHR", destination: "AMS", volumeUsed: 3000 },
      { origin: "LHR", destination: "FRA", volumeUsed: 2500 },
      { origin: "CDG", destination: "BCN", volumeUsed: 2500 },
    ],
    createdAt: "2024-12-08",
  },
  {
    id: "claim-003",
    claimNumber: "CLAIM-2025-Q1-001",
    claimType: "lcfs",
    volumeClaimed: 3000,
    volumeUnit: "MT",
    reportingPeriod: {
      start: "2025-01-01",
      end: "2025-03-31",
    },
    reportingYear: 2025,
    reportingQuarter: "Q1",
    batchNumbers: ["BATCH-AR-2025-003"],
    carbonIntensity: 25,
    ghgReduction: 75,
    totalEmissionsAvoided: 2250,
    scheme: "California LCFS",
    certificationBody: "CARB",
    verificationStatus: "pending",
    creditsGenerated: 15000,
    creditUnit: "LCFS Credits",
    status: "draft",
    routes: [
      { origin: "LAX", destination: "SFO", volumeUsed: 1500 },
      { origin: "SFO", destination: "SEA", volumeUsed: 1500 },
    ],
    createdAt: "2024-12-18",
  },
  {
    id: "claim-004",
    claimNumber: "CLAIM-2024-Q3-003",
    claimType: "corsia",
    volumeClaimed: 4500,
    volumeUnit: "MT",
    reportingPeriod: {
      start: "2024-07-01",
      end: "2024-09-30",
    },
    reportingYear: 2024,
    reportingQuarter: "Q3",
    batchNumbers: ["BATCH-NS-2024-067"],
    carbonIntensity: 18,
    ghgReduction: 82,
    totalEmissionsAvoided: 3690,
    scheme: "CORSIA",
    certificationBody: "ISCC System",
    certificateNumber: "CORSIA-2024-09876",
    verificationStatus: "verified",
    verificationDate: "2024-10-10",
    creditsGenerated: 3690,
    creditUnit: "MT CO2e",
    creditValue: 221400,
    creditCurrency: "USD",
    status: "credited",
    submittedDate: "2024-09-25",
    approvedDate: "2024-10-15",
    routes: [
      { origin: "AMS", destination: "JFK", volumeUsed: 2250 },
      { origin: "FRA", destination: "LAX", volumeUsed: 2250 },
    ],
    createdAt: "2024-09-15",
  },
];

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [filter, setFilter] = useState<ClaimStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ClaimType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClaims = claims.filter((claim) => {
    const matchesStatus = filter === "all" || claim.status === filter;
    const matchesType = typeFilter === "all" || claim.claimType === typeFilter;
    const matchesSearch =
      searchTerm === "" ||
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.scheme.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    submitted: claims.filter((c) => c.status === "submitted" || c.status === "under_review").length,
    approved: claims.filter((c) => c.status === "approved" || c.status === "credited").length,
    draft: claims.filter((c) => c.status === "draft").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    totalCredits: claims
      .filter((c) => c.status === "approved" || c.status === "credited")
      .reduce((sum, c) => sum + (c.creditsGenerated || 0), 0),
    totalValue: claims
      .filter((c) => c.status === "approved" || c.status === "credited")
      .reduce((sum, c) => sum + (c.creditValue || 0), 0),
  };

  const getStatusBadge = (status: ClaimStatus) => {
    const styles = {
      draft: "bg-[#e5e5e5] text-[#706e6b]",
      submitted: "bg-[#e3f2fd] text-[#0176d3]",
      under_review: "bg-[#fff3e0] text-[#e65100]",
      approved: "bg-[#e8f5e9] text-[#2e844a]",
      rejected: "bg-[#ffebee] text-[#c23934]",
      credited: "bg-[#f3e5f5] text-[#9c27b0]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    const styles = {
      pending: "bg-[#fff3e0] text-[#e65100]",
      verified: "bg-[#e8f5e9] text-[#2e844a]",
      rejected: "bg-[#ffebee] text-[#c23934]",
      expired: "bg-[#e5e5e5] text-[#706e6b]",
    };
    const icons = {
      pending: "⏳",
      verified: "✓",
      rejected: "✗",
      expired: "⏰",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getClaimTypeLabel = (type: ClaimType) => {
    const labels = {
      carbon_credit: "Carbon Credit",
      corsia: "CORSIA",
      red_ii: "EU RED II",
      lcfs: "CA LCFS",
      rins: "D-RINs",
      book_and_claim: "Book & Claim",
    };
    return labels[type];
  };

  const formatCurrency = (value: number, currency?: string) => {
    const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(1)}K`;
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Claims & Credits</p>
            <h1 className="text-3xl font-bold text-[#181818]">Carbon Credit Claims</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Submit and track sustainability claims and carbon credits
            </p>
          </div>
          <Link
            href="/airline/claims/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Claim
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Draft</p>
          <p className="mt-2 text-3xl font-bold text-[#706e6b]">{stats.draft}</p>
          <p className="text-sm text-[#706e6b]">Claims</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Under Review</p>
          <p className="mt-2 text-3xl font-bold text-[#ff9800]">{stats.submitted}</p>
          <p className="text-sm text-[#706e6b]">Claims</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Approved</p>
          <p className="mt-2 text-3xl font-bold text-[#2e844a]">{stats.approved}</p>
          <p className="text-sm text-[#706e6b]">Claims</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-[#c23934]">{stats.rejected}</p>
          <p className="text-sm text-[#706e6b]">Claims</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Total Credits</p>
          <p className="mt-2 text-3xl font-bold text-[#0176d3]">{stats.totalCredits.toLocaleString()}</p>
          <p className="text-sm text-[#706e6b]">MT CO2e</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Credit Value</p>
          <p className="mt-2 text-3xl font-bold text-[#181818]">
            {formatCurrency(stats.totalValue, "USD")}
          </p>
          <p className="text-sm text-[#706e6b]">Estimated</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "draft", "submitted", "under_review", "approved", "credited"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  filter === status
                    ? "bg-[#0176d3] text-white shadow-sm"
                    : "border border-[#e5e5e5] text-[#706e6b] hover:bg-[#f3f2f2]"
                }`}
              >
                {status === "all" ? "All" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by claim number or scheme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#c9c9c9] py-2 pl-10 pr-4 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
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
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="rounded-lg border border-[#c9c9c9] bg-white px-4 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            >
              <option value="all">All Types</option>
              <option value="corsia">CORSIA</option>
              <option value="red_ii">EU RED II</option>
              <option value="lcfs">CA LCFS</option>
              <option value="rins">D-RINs</option>
              <option value="book_and_claim">Book & Claim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No claims found</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            {searchTerm || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first claim to start tracking carbon credits"}
          </p>
          {!searchTerm && typeFilter === "all" && (
            <Link
              href="/airline/claims/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Claim
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#0176d3]">{claim.claimNumber}</span>
                    {getStatusBadge(claim.status)}
                    {getVerificationBadge(claim.verificationStatus)}
                    <span className="rounded-full bg-[#f3e5f5] px-2.5 py-1 text-xs font-semibold text-[#9c27b0]">
                      {getClaimTypeLabel(claim.claimType)}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-[#181818]">{claim.scheme}</h3>
                  <p className="text-sm text-[#706e6b]">
                    {claim.reportingYear} {claim.reportingQuarter} • {claim.certificationBody}
                  </p>

                  <div className="mt-3 grid gap-3 md:grid-cols-5">
                    <div>
                      <p className="text-xs text-[#706e6b]">Volume Claimed</p>
                      <p className="font-semibold text-[#181818]">
                        {claim.volumeClaimed.toLocaleString()} {claim.volumeUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706e6b]">GHG Reduction</p>
                      <p className="font-semibold text-[#2e844a]">{claim.ghgReduction}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#706e6b]">Emissions Avoided</p>
                      <p className="font-semibold text-[#2e844a]">{claim.totalEmissionsAvoided.toLocaleString()} MT CO2e</p>
                    </div>
                    {claim.creditsGenerated && (
                      <div>
                        <p className="text-xs text-[#706e6b]">Credits Generated</p>
                        <p className="font-semibold text-[#0176d3]">
                          {claim.creditsGenerated.toLocaleString()} {claim.creditUnit}
                        </p>
                      </div>
                    )}
                    {claim.creditValue && (
                      <div>
                        <p className="text-xs text-[#706e6b]">Credit Value</p>
                        <p className="font-semibold text-[#181818]">
                          {formatCurrency(claim.creditValue, claim.creditCurrency)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                      Routes ({claim.routes.length})
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {claim.routes.slice(0, 3).map((route, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[#f3f2f2] px-2 py-0.5 text-xs text-[#181818]"
                        >
                          {route.origin} → {route.destination} ({route.volumeUsed.toLocaleString()} MT)
                        </span>
                      ))}
                      {claim.routes.length > 3 && (
                        <span className="rounded-full bg-[#f3f2f2] px-2 py-0.5 text-xs text-[#706e6b]">
                          +{claim.routes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#706e6b]">
                    <span className="text-xs">Batches:</span>
                    {claim.batchNumbers.slice(0, 2).map((batch, i) => (
                      <span key={i} className="rounded-full bg-[#e3f2fd] px-2 py-0.5 text-xs font-medium text-[#0176d3]">
                        {batch}
                      </span>
                    ))}
                    {claim.batchNumbers.length > 2 && (
                      <span className="text-xs text-[#706e6b]">+{claim.batchNumbers.length - 2} more</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm text-[#706e6b]">
                    <span>Period: {formatDate(claim.reportingPeriod.start)} → {formatDate(claim.reportingPeriod.end)}</span>
                    {claim.submittedDate && (
                      <>
                        <span>•</span>
                        <span>Submitted: {formatDate(claim.submittedDate)}</span>
                      </>
                    )}
                    {claim.approvedDate && (
                      <>
                        <span>•</span>
                        <span>Approved: {formatDate(claim.approvedDate)}</span>
                      </>
                    )}
                  </div>

                  {claim.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-[#c23934]/30 bg-[#ffebee] px-3 py-2">
                      <p className="text-sm font-semibold text-[#c23934]">Rejection Reason:</p>
                      <p className="text-sm text-[#181818]">{claim.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pl-4">
                  <Link
                    href={`/airline/claims/${claim.id}`}
                    className="rounded-lg border border-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
                  >
                    View Details
                  </Link>
                  {claim.status === "draft" && (
                    <button className="rounded-lg bg-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#014486]">
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}












