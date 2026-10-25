import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/actions/orders";
import { formatINR } from "@/lib/utils";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
        Order confirmed
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">
        Thanks for shopping Tailorstouch
      </h1>
      <p className="mt-3 text-sm text-neutral-600">
        Order <strong>{order.orderNumber}</strong> is{" "}
        <span className="capitalize">{order.status}</span>
        {order.paymentMethod === "cod"
          ? ". Pay cash when the order arrives. "
          : ". "}
        A confirmation message will be sent to {order.shippingAddress.phone}.
      </p>

      <div className="mt-8 space-y-3 border border-neutral-200 bg-white p-5 text-sm">
        {order.items.map(
          (
            item: {
              name: string;
              size: string;
              color: string;
              quantity: number;
              lineTotal: number;
            },
            index: number
          ) => (
            <div key={index} className="flex justify-between gap-4">
              <span>
                {item.name} · {item.size} · {item.color} × {item.quantity}
              </span>
              <span>{formatINR(item.lineTotal)}</span>
            </div>
          )
        )}
        <div className="border-t border-neutral-200 pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Shipping</span>
            <span>{formatINR(order.shipping)}</span>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-neutral-500">
              <span>Discount</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
        <p className="pt-2 text-neutral-500 capitalize">
          Payment: {order.paymentMethod} · {order.paymentStatus}
        </p>
        {order.trackingUrl ? (
          <a
            href={order.trackingUrl}
            className="inline-block pt-2 underline"
            target="_blank"
            rel="noreferrer"
          >
            Track shipment{order.awbCode ? ` · ${order.awbCode}` : ""}
            {order.courierName ? ` · ${order.courierName}` : ""}
          </a>
        ) : null}
      </div>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/shop" className="bg-neutral-900 px-5 py-3 text-white">
          Continue shopping
        </Link>
        <Link href={`/order/${order.orderNumber}`} className="border px-5 py-3">
          Track order
        </Link>
      </div>
    </div>
  );
}
