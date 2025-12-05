import { NextResponse } from "next/server";
import { seedInitialLots } from "@/lib/seed-data";

export async function POST() {
  try {
    await seedInitialLots();
    return NextResponse.json(
      { message: "Database seeded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}


















