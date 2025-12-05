"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";

type CertificationType = "ISCC EU" | "ISCC CORSIA" | "RSB" | "ASTM D7566" | "RED II" | "National Scheme" | "ISO" | "Other";
type CertStatus = "valid" | "expiring" | "expired";

interface Certificate {
  _id: string;
  producerId: string;
  name: string;
  certificateType: CertificationType;
  issuingBody: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  appliesTo: {
    plants: Array<{ plantId: string; plantName: string }>;
    products: Array<{ productId: string; productName: string }>;
    entireCompany: boolean;
  };
  fileUrl: string;
  fileKey: string;
  notes?: string;
  status: CertStatus;
}

interface Plant {
  _id: string;
  producerId: string;
  name: string;
  location: string;
  pathway: string;
  primaryFeedstock: string;
  annualCapacity: number;
  ghgReduction: number;
  certifications: Array<{
    docId: string;
    name: string;
    status: CertStatus;
    validUntil?: string;
  }>;
  status: "fully_certified" | "certificate_expiring" | "partially_certified" | "not_certified";
}

interface Product {
  _id: string;
  producerId: string;
  name: string;
  pathway: string;
  feedstock: string;
  ghgReduction: number;
  plantId: string;
  plantName: string;
  specifications: {
    astmAnnex?: string;
    maxBlendRatio?: number;
    freezePoint?: number;
  };
  eligibleSchemes: string[];
  status: "active" | "inactive";
}

