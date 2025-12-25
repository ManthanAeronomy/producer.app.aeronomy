"use client";

import { useState } from "react";
import Link from "next/link";

type DeliveryStatus = "scheduled" | "in_transit" | "delivered" | "quality_check" | "accepted" | "rejected" | "invoiced" | "paid";

interface Delivery {
  id: string;
  deliveryNumber: string;
  dealNumber: string;
  producerName: string;
  batchNumber: string;
  scheduledDate: string;
  actualDate?: string;
  estimatedArrival?: string;
  volume: number;
  actualVolume?: number;
  volumeUnit: "MT" | "gal";
  deliveryLocation: string;
  airportCode: string;
  storageLocation?: string;
  status: DeliveryStatus;
  qualityCheckStatus?: "pending" | "passed" | "failed";
  qualityCheckDate?: string;
  qualityNotes?: string;
  carbonIntensity: number;
  ghgReduction: number;
  certifications: string[];
  billOfLading?: string;
  deliveryNote?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDate?: string;
  paidDate?: string;
  transportMethod: "pipeline" | "truck" | "rail" | "barge" | "ship";
  trackingNumber?: string;
}

const initialDeliveries: Delivery[] = [
  {
    id: "del-001",
    deliveryNumber: "DEL-2025-001",
    dealNumber: "DEAL-2025-001",
    producerName: "GreenSky Bio Fuels",
    batchNumber: "BATCH-GS-2025-001",
    scheduledDate: "2025-01-15",
    estimatedArrival: "2025-01-14",
    volume: 5000,
    volumeUnit: "MT",
    deliveryLocation: "JFK Terminal Tank Farm",
    airportCode: "JFK",
    status: "in_transit",
    carbonIntensity: 22,
    ghgReduction: 78,
    certifications: ["ISCC EU", "CORSIA", "ASTM D7566"],
    transportMethod: "pipeline",
    trackingNumber: "TRK-2025-GS-001",
    invoiceNumber: "INV-2025-001",
    invoiceAmount: 10600000,
  },
  {
    id: "del-002",
    deliveryNumber: "DEL-2024-098",
    dealNumber: "DEAL-2025-001",
    producerName: "GreenSky Bio Fuels",
    batchNumber: "BATCH-GS-2024-122",
    scheduledDate: "2024-12-01",
    actualDate: "2024-12-01",
    volume: 4500,
    actualVolume: 4500,
    volumeUnit: "MT",
    deliveryLocation: "JFK Terminal Tank Farm",
    airportCode: "JFK",
    storageLocation: "Tank A-3",
    status: "quality_check",
    qualityCheckStatus: "pending",
    carbonIntensity: 23,
    ghgReduction: 77,
    certifications: ["ISCC EU", "CORSIA"],
    transportMethod: "pipeline",
    billOfLading: "BOL-2024-GS-098",
    deliveryNote: "Delivery completed on time. Quality check initiated.",
  },
  {
    id: "del-003",
    deliveryNumber: "DEL-2024-095",
    dealNumber: "DEAL-2025-002",
    producerName: "BlueHarmony SAF",
    batchNumber: "BATCH-BH-2024-122",
    scheduledDate: "2024-11-15",
    actualDate: "2024-11-15",
    volume: 8000,
    actualVolume: 8050,
    volumeUnit: "MT",
    deliveryLocation: "LHR Hub Storage",
    airportCode: "LHR",
    storageLocation: "Tank B-12",
    status: "accepted",
    qualityCheckStatus: "passed",
    qualityCheckDate: "2024-11-16",
    qualityNotes: "All quality parameters met. Slight volume overage accepted.",
    carbonIntensity: 20,
    ghgReduction: 80,
    certifications: ["ISCC EU", "RED II"],
    transportMethod: "truck",
    billOfLading: "BOL-2024-BH-095",
    invoiceNumber: "INV-2024-095",
    invoiceAmount: 18193000,
    invoiceDate: "2024-11-20",
  },
  {
    id: "del-004",
    deliveryNumber: "DEL-2024-089",
    dealNumber: "DEAL-2024-038",
    producerName: "Neste SAF",
    batchNumber: "BATCH-NS-2024-098",
    scheduledDate: "2024-10-20",
    actualDate: "2024-10-20",
    volume: 4500,
    actualVolume: 4500,
    volumeUnit: "MT",
    deliveryLocation: "AMS Hub Storage",
    airportCode: "AMS",
    storageLocation: "Tank D-8",
    status: "paid",
    qualityCheckStatus: "passed",
    qualityCheckDate: "2024-10-21",
    qualityNotes: "Excellent quality. All parameters exceeded expectations.",
    carbonIntensity: 18,
    ghgReduction: 82,
    certifications: ["ISCC EU", "CORSIA", "RED II"],
    transportMethod: "barge",
    billOfLading: "BOL-2024-NS-089",
    invoiceNumber: "INV-2024-089",
    invoiceAmount: 9810000,
    invoiceDate: "2024-10-25",
    paidDate: "2024-11-05",
  },
  {
    id: "del-005",
    deliveryNumber: "DEL-2025-005",
    dealNumber: "DEAL-2024-045",
    producerName: "Aurora Renewables",
    batchNumber: "BATCH-AR-2025-003",
    scheduledDate: "2025-03-01",
    volume: 3000,
    volumeUnit: "MT",
    deliveryLocation: "SIN Terminal Storage",
    airportCode: "SIN",
    status: "scheduled",
    carbonIntensity: 25,
    ghgReduction: 75,
    certifications: ["ISCC CORSIA", "RSB"],
    transportMethod: "ship",
  },
  {
    id: "del-006",
    deliveryNumber: "DEL-2024-087",
    dealNumber: "DEAL-2024-038",
    producerName: "Neste SAF",
    batchNumber: "BATCH-NS-2024-086",
    scheduledDate: "2024-10-05",
    actualDate: "2024-10-07",
    volume: 3500,
    actualVolume: 3450,
    volumeUnit: "MT",
    deliveryLocation: "LAX West Terminal",
    airportCode: "LAX",
    storageLocation: "Tank F-4",
    status: "rejected",
    qualityCheckStatus: "failed",
    qualityCheckDate: "2024-10-08",
    qualityNotes: "Failed freeze point specification. Volume shortage also noted.",
    carbonIntensity: 19,
    ghgReduction: 81,
    certifications: ["ISCC EU", "CORSIA"],
    transportMethod: "truck",
    billOfLading: "BOL-2024-NS-087",
  },
];

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [filter, setFilter] = useState<DeliveryStatus | "all">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const locations = Array.from(new Set(deliveries.map((d) => d.airportCode)));

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesStatus = filter === "all" || delivery.status === filter;
    const matchesLocation = locationFilter === "all" || delivery.airportCode === locationFilter;
    const matchesSearch =
      searchTerm === "" ||
      delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesLocation && matchesSearch;
  });

  const stats = {
    scheduled: deliveries.filter((d) => d.status === "scheduled").length,
    inTransit: deliveries.filter((d) => d.status === "in_transit").length,
    delivered: deliveries.filter(
      (d) => d.status === "delivered" || d.status === "quality_check" || d.status === "accepted"
    ).length,
    pendingQC: deliveries.filter((d) => d.qualityCheckStatus === "pending").length,
    rejected: deliveries.filter((d) => d.status === "rejected").length,
    pendingInvoice: deliveries.filter((d) => d.status === "accepted" && !d.invoiceNumber).length,
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    const styles = {
      scheduled: "bg-[#e5e5e5] text-[#706e6b]",
      in_transit: "bg-[#e3f2fd] text-[#0176d3]",
      delivered: "bg-[#e8f5e9] text-[#2e844a]",
      quality_check: "bg-[#fff3e0] text-[#e65100]",
      accepted: "bg-[#e8f5e9] text-[#2e844a]",
      rejected: "bg-[#ffebee] text-[#c23934]",
      invoiced: "bg-[#f3e5f5] text-[#9c27b0]",
      paid: "bg-[#e3f2fd] text-[#0176d3]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const getQualityBadge = (status?: "pending" | "passed" | "failed") => {
    if (!status) return null;
    const styles = {
      pending: "bg-[#fff3e0] text-[#e65100]",
      passed: "bg-[#e8f5e9] text-[#2e844a]",
      failed: "bg-[#ffebee] text-[#c23934]",
    };
    const icons = {
      pending: "⏳",
      passed: "✓",
      failed: "✗",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {icons[status]} QC: {status.charAt(0).toUpperCase() + status.slice(1)}
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

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Delivery Management</p>
            <h1 className="text-3xl font-bold text-[#181818]">SAF Deliveries</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Track and verify all incoming SAF deliveries
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Scheduled</p>
          <p className="mt-2 text-3xl font-bold text-[#706e6b]">{stats.scheduled}</p>
          <p className="text-sm text-[#706e6b]">Upcoming</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">In Transit</p>
          <p className="mt-2 text-3xl font-bold text-[#0176d3]">{stats.inTransit}</p>
          <p className="text-sm text-[#706e6b]">En route</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Delivered</p>
          <p className="mt-2 text-3xl font-bold text-[#2e844a]">{stats.delivered}</p>
          <p className="text-sm text-[#706e6b]">Received</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Pending QC</p>
          <p className="mt-2 text-3xl font-bold text-[#ff9800]">{stats.pendingQC}</p>
          <p className="text-sm text-[#706e6b]">Checks needed</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-[#c23934]">{stats.rejected}</p>
          <p className="text-sm text-[#706e6b]">Failed QC</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Pending Invoice</p>
          <p className="mt-2 text-3xl font-bold text-[#9c27b0]">{stats.pendingInvoice}</p>
          <p className="text-sm text-[#706e6b]">To invoice</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "scheduled", "in_transit", "delivered", "quality_check", "accepted", "paid"] as const).map(
              (status) => (
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
              )
            )}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by delivery number, producer, or batch..."
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
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-lg border border-[#c9c9c9] bg-white px-4 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No deliveries found</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            {searchTerm || locationFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No deliveries match the current filter"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDeliveries.map((delivery) => {
            const daysUntilDelivery = delivery.scheduledDate ? getDaysUntil(delivery.scheduledDate) : null;
            const isUrgent = daysUntilDelivery !== null && daysUntilDelivery <= 3 && daysUntilDelivery > 0;
            const volumeDifference = delivery.actualVolume ? delivery.actualVolume - delivery.volume : 0;

            return (
              <div
                key={delivery.id}
                className={`rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  isUrgent
                    ? "border-[#ff9800]/50 bg-gradient-to-r from-[#fff8e1] to-white"
                    : delivery.status === "rejected"
                    ? "border-[#c23934]/50 bg-gradient-to-r from-[#ffebee] to-white"
                    : "border-[#e5e5e5] bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#0176d3]">{delivery.deliveryNumber}</span>
                      {getStatusBadge(delivery.status)}
                      {getQualityBadge(delivery.qualityCheckStatus)}
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ff9800] px-2.5 py-1 text-xs font-semibold text-white">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {daysUntilDelivery}d away
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#181818]">{delivery.producerName}</h3>
                      <span className="text-[#706e6b]">•</span>
                      <span className="text-sm text-[#706e6b]">Deal: {delivery.dealNumber}</span>
                    </div>
                    <p className="text-sm text-[#706e6b]">Batch: {delivery.batchNumber}</p>

                    <div className="mt-3 grid gap-3 md:grid-cols-5">
                      <div>
                        <p className="text-xs text-[#706e6b]">Volume</p>
                        <p className="font-semibold text-[#181818]">
                          {delivery.volume.toLocaleString()} {delivery.volumeUnit}
                        </p>
                        {delivery.actualVolume && volumeDifference !== 0 && (
                          <p
                            className={`text-xs ${
                              volumeDifference > 0 ? "text-[#2e844a]" : "text-[#c23934]"
                            }`}
                          >
                            ({volumeDifference > 0 ? "+" : ""}
                            {volumeDifference.toLocaleString()} {delivery.volumeUnit})
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Location</p>
                        <p className="font-semibold text-[#181818]">{delivery.airportCode}</p>
                        {delivery.storageLocation && (
                          <p className="text-xs text-[#706e6b]">{delivery.storageLocation}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Transport</p>
                        <p className="font-semibold text-[#181818]">
                          {delivery.transportMethod.replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        {delivery.trackingNumber && (
                          <p className="text-xs text-[#706e6b]">{delivery.trackingNumber}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">CI Score</p>
                        <p className="font-semibold text-[#2e844a]">{delivery.carbonIntensity} gCO₂e/MJ</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">GHG Reduction</p>
                        <p className="font-semibold text-[#2e844a]">{delivery.ghgReduction}%</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {delivery.certifications.map((cert, i) => (
                        <span key={i} className="rounded-full bg-[#e3f2fd] px-2 py-0.5 text-xs font-medium text-[#0176d3]">
                          {cert}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-[#706e6b]">
                      <span>
                        Scheduled: {formatDate(delivery.scheduledDate)}
                        {delivery.estimatedArrival && ` (ETA: ${formatDate(delivery.estimatedArrival)})`}
                      </span>
                      {delivery.actualDate && (
                        <>
                          <span>•</span>
                          <span>Delivered: {formatDate(delivery.actualDate)}</span>
                        </>
                      )}
                    </div>

                    {delivery.qualityNotes && (
                      <div
                        className={`mt-3 rounded-lg border px-3 py-2 ${
                          delivery.qualityCheckStatus === "failed"
                            ? "border-[#c23934]/30 bg-[#ffebee]"
                            : "border-[#e5e5e5] bg-[#f8f9fa]"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                          Quality Notes
                        </p>
                        <p className="text-sm text-[#181818]">{delivery.qualityNotes}</p>
                        {delivery.qualityCheckDate && (
                          <p className="text-xs text-[#706e6b]">
                            Checked: {formatDate(delivery.qualityCheckDate)}
                          </p>
                        )}
                      </div>
                    )}

                    {delivery.invoiceNumber && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-[#706e6b]">Invoice: {delivery.invoiceNumber}</span>
                        {delivery.invoiceAmount && (
                          <>
                            <span className="text-[#706e6b]">•</span>
                            <span className="font-semibold text-[#181818]">
                              {formatCurrency(delivery.invoiceAmount)}
                            </span>
                          </>
                        )}
                        {delivery.paidDate && (
                          <>
                            <span className="text-[#706e6b]">•</span>
                            <span className="text-[#2e844a]">Paid: {formatDate(delivery.paidDate)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href={`/airline/deliveries/${delivery.id}`}
                      className="rounded-lg border border-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
                    >
                      View Details
                    </Link>
                    {delivery.status === "delivered" && !delivery.qualityCheckStatus && (
                      <button className="rounded-lg bg-[#ff9800] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#f57c00]">
                        Quality Check
                      </button>
                    )}
                    {delivery.status === "quality_check" && delivery.qualityCheckStatus === "pending" && (
                      <button className="rounded-lg bg-[#2e844a] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#1b5e20]">
                        Complete QC
                      </button>
                    )}
                    {delivery.status === "accepted" && !delivery.invoiceNumber && (
                      <button className="rounded-lg bg-[#9c27b0] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#7b1fa2]">
                        Generate Invoice
                      </button>
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





