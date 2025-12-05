import connectDB from "./mongodb";
import Lot from "@/models/Lot";

export async function seedInitialLots() {
  try {
    await connectDB();

    // Check if lots already exist
    const existingLots = await Lot.countDocuments();
    if (existingLots > 0) {
      console.log("Lots already exist, skipping seed");
      return;
    }

    const initialLots = [
      {
        airline: "SkyLink Air",
        lotName: "EU Hub Q3 Drop-in SAF",
        volume: 12000,
        volumeUnit: "MT" as const,
        pricePerUnit: 1150,
        currency: "USD" as const,
        ciScore: 28,
        location: "Rotterdam, NL",
        deliveryWindow: "Jul – Sep 2025",
        longTerm: true,
        postedOn: "Apr 18, 2025",
        status: "open" as const,
      },
      {
        airline: "Global Vista Airlines",
        lotName: "Transatlantic Summer Blend",
        volume: 8500,
        volumeUnit: "MT" as const,
        pricePerUnit: 1325,
        currency: "USD" as const,
        ciScore: 34,
        location: "Houston, USA",
        deliveryWindow: "Jun – Aug 2025",
        longTerm: false,
        postedOn: "Apr 22, 2025",
        status: "open" as const,
      },
      {
        airline: "Aurora Air",
        lotName: "APAC Gateway Supply",
        volume: 15000,
        volumeUnit: "MT" as const,
        pricePerUnit: 1210,
        currency: "USD" as const,
        ciScore: 30,
        location: "Singapore (Changi)",
        deliveryWindow: "Sep – Nov 2025",
        longTerm: true,
        postedOn: "Apr 25, 2025",
        status: "open" as const,
      },
      {
        airline: "Northern Lights Airways",
        lotName: "Nordic Winter Readiness",
        volume: 6000,
        volumeUnit: "MT" as const,
        pricePerUnit: 990,
        currency: "USD" as const,
        ciScore: 25,
        location: "Oslo, NO",
        deliveryWindow: "Dec 2025 – Feb 2026",
        longTerm: false,
        postedOn: "Apr 27, 2025",
        status: "open" as const,
      },
    ];

    await Lot.insertMany(initialLots);
    console.log("Successfully seeded initial lots");
  } catch (error) {
    console.error("Error seeding initial lots:", error);
    throw error;
  }
}


















