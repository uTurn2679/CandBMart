import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryZone,
      paymentMethod,
      transactionId,
      lastThreeDigits,
      couponCode,
      items, // Array of: { productId, variantId, quantity }
    } = body;

    // 1. Basic validation
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryZone || !paymentMethod || !items || !items.length) {
      return NextResponse.json({ error: "Missing required checkout information." }, { status: 400 });
    }

    if (!["INSIDE_DHAKA", "OUTSIDE_DHAKA"].includes(deliveryZone)) {
      return NextResponse.json({ error: "Invalid delivery zone." }, { status: 400 });
    }

    if (!["COD", "BKASH_MANUAL", "NAGAD_MANUAL", "ROCKET_MANUAL"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
    }

    // If payment method is manual MFS, we require transaction ID or last 3 digits
    if (paymentMethod !== "COD" && !transactionId && !lastThreeDigits) {
      return NextResponse.json(
        { error: "Manual mobile payment requires Transaction ID or Phone's Last 3 Digits for verification." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    // 2. Perform Transaction
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      // A. Verify stock, lock products, and calculate subtotal
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant || variant.productId !== item.productId) {
          throw new Error(`Product variant mismatch: Product ${item.productId}, Variant ${item.variantId}`);
        }

        if (variant.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${variant.product.name} (${variant.variantName})`);
        }

        // Deduct variant stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        // Deduct general product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        const unitPrice = variant.priceOverride !== null ? variant.priceOverride : variant.product.price;
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: variant.product.name,
          variantName: variant.variantName,
          unitPrice,
          quantity: item.quantity,
          totalPrice,
        });
      }

      // B. Load Dynamic Settings
      const settings = await tx.systemSetting.findMany({
        where: {
          key: {
            in: ["DELIVERY_CHARGE_INSIDE_DHAKA", "DELIVERY_CHARGE_OUTSIDE_DHAKA", "FREE_DELIVERY_THRESHOLD"],
          },
        },
      });

      const config = {
        insideDhaka: parseFloat(settings.find((s) => s.key === "DELIVERY_CHARGE_INSIDE_DHAKA")?.value || "60"),
        outsideDhaka: parseFloat(settings.find((s) => s.key === "DELIVERY_CHARGE_OUTSIDE_DHAKA")?.value || "120"),
        freeThreshold: parseFloat(settings.find((s) => s.key === "FREE_DELIVERY_THRESHOLD")?.value || "2000"),
      };

      // C. Calculate delivery fee
      const isFreeDelivery = subtotal >= config.freeThreshold;
      const deliveryCharge = isFreeDelivery
        ? 0.00
        : deliveryZone === "INSIDE_DHAKA"
        ? config.insideDhaka
        : config.outsideDhaka;

      // D. Verify and Apply Coupon
      let discountAmount = 0;
      let couponId = null;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase().trim() },
        });

        const now = new Date();
        if (coupon && coupon.isActive && coupon.startsAt <= now && coupon.expiresAt >= now) {
          const meetsLimit = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;
          const meetsMinSpend = subtotal >= coupon.minCartAmount;

          if (meetsLimit && meetsMinSpend) {
            couponId = coupon.id;
            if (coupon.discountType === "PERCENTAGE") {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            discountAmount = Math.min(discountAmount, subtotal);

            // Increment coupon usage
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }

      const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);

      // E. Generate order identifier
      const uniqueSuffix = Date.now().toString().slice(-6);
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `BD-${uniqueSuffix}-${randomPart}`;

      // F. Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user ? user.id : null,
          customerName,
          customerPhone,
          deliveryAddress,
          deliveryZone,
          subtotalAmount: subtotal,
          deliveryCharge,
          couponId,
          discountAmount,
          totalAmount,
          orderStatus: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              paymentMethod,
              paymentStatus: "PENDING",
              amountPaid: totalAmount,
              transactionId: transactionId || null,
              lastThreeDigits: lastThreeDigits || null,
            },
          },
          trackingHistory: {
            create: {
              status: "PENDING",
              notes: "Order placed successfully. Awaiting payment verification.",
            },
          },
        },
      });

      return order;
    });

    // 3. Send Telegram Notification
    try {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "8840968249:AAGE8XO-01fC7A9EL62g5tnJOfZw37XkqG8";
      const telegramChatId = process.env.TELEGRAM_CHAT_ID || "6445871174";
      if (telegramBotToken && telegramChatId) {
        const message = encodeURIComponent(`🛒 *New Order Received!*\n\n*Order No:* ${result.orderNumber}\n*Customer:* ${customerName}\n*Phone:* ${customerPhone}\n*Total:* ${result.totalAmount} TK\n*Payment:* ${paymentMethod}\n\nPlease check the admin panel for details.`);
        const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramChatId}&text=${message}&parse_mode=Markdown`;
        
        // Fire and forget (don't await so it doesn't block checkout)
        fetch(url).catch(err => console.error("Telegram Fetch Error:", err));
      }
    } catch (e) {
      console.error("Failed to trigger Telegram notification:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      orderId: result.id,
      orderNumber: result.orderNumber,
      totalAmount: result.totalAmount,
    });
  } catch (error: any) {
    console.error("Checkout transaction error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed." }, { status: 400 });
  }
}
