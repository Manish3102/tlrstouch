"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn, effectivePrice, formatRs } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { StoreProduct } from "@/components/store/product-card";
import type { ProductSize } from "@/types";

export function QuickViewModal({
  product,
  open,
  onClose,
}: {
  product: StoreProduct | null;
  open: boolean;
  onClose: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const sizes = (product?.sizes?.length
    ? product.sizes
    : ["XS", "S", "M", "L", "XL"]) as ProductSize[];
  const [size, setSize] = useState<ProductSize>(sizes[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setSize((product.sizes?.[0] as ProductSize) || "M");
      setQty(1);
    }
  }, [product]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!product) return null;

  const images = product.images ?? [];
  const primary =
    images.find((i) => i.isPrimary)?.url || images[0]?.url || "";
  const price = effectivePrice(product.price, product.salePrice);
  const onSale = price < product.price;
  const isNew = product.tags?.includes("new-arrival");
  const color = product.colors?.[0]?.name || "Default";

  function addToCart() {
    if ((product!.stock ?? 1) <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product!._id,
      slug: product!.slug,
      name: product!.name,
      price: product!.price,
      salePrice: product!.salePrice,
      image: primary,
      size,
      color,
      stock: product!.stock ?? 10,
      quantity: qty,
    });
    toast.success("Added to cart");
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close quick view"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={product.name}
            className="fixed inset-4 z-[70] mx-auto my-auto flex h-[min(640px,calc(100vh-2rem))] max-w-4xl flex-col overflow-hidden bg-white shadow-2xl md:inset-y-8 md:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative h-56 w-full shrink-0 bg-[#F5F5F5] md:h-full md:w-1/2">
              {primary ? (
                <Image
                  src={primary}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
            </div>

            <div className="relative flex flex-1 flex-col overflow-y-auto p-5 sm:p-7">
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute right-4 top-4 text-[#111111]"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="pr-8 text-xl font-medium tracking-tight sm:text-2xl">
                {product.name}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {isNew ? (
                  <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em]">
                    New
                  </span>
                ) : null}
                {onSale ? (
                  <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em]">
                    Sale
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-lg text-foreground">
                  {formatRs(price)}
                </span>
                {onSale ? (
                  <span className="text-sm text-[#777777] line-through">
                    {formatRs(product.price)}
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <p className="mb-2 text-xs text-[#777777]">
                  Size: <span className="text-[#111111]">{size}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={cn(
                        "min-w-12 border px-3 py-2.5 text-xs uppercase tracking-wide",
                        size === s
                          ? "border-[#111111] bg-[#111111] text-white"
                          : "border-[#DDDDDD] text-[#111111] hover:border-[#111111]"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex items-center gap-3 pt-8">
                <div className="flex items-center border border-[#DDDDDD]">
                  <button
                    type="button"
                    aria-label="Decrease"
                    className="p-3"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-8 text-center text-sm">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    className="p-3"
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex-1 bg-[#111111] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white"
                >
                  Add to Cart
                </button>
              </div>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="mt-4 text-center text-xs uppercase tracking-[0.14em] underline underline-offset-4"
              >
                View full details
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
