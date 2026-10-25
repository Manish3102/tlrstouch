"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn, effectivePrice, formatINR } from "@/lib/utils";

export function CartView({ className }: { className?: string }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);

  if (!items.length) {
    return (
      <div
        className={cn(
          "page-shell py-20 text-center",
          className
        )}
      >
        <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Your bag is empty
        </h1>
        <p className="mt-3 font-sans text-sm text-neutral-600">
          Add pieces from the latest drop.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center bg-neutral-900 px-8 font-sans text-sm font-medium uppercase tracking-wider text-white hover:bg-neutral-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "page-shell py-10 sm:py-14",
        className
      )}
    >
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Bag
          </h1>
          <p className="mt-1 font-sans text-sm text-neutral-600">
            {items.reduce((n, i) => n + i.quantity, 0)} items
          </p>
        </div>
        <button
          type="button"
          onClick={() => clear()}
          className="font-sans text-xs uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900"
        >
          Clear bag
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
        <ul className="divide-y divide-neutral-200">
          {items.map((item) => {
            const lineTotal =
              effectivePrice(item.price, item.salePrice) * item.quantity;
            return (
              <li
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex gap-4 py-6 sm:gap-6"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-28 w-20 shrink-0 overflow-hidden bg-[#F7F7F5] sm:h-32 sm:w-28"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-sans text-sm font-medium text-neutral-900 hover:opacity-70"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 font-sans text-xs text-neutral-500">
                      {item.size} · {item.color}
                    </p>
                    <p className="mt-2 font-sans text-sm text-neutral-900">
                      {formatINR(effectivePrice(item.price, item.salePrice))}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center border border-neutral-300">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100"
                        aria-label="Decrease"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center hover:bg-neutral-100"
                        aria-label="Increase"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-sm font-medium">
                        {formatINR(lineTotal)}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove item"
                        className="text-neutral-400 hover:text-neutral-900"
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit border border-border bg-well p-6">
          <h2 className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
            Summary
          </h2>
          <dl className="mt-4 space-y-2 font-sans text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd className="font-medium text-neutral-900">
                {formatINR(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between text-neutral-500">
              <dt>Shipping</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 font-display text-lg">
            <span>Total</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <Link
            href="/checkout"
            className={cn(
              "mt-6 flex h-11 w-full items-center justify-center bg-neutral-900 font-sans text-sm font-medium uppercase tracking-wider text-white hover:bg-neutral-800"
            )}
          >
            Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center font-sans text-xs uppercase tracking-[0.14em] text-neutral-600 hover:text-neutral-900"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
