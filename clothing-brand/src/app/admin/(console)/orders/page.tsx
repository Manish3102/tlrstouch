import { getAdminOrders } from "@/lib/queries";
import { formatINR } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrdersPage() {
  const { items } = await getAdminOrders();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Shipment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(
              (order: {
                _id: string;
                orderNumber: string;
                total: number;
                paymentMethod: string;
                paymentStatus: string;
                status: string;
                shippingAddress?: { fullName?: string; email?: string; phone?: string };
                awbCode?: string;
                courierName?: string;
                trackingUrl?: string;
                shiprocketOrderId?: string;
              }) => (
                <tr key={order._id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.shippingAddress?.fullName}</div>
                    <div className="text-xs text-neutral-500">
                      {order.shippingAddress?.phone}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {order.shippingAddress?.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatINR(order.total)}</td>
                  <td className="px-4 py-3 capitalize">
                    {order.paymentMethod} · {order.paymentStatus}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {order.awbCode ? (
                      <a
                        href={order.trackingUrl}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.courierName || "AWB"} {order.awbCode}
                      </a>
                    ) : order.shiprocketOrderId ? (
                      "In Shiprocket"
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect id={order._id} status={order.status} />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No orders yet.</p>
      ) : null}
    </div>
  );
}
