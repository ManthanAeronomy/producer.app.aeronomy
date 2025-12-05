"use client";

import { FormEvent, useMemo, useState } from "react";

type LotStatus = "draft" | "live" | "awarded";

interface BuyerLot {
  id: string;
  lotName: string;
  airport: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  targetPrice: number;
  currency: "USD" | "EUR" | "GBP";
  ciTarget: number;
  deliveryWindow: string;
  bidsReceived: number;
  status: LotStatus;
}

const initialLots: BuyerLot[] = [
  {
    id: "buyer-lot-1",
    lotName: "HEFA Blend — JFK 2025",
    airport: "JFK, New York",
    volume: 18000,
    volumeUnit: "MT",
    targetPrice: 2125,
    currency: "USD",
    ciTarget: 25,
    deliveryWindow: "Oct – Dec 2025",
    bidsReceived: 6,
    status: "live",
  },
  {
    id: "buyer-lot-2",
    lotName: "EU Mandate Compliance — LHR",
    airport: "LHR, London",
    volume: 12000,
    volumeUnit: "MT",
    targetPrice: 2280,
    currency: "EUR",
    ciTarget: 22,
    deliveryWindow: "Jan – Mar 2026",
    bidsReceived: 3,
    status: "live",
  },
  {
    id: "buyer-lot-3",
    lotName: "APAC Summer Blend",
    airport: "SIN, Singapore",
    volume: 9000,
    volumeUnit: "MT",
    targetPrice: 2050,
    currency: "USD",
    ciTarget: 27,
    deliveryWindow: "Jun – Aug 2025",
    bidsReceived: 0,
    status: "draft",
  },
];

const defaultForm: Omit<BuyerLot, "id" | "bidsReceived" | "status"> = {
  lotName: "",
  airport: "",
  volume: 5000,
  volumeUnit: "MT",
  targetPrice: 2100,
  currency: "USD",
  ciTarget: 25,
  deliveryWindow: "",
};

