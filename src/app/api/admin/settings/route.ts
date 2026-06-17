import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET: Fetch all configuration settings
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const configMap = settings.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    
    return NextResponse.json({ success: true, settings: configMap });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Update system configurations (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await request.json(); // Expected format: { key: value, ... }

    // Execute upsert operations for each key-value pair
    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
