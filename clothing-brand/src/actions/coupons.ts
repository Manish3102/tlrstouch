"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { couponSchema } from "@/lib/validations";
import { calculateOrderTotals } from "@/lib/pricing";
import type { CheckoutLineInput } from "@/lib/pricing";

export async function createCoupon(input: unknown) {
  await requireAdmin();
  const data = couponSchema.parse(input);
  await connectDB();
  await Coupon.create({
    ...data,
    code: data.code.toUpperCase(),
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    maxDiscount: data.maxDiscount ?? undefined,
    usageLimit: data.usageLimit ?? undefined,
  });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await connectDB();
  await Coupon.findByIdAndDelete(id);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function validateCouponCode(
  code: string,
  items: CheckoutLineInput[]
) {
  const totals = await calculateOrderTotals(items, code);
  return {
    valid: true,
    discount: totals.discount,
    code: totals.couponCode,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
  };
}