type TabType = "certificates" | "plants";

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("certificates");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certFilter, setCertFilter] = useState<CertificationType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<CertStatus | "All">("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newCert, setNewCert] = useState({
    name: "",
    certificateType: "ISCC EU" as CertificationType,
    issuingBody: "",
    certificateNumber: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
    entireCompany: false,
    selectedPlants: [] as string[],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [certsRes, plantsRes, productsRes] = await Promise.all([
        fetch("/api/certificates"),
        fetch("/api/plants"),
        fetch("/api/products"),
      ]);

      if (!certsRes.ok || !plantsRes.ok || !productsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [certsData, plantsData, productsData] = await Promise.all([
        certsRes.json(),
        plantsRes.json(),
        productsRes.json(),
      ]);

      setCertificates(certsData.certificates || []);
      setPlants(plantsData.plants || []);
      setProducts(productsData.products || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load compliance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCerts = useMemo(() => {
    let filtered = certificates;
    if (certFilter !== "All") {
      filtered = filtered.filter((c) => c.certificateType === certFilter);
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    return filtered;
  }, [certificates, certFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      valid: certificates.filter((c) => c.status === "valid").length,
      expiring: certificates.filter((c) => c.status === "expiring").length,
      expired: certificates.filter((c) => c.status === "expired").length,
    }),
    [certificates]
  );

  const getStatusBadge = (status: CertStatus) => {
    const styles = {
      valid: "bg-[#e8f5e9] text-[#2e844a]",
      expiring: "bg-[#fff3e0] text-[#e65100]",
      expired: "bg-[#ffebee] text-[#c23934]",
    };
    const icons = {
      valid: "🟢",
      expiring: "🟡",
      expired: "🔴",
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
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

  const getAppliesToText = (cert: Certificate): string => {
    if (cert.appliesTo.entireCompany) return "Company-wide";
    const items: string[] = [];
    cert.appliesTo.plants?.forEach((p) => items.push(p.plantName));
    cert.appliesTo.products?.forEach((p) => items.push(p.productName));
    return items.length > 0 ? items.join(", ") : "Not specified";
  };

  const handleUploadCert = async () => {
    try {
      // For now, we'll create a mock file URL since we don't have file upload implemented
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId: "default-producer",
          name: newCert.name,
          certificateType: newCert.certificateType,
          issuingBody: newCert.issuingBody,
          certificateNumber: newCert.certificateNumber,
          issueDate: newCert.issueDate,
          expiryDate: newCert.expiryDate,
          notes: newCert.notes,
          fileUrl: "/placeholder-certificate.pdf",
          fileKey: `cert-${Date.now()}`,
          appliesTo: {
            plants: newCert.selectedPlants.map((id) => {
              const plant = plants.find((p) => p._id === id);
              return { plantId: id, plantName: plant?.name || "Unknown" };
            }),
            products: [],
            entireCompany: newCert.entireCompany,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create certificate");
      }

      setShowUploadModal(false);
      setNewCert({
        name: "",
        certificateType: "ISCC EU",
        issuingBody: "",
        certificateNumber: "",
        issueDate: "",
        expiryDate: "",
        notes: "",
        entireCompany: false,
        selectedPlants: [],
      });
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload certificate");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
          <p className="text-sm text-[#706e6b]">Loading compliance data...</p>
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
          <h3 className="text-lg font-semibold text-[#181818]">Failed to load compliance data</h3>
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
            <h1 className="text-3xl font-bold text-[#181818]">Compliance</h1>
            <p className="mt-1 text-base text-[#706e6b]">Manage certifications and prove compliance</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Certificate
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#e5e5e5]">
          {(
            [
              { id: "certificates", label: "Certificates" },
              { id: "plants", label: "Plants & Products" },
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

      {activeTab === "certificates" ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Valid Certificates</p>
              <p className="mt-1 text-2xl font-bold text-[#2e844a]">{stats.valid}</p>
        </div>
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Expiring in 30 Days</p>
              <p className="mt-1 text-2xl font-bold text-[#e65100]">{stats.expiring}</p>
        </div>
            <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Expired</p>
              <p className="mt-1 text-2xl font-bold text-[#c23934]">{stats.expired}</p>
        </div>
      </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#706e6b]">Type:</span>
              <select
                value={certFilter}
                onChange={(e) => setCertFilter(e.target.value as typeof certFilter)}
                className="rounded-lg border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm"
              >
                <option value="All">All</option>
                <option value="ISCC EU">ISCC EU</option>
                <option value="ISCC CORSIA">ISCC CORSIA</option>
                <option value="RSB">RSB</option>
                <option value="ASTM D7566">ASTM D7566</option>
                <option value="RED II">RED II</option>
                <option value="ISO">ISO</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#706e6b]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-lg border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm"
              >
                <option value="All">All</option>
                <option value="valid">Valid</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          {certificates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f2]">
                <svg className="h-8 w-8 text-[#706e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#181818]">No certificates yet</h3>
              <p className="mt-1 text-sm text-[#706e6b]">Upload your first certificate to start tracking compliance</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Certificate
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#e5e5e5] bg-[#f8f9fa]">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Name</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Type</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Applies To</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Valid Until</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Status</th>
                    <th className="px-4 py-3 font-semibold text-[#706e6b]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredCerts.map((cert) => (
                    <tr key={cert._id} className="group transition-colors hover:bg-[#f8f9fa]">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#181818]">{cert.name}</div>
                        <div className="text-xs text-[#706e6b]">{cert.issuingBody}</div>
                      </td>
                      <td className="px-4 py-4 text-[#181818]">{cert.certificateType}</td>
                      <td className="px-4 py-4 text-[#181818]">{getAppliesToText(cert)}</td>
                      <td className="px-4 py-4 text-[#181818]">{formatDate(cert.expiryDate)}</td>
                      <td className="px-4 py-4">{getStatusBadge(cert.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/compliance/${cert._id}`}
                            className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
                          >
                            View
                          </Link>
                          {cert.fileUrl && (
                            <a
                              href={cert.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-[#0176d3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#014486]"
                            >
                              Download
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-[#706e6b]">
                  <svg className="h-12 w-12 text-[#e5e5e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-3 text-sm font-medium">No certificates match your filters</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Plants Section */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#181818]">Production Plants</h2>
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
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {plants.map((plant) => (
                  <div key={plant._id} className="rounded-lg border border-[#e5e5e5] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#181818]">{plant.name}</h3>
                        <p className="text-sm text-[#706e6b]">{plant.location}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          plant.status === "fully_certified"
                            ? "bg-[#e8f5e9] text-[#2e844a]"
                            : plant.status === "certificate_expiring"
                            ? "bg-[#fff3e0] text-[#e65100]"
                            : "bg-[#ffebee] text-[#c23934]"
                        }`}
                      >
                        {plant.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
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
                    {plant.certifications && plant.certifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {plant.certifications.map((cert, i) => (
              <span
                            key={i}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              cert.status === "valid"
                                ? "bg-[#e8f5e9] text-[#2e844a]"
                                : cert.status === "expiring"
                                ? "bg-[#fff3e0] text-[#e65100]"
                                : "bg-[#ffebee] text-[#c23934]"
                            }`}
                          >
                            {cert.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#181818]">Products</h2>
              <Link
                href="/products/new"
                className="rounded-lg border border-[#0176d3] px-3 py-2 text-sm font-semibold text-[#0176d3] hover:bg-[#f0f7ff]"
              >
                + Add Product
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-[#e5e5e5] bg-[#f8f9fa] p-8 text-center">
                <p className="text-sm text-[#706e6b]">No products configured yet</p>
                <Link
                  href="/products/new"
                  className="mt-2 inline-block text-sm font-medium text-[#0176d3] hover:underline"
                >
                  Add your first product →
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {products.map((product) => (
                  <div key={product._id} className="rounded-lg border border-[#e5e5e5] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#181818]">{product.name}</h3>
                        <p className="text-sm text-[#706e6b]">Produced at: {product.plantName}</p>
                      </div>
                      <Link href={`/products/${product._id}`} className="text-sm text-[#0176d3] hover:underline">
                        Edit
                      </Link>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[#706e6b]">Pathway:</span>{" "}
                        <span className="font-medium text-[#181818]">{product.pathway}</span>
                      </div>
                      <div>
                        <span className="text-[#706e6b]">Feedstock:</span>{" "}
                        <span className="font-medium text-[#181818]">{product.feedstock}</span>
                      </div>
                      <div>
                        <span className="text-[#706e6b]">GHG:</span>{" "}
                        <span className="font-medium text-[#2e844a]">{product.ghgReduction}%</span>
                      </div>
                    </div>
                    {product.eligibleSchemes && product.eligibleSchemes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.eligibleSchemes.map((scheme, i) => (
                          <span key={i} className="rounded-full bg-[#e3f2fd] px-2 py-0.5 text-xs font-medium text-[#0176d3]">
                            {scheme}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e5e5e5] px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#181818]">Upload Certificate</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg p-2 text-[#706e6b] hover:bg-[#f3f2f2]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Document Name *
                  <input
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    placeholder="ISCC EU 2025"
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Certificate Type *
                  <select
                    value={newCert.certificateType}
                    onChange={(e) => setNewCert({ ...newCert, certificateType: e.target.value as CertificationType })}
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="ISCC EU">ISCC EU</option>
                    <option value="ISCC CORSIA">ISCC CORSIA</option>
                    <option value="RSB">RSB</option>
                    <option value="ASTM D7566">ASTM D7566</option>
                    <option value="RED II">RED II</option>
                    <option value="National Scheme">National Scheme</option>
                    <option value="ISO">ISO</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Issuing Body *
                  <input
                    value={newCert.issuingBody}
                    onChange={(e) => setNewCert({ ...newCert, issuingBody: e.target.value })}
                    placeholder="ISCC System GmbH"
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Certificate Number *
                  <input
                    value={newCert.certificateNumber}
                    onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                    placeholder="ISCC-EU-12345-2025"
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Issue Date *
                  <input
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Expiry Date *
                  <input
                    type="date"
                    value={newCert.expiryDate}
                    onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    required
                  />
                </label>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-[#3e3e3c]">Applies To</p>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newCert.entireCompany}
                      onChange={(e) => setNewCert({ ...newCert, entireCompany: e.target.checked })}
                      className="h-4 w-4 rounded text-[#0176d3]"
                    />
                    <span className="text-sm text-[#181818]">Entire Company</span>
                  </label>
                  {plants.map((plant) => (
                    <label key={plant._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newCert.selectedPlants.includes(plant._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCert({ ...newCert, selectedPlants: [...newCert.selectedPlants, plant._id] });
                          } else {
                            setNewCert({
                              ...newCert,
                              selectedPlants: newCert.selectedPlants.filter((id) => id !== plant._id),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded text-[#0176d3]"
                      />
                      <span className="text-sm text-[#181818]">{plant.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Upload File
                  <div className="mt-1.5 rounded-lg border-2 border-dashed border-[#c9c9c9] px-4 py-6 text-center text-sm text-[#706e6b] hover:border-[#0176d3]">
                    <p>Drag and drop or click to browse</p>
                    <p className="mt-1 text-xs">PDF, PNG, or JPG up to 10MB</p>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Notes
                  <textarea
                    value={newCert.notes}
                    onChange={(e) => setNewCert({ ...newCert, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    rows={2}
                  />
                </label>
              </div>
            </div>
            <div className="border-t border-[#e5e5e5] px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
                >
                  Cancel
              </button>
                <button
                  onClick={handleUploadCert}
                  className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
                >
                  Upload Certificate
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
