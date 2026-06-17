import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET: List all coupons (Admin only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new coupon (Admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minCartAmount,
      maxDiscountAmount,
      startsAt,
      expiresAt,
      usageLimit,
    } = body;

    // Validate inputs
    if (!code || !discountType || discountValue === undefined || !startsAt || !expiresAt) {
      return NextResponse.json({ error: "Missing required coupon fields." }, { status: 400 });
    }

    if (!["FIXED", "PERCENTAGE"].includes(discountType)) {
      return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType,
        discountValue: parseFloat(discountValue),
        minCartAmount: parseFloat(minCartAmount || "0"),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        startsAt: new Date(startsAt),
        expiresAt: new Date(expiresAt),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a coupon (Admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully." });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
