"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCoupon, deleteCoupon } from "@/actions/coupons";

interface Coupon {
  _id: string;
  code: string;
  type: string;
  value: number;
  usedCount?: number;
  usageLimit?: number;
  isActive: boolean;
  expiresAt?: string;
}

export function CouponsManager({ initial }: { initial: Coupon[] }) {
  const [coupons, setCoupons] = useState(initial);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createCoupon({
        code: String(form.get("code")),
        type: String(form.get("type")),
        value: Number(form.get("value")),
        minOrderAmount: Number(form.get("minOrderAmount") || 0),
        maxDiscount: form.get("maxDiscount")
          ? Number(form.get("maxDiscount"))
          : null,
        usageLimit: form.get("usageLimit")
          ? Number(form.get("usageLimit"))
          : null,
        expiresAt: String(form.get("expiresAt") || "") || null,
        isActive: true,
      });
      toast.success("Coupon created");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete coupon?")) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success("Deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="flex items-center justify-between border border-neutral-200 bg-white p-4 text-sm"
          >
            <div>
              <p className="font-medium tracking-wide">{coupon.code}</p>
              <p className="text-neutral-500">
                {coupon.type === "percent"
                  ? `${coupon.value}%`
                  : `₹${coupon.value}`}{" "}
                · used {coupon.usedCount ?? 0}
                {coupon.usageLimit ? `/${coupon.usageLimit}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(coupon._id)}
              className="text-red-600 underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={onCreate} className="space-y-3 border border-neutral-200 bg-white p-5">
        <h2 className="font-medium">Create coupon</h2>
        <input name="code" required placeholder="Code" className="w-full border px-3 py-2 text-sm" />
        <select name="type" className="w-full border px-3 py-2 text-sm">
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
        <input name="value" type="number" required min={0} placeholder="Value" className="w-full border px-3 py-2 text-sm" />
        <input name="minOrderAmount" type="number" placeholder="Min order" className="w-full border px-3 py-2 text-sm" />
        <input name="maxDiscount" type="number" placeholder="Max discount" className="w-full border px-3 py-2 text-sm" />
        <input name="usageLimit" type="number" placeholder="Usage limit" className="w-full border px-3 py-2 text-sm" />
        <input name="expiresAt" type="date" className="w-full border px-3 py-2 text-sm" />
        <button type="submit" className="w-full bg-neutral-900 py-2.5 text-sm text-white">
          Create
        </button>
      </form>
    </div>
  );
}
