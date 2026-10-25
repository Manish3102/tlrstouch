import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/queries";
import { formatINR } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Products", value: stats.totalProducts },
    { label: "Orders", value: stats.totalOrders },
    { label: "Customers", value: stats.totalCustomers },
    { label: "Revenue", value: formatINR(stats.totalRevenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Store performance at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-neutral-200 bg-white p-5"
          >
            <p className="text-xs uppercase tracking-wider text-neutral-500">
              {card.label}
            </p>
            <p className="mt-2 font-display text-3xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Low stock</h2>
            <Link href="/admin/inventory" className="text-sm underline">
              Inventory
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-neutral-500">No low-stock items</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStock.map(
                (p: { _id: string; name: string; stock: number; sku: string }) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {p.name}
                      <span className="ml-2 text-neutral-400">{p.sku}</span>
                    </span>
                    <span className="font-medium text-red-600">{p.stock}</span>
                  </li>
                )
              )}
            </ul>
          )}
        </section>

        <section className="border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm underline">
              All orders
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentOrders.map(
                (o: {
                  _id: string;
                  orderNumber: string;
                  total: number;
                  status: string;
                }) => (
                  <li
                    key={o._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{o.orderNumber}</span>
                    <span className="text-neutral-500">{o.status}</span>
                    <span>{formatINR(o.total)}</span>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
