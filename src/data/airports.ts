// Major world airports with coordinates and SAF regulatory information
export interface Airport {
    iata: string;
    name: string;
    city: string;
    country: string;
    region: "europe" | "north_america" | "asia_pacific" | "middle_east" | "africa" | "south_america";
    coordinates: [number, number]; // [longitude, latitude]
    regulatory: {
        framework: string;
        mandate: string;
        requirements: string[];
        penaltyInfo?: string;
    };
}

export const AIRPORTS: Airport[] = [
    // Europe - EU ReFuelEU Aviation Regulation
    {
        iata: "LHR",
        name: "London Heathrow",
        city: "London",
        country: "United Kingdom",
        region: "europe",
        coordinates: [-0.4543, 51.4700],
        regulatory: {
            framework: "UK SAF Mandate",
            mandate: "10% SAF by 2030, 22% by 2040",
            requirements: [
                "SAF must meet sustainability criteria under UK RED II",
                "Mass balance chain of custody required",
                "GHG reduction ≥50% vs fossil jet fuel",
                "ISCC or RSB certification required"
            ],
            penaltyInfo: "£500/tonne non-compliance penalty"
        }
    },
    {
        iata: "CDG",
        name: "Paris Charles de Gaulle",
        city: "Paris",
        country: "France",
        region: "europe",
        coordinates: [2.5479, 49.0097],
        regulatory: {
            framework: "EU ReFuelEU Aviation",
            mandate: "2% SAF by 2025, 6% by 2030, 70% by 2050",
            requirements: [
                "Minimum 1.2% synthetic fuels by 2030",
                "Book & claim not accepted - physical delivery required",
                "EU sustainability certification (ISCC EU, RSB EU)",
                "LCA GHG reduction ≥70% for e-fuels"
            ],
            penaltyInfo: "€4,500/tonne × 1.2 non-compliance multiplier"
        }
    },
    {
        iata: "AMS",
        name: "Amsterdam Schiphol",
        city: "Amsterdam",
        country: "Netherlands",
        region: "europe",
        coordinates: [4.7683, 52.3105],
        regulatory: {
            framework: "EU ReFuelEU Aviation + Dutch Blending Mandate",
            mandate: "2% SAF by 2025, 14% by 2030 (Dutch mandate exceeds EU)",
            requirements: [
                "Dutch blending mandate stricter than EU baseline",
                "Physical delivery at Dutch airports",
                "NEa reporting and verification",
                "ISCC EU or RSB EU certification"
            ],
            penaltyInfo: "Dutch penalties + EU ReFuelEU fines"
        }
    },
    {
        iata: "FRA",
        name: "Frankfurt Airport",
        city: "Frankfurt",
        country: "Germany",
        region: "europe",
        coordinates: [8.5622, 50.0379],
        regulatory: {
            framework: "EU ReFuelEU Aviation + German PtL Quota",
            mandate: "2% SAF by 2025, 0.5% PtL by 2026",
            requirements: [
                "Power-to-Liquid (PtL) sub-mandate",
                "UBA registry for sustainability verification",
                "Physical delivery required",
                "German-specific reporting to DEHSt"
            ],
            penaltyInfo: "€70/GJ penalty for PtL non-compliance"
        }
    },
    {
        iata: "MAD",
        name: "Madrid Barajas",
        city: "Madrid",
        country: "Spain",
        region: "europe",
        coordinates: [-3.5673, 40.4983],
        regulatory: {
            framework: "EU ReFuelEU Aviation",
            mandate: "2% SAF by 2025, 6% by 2030",
            requirements: [
                "CNMC verification required",
                "Physical delivery at Spanish airports",
                "EU RED II sustainability criteria",
                "Mass balance chain of custody"
            ]
        }
    },
    {
        iata: "FCO",
        name: "Rome Fiumicino",
        city: "Rome",
        country: "Italy",
        region: "europe",
        coordinates: [12.2389, 41.8003],
        regulatory: {
            framework: "EU ReFuelEU Aviation",
            mandate: "2% SAF by 2025, 6% by 2030",
            requirements: [
                "GSE verification required",
                "Physical delivery at Italian airports",
                "EU RED II sustainability criteria",
                "ISCC EU certification"
            ]
        }
    },

    // North America
    {
        iata: "JFK",
        name: "John F. Kennedy International",
        city: "New York",
        country: "United States",
        region: "north_america",
        coordinates: [-73.7781, 40.6413],
        regulatory: {
            framework: "US Federal SAF Grand Challenge + NY State",
            mandate: "3 billion gallons SAF/year by 2030 (national target)",
            requirements: [
                "CORSIA eligible fuels accepted",
                "D4 RIN generation for SAF",
                "GREET model lifecycle analysis",
                "EPA RFS compliance"
            ],
            penaltyInfo: "No federal mandate, incentive-based (SAF tax credit $1.25-1.75/gal)"
        }
    },
    {
        iata: "LAX",
        name: "Los Angeles International",
        city: "Los Angeles",
        country: "United States",
        region: "north_america",
        coordinates: [-118.4085, 33.9416],
        regulatory: {
            framework: "California LCFS + US Federal",
            mandate: "CA LCFS credits + federal incentives",
            requirements: [
                "CARB LCFS credit generation",
                "CI score verification required",
                "LCFS pathway certification",
                "CA-GREET 4.0 lifecycle model"
            ],
            penaltyInfo: "LCFS credits worth $50-200/tonne CO2e"
        }
    },
    {
        iata: "ORD",
        name: "Chicago O'Hare",
        city: "Chicago",
        country: "United States",
        region: "north_america",
        coordinates: [-87.9073, 41.9742],
        regulatory: {
            framework: "US Federal SAF Grand Challenge + Illinois",
            mandate: "Federal incentive-based program",
            requirements: [
                "Illinois SAF infrastructure investment",
                "GREET model verification",
                "EPA RFS D4 RIN eligible",
                "IRA SAF tax credit applicable"
            ],
            penaltyInfo: "IRA SAF credit: $1.25/gal base + $0.01/% over 50% GHG reduction"
        }
    },
    {
        iata: "DFW",
        name: "Dallas/Fort Worth International",
        city: "Dallas",
        country: "United States",
        region: "north_america",
        coordinates: [-97.0403, 32.8998],
        regulatory: {
            framework: "US Federal SAF Grand Challenge",
            mandate: "Federal incentive-based program",
            requirements: [
                "Texas emerging SAF hub",
                "GREET model verification",
                "EPA RFS compliance",
                "IRA SAF tax credit applicable"
            ]
        }
    },
    {
        iata: "SFO",
        name: "San Francisco International",
        city: "San Francisco",
        country: "United States",
        region: "north_america",
        coordinates: [-122.3789, 37.6213],
        regulatory: {
            framework: "California LCFS + US Federal",
            mandate: "CA LCFS credits + federal incentives",
            requirements: [
                "CARB LCFS credit generation",
                "Bay Area sustainability requirements",
                "CA-GREET pathway certification",
                "Physical delivery verification"
            ]
        }
    },
    {
        iata: "YYZ",
        name: "Toronto Pearson",
        city: "Toronto",
        country: "Canada",
        region: "north_america",
        coordinates: [-79.6248, 43.6777],
        regulatory: {
            framework: "Canada Clean Fuel Regulations",
            mandate: "CFR credit generation for SAF",
            requirements: [
                "ECCC fuel lifecycle assessment",
                "Clean Fuel Standard compliance",
                "Canadian sustainability criteria",
                "CORSIA eligible pathways"
            ]
        }
    },

    // Asia Pacific
    {
        iata: "SIN",
        name: "Singapore Changi",
        city: "Singapore",
        country: "Singapore",
        region: "asia_pacific",
        coordinates: [103.9915, 1.3644],
        regulatory: {
            framework: "Singapore SAF Roadmap",
            mandate: "1% SAF by 2026, 3-5% by 2030",
            requirements: [
                "CAAS approved sustainability criteria",
                "Book & claim accepted with limitations",
                "ISCC or RSB certification",
                "Singapore hub development focus"
            ]
        }
    },
    {
        iata: "HKG",
        name: "Hong Kong International",
        city: "Hong Kong",
        country: "Hong Kong",
        region: "asia_pacific",
        coordinates: [113.9185, 22.3080],
        regulatory: {
            framework: "Hong Kong SAF Coalition",
            mandate: "Voluntary adoption, 10% by 2030 target",
            requirements: [
                "HKCAD approved pathways",
                "CORSIA eligible fuels",
                "Industry coalition commitments",
                "RSB or ISCC certification"
            ]
        }
    },
    {
        iata: "NRT",
        name: "Narita International",
        city: "Tokyo",
        country: "Japan",
        region: "asia_pacific",
        coordinates: [140.3929, 35.7647],
        regulatory: {
            framework: "Japan SAF Mandate",
            mandate: "10% SAF by 2030",
            requirements: [
                "METI approved sustainability criteria",
                "Domestic production incentives",
                "ACT for Sky certification",
                "Japanese lifecycle methodology"
            ]
        }
    },
    {
        iata: "ICN",
        name: "Incheon International",
        city: "Seoul",
        country: "South Korea",
        region: "asia_pacific",
        coordinates: [126.4407, 37.4602],
        regulatory: {
            framework: "Korea SAF Roadmap",
            mandate: "1% SAF by 2027, 5% by 2030",
            requirements: [
                "MOLIT approved pathways",
                "K-SAF certification developing",
                "CORSIA eligible fuels",
                "Domestic production focus"
            ]
        }
    },
    {
        iata: "SYD",
        name: "Sydney Kingsford Smith",
        city: "Sydney",
        country: "Australia",
        region: "asia_pacific",
        coordinates: [151.1772, -33.9399],
        regulatory: {
            framework: "Australia SAF Roadmap",
            mandate: "Voluntary, targets under development",
            requirements: [
                "CASA approved fuels",
                "NGER reporting for emissions",
                "Australian sustainability criteria developing",
                "ISCC or RSB certification"
            ]
        }
    },
    {
        iata: "PEK",
        name: "Beijing Capital International",
        city: "Beijing",
        country: "China",
        region: "asia_pacific",
        coordinates: [116.5975, 40.0801],
        regulatory: {
            framework: "China SAF Development Plan",
            mandate: "Voluntary with production targets",
            requirements: [
                "CAAC approved pathways",
                "Sinopec/PetroChina supply chain",
                "Chinese sustainability standards",
                "Domestic production focus"
            ]
        }
    },

    // Middle East
    {
        iata: "DXB",
        name: "Dubai International",
        city: "Dubai",
        country: "United Arab Emirates",
        region: "middle_east",
        coordinates: [55.3647, 25.2532],
        regulatory: {
            framework: "UAE Net Zero 2050 / Dubai SAF Coalition",
            mandate: "1% SAF by 2031, 5% by 2035",
            requirements: [
                "GCAA approved sustainability criteria",
                "Emirates/Etihad coalition commitments",
                "CORSIA eligible fuels",
                "Regional hub development"
            ]
        }
    },
    {
        iata: "DOH",
        name: "Hamad International",
        city: "Doha",
        country: "Qatar",
        region: "middle_east",
        coordinates: [51.6138, 25.2609],
        regulatory: {
            framework: "Qatar National Vision 2030",
            mandate: "Voluntary adoption",
            requirements: [
                "QCAA approved pathways",
                "Qatar Airways commitment",
                "CORSIA eligible fuels",
                "Regional collaboration"
            ]
        }
    },
    {
        iata: "AUH",
        name: "Abu Dhabi International",
        city: "Abu Dhabi",
        country: "United Arab Emirates",
        region: "middle_east",
        coordinates: [54.6511, 24.4330],
        regulatory: {
            framework: "UAE Net Zero 2050 / Masdar SAF Initiative",
            mandate: "1% SAF by 2031, 5% by 2035",
            requirements: [
                "GCAA approved sustainability criteria",
                "Etihad Airways commitment",
                "Masdar SAF production partnership",
                "ISCC or RSB certification"
            ]
        }
    }
];

// Helper function to match airport by location string
export function findAirportByLocation(location: string): Airport | undefined {
    const locationLower = location.toLowerCase();
    return AIRPORTS.find(airport =>
        locationLower.includes(airport.iata.toLowerCase()) ||
        locationLower.includes(airport.city.toLowerCase()) ||
        locationLower.includes(airport.name.toLowerCase())
    );
}

// Get region color for map visualization
export function getRegionColor(region: Airport["region"]): string {
    const colors: Record<Airport["region"], string> = {
        europe: "#0176d3",
        north_america: "#2e844a",
        asia_pacific: "#9c27b0",
        middle_east: "#ff9800",
        africa: "#795548",
        south_america: "#00bcd4"
    };
    return colors[region];
}

// Get region display name
export function getRegionDisplayName(region: Airport["region"]): string {
    const names: Record<Airport["region"], string> = {
        europe: "Europe",
        north_america: "North America",
        asia_pacific: "Asia Pacific",
        middle_east: "Middle East",
        africa: "Africa",
        south_america: "South America"
    };
    return names[region];
}
