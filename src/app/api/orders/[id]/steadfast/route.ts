import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID missing" }, { status: 400 });
    }

    // 1. Fetch Order Details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 2. Fetch Steadfast Settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ["STEADFAST_API_KEY", "STEADFAST_SECRET_KEY"] } },
    });
    
    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    const apiKey = configMap["STEADFAST_API_KEY"];
    const secretKey = configMap["STEADFAST_SECRET_KEY"];

    if (!apiKey || !secretKey) {
      return NextResponse.json({ success: false, error: "Steadfast API Key or Secret Key is missing in Settings." }, { status: 400 });
    }

    // 3. Send request to Steadfast API
    const steadfastPayload = {
      invoice: order.orderNumber,
      recipient_name: order.customerName,
      recipient_phone: order.customerPhone,
      recipient_address: order.deliveryAddress,
      cod_amount: order.totalAmount
    };

    const response = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Secret-Key": secretKey
      },
      body: JSON.stringify(steadfastPayload)
    });

    const data = await response.json();

    if (response.ok && data.status === 200) {
      const trackingCode = data.consignment?.tracking_code || "Unknown";
      
      // 4. Update order tracking history
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: "SENT_TO_STEADFAST",
          notes: `Sent to Steadfast Courier. Tracking Code: ${trackingCode}`,
        }
      });

      return NextResponse.json({ success: true, trackingCode });
    } else {
      console.error("Steadfast API Error:", data);
      return NextResponse.json({ 
        success: false, 
        error: data.message || "Failed to create parcel in Steadfast" 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Error sending to Steadfast:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
