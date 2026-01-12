"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";
import { getRegionColor, getRegionDisplayName } from "@/data/airports";
import type { AirportWithLots } from "@/app/api/airports/route";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface TooltipContent {
    airport: AirportWithLots;
    x: number;
    y: number;
}

// Memoized geography component to prevent re-renders
const MemoizedGeographies = memo(function MemoizedGeographies() {
    return (
        <Geographies geography={geoUrl}>
            {({ geographies }) =>
                geographies.map((geo) => (
                    <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#e8e8e8"
                        stroke="#d4d4d4"
                        strokeWidth={0.5}
                        style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "#dcdcdc" },
                            pressed: { outline: "none" },
                        }}
                    />
                ))
            }
        </Geographies>
    );
});

export function AirportMap() {
    const [airports, setAirports] = useState<AirportWithLots[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<TooltipContent | null>(null);
    const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });

    const fetchAirports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/airports");
            if (!response.ok) throw new Error("Failed to fetch airports");
            const data = await response.json();
            setAirports(data.airports);
            setError(null);
        } catch (err) {
            console.error("Error fetching airports:", err);
            setError(err instanceof Error ? err.message : "Failed to load airports");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAirports();
    }, [fetchAirports]);

    const handleMarkerHover = (airport: AirportWithLots, event: React.MouseEvent) => {
        const rect = (event.currentTarget as Element).closest("svg")?.getBoundingClientRect();
        if (rect) {
            setTooltip({
                airport,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        }
    };

    const handleMarkerLeave = () => {
        setTooltip(null);
    };

    const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
        setPosition(newPosition);
    };

    const getMarkerSize = (lotCount: number) => {
        if (lotCount === 0) return 4;
        if (lotCount <= 2) return 6;
        if (lotCount <= 5) return 8;
        return 10;
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl border border-[#e5e5e5] bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0176d3] border-t-transparent" />
                    <p className="text-sm text-[#706e6b]">Loading airport map...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl border border-[#e5e5e5] bg-white">
                <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fce4ec]">
                        <svg className="h-6 w-6 text-[#c23934]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-[#181818]">Failed to load map</p>
                    <button onClick={fetchAirports} className="mt-2 text-sm text-[#0176d3] hover:underline">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-[#e5e5e5] bg-gradient-to-br from-[#f8fafc] to-white shadow-sm">
            {/* Map Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0176d3]/10">
                        <svg className="h-5 w-5 text-[#0176d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#181818]">Global SAF Activity</h2>
                        <p className="text-xs text-[#706e6b]">
                            {airports.filter(a => a.lots.count > 0).length} airports with active lots
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#0176d3]" />
                        <span className="text-[#706e6b]">Europe</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#2e844a]" />
                        <span className="text-[#706e6b]">North America</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#9c27b0]" />
                        <span className="text-[#706e6b]">Asia Pacific</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-[#ff9800]" />
                        <span className="text-[#706e6b]">Middle East</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[450px]">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 130,
                    }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMoveEnd={handleMoveEnd}
                        minZoom={1}
                        maxZoom={4}
                    >
                        <MemoizedGeographies />

                        {/* Airport Markers */}
                        {airports.map((airport) => (
                            <Marker
                                key={airport.iata}
                                coordinates={airport.coordinates}
                                onMouseEnter={(e) => handleMarkerHover(airport, e)}
                                onMouseLeave={handleMarkerLeave}
                            >
                                <circle
                                    r={getMarkerSize(airport.lots.count)}
                                    fill={getRegionColor(airport.region)}
                                    fillOpacity={airport.lots.count > 0 ? 0.9 : 0.4}
                                    stroke="#fff"
                                    strokeWidth={1.5}
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                />
                                {airport.lots.count > 0 && (
                                    <circle
                                        r={getMarkerSize(airport.lots.count) + 4}
                                        fill="none"
                                        stroke={getRegionColor(airport.region)}
                                        strokeWidth={1}
                                        strokeOpacity={0.3}
                                        style={{ animation: "pulse 2s infinite" }}
                                    />
                                )}
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>

                {/* Tooltip */}
                {tooltip && (
                    <div
                        className="pointer-events-none absolute z-50 w-80 rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-xl"
                        style={{
                            left: Math.min(tooltip.x + 15, window.innerWidth - 350),
                            top: tooltip.y - 10,
                            transform: tooltip.y > 300 ? "translateY(-100%)" : "translateY(0)",
                        }}
                    >
                        {/* Airport Header */}
                        <div className="flex items-start justify-between border-b border-[#e5e5e5] pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-flex h-6 w-10 items-center justify-center rounded text-xs font-bold text-white"
                                        style={{ backgroundColor: getRegionColor(tooltip.airport.region) }}
                                    >
                                        {tooltip.airport.iata}
                                    </span>
                                    <span className="text-sm font-semibold text-[#181818]">
                                        {tooltip.airport.name}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-[#706e6b]">
                                    {tooltip.airport.city}, {tooltip.airport.country}
                                </p>
                            </div>
                        </div>

                        {/* Regulatory Framework */}
                        <div className="mt-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                                Regulatory Framework
                            </h4>
                            <p className="mt-1 text-sm font-medium text-[#181818]">
                                {tooltip.airport.regulatory.framework}
                            </p>
                            <p className="mt-0.5 text-xs text-[#0176d3]">
                                {tooltip.airport.regulatory.mandate}
                            </p>
                        </div>

                        {/* Compliance Requirements */}
                        <div className="mt-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                                Compliance Requirements
                            </h4>
                            <ul className="mt-1 space-y-0.5">
                                {tooltip.airport.regulatory.requirements.slice(0, 3).map((req, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-xs text-[#3e3e3c]">
                                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#706e6b]" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Lot Statistics */}
                        <div className="mt-3 rounded-lg bg-[#f8f9fa] p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#706e6b]">
                                Active SAF Lots
                            </h4>
                            {tooltip.airport.lots.count > 0 ? (
                                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-[#0176d3]">{tooltip.airport.lots.count}</p>
                                        <p className="text-[10px] text-[#706e6b]">Active Lots</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-[#181818]">
                                            {tooltip.airport.lots.totalVolume.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-[#706e6b]">Total MT</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-[#2e844a]">
                                            ${tooltip.airport.lots.avgPrice.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-[#706e6b]">Avg Price/MT</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-1 text-xs text-[#706e6b]">No active lots at this airport</p>
                            )}
                        </div>

                        {/* Penalty Info */}
                        {tooltip.airport.regulatory.penaltyInfo && (
                            <div className="mt-2 rounded border border-[#ff9800]/30 bg-[#fff8e1] px-2 py-1.5">
                                <p className="text-[10px] text-[#e65100]">
                                    ⚠️ {tooltip.airport.regulatory.penaltyInfo}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <button
                    onClick={() => setPosition({ ...position, zoom: Math.min(position.zoom * 1.5, 4) })}
                    className="flex h-8 w-8 items-center justify-center rounded bg-white text-[#181818] shadow-md transition-colors hover:bg-[#f3f2f2]"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <button
                    onClick={() => setPosition({ ...position, zoom: Math.max(position.zoom / 1.5, 1) })}
                    className="flex h-8 w-8 items-center justify-center rounded bg-white text-[#181818] shadow-md transition-colors hover:bg-[#f3f2f2]"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <button
                    onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
                    className="flex h-8 w-8 items-center justify-center rounded bg-white text-[#181818] shadow-md transition-colors hover:bg-[#f3f2f2]"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* CSS for pulse animation */}
            <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
        }
      `}</style>
        </div>
    );
}