export default function BuyerMarketplacePage() {
  const [lots, setLots] = useState<BuyerLot[]>(initialLots);
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState<LotStatus>("live");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<LotStatus | "all">("all");

  const stats = useMemo(() => {
    const liveLots = lots.filter((lot) => lot.status === "live");
    const awaitingBids = liveLots.filter((lot) => lot.bidsReceived === 0);
    const awarded = lots.filter((lot) => lot.status === "awarded");
    return {
      live: liveLots.length,
      awaiting: awaitingBids.length,
      awarded: awarded.length,
    };
  }, [lots]);

  const totalVolume = useMemo(
    () => lots.reduce((sum, lot) => sum + lot.volume, 0).toLocaleString(),
    [lots]
  );

  const visibleLots = useMemo(() => {
    if (filter === "all") return lots;
    return lots.filter((lot) => lot.status === filter);
  }, [filter, lots]);

  const handleInput =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        field === "volume" || field === "targetPrice" || field === "ciTarget"
          ? Number(event.target.value)
          : event.target.value;
      setForm((previous) => ({ ...previous, [field]: value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setTimeout(() => {
      setLots((previous) => [
        {
          id: crypto.randomUUID(),
          bidsReceived: 0,
          status,
          ...form,
        },
        ...previous,
      ]);
      setForm(defaultForm);
      setStatus("live");
      setCreating(false);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              Airline Marketplace Console
            </p>
            <h1 className="text-3xl font-bold text-[#181818]">Post SAF Lots</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#706e6b]">
              Airlines create tenders/lots here so producers can bid. Producers never bid from this
              view—they respond to the lots you publish.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-semibold text-[#2e844a]">
            {stats.live} live lots
          </span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Live Lots",
            value: stats.live,
            desc: "Receiving producer bids",
          },
          {
            label: "Awaiting Bids",
            value: stats.awaiting,
            desc: "Need supplier outreach",
          },
          {
            label: "Awarded",
            value: stats.awarded,
            desc: "Contracts in flight",
          },
          {
            label: "Total Volume Posted",
            value: `${totalVolume} MT`,
            desc: "Across all open lots",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-[#181818]">{card.value}</p>
            <p className="text-sm text-[#706e6b]">{card.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#181818]">Create a New Lot</h2>
        <p className="text-sm text-[#706e6b]">
          Provide delivery window, CI targets, and pricing guidance. Producers will see this in their
          marketplace experience.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Lot Name
            <input
              required
              value={form.lotName}
              onChange={handleInput("lotName")}
              placeholder="Transatlantic Q4 SAF"
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Delivery Airport / Region
            <input
              required
              value={form.airport}
              onChange={handleInput("airport")}
              placeholder="JFK, New York"
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Volume ({form.volumeUnit})
            <input
              required
              type="number"
              min={0}
              value={form.volume}
              onChange={handleInput("volume")}
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Target Price ({form.currency}/{form.volumeUnit})
            <input
              required
              type="number"
              min={0}
              value={form.targetPrice}
              onChange={handleInput("targetPrice")}
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Carbon Intensity Target (gCO₂e/MJ)
            <input
              required
              type="number"
              min={0}
              value={form.ciTarget}
              onChange={handleInput("ciTarget")}
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Delivery Window
            <input
              required
              value={form.deliveryWindow}
              onChange={handleInput("deliveryWindow")}
              placeholder="Jan – Mar 2026"
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Lot Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as LotStatus)}
              className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            >
              <option value="live">Go Live Immediately</option>
              <option value="draft">Save as Draft</option>
              <option value="awarded" disabled>
                Mark as Awarded
              </option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="reset"
              onClick={() => {
                setForm(defaultForm);
                setStatus("live");
              }}
              className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#706e6b] hover:bg-[#f3f2f2]"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#014486] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Publishing…" : "Publish Lot"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#181818]">Lots You Have Posted</h2>
            <p className="text-sm text-[#706e6b]">
              Producers will bid on these from their marketplace view. You can pause or award lots
              here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "live", "draft", "awarded"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  filter === option
                    ? "bg-[#0176d3] text-white shadow-sm"
                    : "border border-[#e5e5e5] text-[#706e6b] hover:bg-[#f3f2f2]"
                }`}
              >
                {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8f9fa] text-[#706e6b]">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Lot</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Volume</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Target Price</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">CI Target</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Window</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Bids</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f2f2]">
              {visibleLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-[#f8f9fa]">
                  <td className="px-4 py-3 text-[#181818]">
                    <div className="font-semibold">{lot.lotName}</div>
                    <div className="text-xs text-[#706e6b]">{lot.airport}</div>
                  </td>
                  <td className="px-4 py-3 text-[#181818]">
                    {lot.volume.toLocaleString()} {lot.volumeUnit}
                  </td>
                  <td className="px-4 py-3 text-[#181818]">
                    {lot.currency} {lot.targetPrice.toLocaleString()}/{lot.volumeUnit}
                  </td>
                  <td className="px-4 py-3 text-[#181818]">{lot.ciTarget} gCO₂e/MJ</td>
                  <td className="px-4 py-3 text-[#181818]">{lot.deliveryWindow}</td>
                  <td className="px-4 py-3 text-[#181818]">{lot.bidsReceived}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        lot.status === "live"
                          ? "bg-[#e8f5e9] text-[#2e844a]"
                          : lot.status === "draft"
                          ? "bg-[#fff3e0] text-[#e65100]"
                          : "bg-[#e3f2fd] text-[#014486]"
                      }`}
                    >
                      {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-semibold text-[#706e6b] hover:bg-[#f3f2f2]">
                        View Bids
                      </button>
                      <button className="rounded-lg border border-[#0176d3] px-3 py-1.5 text-xs font-semibold text-[#0176d3] hover:bg-[#f0f7ff]">
                        Manage Lot
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleLots.length === 0 && (
            <div className="py-8 text-center text-sm text-[#706e6b]">
              No lots in this filter yet. Publish or change the status filter.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#181818]">Recent Producer Activity</h3>
          <p className="text-sm text-[#706e6b]">
            Signals coming from the producer marketplace in the last 48 hours.
          </p>
          <ul className="mt-4 space-y-3">
            {[
              {
                producer: "GreenSky Bio Fuels",
                action: "submitted a revised bid on JFK Q4 lot",
                timestamp: "2 hours ago",
              },
              {
                producer: "Aurora Renewables",
                action: "requested access to LHR compliance pack",
                timestamp: "Yesterday • 18:10 UTC",
              },
              {
                producer: "BlueHarmony SAF",
                action: "messaged about increasing volume for SIN lot",
                timestamp: "Yesterday • 09:45 UTC",
              },
            ].map((activity) => (
              <li
                key={activity.producer + activity.timestamp}
                className="rounded-lg border border-[#f3f2f2] bg-[#f8f9fa] px-4 py-3 text-sm"
              >
                <p className="font-semibold text-[#181818]">{activity.producer}</p>
                <p className="text-[#3e3e3c]">{activity.action}</p>
                <p className="text-xs text-[#706e6b]">{activity.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#181818]">Checklist Before Publishing</h3>
          <ul className="mt-4 space-y-3 text-sm text-[#181818]">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2e844a]" />
              Align CI targets with internal sustainability commitments.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2e844a]" />
              Confirm hedging strategy for posted target prices.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#ff9800]" />
              Attach latest regulatory guidance for producers (CAAF, LCFS, etc.).
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#0176d3]" />
              Share contact window for Q&A before bids close.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}


