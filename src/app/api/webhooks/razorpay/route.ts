import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Coupon } from "@/models/Coupon";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { syncOrderFulfillment } from "@/lib/order-fulfillment";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (process.env.RAZORPAY_WEBHOOK_SECRET) {
    const valid = verifyWebhookSignature(body, signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  try {
    const event = JSON.parse(body) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            order_id?: string;
            id?: string;
            status?: string;
          };
        };
      };
    };

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await connectDB();
        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.status = "paid";
          order.razorpayPaymentId = payment.id;
          await order.save();
          if (order.couponCode) {
            await Coupon.updateOne(
              { code: order.couponCode },
              { $inc: { usedCount: 1 } }
            );
          }
          await syncOrderFulfillment(order, "placed");
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
