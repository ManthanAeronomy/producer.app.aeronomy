"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type Step = 1 | 2 | 3 | 4 | 5;

interface PlantAllocation {
  plantId: string;
  plantName: string;
  pathway: string;
  feedstock: string;
  ghgReduction: number;
  available: { year: number; volume: number }[];
  allocated: { year: number; volume: number }[];
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

export default function NewBidPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(true);

  // Step 1: Supply Source
  const [plants, setPlants] = useState<PlantAllocation[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);

  // Fetch plants from API
  const fetchPlants = useCallback(async () => {
    try {
      setLoadingPlants(true);
      const response = await fetch("/api/plants");
      if (!response.ok) throw new Error("Failed to fetch plants");
      const data = await response.json();

      // Transform plants to PlantAllocation format
      const currentYear = new Date().getFullYear();
      const plantAllocations: PlantAllocation[] = (data.plants || []).map((plant: Plant) => ({
        plantId: plant._id,
        plantName: `${plant.name} - ${plant.location}`,
        pathway: plant.pathway,
        feedstock: plant.primaryFeedstock,
        ghgReduction: plant.ghgReduction,
        available: [
          { year: currentYear + 1, volume: plant.annualCapacity },
          { year: currentYear + 2, volume: plant.annualCapacity },
          { year: currentYear + 3, volume: plant.annualCapacity },
        ],
        allocated: [
          { year: currentYear + 1, volume: 0 },
          { year: currentYear + 2, volume: 0 },
          { year: currentYear + 3, volume: 0 },
        ],
      }));

      setPlants(plantAllocations);
      if (plantAllocations.length > 0) {
        setSelectedPlants([plantAllocations[0].plantId]);
      }
    } catch (err) {
      console.error("Error fetching plants:", err);
    } finally {
      setLoadingPlants(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Step 2: Pricing
  const [pricingType, setPricingType] = useState<"indexed" | "fixed">("indexed");
  const [priceIndex, setPriceIndex] = useState("Argus UCO FOB Rotterdam");
  const [premium, setPremium] = useState(175);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");

  // Step 3: Terms
  const [incoterms, setIncoterms] = useState("DAP");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [acceptPenalties, setAcceptPenalties] = useState(true);
  const [penaltyAmount, setPenaltyAmount] = useState(25);
  const [gracePeriod, setGracePeriod] = useState(5);
  const [tolerance, setTolerance] = useState(10);

  // Step 4: Documents
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    "ISCC EU Certificate",
    "CORSIA Certification",
    "ASTM D7566 Approval",
  ]);

  // Step 5: Review
  const [approvalNotes, setApprovalNotes] = useState("");
  const [confirmCapacity, setConfirmCapacity] = useState(false);

  const steps = [
    { num: 1, label: "Supply" },
    { num: 2, label: "Pricing" },
    { num: 3, label: "Terms" },
    { num: 4, label: "Documents" },
    { num: 5, label: "Review" },
  ];

  const updateAllocation = (plantId: string, year: number, volume: number) => {
    setPlants((prev) =>
      prev.map((plant) => {
        if (plant.plantId !== plantId) return plant;
        return {
          ...plant,
          allocated: plant.allocated.map((a) =>
            a.year === year ? { ...a, volume } : a
          ),
        };
      })
    );
  };

  const handleSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      router.push("/bids");
    }, 1500);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181818]">Step 1: Supply Source</h2>
              <p className="mt-1 text-sm text-[#706e6b]">
                Which production facilities will fulfill this order?
              </p>
            </div>

            <div className="rounded-lg border border-[#0176d3]/20 bg-[#f0f7ff] p-4">
              <p className="text-sm font-medium text-[#0176d3]">
                RFQ Requirement: 15,000 tonnes (2027-2029)
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#181818]">Select Fulfillment Sources</h3>
              
              {plants.map((plant) => (
                <div
                  key={plant.plantId}
                  className={`rounded-xl border-2 p-5 transition-all ${
                    selectedPlants.includes(plant.plantId)
                      ? "border-[#0176d3] bg-[#f8fbff]"
                      : "border-[#e5e5e5] bg-white"
                  }`}
                >
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPlants.includes(plant.plantId)}
                      onChange={() =>
                        setSelectedPlants((prev) =>
                          prev.includes(plant.plantId)
                            ? prev.filter((p) => p !== plant.plantId)
                            : [...prev, plant.plantId]
                        )
                      }
                      className="mt-1 h-5 w-5 rounded border-[#c9c9c9] text-[#0176d3]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#181818]">{plant.plantName}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#706e6b]">
                        <span>Pathway: {plant.pathway}</span>
                        <span>•</span>
                        <span>Feedstock: {plant.feedstock}</span>
                        <span>•</span>
                        <span>GHG Reduction: {plant.ghgReduction}%</span>
                      </div>

                      {selectedPlants.includes(plant.plantId) && (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                            Volume Allocation
                          </p>
                          <div className="grid gap-3 md:grid-cols-3">
                            {plant.available.map((avail) => (
                              <div key={avail.year} className="rounded-lg bg-white p-3 border border-[#e5e5e5]">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-[#181818]">{avail.year}</span>
                                  <span className="text-xs text-[#706e6b]">
                                    {avail.volume.toLocaleString()}t available
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={avail.volume}
                                    value={plant.allocated.find((a) => a.year === avail.year)?.volume || 0}
                                    onChange={(e) =>
                                      updateAllocation(plant.plantId, avail.year, Number(e.target.value))
                                    }
                                    className="w-24 rounded border border-[#c9c9c9] px-2 py-1.5 text-sm"
                                  />
                                  <span className="text-sm text-[#706e6b]">t</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4">
              <h4 className="text-sm font-semibold text-[#181818]">Allocation Summary</h4>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#706e6b]">2027</span>
                  <span className="font-medium text-[#181818]">
                    5,000t allocated • ✅ Fully allocated
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#706e6b]">2028</span>
                  <span className="font-medium text-[#181818]">
                    5,000t allocated • ✅ Fully allocated
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#706e6b]">2029</span>
                  <span className="font-medium text-[#181818]">
                    5,000t allocated • ✅ Fully allocated
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-[#2e844a]">
                ✅ Blended GHG Reduction: 78% (exceeds 65% requirement)
              </p>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confirmCapacity}
                onChange={(e) => setConfirmCapacity(e.target.checked)}
                className="h-4 w-4 rounded border-[#c9c9c9] text-[#0176d3]"
              />
              <span className="text-sm text-[#181818]">
                I confirm we can produce this volume in the required timeframe
              </span>
            </label>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181818]">Step 2: Pricing</h2>
              <p className="mt-1 text-sm text-[#706e6b]">
                Define your pricing structure and validate margins
              </p>
            </div>

            <div className="rounded-lg border border-[#0176d3]/20 bg-[#f0f7ff] p-4">
              <p className="text-sm text-[#706e6b]">
                Buyer&apos;s Requested Structure:{" "}
                <span className="font-medium text-[#0176d3]">Indexed (Argus UCO FOB Rotterdam + premium)</span>
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#181818]">Your Offer</p>
              <div className="mt-3 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pricingType === "indexed"}
                    onChange={() => setPricingType("indexed")}
                    className="h-4 w-4 text-[#0176d3]"
                  />
                  <span className="text-sm text-[#181818]">Indexed</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pricingType === "fixed"}
                    onChange={() => setPricingType("fixed")}
                    className="h-4 w-4 text-[#0176d3]"
                  />
                  <span className="text-sm text-[#181818]">Fixed</span>
                </label>
              </div>
            </div>

            {pricingType === "indexed" && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Index Reference
                  <input
                    value={priceIndex}
                    onChange={(e) => setPriceIndex(e.target.value)}
                    className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                  Premium
                  <div className="mt-1.5 flex items-center gap-2">
                    <select className="rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm">
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as typeof currency)}
                      className="rounded-lg border border-[#c9c9c9] bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="EUR">€</option>
                      <option value="USD">$</option>
                    </select>
                    <input
                      type="number"
                      value={premium}
                      onChange={(e) => setPremium(Number(e.target.value))}
                      className="w-24 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
                    />
                    <span className="text-sm text-[#706e6b]">per tonne</span>
                  </div>
                </label>
              </div>
            )}

            {/* Margin Analysis */}
            <div className="rounded-xl border border-[#e5e5e5] bg-[#f8f9fa] p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#181818]">Margin Analysis</h3>
                <span className="rounded-full bg-[#fff3e0] px-2 py-0.5 text-xs font-medium text-[#e65100]">
                  Internal - Not shared with buyer
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#706e6b]">Assumed Index Price:</span>
                    <span className="font-medium text-[#181818]">€1,050/t (current Argus UCO)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706e6b]">Your Offer:</span>
                    <span className="font-medium text-[#181818]">€1,225/t (index + €{premium} premium)</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-[#706e6b]">Cost Breakdown (per tonne):</p>
                  <div className="flex justify-between">
                    <span className="text-[#706e6b]">├─ Feedstock:</span>
                    <span>€820</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706e6b]">├─ Production:</span>
                    <span>€180</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706e6b]">├─ Logistics (DAP):</span>
                    <span>€95</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706e6b]">└─ Platform fee:</span>
                    <span>€12</span>
                  </div>
                  <div className="flex justify-between border-t border-[#e5e5e5] pt-2 font-semibold">
                    <span className="text-[#181818]">Total Cost:</span>
                    <span>€1,107</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-white p-4 border border-[#e5e5e5]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#706e6b]">Your Price: <span className="font-bold text-[#181818]">€1,225</span></p>
                    <p className="text-sm text-[#706e6b]">Margin: <span className="font-bold text-[#ff9800]">€118/t (9.6%)</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#706e6b]">Total Contract Value</p>
                    <p className="text-2xl font-bold text-[#181818]">€18,375,000</p>
                    <p className="text-sm text-[#2e844a]">Total Margin: €1,770,000</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-[#2e844a]">✅ Margin above 8% threshold</span>
                  <span className="text-sm text-[#ff9800]">⚠️ Below 10% target - approval required</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181818]">Step 3: Terms</h2>
              <p className="mt-1 text-sm text-[#706e6b]">
                Define delivery and commercial terms
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#181818]">Delivery Terms</h3>
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
                <div>
                  <p className="text-sm font-medium text-[#3e3e3c]">Delivery Schedule</p>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="schedule" className="h-4 w-4 text-[#0176d3]" />
                      <span className="text-sm text-[#181818]">As per RFQ requirements</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="schedule" defaultChecked className="h-4 w-4 text-[#0176d3]" />
                      <span className="text-sm text-[#181818]">Custom schedule</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#181818]">Payment Terms</h3>
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
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#181818]">Late Delivery Penalties</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={acceptPenalties}
                    onChange={() => setAcceptPenalties(true)}
                    className="h-4 w-4 text-[#0176d3]"
                  />
                  <span className="text-sm text-[#181818]">Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!acceptPenalties}
                    onChange={() => setAcceptPenalties(false)}
                    className="h-4 w-4 text-[#0176d3]"
                  />
                  <span className="text-sm text-[#181818]">No</span>
                </label>
              </div>
              {acceptPenalties && (
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                    Penalty Amount
                    <div className="mt-1.5 flex items-center gap-2">
                      <span>€</span>
                      <input
                        type="number"
                        value={penaltyAmount}
                        onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                        className="w-20 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm"
                      />
                      <span className="text-xs text-[#706e6b]">per tonne per day late</span>
                    </div>
                  </label>
                  <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                    Grace Period
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(Number(e.target.value))}
                        className="w-16 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm"
                      />
                      <span className="text-xs text-[#706e6b]">days</span>
                    </div>
                  </label>
                  <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                    Maximum Liability
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="number"
                        value={5}
                        className="w-16 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm"
                        readOnly
                      />
                      <span className="text-xs text-[#706e6b]">% of delivery value</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Volume Flexibility (Tolerance)
              <div className="mt-1.5 flex items-center gap-2">
                <span>+/-</span>
                <input
                  type="number"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-16 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm"
                />
                <span className="text-xs text-[#706e6b]">%</span>
              </div>
            </label>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181818]">Step 4: Compliance Documents</h2>
              <p className="mt-1 text-sm text-[#706e6b]">
                Attach required certifications and supporting documents
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#181818]">Required by Buyer</h3>
              {["ISCC EU Certificate", "CORSIA Certification", "ASTM D7566 Approval"].map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-[#2e844a]">✅</span>
                    <div>
                      <p className="font-medium text-[#181818]">{doc}</p>
                      <p className="text-xs text-[#706e6b]">
                        {doc.includes("ISCC") && "Plant_A_ISCC_EU_2024.pdf │ Valid until Dec 2026"}
                        {doc.includes("CORSIA") && "Plant_A_CORSIA_2024.pdf │ Valid until Mar 2026"}
                        {doc.includes("ASTM") && "ASTM_D7566_Current.pdf │ Valid until Mar 2027"}
                      </p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-[#0176d3] hover:underline">Change</button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#181818]">Additional Documents</h3>
              <div className="flex flex-wrap gap-2">
                {["Company_Profile_2024.pdf", "Plant_A_Technical_Specs.pdf", "Feedstock_Sourcing_Policy.pdf"].map((doc) => (
                  <span key={doc} className="inline-flex items-center gap-2 rounded-full bg-[#f3f2f2] px-3 py-1.5 text-sm">
                    📄 {doc}
                    <button className="text-[#706e6b] hover:text-[#c23934]">×</button>
                  </span>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-[#0176d3] hover:underline">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Document
              </button>
            </div>

            <div className="rounded-lg border border-[#ff9800]/30 bg-[#fff8e1] p-4">
              <h4 className="text-sm font-semibold text-[#e65100]">⚠️ Compliance Notes</h4>
              <ul className="mt-2 space-y-1 text-sm text-[#e65100]">
                <li>• ASTM D7566 certification expires Mar 2027. Ensure renewal is completed before Q2 2027 deliveries.</li>
                <li>• All documents will be shared with buyer upon bid submission.</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181818]">Step 5: Review & Submit</h2>
              <p className="mt-1 text-sm text-[#706e6b]">
                Review your bid before submitting for approval
              </p>
            </div>

            <div className="rounded-xl border border-[#e5e5e5] bg-[#f8f9fa] p-6">
              <h3 className="text-lg font-bold text-[#181818]">Bid Summary</h3>
              <div className="mt-2 text-sm text-[#706e6b]">
                <p>Buyer: <span className="font-medium text-[#181818]">Lufthansa Cargo</span></p>
                <p>RFQ Reference: <span className="font-medium text-[#181818]">RFQ-2025-089</span></p>
                <p>Bid Number: <span className="font-medium text-[#181818]">B-2025-003 (v1)</span></p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Volume & Supply</h4>
                  <p className="mt-2 text-sm">Total Volume: <span className="font-bold">15,000 tonnes</span></p>
                  <p className="text-sm">2027: 5,000t (Plant A)</p>
                  <p className="text-sm">2028: 5,000t (Plant A)</p>
                  <p className="text-sm">2029: 5,000t (Plant A)</p>
                  <p className="mt-2 text-sm text-[#2e844a]">Blended GHG: 78%</p>
                </div>
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Pricing</h4>
                  <p className="mt-2 text-sm">Structure: <span className="font-bold">Indexed</span></p>
                  <p className="text-sm">Index: Argus UCO FOB Rotterdam</p>
                  <p className="text-sm">Premium: +€{premium}/tonne</p>
                  <p className="mt-2 text-sm">Est. Value: <span className="font-bold">€18.4M</span></p>
                  <p className="text-sm">Est. Margin: <span className="font-bold text-[#ff9800]">9.6%</span></p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Delivery Terms</h4>
                  <p className="mt-2 text-sm">Incoterms: {incoterms} Frankfurt</p>
                  <p className="text-sm">Schedule: Quarterly</p>
                  <p className="text-sm">Tolerance: +/- {tolerance}%</p>
                </div>
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Commercial Terms</h4>
                  <p className="mt-2 text-sm">Payment: {paymentTerms}</p>
                  <p className="text-sm">Late penalty: €{penaltyAmount}/t/day</p>
                  <p className="text-sm">Max liability: 5%</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-[#706e6b]">
                Documents Attached: <span className="font-medium text-[#181818]">6 files</span>
              </p>
            </div>

            {/* Approval Required */}
            <div className="rounded-xl border-2 border-[#ff9800]/30 bg-[#fff8e1] p-5">
              <h3 className="text-sm font-bold text-[#e65100]">Approval Required</h3>
              <p className="mt-1 text-sm text-[#e65100]">This bid requires internal approval because:</p>
              <ul className="mt-2 list-inside list-disc text-sm text-[#e65100]">
                <li>Margin below 10% target (9.6%)</li>
                <li>Contract value exceeds €5M</li>
              </ul>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Approvers:</p>
                <div className="flex items-center justify-between rounded bg-white px-3 py-2">
                  <span className="text-sm">1. Jane Doe (Sales Director)</span>
                  <span className="text-xs text-[#ff9800]">Required</span>
                </div>
                <div className="flex items-center justify-between rounded bg-white px-3 py-2">
                  <span className="text-sm">2. John Smith (CFO)</span>
                  <span className="text-xs text-[#ff9800]">Required</span>
                </div>
              </div>
            </div>

            <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
              Notes for Approvers
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Customer is strategic. This is entry point for larger partnership..."
                rows={3}
                className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2.5 text-sm"
              />
            </label>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/bids"
            className="rounded-lg p-2 text-[#706e6b] hover:bg-[#f3f2f2] hover:text-[#181818]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#181818]">New Bid</h1>
            <p className="text-sm text-[#706e6b]">Lufthansa Cargo • RFQ-2025-089</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.num as Step)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  currentStep === step.num
                    ? "bg-[#0176d3] text-white"
                    : currentStep > step.num
                    ? "bg-[#e8f5e9] text-[#2e844a]"
                    : "bg-[#f3f2f2] text-[#706e6b]"
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  currentStep > step.num ? "bg-[#2e844a] text-white" : "bg-white/20"
                }`}>
                  {currentStep > step.num ? "✓" : step.num}
                </span>
                {step.label}
              </button>
              {index < steps.length - 1 && (
                <div className={`mx-2 h-0.5 w-8 ${currentStep > step.num ? "bg-[#2e844a]" : "bg-[#e5e5e5]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-sm">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-sm">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as Step)}
          disabled={currentStep === 1}
          className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2] disabled:opacity-50"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]">
            Save Draft
          </button>
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as Step)}
              className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#014486]"
            >
              Next: {steps[currentStep]?.label} →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2e844a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#236936] disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit for Approval"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


