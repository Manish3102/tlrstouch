import Link from "next/link";
import { getAdminProducts } from "@/lib/queries";
import { formatINR } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { items, page, pages, total } = await getAdminProducts({
    q: params.q,
    status: params.status,
    page: Number(params.page || 1),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-neutral-500">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-neutral-900 px-4 py-2.5 text-sm text-white"
        >
          Add product
        </Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name or SKU"
          className="border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={params.status || ""}
          className="border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button type="submit" className="border border-neutral-900 px-4 py-2 text-sm">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(
              (product: {
                _id: string;
                name: string;
                sku: string;
                price: number;
                stock: number;
                status: string;
                tags?: string[];
              }) => (
                <tr key={product._id} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <p>{product.name}</p>
                    {product.tags?.length ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        {product.tags
                          .map((tag) => tag.replace("-", " "))
                          .join(" · ")}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-neutral-400">No tags</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{product.sku}</td>
                  <td className="px-4 py-3">{formatINR(product.price)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 capitalize">{product.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${product._id}`}
                        className="underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={product._id} name={product.name} />
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="flex gap-2 text-sm">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}${params.q ? `&q=${params.q}` : ""}${
                params.status ? `&status=${params.status}` : ""
              }`}
              className={`px-3 py-1 ${p === page ? "bg-neutral-900 text-white" : "border"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
