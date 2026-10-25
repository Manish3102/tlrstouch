"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { cn, effectivePrice, formatRs } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { QuickViewModal } from "@/components/store/quick-view-modal";
import type { ProductSize } from "@/types";

export type StoreProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock?: number;
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
  tags?: string[];
  colors?: { name: string; hex: string }[];
  sizes?: ProductSize[];
};

function orderedImages(product: StoreProduct) {
  const imgs = product.images ?? [];
  const primary = imgs.find((i) => i.isPrimary) ?? imgs[0];
  if (!primary) return [];
  return [primary, ...imgs.filter((i) => i.url !== primary.url)];
}

export function ProductCard({
  product,
  className,
  priority,
}: {
  product: StoreProduct;
  className?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const images = useMemo(() => orderedImages(product), [product]);
  const [hovered, setHovered] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const primary = images[0]?.url;
  const secondary = images[1]?.url;
  const showSecondary = hovered && !!secondary && !reduce;

  const price = product.price;
  const sale = product.salePrice;
  const finalPrice = effectivePrice(price, sale);
  const onSale = finalPrice < price;
  const isNew = product.tags?.includes("new-arrival");
  const soldOut = (product.stock ?? 1) <= 0;

  const sizes = (product.sizes?.length
    ? product.sizes
    : ["XS", "S", "M", "L"]) as ProductSize[];
  const color = product.colors?.[0]?.name || "Default";

  function quickAdd(size: ProductSize, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: primary || "",
      size,
      color,
      stock: product.stock ?? 10,
      quantity: 1,
    });
    toast.success("Added to bag");
  }

  return (
    <>
      <article className={cn("group", className)}>
        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[3/4] overflow-hidden bg-well"
        >
          {primary ? (
            <Image
              src={primary}
              alt={images[0]?.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className={cn(
                "object-cover object-center transition-opacity duration-300",
                showSecondary ? "opacity-0" : "opacity-100"
              )}
              priority={priority}
            />
          ) : (
            <span className="absolute inset-0 flex items-end p-4 font-display text-2xl text-stone">
              {product.name}
            </span>
          )}
          {secondary ? (
            <Image
              src={secondary}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className={cn(
                "object-cover object-center transition-opacity duration-300",
                showSecondary ? "opacity-100" : "opacity-0"
              )}
            />
          ) : null}

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {isNew ? (
              <span className="bg-background/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground">
                New
              </span>
            ) : null}
            {onSale ? (
              <span className="bg-background/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground">
                Sale
              </span>
            ) : null}
            {soldOut ? (
              <span className="bg-ink/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-background">
                Sold out
              </span>
            ) : null}
          </div>
        </Link>

        <div
          className={cn(
            "absolute inset-x-2 bottom-2 z-10 hidden gap-px bg-background/95 p-1 transition duration-200 md:grid",
            sizes.length > 4 ? "grid-cols-3" : "grid-cols-4",
            hovered && !soldOut
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0"
          )}
        >
          {sizes.slice(0, 6).map((size) => (
            <button
              key={size}
              type="button"
              tabIndex={hovered ? 0 : -1}
              aria-hidden={!hovered}
              onClick={(e) => quickAdd(size, e)}
              className="bg-background py-2.5 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-ink hover:text-background"
            >
              {size}
            </button>
          ))}
        </div>
        </div>

        <div className="mt-3.5 space-y-1">
          <Link
            href={`/product/${product.slug}`}
            className="block text-sm leading-snug text-foreground transition-opacity hover:opacity-60"
          >
            {product.name}
          </Link>
          <p className="text-sm text-muted">
            {onSale ? (
              <>
                <span className="text-foreground">{formatRs(finalPrice)}</span>
                <span className="ml-2 line-through">{formatRs(price)}</span>
              </>
            ) : (
              formatRs(finalPrice)
            )}
          </p>
          {product.colors && product.colors.length > 0 ? (
            <ul className="flex items-center gap-1.5 pt-1" aria-label="Available colors">
              {product.colors.slice(0, 5).map((c) => (
                <li
                  key={c.name}
                  title={c.name}
                  className="h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="pt-1 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
          >
            Quick view
          </button>
        </div>
      </article>

      <QuickViewModal
        product={product}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </>
  );
}
