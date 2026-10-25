"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProductStock } from "@/actions/products";

interface ProductRow {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  status: string;
}

export function InventoryManager({
  products,
  threshold,
}: {
  products: ProductRow[];
  threshold: number;
}) {
  const [rows, setRows] = useState(products);

  async function save(id: string, stock: number) {
    try {
      await updateProductStock(id, stock);
      setRows((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock } : p))
      );
      toast.success("Stock updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div className="overflow-x-auto border border-neutral-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 text-neutral-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((product) => (
            <tr key={product._id} className="border-b border-neutral-100">
              <td className="px-4 py-3">
                {product.name}
                {product.stock <= threshold ? (
                  <span className="ml-2 text-xs text-red-600">LOW</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-neutral-500">{product.sku}</td>
              <td className="px-4 py-3 capitalize">{product.status}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min={0}
                  defaultValue={product.stock}
                  id={`stock-${product._id}`}
                  className="w-24 border border-neutral-200 px-2 py-1"
                />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    const input = document.getElementById(
                      `stock-${product._id}`
                    ) as HTMLInputElement;
                    save(product._id, Number(input.value));
                  }}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
