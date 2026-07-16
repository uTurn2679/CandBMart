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
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiration

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

    // Send SMS if identifier is a Bangladeshi phone number
    const isPhone = /^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleanIdentifier);
    
    if (isPhone) {
      // NOTE: To actually send SMS, you must provide a valid SMS gateway API token in .env
      // Example using Greenweb SMS (Popular in BD):
      const smsApiToken = process.env.SMS_API_TOKEN;
      if (smsApiToken) {
        try {
          const smsText = `Your Grihokathon OTP is ${otpCode}. It is valid for 2 minutes.`;
          await fetch("http://api.greenweb.com.bd/api.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              token: smsApiToken,
              to: cleanIdentifier,
              message: smsText
            })
          });
          console.log(`[OTP] SMS Sent to ${cleanIdentifier}`);
        } catch (smsErr) {
          console.error("SMS Sending failed:", smsErr);
        }
      } else {
        console.log(`[OTP GATEWAY SIMULATION] Sent OTP Code ${otpCode} to ${cleanIdentifier}`);
      }
    } else {
      // Handle email sending here if needed
      console.log(`[OTP GATEWAY SIMULATION] Sent OTP Code ${otpCode} to ${cleanIdentifier}`);
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${cleanIdentifier}`,
      // TEMPORARILY returning otpCode to frontend so the user can log in without an SMS API
      otpCode: otpCode, 
    });
  } catch (error) {
    console.error("Error in OTP send route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
