"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FuelType = "HEFA" | "AtJ" | "PtL" | "FT";
type PricingType = "indexed" | "fixed";

interface VolumeBreakdown {
  year: string;
  volume: number;
  location: string;
}

export default function CreateRFQPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Buyer Information
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [source, setSource] = useState<"email" | "phone" | "meeting" | "rfp">("email");

  // Volume Requirements
  const [totalVolume, setTotalVolume] = useState(15000);
  const [volumeBreakdown, setVolumeBreakdown] = useState<VolumeBreakdown[]>([
    { year: "2027", volume: 5000, location: "Frankfurt (FRA)" },
    { year: "2028", volume: 5000, location: "Frankfurt (FRA)" },
    { year: "2029", volume: 5000, location: "Frankfurt (FRA)" },
  ]);

  // Fuel Specifications
  const [fuelType, setFuelType] = useState<FuelType>("HEFA");
  const [feedstock, setFeedstock] = useState("Any");
  const [minGHGReduction, setMinGHGReduction] = useState(65);

  // Pricing
  const [pricingType, setPricingType] = useState<PricingType>("indexed");
  const [priceIndex, setPriceIndex] = useState("Argus UCO FOB Rotterdam");
  const [premium, setPremium] = useState(150);
  const [targetPrice, setTargetPrice] = useState(1800);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");

  // Terms
  const [incoterms, setIncoterms] = useState("DAP");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [responseDeadline, setResponseDeadline] = useState("");

  // Certifications
  const [requiredCerts, setRequiredCerts] = useState<string[]>(["ISCC EU", "CORSIA"]);

  // Notes
  const [notes, setNotes] = useState("");

  const addVolumeYear = () => {
    setVolumeBreakdown((prev) => [
      ...prev,
      { year: "2030", volume: 5000, location: "Frankfurt (FRA)" },
    ]);
  };

  const updateVolumeBreakdown = (
    index: number,
    field: keyof VolumeBreakdown,
    value: string | number
  ) => {
    setVolumeBreakdown((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeVolumeYear = (index: number) => {
    setVolumeBreakdown((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCert = (cert: string) => {
    setRequiredCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleSubmit = (event: FormEvent, asDraft: boolean = false) => {
    event.preventDefault();
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      router.push("/opportunities");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/opportunities"
            className="rounded-lg p-2 text-[#706e6b] hover:bg-[#f3f2f2] hover:text-[#181818]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#181818]">Create RFQ</h1>
            <p className="mt-1 text-base text-[#706e6b]">
              Manually enter an RFQ from an email, call, or meeting
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Buyer Information */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Buyer Information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Company Name *
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Lufthansa Cargo"
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Contact Name
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Hans Mueller"
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Contact Email
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hans.mueller@lufthansa.com"
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Source
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as typeof source)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="meeting">Meeting</option>
                <option value="rfp">RFP Document</option>
              </select>
            </label>
          </div>
          <div className="mt-4">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Original RFQ Document
              <div className="mt-1.5 flex items-center justify-center rounded-lg border-2 border-dashed border-[#c9c9c9] px-6 py-8 transition-colors hover:border-[#0176d3]">
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-[#c9c9c9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-[#706e6b]">
                    <span className="font-medium text-[#0176d3]">Upload PDF</span> or drag and drop
                  </p>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Volume Requirements */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Volume Requirements</h2>
          <div className="mt-4">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Total Volume *
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  required
                  type="number"
                  min={0}
                  value={totalVolume}
                  onChange={(e) => setTotalVolume(Number(e.target.value))}
                  className="w-40 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                />
                <span className="text-sm text-[#706e6b]">tonnes</span>
              </div>
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-[#3e3e3c]">Breakdown by Year</p>
            <div className="mt-2 space-y-3">
              {volumeBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={item.year}
                    onChange={(e) => updateVolumeBreakdown(index, "year", e.target.value)}
                    className="w-28 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm"
                  >
                    {["2025", "2026", "2027", "2028", "2029", "2030"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.volume}
                    onChange={(e) => updateVolumeBreakdown(index, "volume", Number(e.target.value))}
                    className="w-28 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm"
                  />
                  <span className="text-sm text-[#706e6b]">t</span>
                  <input
                    value={item.location}
                    onChange={(e) => updateVolumeBreakdown(index, "location", e.target.value)}
                    placeholder="Location"
                    className="flex-1 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeVolumeYear(index)}
                    className="rounded-lg p-2 text-[#706e6b] hover:bg-[#ffebee] hover:text-[#c23934]"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVolumeYear}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0176d3] hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Year
            </button>
          </div>
        </section>

        {/* Fuel Specifications */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Fuel Specifications</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Fuel Type *
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
              >
                <option value="HEFA">HEFA</option>
                <option value="AtJ">AtJ (Alcohol-to-Jet)</option>
                <option value="PtL">PtL (Power-to-Liquid)</option>
                <option value="FT">FT (Fischer-Tropsch)</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Feedstock
              <select
                value={feedstock}
                onChange={(e) => setFeedstock(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
              >
                <option value="Any">Any</option>
                <option value="UCO">UCO (Used Cooking Oil)</option>
                <option value="Tallow">Tallow</option>
                <option value="Camelina">Camelina</option>
                <option value="Corn">Corn</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Min GHG Reduction
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={minGHGReduction}
                  onChange={(e) => setMinGHGReduction(Number(e.target.value))}
                  className="w-24 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                />
                <span className="text-sm text-[#706e6b]">%</span>
              </div>
            </label>
          </div>
        </section>

        {/* Pricing Structure */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Pricing Structure</h2>
          <div className="mt-4">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Type *
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pricingType"
                    checked={pricingType === "indexed"}
                    onChange={() => setPricingType("indexed")}
                    className="h-4 w-4 border-[#c9c9c9] text-[#0176d3] focus:ring-[#0176d3]"
                  />
                  <span className="text-sm text-[#181818]">Indexed</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pricingType"
                    checked={pricingType === "fixed"}
                    onChange={() => setPricingType("fixed")}
                    className="h-4 w-4 border-[#c9c9c9] text-[#0176d3] focus:ring-[#0176d3]"
                  />
                  <span className="text-sm text-[#181818]">Fixed</span>
                </label>
              </div>
            </label>
          </div>

          {pricingType === "indexed" ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Price Index
                <input
                  value={priceIndex}
                  onChange={(e) => setPriceIndex(e.target.value)}
                  placeholder="Argus UCO FOB Rotterdam"
                  className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Premium/Discount
                <div className="mt-1.5 flex items-center gap-2">
                  <select className="rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm">
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                  <input
                    type="number"
                    value={premium}
                    onChange={(e) => setPremium(Number(e.target.value))}
                    className="w-28 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                  />
                  <span className="text-sm text-[#706e6b]">per tonne</span>
                </div>
              </label>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Target Price
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-32 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                  />
                  <span className="text-sm text-[#706e6b]">per tonne</span>
                </div>
              </label>
              <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                Currency
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as typeof currency)}
                  className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>
          )}
        </section>

        {/* Terms */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Terms</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Incoterms
              <select
                value={incoterms}
                onChange={(e) => setIncoterms(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
              >
                <option value="DAP">DAP</option>
                <option value="FOB">FOB</option>
                <option value="CIF">CIF</option>
                <option value="EXW">EXW</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Payment Terms
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Response Deadline *
              <input
                required
                type="date"
                value={responseDeadline}
                onChange={(e) => setResponseDeadline(e.target.value)}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Required Certifications */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Required Certifications</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {["ISCC EU", "CORSIA", "RSB", "RED II", "ASTM D7566", "LCFS"].map((cert) => (
              <label key={cert} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={requiredCerts.includes(cert)}
                  onChange={() => toggleCert(cert)}
                  className="h-4 w-4 rounded border-[#c9c9c9] text-[#0176d3] focus:ring-[#0176d3]"
                />
                <span className="text-sm text-[#181818]">{cert}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#181818]">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context, special requirements..."
            rows={4}
            className="mt-4 w-full rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
          />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/opportunities"
            className="rounded-lg border border-[#e5e5e5] px-6 py-2.5 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="rounded-lg border border-[#0176d3] px-6 py-2.5 text-sm font-semibold text-[#0176d3] hover:bg-[#f0f7ff] disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#014486] disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create RFQ"}
          </button>
        </div>
      </form>
    </div>
  );
}























