import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { identifier, otpCode, newPassword } = await request.json();

    if (!identifier || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: "Identifier, OTP Code, and New Password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // 1. Verify the user exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone_number: cleanIdentifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 2. Find valid OTP
    const validOtp = await prisma.otp.findFirst({
      where: {
        identifier: cleanIdentifier,
        otpCode: otpCode.trim(),
        purpose: "RESET_PASSWORD",
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    // 3. Hash the new password
    const newPasswordHash = hashPassword(newPassword);

    // 4. Perform transaction to update password and mark OTP as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.otp.update({
        where: { id: validOtp.id },
        data: { isUsed: true },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Password updated successfully." });

  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting password." },
      { status: 500 }
    );
  }
}
