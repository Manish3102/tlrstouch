"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recently-viewed";

export function RecentlyViewedTracker({ productId }: { productId: string }) {
  const add = useRecentlyViewedStore((s) => s.add);
  useEffect(() => {
    add(productId);
  }, [add, productId]);
  return null;
}
