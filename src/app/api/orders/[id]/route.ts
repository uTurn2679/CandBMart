import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// 1. GET: Fetch order tracking timeline & details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const orConditions: any[] = [
      { id: id }, 
      { orderNumber: id }, 
      { customerPhone: id }
    ];

    const digitsOnly = id.replace(/\D/g, '');
    if (digitsOnly.length >= 11) {
      orConditions.push({ customerPhone: { endsWith: digitsOnly.slice(-11) } });
    }

    // Search by UUID, orderNumber, or customerPhone (last 11 digits)
    const order = await prisma.order.findFirst({
      where: {
        OR: orConditions,
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        },
        payment: true,
        trackingHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PATCH: Admin update order status / payment status
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Authorization check
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await request.json();
    const { orderStatus, paymentStatus, notes } = body;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updateData: any = {};
    const trackingHistoryCreate: any = [];

    // Process order status update
    if (orderStatus) {
      if (!["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(orderStatus)) {
        return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
      }
      updateData.orderStatus = orderStatus;
      
      trackingHistoryCreate.push({
        status: orderStatus,
        notes: notes || `Order status updated to ${orderStatus.toLowerCase()}.`,
      });
    }

    // Process payment status update
    if (paymentStatus) {
      if (!["PENDING", "PAID", "REFUNDED", "FAILED"].includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;

      // Update nested payment status if it exists
      if (order.payment) {
        await prisma.payment.update({
          where: { orderId: order.id },
          data: {
            paymentStatus: paymentStatus === "PAID" ? "VERIFIED" : "PENDING",
            verifiedById: user.id,
            verifiedAt: new Date(),
          },
        });
      }
    }

    // Apply updates inside a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Create tracking records
      if (trackingHistoryCreate.length > 0) {
        await tx.orderTracking.create({
          data: {
            orderId: order.id,
            status: trackingHistoryCreate[0].status,
            notes: trackingHistoryCreate[0].notes,
          },
        });
      }

      // Update order
      return await tx.order.update({
        where: { id: order.id },
        data: updateData,
        include: {
          items: true,
          payment: true,
          trackingHistory: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 3. DELETE: Remove order completely from database
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Authorization check
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    // Since onDelete: Cascade is configured for OrderItem, Payment, and OrderTracking,
    // deleting the order will automatically clean up the related records.
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
