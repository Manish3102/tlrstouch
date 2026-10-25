"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ProductSize } from "@/types";
import { effectivePrice } from "@/lib/utils";

interface CartState {
  items: CartItem[];
  couponCode?: string;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: ProductSize, color: string) => void;
  updateQuantity: (
    productId: string,
    size: ProductSize,
    color: string,
    quantity: number
  ) => void;
  setCoupon: (code?: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

function keyOf(productId: string, size: string, color: string) {
  return `${productId}:${size}:${color}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        set((state) => {
          const idx = state.items.findIndex(
            (i) =>
              keyOf(i.productId, i.size, i.color) ===
              keyOf(item.productId, item.size, item.color)
          );
          if (idx >= 0) {
            const next = [...state.items];
            const nextQty = Math.min(
              next[idx].stock,
              next[idx].quantity + quantity
            );
            next[idx] = { ...next[idx], quantity: nextQty };
            return { items: next };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.stock) },
            ],
          };
        });
      },
      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) => keyOf(i.productId, i.size, i.color) !== keyOf(productId, size, color)
          ),
        })),
      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              keyOf(i.productId, i.size, i.color) === keyOf(productId, size, color)
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      setCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ items: [], couponCode: undefined }),
      subtotal: () =>
        get().items.reduce(
          (sum, i) =>
            sum + effectivePrice(i.price, i.salePrice) * i.quantity,
          0
        ),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "drift-cart" }
  )
);
