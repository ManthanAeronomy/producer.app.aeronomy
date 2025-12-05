import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { fetchLotsFrom3004 } from "@/lib/lots-transformer";
import type { CreateTenderInput, Tender } from "@/types/tender";

export const dynamic = 'force-dynamic'

// GET /api/tenders - List all tenders with optional filters (includes lots from 3004)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filter parameters
    const status = searchParams.get('status') || undefined;
    const airline = searchParams.get('airline') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const search = searchParams.get('search') || undefined;
    const longTerm = searchParams.get('longTerm') === 'true' ? true : searchParams.get('longTerm') === 'false' ? false : undefined;

    // Get tenders from local database
    let localTenders: Tender[] = [];
    try {
      localTenders = await dataStore.getAllTenders();
    } catch (error) {
      console.error("Error fetching local tenders:", error);
      // Continue with empty array, will try to get lots from 3004
    }
    
    // Get lots from 3004 API and transform to Tender format
    // Wrap in try-catch to ensure local tenders still work if 3004 is unavailable
    let lotsFrom3004: Tender[] = [];
    try {
      lotsFrom3004 = await fetchLotsFrom3004();
    } catch (error) {
      console.warn("Failed to fetch lots from 3004, continuing with local tenders only:", error);
      // Continue with just local tenders
    }
    
    // Merge both sources - no demo data, only real data
    let tenders: Tender[] = [...localTenders, ...lotsFrom3004];

    // Apply filters
    if (status) {
      // Note: This assumes dataStore returns tenders with status field
      // If not, we may need to filter in memory or update dataStore
      tenders = tenders.filter(t => (t as any).status === status);
    }

    if (airline) {
      tenders = tenders.filter(t => 
        t.airline.toLowerCase().includes(airline.toLowerCase())
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      tenders = tenders.filter(t => {
        if (minPrice !== undefined && t.pricePerUnit < minPrice) return false;
        if (maxPrice !== undefined && t.pricePerUnit > maxPrice) return false;
        return true;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      tenders = tenders.filter(t => 
        t.airline.toLowerCase().includes(searchLower) ||
        t.lotName.toLowerCase().includes(searchLower) ||
        t.location.toLowerCase().includes(searchLower)
      );
    }

    if (longTerm !== undefined) {
      tenders = tenders.filter(t => t.longTerm === longTerm);
    }

    return NextResponse.json({ tenders }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tenders" },
      { status: 500 }
    );
  }
}

// POST /api/tenders - Create a new tender
export async function POST(request: NextRequest) {
  try {
    const body: CreateTenderInput = await request.json();

    // Validation with detailed error messages
    const missingFields: string[] = [];
    if (!body.airline) missingFields.push('airline');
    if (!body.lotName) missingFields.push('lotName');
    if (body.volume === undefined) missingFields.push('volume');
    if (!body.volumeUnit) missingFields.push('volumeUnit');
    if (body.pricePerUnit === undefined) missingFields.push('pricePerUnit');
    if (!body.currency) missingFields.push('currency');
    if (body.ciScore === undefined) missingFields.push('ciScore');
    if (!body.location) missingFields.push('location');
    if (!body.deliveryWindow) missingFields.push('deliveryWindow');
    if (!body.postedOn) missingFields.push('postedOn');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (body.volume <= 0) {
      return NextResponse.json(
        { error: "Volume must be a positive number" },
        { status: 400 }
      );
    }

    if (body.pricePerUnit <= 0) {
      return NextResponse.json(
        { error: "Price per unit must be a positive number" },
        { status: 400 }
      );
    }

    if (body.ciScore < 0) {
      return NextResponse.json(
        { error: "CI score must be a non-negative number" },
        { status: 400 }
      );
    }

    const newTender = await dataStore.createTender(body);
    return NextResponse.json({ tender: newTender }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tender:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create tender" },
      { status: 500 }
    );
  }
}

