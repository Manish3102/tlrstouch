"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type StoreProduct } from "@/components/store/product-card";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

export function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllHref,
  className,
  autoPlay = false,
}: {
  products: StoreProduct[];
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  function scrollBy(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-product-slide]");
    const amount = card ? card.offsetWidth + 12 : 280;
    const max = el.scrollWidth - el.clientWidth;
    const next = el.scrollLeft + dir * amount;
    if (dir > 0 && next >= max - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir < 0 && el.scrollLeft <= 4) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * amount, behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (!autoPlay || reduce || paused || products.length < 3) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      scrollBy(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoPlay, reduce, paused, products.length]);

  if (!products.length) return null;

  return (
    <section
      className={cn("relative min-w-0", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
          <h2 className="mt-2 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="hidden text-[11px] uppercase tracking-[0.16em] underline underline-offset-4 sm:inline"
            >
              View all
            </Link>
          ) : null}
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous products"
              onClick={() => scrollBy(-1)}
              className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next products"
              onClick={() => scrollBy(1)}
              className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        className="scrollbar-none flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-4"
      >
        {products.map((product, i) => (
          <div
            key={product._id}
            data-product-slide
            className="w-[72%] shrink-0 snap-start sm:w-[46%] md:w-[32%] lg:w-[24.5%]"
          >
            <ProductCard product={product} priority={i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}
