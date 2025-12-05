"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";

type BatchStatus = "available" | "partially_allocated" | "fully_allocated" | "delivered";

interface ProductionBatch {
  _id: string;
  batchNumber: string;
  productionDate: string;
  plantId: string;
  plantName: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  feedstockType: string;
  feedstockSupplier?: string;
  ghgReduction: number;
  meetsASTM: boolean;
  meetsISCC: boolean;
  meetsCORSIA: boolean;
  allocations: Array<{
    contractId: string;
    contractNumber: string;
    volume: number;
    allocatedAt: string;
  }>;
  allocatedVolume: number;
  availableVolume: number;
  status: BatchStatus;
}

interface Plant {
  _id: string;
  name: string;
  location: string;
  pathway: string;
  primaryFeedstock: string;
  annualCapacity: number;
  ghgReduction: number;
}

type TabType = "batches" | "capacity";

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState<TabType>("batches");
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batchFilter, setBatchFilter] = useState<"all" | BatchStatus>("all");
  const [showLogModal, setShowLogModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchNumber: "",
    productionDate: "",
    plantId: "",
    plantName: "",
    volume: "",
    feedstockType: "UCO",
    ghgReduction: "",
    meetsASTM: true,
    meetsISCC: true,
    meetsCORSIA: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [batchesRes, plantsRes] = await Promise.all([
        fetch("/api/production-batches"),
        fetch("/api/plants"),
      ]);

      if (!batchesRes.ok || !plantsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [batchesData, plantsData] = await Promise.all([
        batchesRes.json(),
        plantsRes.json(),
      ]);

      setBatches(batchesData.batches || []);
      setPlants(plantsData.plants || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load production data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBatches = useMemo(() => {
    if (batchFilter === "all") return batches;
    return batches.filter((b) => b.status === batchFilter);
  }, [batches, batchFilter]);

  const stats = useMemo(() => {
    const total = batches.reduce((sum, b) => sum + b.volume, 0);
    const allocated = batches.reduce((sum, b) => sum + b.allocatedVolume, 0);
    const available = batches.reduce((sum, b) => sum + b.availableVolume, 0);
    return { total, allocated, available };
  }, [batches]);

  const totalCapacity = useMemo(() => {
    return plants.reduce((sum, p) => sum + p.annualCapacity, 0);
  }, [plants]);

  const getStatusBadge = (status: BatchStatus) => {
    const styles: Record<BatchStatus, string> = {
      available: "bg-[#e8f5e9] text-[#2e844a]",
      partially_allocated: "bg-[#e3f2fd] text-[#0176d3]",
      fully_allocated: "bg-[#fff3e0] text-[#e65100]",
      delivered: "bg-[#f3f2f2] text-[#706e6b]",
    };
    const labels: Record<BatchStatus, string> = {
      available: "Available",
      partially_allocated: "Partial",
      fully_allocated: "Allocated",
      delivered: "Delivered",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleSaveBatch = async () => {
    try {
      const plant = plants.find((p) => p._id === newBatch.plantId);
      if (!plant) {
        alert("Please select a plant");
        return;
      }

      const response = await fetch("/api/production-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBatch,
          plantName: plant.name,
          volume: parseFloat(newBatch.volume),
          ghgReduction: parseFloat(newBatch.ghgReduction),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create batch");
      }

      setShowLogModal(false);
      setNewBatch({
        batchNumber: "",
        productionDate: "",
        plantId: "",
        plantName: "",
        volume: "",
        feedstockType: "UCO",
        ghgReduction: "",
        meetsASTM: true,
        meetsISCC: true,
        meetsCORSIA: true,
      });
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save batch");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading production data...</p>
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
          <h3 className="text-lg font-semibold text-[#181818]">Failed to load production data</h3>
          <p className="mt-1 text-sm text-[#706e6b]">{error}</p>
          <button
            onClick={fetchData}
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
            <h1 className="text-3xl font-bold text-[#181818]">Production</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Track what you produce and allocate it to contracts
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Batch
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#e5e5e5]">
          {(
            [
              { id: "batches", label: "Production Batches" },
              { id: "capacity", label: "Capacity Planning" },
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
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0176d3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "batches" ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Total Produced</p>
              <p className="mt-1 text-2xl font-bold text-[#181818]">{stats.total.toLocaleString()}t</p>
            </div>
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Allocated</p>
              <p className="mt-1 text-2xl font-bold text-[#0176d3]">{stats.allocated.toLocaleString()}t</p>
            </div>
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Available</p>
              <p className="mt-1 text-2xl font-bold text-[#2e844a]">{stats.available.toLocaleString()}t</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#706e6b]">Filter:</span>
            {(["all", "available", "partially_allocated", "fully_allocated", "delivered"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setBatchFilter(filter)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  batchFilter === filter
                    ? "bg-[#0176d3] text-white"
                    : "bg-[#f3f2f2] text-[#706e6b] hover:bg-[#e5e5e5]"
                }`}
              >
                {filter === "all" ? "All" : filter.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Batches Table */}
          {batches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
                <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#181818]">No production batches yet</h3>
              <p className="mt-1 text-sm text-[#706e6b]">
                Log your first production batch to start tracking
              </p>
              <button
                onClick={() => setShowLogModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Log Batch
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#e5e5e5] bg-[#f8f9fa]">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Batch #</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Date</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Plant</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Volume</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Feedstock</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">GHG</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Allocated</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Available</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredBatches.map((batch) => (
                    <tr key={batch._id} className="group transition-colors hover:bg-[#f8f9fa]">
                      <td className="px-4 py-4">
                        <Link href={`/production/${batch._id}`} className="font-semibold text-[#0176d3] hover:underline">
                          {batch.batchNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-[#181818]">{formatDate(batch.productionDate)}</td>
                      <td className="px-4 py-4 text-[#181818]">{batch.plantName}</td>
                      <td className="px-4 py-4 font-medium text-[#181818]">{batch.volume.toLocaleString()}t</td>
                      <td className="px-4 py-4 text-[#181818]">{batch.feedstockType}</td>
                      <td className="px-4 py-4 text-[#181818]">{batch.ghgReduction}%</td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-[#181818]">{batch.allocatedVolume.toLocaleString()}t</span>
                        {batch.allocations.length > 0 && (
                          <p className="text-xs text-[#706e6b]">
                            {batch.allocations.map((a) => a.contractNumber).join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 font-medium text-[#2e844a]">{batch.availableVolume.toLocaleString()}t</td>
                      <td className="px-4 py-4">{getStatusBadge(batch.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBatches.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-[#706e6b]">
                  <svg className="h-12 w-12 text-[#e5e5e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  <p className="mt-3 text-sm font-medium">No batches found</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Capacity Planning */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#181818]">Production Plants</h2>
                <p className="text-sm text-[#706e6b]">
                  Total Annual Capacity: {totalCapacity.toLocaleString()} tonnes
                </p>
              </div>
              <Link
                href="/plants/new"
                className="rounded-lg border border-[#0176d3] px-3 py-2 text-sm font-semibold text-[#0176d3] hover:bg-[#f0f7ff]"
              >
                + Add Plant
              </Link>
            </div>

            {plants.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-[#e5e5e5] bg-[#f8f9fa] p-8 text-center">
                <p className="text-sm text-[#706e6b]">No plants configured yet</p>
                <Link
                  href="/plants/new"
                  className="mt-2 inline-block text-sm font-medium text-[#0176d3] hover:underline"
                >
                  Add your first plant →
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {plants.map((plant) => (
                  <div key={plant._id} className="rounded-lg border border-[#e5e5e5] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#181818]">{plant.name}</h3>
                        <p className="text-sm text-[#706e6b]">{plant.location}</p>
                      </div>
                      <Link
                        href={`/plants/${plant._id}`}
                        className="text-sm text-[#0176d3] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[#706e6b]">Pathway:</span>{" "}
                        <span className="font-medium text-[#181818]">{plant.pathway}</span>
                      </div>
                      <div>
                        <span className="text-[#706e6b]">Feedstock:</span>{" "}
                        <span className="font-medium text-[#181818]">{plant.primaryFeedstock}</span>
                      </div>
                      <div>
                        <span className="text-[#706e6b]">Capacity:</span>{" "}
                        <span className="font-medium text-[#181818]">{plant.annualCapacity.toLocaleString()}t/yr</span>
                      </div>
                      <div>
                        <span className="text-[#706e6b]">GHG:</span>{" "}
                        <span className="font-medium text-[#2e844a]">{plant.ghgReduction}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Log Batch Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e5e5e5] px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#181818]">Log Production Batch</h2>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="rounded-lg p-2 text-[#706e6b] hover:bg-[#f3f2f2]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {plants.length === 0 ? (
                <div className="rounded-lg border border-[#ff9800]/30 bg-[#fff8e1] p-4 text-center">
                  <p className="text-sm text-[#e65100]">
                    You need to add a plant before logging production batches.
                  </p>
                  <Link
                    href="/plants/new"
                    className="mt-2 inline-block text-sm font-medium text-[#0176d3] hover:underline"
                  >
                    Add a plant →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Batch Number (optional)
                      <input
                        value={newBatch.batchNumber}
                        onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                        placeholder="Auto-generated if empty"
                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                      />
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Production Date *
                      <input
                        type="date"
                        value={newBatch.productionDate}
                        onChange={(e) => setNewBatch({ ...newBatch, productionDate: e.target.value })}
                        className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                        required
                      />
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Plant *
                      <select
                        value={newBatch.plantId}
                        onChange={(e) => setNewBatch({ ...newBatch, plantId: e.target.value })}
                        className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
                        required
                      >
                        <option value="">Select a plant</option>
                        {plants.map((plant) => (
                          <option key={plant._id} value={plant._id}>
                            {plant.name} ({plant.location})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Volume Produced *
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="number"
                          value={newBatch.volume}
                          onChange={(e) => setNewBatch({ ...newBatch, volume: e.target.value })}
                          placeholder="2500"
                          className="w-full rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                          required
                        />
                        <span className="text-sm text-[#706e6b]">tonnes</span>
                      </div>
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Feedstock Type *
                      <select
                        value={newBatch.feedstockType}
                        onChange={(e) => setNewBatch({ ...newBatch, feedstockType: e.target.value })}
                        className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
                      >
                        <option>UCO</option>
                        <option>Tallow</option>
                        <option>Camelina</option>
                        <option>Corn Oil</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      GHG Reduction *
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="number"
                          value={newBatch.ghgReduction}
                          onChange={(e) => setNewBatch({ ...newBatch, ghgReduction: e.target.value })}
                          placeholder="78"
                          className="w-full rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                          required
                        />
                        <span className="text-sm text-[#706e6b]">%</span>
                      </div>
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newBatch.meetsASTM}
                        onChange={(e) => setNewBatch({ ...newBatch, meetsASTM: e.target.checked })}
                        className="h-4 w-4 rounded text-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">Meets ASTM D7566</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newBatch.meetsISCC}
                        onChange={(e) => setNewBatch({ ...newBatch, meetsISCC: e.target.checked })}
                        className="h-4 w-4 rounded text-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">Meets ISCC EU</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newBatch.meetsCORSIA}
                        onChange={(e) => setNewBatch({ ...newBatch, meetsCORSIA: e.target.checked })}
                        className="h-4 w-4 rounded text-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">CORSIA eligible</span>
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-[#e5e5e5] px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
                >
                  Cancel
                </button>
                {plants.length > 0 && (
                  <button
                    onClick={handleSaveBatch}
                    className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
                  >
                    Save Batch
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
