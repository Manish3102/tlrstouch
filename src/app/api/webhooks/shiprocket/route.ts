import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { restoreOrderStock } from "@/lib/inventory";
import { notifyOrderOnce } from "@/lib/order-fulfillment";
import { mapShiprocketStatus, trackingUrlForAwb } from "@/lib/shiprocket";
import { Order } from "@/models/Order";

function tokenMatches(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-api-key") || url.searchParams.get("token") || "";
  if (!expected || !tokenMatches(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      awb?: string;
      courier_name?: string;
      current_status?: string;
      shipment_status?: string;
      order_id?: string | number;
      sr_order_id?: string | number;
    };

    const statusText = body.current_status || body.shipment_status || "";
    const nextStatus = statusText ? mapShiprocketStatus(statusText) : null;

    await connectDB();
    const order =
      (body.order_id
        ? await Order.findOne({ orderNumber: String(body.order_id) })
        : null) ||
      (body.sr_order_id
        ? await Order.findOne({ shiprocketOrderId: String(body.sr_order_id) })
        : null);

    if (!order) return NextResponse.json({ received: true });

    if (body.awb) {
      order.awbCode = String(body.awb);
      order.trackingUrl = trackingUrlForAwb(String(body.awb));
    }
    if (body.courier_name) order.courierName = body.courier_name;

    const previous = order.status;
    if (nextStatus && nextStatus !== previous) {
      if (nextStatus === "cancelled") {
        await restoreOrderStock(order.items);
      }
      order.status = nextStatus;
      if (
        nextStatus === "delivered" &&
        order.paymentMethod === "cod" &&
        order.paymentStatus === "pending"
      ) {
        order.paymentStatus = "paid";
      }
    }

    await order.save();

    if (nextStatus && nextStatus !== previous && nextStatus !== "processing") {
      await notifyOrderOnce(order, nextStatus);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[shiprocket] webhook", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
