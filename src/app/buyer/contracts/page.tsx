"use client";

import { useState } from "react";

type ContractStage = "RFI Sent" | "Negotiating" | "In Legal" | "Awarded";

interface ContractPipeline {
  id: string;
  producer: string;
  lot: string;
  value: string;
  stage: ContractStage;
  nextStep: string;
  owner: string;
}

const initialPipeline: ContractPipeline[] = [
  {
    id: "cp-1",
    producer: "GreenSky Bio Fuels",
    lot: "JFK Q4 2025 Lot",
    value: "$38.5M",
    stage: "In Legal",
    nextStep: "Finalize counterparty indemnities",
    owner: "Legal Ops",
  },
  {
    id: "cp-2",
    producer: "BlueHarmony SAF",
    lot: "LHR Mandate Contract",
    value: "$22.1M",
    stage: "Negotiating",
    nextStep: "Confirm delivery schedule and LCFS credits",
    owner: "Supply & Trading",
  },
  {
    id: "cp-3",
    producer: "Aurora Renewables",
    lot: "APAC Summer Blend",
    value: "$18.9M",
    stage: "RFI Sent",
    nextStep: "Awaiting updated CI scorecards",
    owner: "Sustainability",
  },
];

const stageOptions: ContractStage[] = ["RFI Sent", "Negotiating", "In Legal", "Awarded"];

export default function BuyerContractsPage() {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [form, setForm] = useState({
    producer: "",
    lot: "",
    value: "",
    owner: "Supply & Trading",
  });
  const [stage, setStage] = useState<ContractStage>("RFI Sent");
  const [saving, setSaving] = useState(false);

  const updateStage = (id: string, next: ContractStage) => {
    setPipeline((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              stage: next,
              nextStep:
                next === "Awarded"
                  ? "Initiate onboarding + compliance refresh"
                  : item.nextStep,
            }
          : item
      )
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setPipeline((previous) => [
        {
          id: crypto.randomUUID(),
          producer: form.producer,
          lot: form.lot,
          value: form.value,
          stage,
          nextStep: "Define next milestone",
          owner: form.owner,
        },
        ...previous,
      ]);
      setForm({ producer: "", lot: "", value: "", owner: "Supply & Trading" });
      setStage("RFI Sent");
      setSaving(false);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              Airline Contracts
            </p>
            <h1 className="text-3xl font-bold text-[#181818]">Producer Negotiations</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#706e6b]">
              Track every SAF offtake negotiation from RFI to execution. Producers see awarded results
              via their contracts tab once finalized.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3e0] px-3 py-1 text-xs font-semibold text-[#e65100]">
            {pipeline.length} active tracks
          </span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "In Legal", value: pipeline.filter((item) => item.stage === "In Legal").length },
          { label: "Negotiating", value: pipeline.filter((item) => item.stage === "Negotiating").length },
          { label: "Awarded", value: pipeline.filter((item) => item.stage === "Awarded").length },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-[#e5e5e5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-[#181818]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#181818]">Invite Producer to Contracting</h2>
        <p className="text-sm text-[#706e6b]">
          Capture new negotiation tracks without impacting the producer dashboard (demo-only, no API
          calls made).
        </p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Producer
            <input
              required
              value={form.producer}
              onChange={(event) => setForm((prev) => ({ ...prev, producer: event.target.value }))}
              placeholder="GreenSky Bio Fuels"
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Lot / Opportunity
            <input
              required
              value={form.lot}
              onChange={(event) => setForm((prev) => ({ ...prev, lot: event.target.value }))}
              placeholder="CDG 2026 Mandate Volume"
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Estimated Contract Value
            <input
              required
              value={form.value}
              onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
              placeholder="$25M"
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c]">
            Stage
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value as ContractStage)}
              className="mt-1.5 rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            >
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm font-medium text-[#3e3e3c] md:col-span-2">
            Internal Owner
            <input
              value={form.owner}
              onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
              className="mt-1.5 rounded-lg border border-[#c9c9c9] px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#0176d3] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#014486] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Adding..." : "Add to Pipeline"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-[#e5e5e5] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#181818]">Active Negotiations</h2>
        <div className="mt-4 grid gap-4">
          {pipeline.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[#f3f2f2] bg-[#f8f9fa] p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0176d3]">{item.producer}</p>
                  <p className="text-base font-bold text-[#181818]">{item.lot}</p>
                  <p className="text-xs text-[#706e6b]">Owned by {item.owner}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-[#706e6b]">Est. Value</p>
                  <p className="text-xl font-semibold text-[#181818]">{item.value}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                    Stage
                  </p>
                  <select
                    value={item.stage}
                    onChange={(event) => updateStage(item.id, event.target.value as ContractStage)}
                    className="mt-1 w-full rounded-lg border border-[#c9c9c9] bg-white px-3 py-2 text-sm focus:border-[#0176d3] focus:outline-none focus:ring-2 focus:ring-[#0176d3]/20"
                  >
                    {stageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                    Next Step
                  </p>
                  <p className="mt-1 text-sm text-[#181818]">{item.nextStep}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

























