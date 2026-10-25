"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import { effectivePrice, formatINR } from "@/lib/utils";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeCart]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-5">
              <h2 className="font-display text-3xl tracking-tight">
                Bag ({items.reduce((n, i) => n + i.quantity, 0)})
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={closeCart}
                className="flex h-11 w-11 items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-display text-3xl tracking-tight">Your bag is empty</p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-6 bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-background"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => {
                    const unit = effectivePrice(item.price, item.salePrice);
                    return (
                      <li
                        key={`${item.productId}-${item.size}-${item.color}`}
                        className="flex gap-3"
                      >
                        <div className="relative aspect-[3/4] w-20 shrink-0 bg-well">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={closeCart}
                              className="text-sm"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              className="text-xs text-muted underline"
                              onClick={() =>
                                removeItem(item.productId, item.size, item.color)
                              }
                            >
                              Remove
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {item.size} · {item.color}
                          </p>
                          <p className="mt-1 text-sm">{formatINR(unit)}</p>
                          <div className="mt-auto flex items-center gap-3 pt-2">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center border border-border"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center border border-border"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-border px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="mb-4 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block bg-ink py-3.5 text-center text-[11px] uppercase tracking-[0.16em] text-background"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="mt-2 block py-2 text-center text-[11px] uppercase tracking-[0.16em] text-muted"
                >
                  View bag
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
