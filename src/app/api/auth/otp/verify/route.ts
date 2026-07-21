import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { identifier, otpCode } = await request.json();

    if (!identifier || !otpCode) {
      return NextResponse.json({ error: "Identifier and OTP code are required." }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();
    const cleanOtp = otpCode.trim();

    // 1. Find the latest valid OTP code
    const otpRecord = await prisma.otp.findFirst({
      where: {
        identifier: cleanIdentifier,
        otpCode: cleanOtp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });
    }

    // 2. Mark the OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // 3. Determine if identifier is email or phone number
    const isEmail = cleanIdentifier.includes("@");
    
    let user = await prisma.user.findUnique({
      where: isEmail ? { email: cleanIdentifier } : { phone_number: cleanIdentifier },
    });

    // 4. Create user if it doesn't exist (automatic registration)
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: cleanIdentifier.split("@")[0], // default fallback name
          email: isEmail ? cleanIdentifier : null,
          phone_number: !isEmail ? cleanIdentifier : null,
          isEmailVerified: isEmail,
          isPhoneVerified: !isEmail,
          role: "USER",
        },
      });
    } else {
      // If user exists, update their verification state
      await prisma.user.update({
        where: { id: user.id },
        data: isEmail ? { isEmailVerified: true } : { isPhoneVerified: true },
      });
    }

    // 5. Establish authentication session
    await setSessionCookie(user.id, user.role);

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in OTP verify route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
