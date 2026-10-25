"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { requireAdmin, auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { checkoutSchema } from "@/lib/validations";
import { calculateOrderTotals } from "@/lib/pricing";
import { restoreOrderStock } from "@/lib/inventory";
import { syncOrderFulfillment } from "@/lib/order-fulfillment";
import { getRazorpay, isRazorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export async function createCheckoutOrder(input: unknown) {
  const limited = rateLimit("checkout:global", 60, 60_000);
  if (!limited.success) throw new Error("Too many checkout attempts");

  const data = checkoutSchema.parse(input);
  await connectDB();

  const totals = await calculateOrderTotals(data.items, data.couponCode);
  const session = await auth();
  const settings = totals.settings;
  const codEnabled =
    process.env.COD_ENABLED !== "false" && (settings?.codEnabled ?? true);

  if (data.paymentMethod === "cod" && !codEnabled) {
    throw new Error("Cash on Delivery is disabled");
  }

  if (data.paymentMethod === "razorpay" && !isRazorpayConfigured()) {
    throw new Error(
      "Online payments are not configured. Set Razorpay credentials or use COD."
    );
  }

  // Reserve stock
  for (const line of totals.lines) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.product, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } },
      { new: true }
    );
    if (!updated) {
      throw new Error(`Insufficient stock for ${line.name}`);
    }
  }

  const orderNumber = `DRF-${nanoid(8).toUpperCase()}`;
  let razorpayOrderId: string | undefined;

  if (data.paymentMethod === "razorpay") {
    const rzp = getRazorpay();
    const rzOrder = await rzp.orders.create({
      amount: Math.round(totals.total * 100),
      currency: "INR",
      receipt: orderNumber,
    });
    razorpayOrderId = rzOrder.id;
  }

  const order = await Order.create({
    orderNumber,
    user: session?.user?.id,
    items: totals.lines,
    shippingAddress: data.shippingAddress,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    discount: totals.discount,
    total: totals.total,
    couponCode: totals.couponCode,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === "cod" ? "pending" : "pending",
    status: data.paymentMethod === "cod" ? "processing" : "pending",
    razorpayOrderId,
  });

  if (totals.couponCode && data.paymentMethod === "cod") {
    await Coupon.updateOne(
      { code: totals.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  if (data.paymentMethod === "cod") {
    await syncOrderFulfillment(order, "placed");
  }

  revalidatePath("/admin/orders");
  return {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    total: order.total,
    paymentMethod: order.paymentMethod,
    razorpayOrderId,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

const verifySchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function verifyRazorpayPayment(input: unknown) {
  const data = verifySchema.parse(input);
  await connectDB();

  const valid = verifyPaymentSignature({
    orderId: data.razorpayOrderId,
    paymentId: data.razorpayPaymentId,
    signature: data.razorpaySignature,
  });

  if (!valid) throw new Error("Invalid payment signature");

  const order = await Order.findById(data.orderId);
  if (!order) throw new Error("Order not found");
  if (order.razorpayOrderId !== data.razorpayOrderId) {
    throw new Error("Order mismatch");
  }

  order.paymentStatus = "paid";
  order.status = "paid";
  order.razorpayPaymentId = data.razorpayPaymentId;
  order.razorpaySignature = data.razorpaySignature;
  await order.save();

  if (order.couponCode) {
    await Coupon.updateOne(
      { code: order.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  await syncOrderFulfillment(order, "placed");

  revalidatePath("/admin/orders");
  revalidatePath(`/order/${order.orderNumber}`);
  return { ok: true, orderNumber: order.orderNumber };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  await connectDB();
  const allowed = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];
  if (!allowed.includes(status)) throw new Error("Invalid status");

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (status === "cancelled" && order.status !== "cancelled") {
    await restoreOrderStock(order.items);
  }

  order.status = status as typeof order.status;
  if (status === "paid") order.paymentStatus = "paid";
  if (status === "refunded") order.paymentStatus = "refunded";
  if (
    status === "delivered" &&
    order.paymentMethod === "cod" &&
    order.paymentStatus === "pending"
  ) {
    order.paymentStatus = "paid";
  }
  await order.save();

  if (status === "shipped" || status === "delivered" || status === "cancelled") {
    await syncOrderFulfillment(order, status);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/order/${order.orderNumber}`);
  return { ok: true };
}

export async function getOrderByNumber(orderNumber: string) {
  await connectDB();
  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) return null;
  return JSON.parse(JSON.stringify(order));
}
