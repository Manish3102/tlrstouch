"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/wishlist";
import { ProductGrid } from "@/components/store/product-grid";
import type { StoreProduct } from "@/components/store/product-card";

export function WishlistView() {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!ids.length) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      const res = await fetch(`/api/products/by-ids?ids=${ids.join(",")}`);
      const data = await res.json();
      if (!cancelled) {
        setProducts(data.products || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading wishlist…</p>;
  }
  if (!products.length) {
    return (
      <p className="text-sm text-neutral-500">
        Your wishlist is empty. Tap the heart on any product to save it.
      </p>
    );
  }
  return <ProductGrid products={products} />;
}
