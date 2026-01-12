"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ComplianceStatus = "verified" | "pending" | "review";

interface ProducerDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  owner: string;
}

interface ComplianceCheck {
  id: string;
  title: string;
  status: ComplianceStatus;
  summary: string;
  owner: string;
  lastUpdated: string;
}

interface CapacityWindow {
  id: string;
  label: string;
  committed: number;
  available: number;
}

interface Plant {
  _id: string;
  name: string;
  location: string;
  pathway: string;
  primaryFeedstock: string;
  annualCapacity: number;
  ghgReduction: number;
  certifications: Array<{
    name: string;
    status: "valid" | "expiring" | "expired";
    validUntil?: string;
  }>;
}

interface Certificate {
  _id: string;
  name: string;
  certificateType: string;
  issuingBody: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
        <p className="text-sm text-[#706e6b]">Loading producer profile...</p>
      </div>
    </div>
  );
}

// Main page export wrapped in Suspense
export default function BuyerProducerProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BuyerProducerProfileContent />
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function BuyerProducerProfileContent() {
  const searchParams = useSearchParams();
  const producerId = searchParams.get("producer") || "default";

  const [plants, setPlants] = useState<Plant[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<ProducerDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [plantsRes, certsRes] = await Promise.all([
        fetch("/api/plants"),
        fetch("/api/certificates"),
      ]);

      if (plantsRes.ok) {
        const plantsData = await plantsRes.json();
        setPlants(plantsData.plants || []);
      }

      if (certsRes.ok) {
        const certsData = await certsRes.json();
        setCertificates(certsData.certificates || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploads((previous) => [
        {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || "Document",
          uploadedAt: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          owner: "Airline User",
        },
        ...previous,
      ]);
      setUploading(false);
    }, 600);
    event.target.value = "";
  };

  const getComplianceColor = (status: ComplianceStatus) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "review":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Generate compliance checks from certificates
  const complianceChecks: ComplianceCheck[] = certificates.map((cert) => ({
    id: cert._id,
    title: cert.name,
    status: cert.status === "valid" ? "verified" : cert.status === "expiring" ? "pending" : "review",
    summary: `${cert.certificateType} certification from ${cert.issuingBody}. Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`,
    owner: "Compliance Team",
    lastUpdated: new Date(cert.expiryDate).toLocaleDateString(),
  }));

  // Calculate total capacity from plants
  const totalCapacity = plants.reduce((sum, p) => sum + p.annualCapacity, 0);

  // Generate capacity windows
  const currentYear = new Date().getFullYear();
  const capacityWindows: CapacityWindow[] = [
    { id: "1", label: `Q1-Q2 ${currentYear + 1}`, committed: Math.floor(totalCapacity * 0.4), available: Math.floor(totalCapacity * 0.2) },
    { id: "2", label: `Q3-Q4 ${currentYear + 1}`, committed: Math.floor(totalCapacity * 0.3), available: Math.floor(totalCapacity * 0.3) },
    { id: "3", label: `${currentYear + 2}`, committed: Math.floor(totalCapacity * 0.2), available: Math.floor(totalCapacity * 0.5) },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading producer profile...</p>
        </div>
      </div>
    );
  }

  if (plants.length === 0 && certificates.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
            Airline Perspective
          </p>
          <h1 className="text-3xl font-bold text-[#181818]">Producer Profile</h1>
        </div>
        <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
            <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#181818]">No producer data available</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            Producers need to set up their plants and certificates first.
          </p>
          <Link
            href="/buyer/marketplace"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const feedstocks = [...new Set(plants.map((p) => p.primaryFeedstock))];
  const producerName = plants[0]?.name?.split(" - ")[0] || "SAF Producer";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              Airline Perspective
            </p>
            <h1 className="text-3xl font-bold text-[#181818]">
              {producerName} — Producer Profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#706e6b]">
              Review compliance posture, confirmed capacity, and upload required diligence lists prior
              to awarding long-term offtake agreements.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#706e6b]">
              <span>{plants.length} Production Facilities</span>
              <span className="h-4 w-px bg-[#e5e5e5]" />
              <span>{feedstocks.join(", ")} Feedstocks</span>
              <span className="h-4 w-px bg-[#e5e5e5]" />
              <span>{certificates.length} Active Certifications</span>
            </div>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0176d3] bg-[#f5f9ff] px-4 py-2 text-sm font-semibold text-[#014486] shadow-sm transition-colors hover:bg-white">
            Export Summary
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
            Total Certified Capacity
          </p>
          <p className="mt-2 text-2xl font-bold text-[#181818]">{totalCapacity.toLocaleString()} MT/yr</p>
          <p className="text-sm text-[#706e6b]">{feedstocks.join(", ")} • {plants.length} facilities</p>
        </div>
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
            Valid Certifications
          </p>
          <p className="mt-2 text-2xl font-bold text-[#181818]">{certificates.filter((c) => c.status === "valid").length}</p>
          <p className="text-sm text-[#706e6b]">
            {certificates.filter((c) => c.status === "expiring").length} expiring soon
          </p>
        </div>
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
            Avg GHG Reduction
          </p>
          <p className="mt-2 text-2xl font-bold text-[#181818]">
            {plants.length > 0 ? Math.round(plants.reduce((sum, p) => sum + p.ghgReduction, 0) / plants.length) : 0}%
          </p>
          <p className="text-sm text-[#706e6b]">Across all pathways</p>
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#181818]">Compliance Checks</h2>
            <p className="text-sm text-[#706e6b]">
              Track regulator and certification milestones before final contracting.
            </p>
          </div>
          <button className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm font-semibold text-[#0176d3] hover:bg-[#f8f9fa]">
            Request Update
          </button>
        </div>
        {complianceChecks.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-[#e5e5e5] bg-[#f8f9fa] p-8 text-center">
            <p className="text-sm text-[#706e6b]">No certificates uploaded yet</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {complianceChecks.slice(0, 6).map((check) => (
              <div
                key={check.id}
                className="flex flex-col justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#181818]">{check.title}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getComplianceColor(check.status)}`}>
                      {check.status === "verified"
                        ? "Verified"
                        : check.status === "pending"
                          ? "Expiring"
                          : "Expired"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#3e3e3c]">{check.summary}</p>
                </div>
                <div className="mt-3 text-xs text-[#706e6b]">
                  <p>Owner: {check.owner}</p>
                  <p>Expires: {check.lastUpdated}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#181818]">Capacity Outlook</h2>
            <p className="text-sm text-[#706e6b]">
              Confirm available MT per quarter prior to issuing awards.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-semibold text-[#2e844a]">
            Based on plant data
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {capacityWindows.map((window) => (
            <div key={window.id} className="rounded-xl border border-[#e5e5e5] p-4">
              <p className="text-sm font-semibold text-[#706e6b]">{window.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#706e6b]">Committed</p>
                  <p className="text-2xl font-bold text-[#181818]">{Math.round(window.committed / 1000)}k MT</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-[#706e6b]">Available</p>
                  <p className="text-xl font-semibold text-[#2e844a]">{Math.round(window.available / 1000)}k MT</p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#f3f2f2]">
                <div
                  className="h-full rounded-full bg-[#0176d3]"
                  style={{
                    width: `${(window.committed / (window.committed + window.available)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#181818]">Document Requests & Uploads</h2>
              <p className="text-sm text-[#706e6b]">
                Airlines can request feedstock lists, plant capacity proof, or compliance packs and
                receive uploads securely.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#0176d3] px-4 py-2 text-sm font-semibold text-[#0176d3] hover:bg-[#f5f9ff]">
              <input type="file" className="hidden" onChange={handleUpload} />
              {uploading ? "Uploading…" : "Upload Document"}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </label>
          </div>
          <div className="mt-4 divide-y divide-[#f3f2f2] rounded-lg border border-[#f3f2f2]">
            {uploads.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#181818]">{item.name}</p>
                  <p className="text-xs text-[#706e6b]">{item.type}</p>
                </div>
                <div className="text-xs text-[#706e6b]">
                  <p>{item.uploadedAt}</p>
                  <p>By {item.owner}</p>
                </div>
                <button className="text-xs font-semibold text-[#0176d3] hover:underline">
                  Download
                </button>
              </div>
            ))}
            {uploads.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-[#706e6b]">
                No documents yet. Request a list or upload supporting files.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#181818]">Airline Checklist</h3>
          <p className="mt-1 text-sm text-[#706e6b]">
            Quick reference before approving a producer.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#181818]">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2e844a]" />
              Confirm compliance certificates are current for planned delivery window.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2e844a]" />
              Validate available capacity matches RFQ requirements and feedstock mix.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#ff9800]" />
              Review uploaded diligence lists and flag missing documentation.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#0176d3]" />
              Align payment terms and logistics corridors before issuing a counter-bid.
            </li>
          </ul>
          <button className="mt-6 w-full rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#014486]">
            Mark Producer as Ready
          </button>
        </div>
      </section>
    </div>
  );
}
