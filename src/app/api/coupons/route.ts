import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.toUpperCase().trim();
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    const now = new Date();

    if (!coupon || !coupon.isActive || coupon.startsAt > now || coupon.expiresAt < now) {
      return NextResponse.json({ isValid: false, error: "Invalid or expired coupon code." });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ isValid: false, error: "This coupon is no longer available." });
    }

    if (subtotal < coupon.minCartAmount) {
      return NextResponse.json({
        isValid: false,
        error: `Minimum order value of ${coupon.minCartAmount} TK is required to use this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      isValid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
