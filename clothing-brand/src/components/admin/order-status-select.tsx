"use client";

import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/orders";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  return (
    <select
      defaultValue={status}
      className="border border-neutral-200 px-2 py-1 text-sm"
      onChange={async (e) => {
        try {
          await updateOrderStatus(id, e.target.value);
          toast.success("Order updated");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed");
        }
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
