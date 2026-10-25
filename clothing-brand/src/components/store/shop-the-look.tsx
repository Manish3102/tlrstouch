"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatINR, effectivePrice } from "@/lib/utils";
import type { StoreProduct } from "@/components/store/product-card";

export type LookHotspot = {
  x: number;
  y: number;
  productId: string;
};

export function ShopTheLook({
  title,
  description,
  imageUrl,
  imageAlt,
  hotspots,
  products,
}: {
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  hotspots: LookHotspot[];
  products: StoreProduct[];
}) {
  const [activeId, setActiveId] = useState<string | null>(
    hotspots[0]?.productId ?? null
  );
  const productMap = new Map(products.map((p) => [p._id, p]));
  const active = activeId ? productMap.get(activeId) : null;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#FAFAF8]">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {hotspots.map((spot) => {
            const product = productMap.get(spot.productId);
            if (!product) return null;
            const isActive = activeId === spot.productId;
            return (
              <button
                key={`${spot.productId}-${spot.x}-${spot.y}`}
                type="button"
                aria-label={`View ${product.name}`}
                onClick={() => setActiveId(spot.productId)}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border border-white bg-[#111111]/70 text-[10px] text-white backdrop-blur-sm transition ${
                    isActive ? "scale-110 ring-2 ring-white" : ""
                  }`}
                >
                  +
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#777777]">
            Shop the look
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#777777]">
              {description}
            </p>
          ) : null}

          <div className="mt-8 min-h-[140px]">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-4 border border-[#EAEAEA] p-4"
                >
                  <div className="relative h-28 w-20 bg-[#FAFAF8]">
                    {active.images?.[0]?.url ? (
                      <Image
                        src={
                          active.images.find((i) => i.isPrimary)?.url ||
                          active.images[0].url
                        }
                        alt={active.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm">{active.name}</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatINR(
                        effectivePrice(active.price, active.salePrice)
                      )}
                    </p>
                    <Link
                      href={`/product/${active.slug}`}
                      className="mt-auto pt-3 text-[11px] uppercase tracking-[0.16em] underline underline-offset-4"
                    >
                      View product
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <p className="text-sm text-[#777777]">
                  Tap a hotspot to explore pieces from this look.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
