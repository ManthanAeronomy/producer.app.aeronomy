"use client";

import { ChangeEvent, FormEvent, useMemo, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Tender } from "@/types/tender";
import { apiClient } from "@/lib/api-client";

type BidDraft = {
  volume: string;
  price: string;
  notes: string;
  producerName: string;
  producerEmail: string;
};

const formatVolume = (volume: number, unit: Tender["volumeUnit"]) =>
  `${volume.toLocaleString()} ${unit}`;

const formatCurrency = (value: number, currency: Tender["currency"]) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export default function MarketplacePage() {
  const { userId } = useAuth();  // Get Clerk userId (shared Clerk instance)
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTenderId, setActiveTenderId] = useState<string | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidDraft, setBidDraft] = useState<BidDraft>({
    volume: "",
    price: "",
    notes: "",
    producerName: "",
    producerEmail: "",
  });
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tenders on mount
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getTenders();
        setTenders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tenders");
        console.error("Error fetching tenders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  const activeTender = activeTenderId
    ? tenders.find((tender) => tender.id === activeTenderId)
    : undefined;

  const totalVolume = useMemo(
    () => tenders.reduce((sum, tender) => sum + tender.volume, 0),
    [tenders]
  );

  const averagePrice = useMemo(() => {
    if (!tenders.length) return 0;
    // Convert all prices to metric tons (MT) for fair averaging
    // 1 gallon ≈ 0.00378541 metric tons, so 1 MT ≈ 264.172 gallons
    const GALLONS_PER_MT = 264.172;
    const totalPrice = tenders.reduce((sum, tender) => {
      let priceInMT = tender.pricePerUnit;
      // Convert gallon prices to MT prices
      if (tender.volumeUnit === "gal") {
        priceInMT = tender.pricePerUnit * GALLONS_PER_MT;
      }
      return sum + priceInMT;
    }, 0);
    return totalPrice / tenders.length;
  }, [tenders]);

  const longTermCount = useMemo(
    () => tenders.filter((tender) => tender.longTerm).length,
    [tenders]
  );

  const handleOpenBid = (tender: Tender) => {
    setActiveTenderId(tender.id);
    setShowBidModal(true);
    setBidDraft({
      volume: tender.volume.toString(),
      price: tender.pricePerUnit.toString(),
      notes: "",
      producerName: "",
      producerEmail: "",
    });
    setConfirmation(null);
  };

  const handleDraftChange =
    (field: keyof BidDraft) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setBidDraft((previous) => ({
          ...previous,
          [field]: event.target.value,
        }));
      };

  const handleBidSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeTender) return;

    // Validate user is logged in (required for Clerk userId)
    if (!userId) {
      setError("You must be logged in to submit a bid");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Submit bid through server-side proxy to avoid CORS issues
      const response = await fetch("/api/bids/submit-to-buyer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lotId: activeTender.id,
          producerName: bidDraft.producerName,
          producerEmail: bidDraft.producerEmail,
          volume: Number(bidDraft.volume),
          volumeUnit: activeTender.volumeUnit,
          pricePerUnit: Number(bidDraft.price),
          currency: activeTender.currency,
          notes: bidDraft.notes,
          status: "pending",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit bid");
      }

      setConfirmation(
        `Bid submitted for ${activeTender.lotName} (${activeTender.airline}). Your bid has been sent to the buyer for review.`
      );
      setShowBidModal(false);
      setActiveTenderId(null);
      setBidDraft({ volume: "", price: "", notes: "", producerName: "", producerEmail: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit bid");
      console.error("Error submitting bid:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-lg bg-white border border-[#e5e5e5] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#181818]">
              Marketplace
            </h1>
            <p className="mt-2 text-base text-[#706e6b]">
              Browse current airline demand for sustainable aviation fuel and
              submit competitive bids.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5e9] px-4 py-2 text-sm font-semibold text-[#2e844a]">
            <span className="h-2 w-2 rounded-full bg-[#2e844a] animate-pulse"></span>
            {tenders.length} Live Tenders
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border-l-4 border-[#c23934] bg-[#fef7f7] px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-[#c23934] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-[#c23934]">{error}</p>
          </div>
        </div>
      )}

      {confirmation && (
        <div className="rounded-lg border-l-4 border-[#2e844a] bg-[#f7fcf7] px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-[#2e844a] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-[#2e844a]">{confirmation}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#e5e5e5] bg-gradient-to-br from-white to-[#f8f9fa] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0176d3]/10">
              <svg className="h-6 w-6 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                Total Open Volume
              </p>
              <p className="mt-1 text-2xl font-bold text-[#181818]">
                {formatVolume(totalVolume, "MT")}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#706e6b]">
            Across {tenders.length} tenders
          </p>
        </div>

        <div className="rounded-lg border border-[#e5e5e5] bg-gradient-to-br from-white to-[#f8f9fa] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2e844a]/10">
              <svg className="h-6 w-6 text-[#2e844a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                Avg. Target Price
              </p>
              <p className="mt-1 text-2xl font-bold text-[#181818]">
                {formatCurrency(
                  averagePrice,
                  tenders[0]?.currency ?? "USD"
                )}
                <span className="text-base font-medium text-[#706e6b]">/MT</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#706e6b]">
            Indicative across all open lots
          </p>
        </div>

        <div className="rounded-lg border border-[#e5e5e5] bg-gradient-to-br from-white to-[#f8f9fa] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff9800]/10">
              <svg className="h-6 w-6 text-[#ff9800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                Long-term Opportunities
              </p>
              <p className="mt-1 text-2xl font-bold text-[#181818]">
                {longTermCount}
                <span className="text-base font-medium text-[#706e6b]"> lots</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#706e6b]">
            {tenders.length
              ? Math.round((longTermCount / tenders.length) * 100)
              : 0}
            % of total demand
          </p>
        </div>
      </section>

      {/* Tenders Grid */}
      {loading ? (
        <div className="flex items-center justify-center rounded-lg border border-[#e5e5e5] bg-white py-16">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#0176d3]"></div>
            <p className="mt-4 text-sm font-medium text-[#706e6b]">Loading tenders...</p>
          </div>
        </div>
      ) : tenders.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-[#e5e5e5] bg-white py-16">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-[#c9c9c9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-sm font-medium text-[#706e6b]">No tenders available</p>
            <p className="mt-1 text-xs text-[#706e6b]">Check back later for new opportunities</p>
          </div>
        </div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {tenders.map((tender) => {
            const isActive = tender.id === activeTenderId;

            return (
              <article
                key={tender.id}
                className="flex flex-col rounded-lg border border-[#e5e5e5] bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Card Header */}
                <div className="border-b border-[#e5e5e5] bg-gradient-to-r from-[#f8f9fa] to-white px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#0176d3]">
                        {tender.airline}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-[#181818]">
                        {tender.lotName}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#706e6b]">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Posted {tender.postedOn}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${tender.longTerm
                        ? "bg-[#e8f5e9] text-[#2e844a]"
                        : "bg-[#fff3e0] text-[#e65100]"
                        }`}
                    >
                      {tender.longTerm ? (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Long-term
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Spot
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-5">
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-[#f8f9fa] p-3">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Volume
                      </dt>
                      <dd className="mt-2 text-lg font-bold text-[#181818]">
                        {formatVolume(tender.volume, tender.volumeUnit)}
                      </dd>
                    </div>

                    <div className="rounded-lg bg-[#f8f9fa] p-3">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Target Price
                      </dt>
                      <dd className="mt-2 text-lg font-bold text-[#181818]">
                        {formatCurrency(tender.pricePerUnit, tender.currency)}
                        <span className="text-sm font-medium text-[#706e6b]">
                          /{tender.volumeUnit}
                        </span>
                      </dd>
                    </div>

                    <div className="rounded-lg bg-[#f8f9fa] p-3">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        CI Score
                      </dt>
                      <dd className="mt-2 text-lg font-bold text-[#181818]">
                        {tender.ciScore}
                        <span className="text-sm font-medium text-[#706e6b]"> gCO₂e/MJ</span>
                      </dd>
                    </div>

                    <div className="rounded-lg bg-[#f8f9fa] p-3">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Delivery
                      </dt>
                      <dd className="mt-2 text-lg font-bold text-[#181818]">
                        {tender.deliveryWindow}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-lg bg-[#f8f9fa] p-3">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </dt>
                    <dd className="mt-2 text-base font-semibold text-[#181818]">
                      {tender.location}
                    </dd>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleOpenBid(tender)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0176d3] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#014486] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0176d3] focus:ring-offset-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Submit Bid
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Bid Submission Modal */}
      {showBidModal && activeTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="border-b border-[#e5e5e5] px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#181818]">Submit Bid</h2>
                  <p className="mt-1 text-sm text-[#706e6b]">
                    {activeTender.lotName} - {activeTender.airline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBidModal(false);
                    setActiveTenderId(null);
                  }}
                  className="rounded-lg p-2 text-[#706e6b] transition-colors hover:bg-[#f3f2f2] hover:text-[#181818]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBidSubmit} className="px-6 py-5">
              <div className="space-y-5">
                {/* Producer Information */}
                <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f9fa] p-4">
                  <h3 className="text-sm font-semibold text-[#181818]">Your Information</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Producer Name
                      <input
                        required
                        type="text"
                        value={bidDraft.producerName}
                        onChange={handleDraftChange("producerName")}
                        placeholder="Your company name"
                        className="mt-1.5 w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#181818] transition-colors focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                      />
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Email Address
                      <input
                        required
                        type="email"
                        value={bidDraft.producerEmail}
                        onChange={handleDraftChange("producerEmail")}
                        placeholder="contact@company.com"
                        className="mt-1.5 w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#181818] transition-colors focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                      />
                    </label>
                  </div>
                </div>

                {/* Bid Details */}
                <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#181818]">Bid Details</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Volume ({activeTender.volumeUnit})
                      <input
                        required
                        min={0}
                        step="0.1"
                        type="number"
                        value={bidDraft.volume}
                        onChange={handleDraftChange("volume")}
                        className="mt-1.5 w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#181818] transition-colors focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                      />
                    </label>
                    <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
                      Price ({activeTender.currency}/{activeTender.volumeUnit})
                      <input
                        required
                        min={0}
                        step="0.01"
                        type="number"
                        value={bidDraft.price}
                        onChange={handleDraftChange("price")}
                        className="mt-1.5 w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#181818] transition-colors focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                      />
                    </label>
                  </div>

                  <label className="mt-4 flex flex-col text-sm font-medium text-[#3e3e3c]">
                    Additional Notes
                    <textarea
                      required
                      rows={4}
                      value={bidDraft.notes}
                      onChange={handleDraftChange("notes")}
                      placeholder="Include feedstock details, delivery flexibility, certification information, or any other relevant details..."
                      className="mt-1.5 w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm text-[#181818] transition-colors focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                    />
                  </label>
                </div>

                {/* Tender Summary */}
                <div className="rounded-lg border border-[#0176d3]/20 bg-[#f0f7ff] p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">Tender Summary</h4>
                  <dl className="mt-2 grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-[#706e6b]">Required Volume:</dt>
                      <dd className="font-semibold text-[#181818]">{formatVolume(activeTender.volume, activeTender.volumeUnit)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#706e6b]">Target Price:</dt>
                      <dd className="font-semibold text-[#181818]">{formatCurrency(activeTender.pricePerUnit, activeTender.currency)}/{activeTender.volumeUnit}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#706e6b]">Delivery Window:</dt>
                      <dd className="font-semibold text-[#181818]">{activeTender.deliveryWindow}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#706e6b]">Location:</dt>
                      <dd className="font-semibold text-[#181818]">{activeTender.location}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBidModal(false);
                    setActiveTenderId(null);
                  }}
                  className="flex-1 rounded-lg border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#706e6b] transition-colors hover:bg-[#f3f2f2] hover:text-[#181818]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2e844a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#236936] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2e844a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Submitting Bid...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Bid to Buyer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
