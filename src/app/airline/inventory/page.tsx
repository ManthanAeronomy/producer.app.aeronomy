"use client";

import { useState } from "react";
import Link from "next/link";

type InventoryStatus = "in_transit" | "available" | "allocated" | "depleted" | "expired";
type QualityStatus = "pending" | "passed" | "failed";

interface InventoryItem {
  id: string;
  batchNumber: string;
  productName: string;
  productType: "HEFA" | "FT" | "ATJ" | "SIP" | "Other";
  producerName: string;
  totalVolume: number;
  allocatedVolume: number;
  availableVolume: number;
  volumeUnit: "MT" | "gal";
  carbonIntensity: number;
  ghgReduction: number;
  pathway: string;
  feedstock: string;
  storageLocation: string;
  airportCode?: string;
  receivedDate: string;
  expiryDate?: string;
  purchasePrice: number;
  currency: "USD" | "EUR" | "GBP";
  status: InventoryStatus;
  qualityCheckStatus: QualityStatus;
  certifications: string[];
}

const initialInventory: InventoryItem[] = [
  {
    id: "inv-001",
    batchNumber: "BATCH-GS-2025-001",
    productName: "HEFA-SPK",
    productType: "HEFA",
    producerName: "GreenSky Bio Fuels",
    totalVolume: 5000,
    allocatedVolume: 1200,
    availableVolume: 3800,
    volumeUnit: "MT",
    carbonIntensity: 22,
    ghgReduction: 78,
    pathway: "HEFA",
    feedstock: "Used Cooking Oil",
    storageLocation: "Tank A-3, JFK Terminal",
    airportCode: "JFK",
    receivedDate: "2024-12-01",
    expiryDate: "2025-06-01",
    purchasePrice: 2120,
    currency: "USD",
    status: "available",
    qualityCheckStatus: "passed",
    certifications: ["ISCC EU", "CORSIA", "ASTM D7566"],
  },
  {
    id: "inv-002",
    batchNumber: "BATCH-BH-2024-122",
    productName: "HEFA-SPK",
    productType: "HEFA",
    producerName: "BlueHarmony SAF",
    totalVolume: 8000,
    allocatedVolume: 8000,
    availableVolume: 0,
    volumeUnit: "MT",
    carbonIntensity: 20,
    ghgReduction: 80,
    pathway: "HEFA",
    feedstock: "Animal Fats",
    storageLocation: "Tank B-12, LHR Hub",
    airportCode: "LHR",
    receivedDate: "2024-11-15",
    purchasePrice: 2260,
    currency: "EUR",
    status: "allocated",
    qualityCheckStatus: "passed",
    certifications: ["ISCC EU", "RED II"],
  },
  {
    id: "inv-003",
    batchNumber: "BATCH-AR-2025-003",
    productName: "FT-SPK",
    productType: "FT",
    producerName: "Aurora Renewables",
    totalVolume: 3000,
    allocatedVolume: 0,
    availableVolume: 3000,
    volumeUnit: "MT",
    carbonIntensity: 25,
    ghgReduction: 75,
    pathway: "Fischer-Tropsch",
    feedstock: "Municipal Solid Waste",
    storageLocation: "Tank C-5, SIN Terminal",
    airportCode: "SIN",
    receivedDate: "2024-12-10",
    purchasePrice: 2050,
    currency: "USD",
    status: "available",
    qualityCheckStatus: "pending",
    certifications: ["ISCC CORSIA", "RSB"],
  },
  {
    id: "inv-004",
    batchNumber: "BATCH-NS-2024-098",
    productName: "HEFA-SPK",
    productType: "HEFA",
    producerName: "Neste SAF",
    totalVolume: 4500,
    allocatedVolume: 0,
    availableVolume: 4500,
    volumeUnit: "MT",
    carbonIntensity: 18,
    ghgReduction: 82,
    pathway: "HEFA",
    feedstock: "Waste & Residues",
    storageLocation: "Tank D-8, AMS Hub",
    airportCode: "AMS",
    receivedDate: "2024-10-20",
    expiryDate: "2025-01-20",
    purchasePrice: 2180,
    currency: "EUR",
    status: "available",
    qualityCheckStatus: "passed",
    certifications: ["ISCC EU", "CORSIA", "RED II"],
  },
  {
    id: "inv-005",
    batchNumber: "BATCH-WP-2024-045",
    productName: "ATJ-SPK",
    productType: "ATJ",
    producerName: "World Energy",
    totalVolume: 2000,
    allocatedVolume: 2000,
    availableVolume: 0,
    volumeUnit: "MT",
    carbonIntensity: 27,
    ghgReduction: 73,
    pathway: "Alcohol-to-Jet",
    feedstock: "Ethanol",
    storageLocation: "In Transit to LAX",
    receivedDate: "2024-12-15",
    purchasePrice: 2300,
    currency: "USD",
    status: "in_transit",
    qualityCheckStatus: "pending",
    certifications: ["RSB", "LCFS"],
  },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [filter, setFilter] = useState<InventoryStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const locations = Array.from(new Set(inventory.map((item) => item.airportCode).filter(Boolean))) as string[];

  const filteredInventory = inventory.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesLocation = locationFilter === "all" || item.airportCode === locationFilter;
    const matchesSearch =
      searchTerm === "" ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesLocation && matchesSearch;
  });

  const stats = {
    totalVolume: inventory.reduce((sum, item) => sum + item.totalVolume, 0),
    availableVolume: inventory.reduce((sum, item) => sum + item.availableVolume, 0),
    allocatedVolume: inventory.reduce((sum, item) => sum + item.allocatedVolume, 0),
    locations: locations.length,
    batches: inventory.length,
    pendingQuality: inventory.filter((i) => i.qualityCheckStatus === "pending").length,
    expiringSoon: inventory.filter((i) => {
      if (!i.expiryDate) return false;
      const daysUntilExpiry = Math.ceil(
        (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
  };

  const getStatusBadge = (status: InventoryStatus) => {
    const styles = {
      in_transit: "bg-[#fff3e0] text-[#e65100]",
      available: "bg-[#e8f5e9] text-[#2e844a]",
      allocated: "bg-[#e3f2fd] text-[#0176d3]",
      depleted: "bg-[#e5e5e5] text-[#706e6b]",
      expired: "bg-[#ffebee] text-[#c23934]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const getQualityBadge = (status: QualityStatus) => {
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
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Inventory Management</p>
            <h1 className="text-3xl font-bold text-[#181818]">SAF Inventory</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Track and manage your SAF inventory across all locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/airline/inventory/allocate"
              className="inline-flex items-center gap-2 rounded-lg border border-[#0176d3] px-4 py-2.5 text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Allocate
            </Link>
            <Link
              href="/airline/inventory/receive"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Receive Batch
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Total Volume</p>
          <p className="mt-1 text-2xl font-bold text-[#181818]">{stats.totalVolume.toLocaleString()}</p>
          <p className="text-xs text-[#706e6b]">MT</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Available</p>
          <p className="mt-1 text-2xl font-bold text-[#2e844a]">{stats.availableVolume.toLocaleString()}</p>
          <p className="text-xs text-[#706e6b]">MT</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Allocated</p>
          <p className="mt-1 text-2xl font-bold text-[#0176d3]">{stats.allocatedVolume.toLocaleString()}</p>
          <p className="text-xs text-[#706e6b]">MT</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Batches</p>
          <p className="mt-1 text-2xl font-bold text-[#181818]">{stats.batches}</p>
          <p className="text-xs text-[#706e6b]">Total</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Locations</p>
          <p className="mt-1 text-2xl font-bold text-[#181818]">{stats.locations}</p>
          <p className="text-xs text-[#706e6b]">Airports</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Pending QC</p>
          <p className="mt-1 text-2xl font-bold text-[#ff9800]">{stats.pendingQuality}</p>
          <p className="text-xs text-[#706e6b]">Checks</p>
        </div>
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Expiring</p>
          <p className="mt-1 text-2xl font-bold text-[#c23934]">{stats.expiringSoon}</p>
          <p className="text-xs text-[#706e6b]">In 30 days</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "available", "allocated", "in_transit", "depleted"] as const).map((status) => (
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
                placeholder="Search by batch, producer, or product..."
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

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No inventory found</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            {searchTerm || locationFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No inventory items match the current filter"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredInventory.map((item) => {
            const availablePercentage = item.totalVolume > 0 
              ? Math.round((item.availableVolume / item.totalVolume) * 100) 
              : 0;
            const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  isExpiringSoon
                    ? "border-[#ff9800]/50 bg-gradient-to-r from-[#fff8e1] to-white"
                    : "border-[#e5e5e5] bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#0176d3]">{item.batchNumber}</span>
                      {getStatusBadge(item.status)}
                      {getQualityBadge(item.qualityCheckStatus)}
                      {isExpiringSoon && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ff9800] px-2.5 py-1 text-xs font-semibold text-white">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Expires in {daysUntilExpiry}d
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <h3 className="text-lg font-bold text-[#181818]">{item.productName}</h3>
                      <span className="rounded-full bg-[#f3f2f2] px-2 py-0.5 text-xs font-semibold text-[#706e6b]">
                        {item.productType}
                      </span>
                    </div>
                    <p className="text-sm text-[#706e6b]">{item.producerName}</p>

                    <div className="mt-3 grid gap-3 md:grid-cols-6">
                      <div>
                        <p className="text-xs text-[#706e6b]">Total Volume</p>
                        <p className="font-semibold text-[#181818]">
                          {item.totalVolume.toLocaleString()} {item.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Available</p>
                        <p className="font-semibold text-[#2e844a]">
                          {item.availableVolume.toLocaleString()} {item.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Allocated</p>
                        <p className="font-semibold text-[#0176d3]">
                          {item.allocatedVolume.toLocaleString()} {item.volumeUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">CI Score</p>
                        <p className="font-semibold text-[#2e844a]">{item.carbonIntensity} gCO₂e/MJ</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">GHG Reduction</p>
                        <p className="font-semibold text-[#2e844a]">{item.ghgReduction}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#706e6b]">Location</p>
                        <p className="font-semibold text-[#181818]">{item.airportCode || "N/A"}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#706e6b]">Available Volume</span>
                        <span className="font-semibold text-[#181818]">{availablePercentage}%</span>
                      </div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#e5e5e5]">
                        <div
                          className={`h-full rounded-full ${
                            availablePercentage > 50
                              ? "bg-gradient-to-r from-[#2e844a] to-[#4caf50]"
                              : availablePercentage > 20
                              ? "bg-gradient-to-r from-[#ff9800] to-[#f57c00]"
                              : "bg-gradient-to-r from-[#c23934] to-[#d32f2f]"
                          }`}
                          style={{ width: `${availablePercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#706e6b]">{item.pathway}</span>
                      <span className="text-xs text-[#706e6b]">•</span>
                      <span className="text-xs text-[#706e6b]">{item.feedstock}</span>
                      <span className="text-xs text-[#706e6b]">•</span>
                      {item.certifications.slice(0, 3).map((cert, i) => (
                        <span key={i} className="rounded-full bg-[#e3f2fd] px-2 py-0.5 text-xs font-medium text-[#0176d3]">
                          {cert}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 text-sm text-[#706e6b]">
                      <span>Received: {formatDate(item.receivedDate)}</span>
                      {item.expiryDate && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Expires: {formatDate(item.expiryDate)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    <Link
                      href={`/airline/inventory/${item.id}`}
                      className="rounded-lg border border-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-[#0176d3] transition-all hover:bg-[#f0f7ff]"
                    >
                      View Details
                    </Link>
                    {item.availableVolume > 0 && item.status === "available" && (
                      <Link
                        href={`/airline/inventory/allocate?batch=${item.id}`}
                        className="rounded-lg bg-[#0176d3] px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-[#014486]"
                      >
                        Allocate
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











