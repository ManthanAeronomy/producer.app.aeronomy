"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isBuyerRoute = pathname?.startsWith("/buyer");

  const producerShortcuts = [
    {
      label: "Producer Dashboard",
      description: "Manage bids, contracts, compliance",
      href: "/dashboard",
      active: pathname?.startsWith("/dashboard"),
    },
    {
      label: "Marketplace",
      description: "Submit bids to live tenders",
      href: "/marketplace",
      active: pathname?.startsWith("/marketplace"),
    },
  ];

  const buyerShortcuts = [
    {
      label: "Airline Marketplace",
      description: "Post lots & monitor responses",
      href: "/buyer/marketplace",
      active: pathname?.startsWith("/buyer/marketplace"),
    },
    {
      label: "Producers Directory",
      description: "Review SAF supplier profiles",
      href: "/buyer/producers",
      active: pathname?.startsWith("/buyer/producers"),
    },
  ];

  const quickTargets = isBuyerRoute ? buyerShortcuts : producerShortcuts;

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1.5 text-sm font-medium text-[#706e6b] transition-all hover:border-[#e5e5e5] hover:bg-[#f3f2f2] hover:text-[#181818]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f2f2] text-[#706e6b] transition-colors group-hover:bg-[#e5e5e5] group-hover:text-[#181818]">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-2xl"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              Account
              <span className="ml-2 rounded-full bg-[#f3f2f2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#706e6b]">
                {isBuyerRoute ? "Airline View" : "Producer View"}
              </span>
            </p>
            <p className="mt-1 text-sm font-semibold text-[#181818]">GreenSky Bio Fuels</p>
            <p className="text-xs text-[#706e6b]">producer@greensky.bio</p>
          </div>

          <div className="space-y-1">
            {quickTargets.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  item.active
                    ? "border-[#0176d3] bg-[#f0f7ff] text-[#0176d3]"
                    : "border-transparent text-[#181818] hover:border-[#e5e5e5] hover:bg-[#f8f9fa]"
                }`}
              >
                <span className="font-semibold">{item.label}</span>
                <p className="text-xs text-[#706e6b]">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="my-4 h-px bg-[#f3f2f2]" />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
              Switch Persona
            </p>
            <button
              type="button"
              onClick={() => handleNavigate(isBuyerRoute ? "/dashboard" : "/buyer/marketplace")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isBuyerRoute
                  ? "border border-[#e5e5e5] text-[#181818] hover:bg-[#f8f9fa]"
                  : "border border-[#0176d3]/30 bg-[#f5f9ff] text-[#014486] hover:border-[#0176d3] hover:bg-white"
              }`}
            >
              <span>{isBuyerRoute ? "View as Producer" : "View as Airline"}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link
              href="/profile"
              className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm font-semibold text-[#181818] transition-colors hover:bg-[#f8f9fa]"
              onClick={() => setOpen(false)}
            >
              <span>Account Settings</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


