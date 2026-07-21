import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const query: any = {};

    // Filter by user unless they are admin (who can see all orders)
    if (user.role !== "ADMIN") {
      query.userId = user.id;
    }

    // Filter by order status if provided
    if (status) {
      query.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where: query,
      include: {
        items: {
          include: {
            product: {
              select: { 
                sku: true,
                images: {
                  take: 1,
                  orderBy: { displayOrder: "asc" }
                }
              },
            },
          },
        },
        payment: true,
        trackingHistory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error in orders index route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
