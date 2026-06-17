import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { identifier, purpose } = await request.json();
    
    if (!identifier) {
      return NextResponse.json({ error: "Identifier (phone or email) is required." }, { status: 400 });
    }

    // Clean and validate format
    const cleanIdentifier = identifier.trim();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit code
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save OTP to database
    await prisma.otp.create({
      data: {
        identifier: cleanIdentifier,
        otpCode,
        purpose: purpose || "LOGIN",
        expiresAt,
        isUsed: false,
      },
    });

    // Simulate dispatch via SMS or Email Gateway
    console.log(`[OTP GATEWAY SIMULATION] Sent OTP Code ${otpCode} to ${cleanIdentifier}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${cleanIdentifier}`,
      otpCode, // Returned for easy UI testing/demonstration
    });
  } catch (error) {
    console.error("Error in OTP send route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
