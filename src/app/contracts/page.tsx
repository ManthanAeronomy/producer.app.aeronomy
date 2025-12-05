"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";

type ContractStatus = "active" | "scheduled" | "completed" | "cancelled" | "at_risk";

interface Contract {
  _id: string;
  contractNumber: string;
  counterparty: {
    companyName: string;
    legalEntity?: string;
    contractContact?: string;
    billingContact?: string;
    billingEmail?: string;
  };
  sourceBidId?: string;
  sourceRfqId?: string;
  producerId: string;
  producerName: string;
  totalVolume: number;
  volumeUnit: "MT" | "gal";
  contractValue: number;
  currency: "USD" | "EUR" | "GBP";
  pricingDetails: {
    type: "Indexed" | "Fixed" | "Hybrid";
    priceIndex?: string;
    premiumDiscount?: number;
    fixedPrices?: Array<{
      year: number;
      pricePerTonne: number;
    }>;
  };
  paymentTerms: string;
  incoterms: string;
  startDate: string;
  endDate: string;
  signatureDate?: string;
  effectiveDate?: string;
  status: ContractStatus;
  deliveries: Array<{
    scheduledDate: string;
    location: string;
    volume: number;
    volumeUnit: "MT" | "gal";
    status: "scheduled" | "delivered" | "invoiced" | "paid" | "late";
    actualDeliveryDate?: string;
    actualVolume?: number;
  }>;
  documents: Array<{
    name: string;
    type: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

type TabType = "active" | "scheduled" | "completed" | "cancelled";

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contracts");
      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }
      const data = await response.json();
      setContracts(data.contracts || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(err instanceof Error ? err.message : "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Calculate delivered volume
  const getDeliveredVolume = (contract: Contract): number => {
    return contract.deliveries
      ?.filter((d) => d.status === "delivered" || d.status === "invoiced" || d.status === "paid")
      .reduce((sum, d) => sum + (d.actualVolume || d.volume), 0) || 0;
  };

  // Get next delivery
  const getNextDelivery = (contract: Contract): { date: string; volume: number } | null => {
    const now = new Date();
    const upcoming = contract.deliveries
      ?.filter((d) => d.status === "scheduled" && new Date(d.scheduledDate) >= now)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    if (upcoming && upcoming.length > 0) {
      const next = upcoming[0];
      return {
        date: new Date(next.scheduledDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        volume: next.volume,
      };
    }
    return null;
  };

  // Calculate outstanding invoices (simplified)
  const getOutstandingInvoices = (contract: Contract): number => {
    const invoiced = contract.deliveries
      ?.filter((d) => d.status === "invoiced")
      .reduce((sum, d) => sum + (d.actualVolume || d.volume), 0) || 0;

    // Estimate value based on contract value per tonne
    const pricePerTonne = contract.totalVolume > 0 ? contract.contractValue / contract.totalVolume : 0;
    return invoiced * pricePerTonne;
  };

  // Check if contract is on track
  const isOnTrack = (contract: Contract): boolean => {
    if (contract.status === "at_risk") return false;

    const now = new Date();
    const lateDeliveries = contract.deliveries?.filter(
      (d) => d.status === "scheduled" && new Date(d.scheduledDate) < now
    );

    return !lateDeliveries || lateDeliveries.length === 0;
  };

  const filteredContracts = useMemo(() => {
    if (activeTab === "active") {
      return contracts.filter((c) => c.status === "active" || c.status === "at_risk");
    }
    return contracts.filter((c) => c.status === activeTab);
  }, [contracts, activeTab]);

  const stats = useMemo(
    () => ({
      active: contracts.filter((c) => c.status === "active" || c.status === "at_risk").length,
      scheduled: contracts.filter((c) => c.status === "scheduled").length,
      completed: contracts.filter((c) => c.status === "completed").length,
      cancelled: contracts.filter((c) => c.status === "cancelled").length,
    }),
    [contracts]
  );

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  const getProgressPercent = (delivered: number, total: number) =>
    total > 0 ? Math.round((delivered / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading contracts...</p>
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
          <h3 className="text-lg font-semibold text-[#181818]">Failed to load contracts</h3>
          <p className="mt-1 text-sm text-[#706e6b]">{error}</p>
          <button
            onClick={fetchContracts}
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
            <h1 className="text-3xl font-bold text-[#181818]">Contracts</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Manage won deals, track deliveries, get paid
            </p>
          </div>
          <Link
            href="/contracts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Contract
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#e5e5e5]">
          {(
            [
              { id: "active", label: "Active", count: stats.active },
              { id: "scheduled", label: "Scheduled", count: stats.scheduled },
              { id: "completed", label: "Completed", count: stats.completed },
              { id: "cancelled", label: "Cancelled", count: stats.cancelled },
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

      {/* Contract Cards */}
      {contracts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No contracts yet</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            Create your first contract to start tracking deliveries
          </p>
          <Link
            href="/contracts/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Contract
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredContracts.map((contract) => {
            const deliveredVolume = getDeliveredVolume(contract);
            const progress = getProgressPercent(deliveredVolume, contract.totalVolume);
            const nextDelivery = getNextDelivery(contract);
            const outstandingInvoices = getOutstandingInvoices(contract);
            const onTrack = isOnTrack(contract);

            return (
              <div
                key={contract._id}
                className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm transition-all hover:border-[#0176d3] hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                      {contract.counterparty.companyName}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-[#181818]">
                      Contract #{contract.contractNumber}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      onTrack ? "bg-[#e8f5e9] text-[#2e844a]" : "bg-[#fff3e0] text-[#e65100]"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${onTrack ? "bg-[#2e844a]" : "bg-[#ff9800]"}`} />
                    {onTrack ? "On Track" : "At Risk"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#706e6b]">Volume</p>
                    <p className="font-semibold text-[#181818]">
                      {contract.totalVolume.toLocaleString()}
                      {contract.volumeUnit === "MT" ? "t" : " gal"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#706e6b]">Contract Value</p>
                    <p className="font-semibold text-[#181818]">
                      {formatCurrency(contract.contractValue, contract.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#706e6b]">Term</p>
                    <p className="font-semibold text-[#181818]">
                      {new Date(contract.startDate).getFullYear()} -{" "}
                      {new Date(contract.endDate).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#706e6b]">Pricing</p>
                    <p className="font-semibold text-[#181818]">{contract.pricingDetails.type}</p>
                  </div>
                </div>

                {nextDelivery && (
                  <div className="mt-4 rounded-lg bg-[#f8f9fa] px-3 py-2">
                    <p className="text-xs text-[#706e6b]">
                      Next:{" "}
                      <span className="font-medium text-[#181818]">{nextDelivery.date}</span> (
                      {nextDelivery.volume.toLocaleString()}t)
                    </p>
                    </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#706e6b]">Delivered</span>
                    <span className="font-medium text-[#181818]">{progress}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e5e5e5]">
                    <div
                      className="h-full rounded-full bg-[#0176d3] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {outstandingInvoices > 0 && (
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-[#ff9800]/30 bg-[#fff8e1] px-3 py-2">
                    <span className="text-xs text-[#e65100]">Outstanding Invoices</span>
                    <span className="text-sm font-semibold text-[#e65100]">
                      {formatCurrency(outstandingInvoices, contract.currency)}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/contracts/${contract._id}`}
                    className="flex-1 rounded-lg border border-[#e5e5e5] py-2 text-center text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
                  >
                    View Details
                  </Link>
                  {contract.status === "active" && (
                    <button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowDeliveryModal(true);
                      }}
                      className="flex-1 rounded-lg bg-[#0176d3] py-2 text-center text-sm font-semibold text-white hover:bg-[#014486]"
                    >
                      Log Delivery
                  </button>
                  )}
                </div>
              </div>
            );
          })}

        {filteredContracts.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-[#e5e5e5] bg-white py-16 text-[#706e6b]">
              <svg className="h-12 w-12 text-[#e5e5e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
              <p className="mt-3 text-sm font-medium">No contracts in this category</p>
          </div>
        )}
      </div>
      )}

      {/* Log Delivery Modal */}
      {showDeliveryModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e5e5e5] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#181818]">Log Delivery</h2>
                  <p className="text-sm text-[#706e6b]">
                    {selectedContract.counterparty.companyName} • {selectedContract.contractNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="rounded-lg p-2 text-[#706e6b] hover:bg-[#f3f2f2]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6 rounded-lg border border-[#0176d3]/20 bg-[#f0f7ff] p-4">
                <p className="text-sm text-[#0176d3]">
                  Select a scheduled delivery to log
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Actual Date
                  <input type="date" className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm" />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Actual Volume
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="number"
                      className="w-full rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    />
                    <span className="text-sm text-[#706e6b]">tonnes</span>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-[#3e3e3c]">Delivery Type</p>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" defaultChecked className="h-4 w-4 text-[#0176d3]" />
                    <span className="text-sm text-[#181818]">Physical</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" className="h-4 w-4 text-[#0176d3]" />
                    <span className="text-sm text-[#181818]">Book & Claim</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Bill of Lading
                  <div className="mt-1.5 rounded-lg border-2 border-dashed border-[#c9c9c9] px-4 py-3 text-center text-sm text-[#706e6b] hover:border-[#0176d3]">
                    Upload...
                  </div>
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Delivery Note
                  <div className="mt-1.5 rounded-lg border-2 border-dashed border-[#c9c9c9] px-4 py-3 text-center text-sm text-[#706e6b] hover:border-[#0176d3]">
                    Upload...
                  </div>
                </label>
              </div>
            </div>
            <div className="border-t border-[#e5e5e5] px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
                >
                  Log Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
