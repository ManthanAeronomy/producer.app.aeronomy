import { NextResponse } from "next/server";
import { AIRPORTS, findAirportByLocation, type Airport } from "@/data/airports";
import { dataStore } from "@/lib/data-store";
import { fetchLotsFrom3004 } from "@/lib/lots-transformer";
import type { Tender } from "@/types/tender";

export const dynamic = 'force-dynamic';

export interface AirportWithLots extends Airport {
    lots: {
        count: number;
        totalVolume: number;
        avgPrice: number;
        minPrice: number;
        maxPrice: number;
        tenders: Array<{
            id: string;
            airline: string;
            lotName: string;
            volume: number;
            volumeUnit: string;
            pricePerUnit: number;
            currency: string;
        }>;
    };
}

// GET /api/airports - Get all airports with aggregated lot data
export async function GET() {
    try {
        // Fetch all tenders from both sources
        let allTenders: Tender[] = [];

        try {
            const localTenders = await dataStore.getAllTenders();
            allTenders = [...localTenders];
        } catch (error) {
            console.warn("Failed to fetch local tenders:", error);
        }

        try {
            const lotsFrom3004 = await fetchLotsFrom3004();
            allTenders = [...allTenders, ...lotsFrom3004];
        } catch (error) {
            console.warn("Failed to fetch lots from 3004:", error);
        }

        // Aggregate lots by airport
        const airportMap = new Map<string, AirportWithLots>();

        // Initialize all airports with empty lots
        for (const airport of AIRPORTS) {
            airportMap.set(airport.iata, {
                ...airport,
                lots: {
                    count: 0,
                    totalVolume: 0,
                    avgPrice: 0,
                    minPrice: Infinity,
                    maxPrice: 0,
                    tenders: []
                }
            });
        }

        // Match tenders to airports by location
        for (const tender of allTenders) {
            const airport = findAirportByLocation(tender.location);
            if (airport) {
                const airportData = airportMap.get(airport.iata)!;
                airportData.lots.count++;
                airportData.lots.totalVolume += tender.volume;
                airportData.lots.minPrice = Math.min(airportData.lots.minPrice, tender.pricePerUnit);
                airportData.lots.maxPrice = Math.max(airportData.lots.maxPrice, tender.pricePerUnit);
                airportData.lots.tenders.push({
                    id: tender.id,
                    airline: tender.airline,
                    lotName: tender.lotName,
                    volume: tender.volume,
                    volumeUnit: tender.volumeUnit,
                    pricePerUnit: tender.pricePerUnit,
                    currency: tender.currency
                });
            }
        }

        // Calculate averages and clean up Infinity values
        for (const airport of airportMap.values()) {
            if (airport.lots.count > 0) {
                const totalPrice = airport.lots.tenders.reduce((sum, t) => sum + t.pricePerUnit, 0);
                airport.lots.avgPrice = Math.round(totalPrice / airport.lots.count);
            }
            if (airport.lots.minPrice === Infinity) {
                airport.lots.minPrice = 0;
            }
        }

        const airports = Array.from(airportMap.values());

        return NextResponse.json({
            airports,
            meta: {
                totalAirports: airports.length,
                airportsWithLots: airports.filter(a => a.lots.count > 0).length,
                totalLots: allTenders.length
            }
        });
    } catch (error: any) {
        console.error("Error fetching airports:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch airports" },
            { status: 500 }
        );
    }
}
