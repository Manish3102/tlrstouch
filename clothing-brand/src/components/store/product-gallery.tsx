"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  url: string;
  alt?: string;
};

export function ProductGallery({
  images,
  productName,
  className,
}: {
  images: GalleryImage[];
  productName: string;
  className?: string;
}) {
  const list = images.filter((img) => img.url);
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const activeImage = list[active] ?? list[0];

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomOpen]);

  return (
    <>
      <div className={cn("flex flex-col lg:grid lg:grid-cols-[4.75rem_1fr] lg:gap-3", className)}>
        {list.length > 1 ? (
          <div className="order-2 mt-3 flex gap-2 overflow-x-auto lg:order-1 lg:mt-0 lg:max-h-[760px] lg:flex-col lg:overflow-y-auto">
            {list.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden bg-well lg:h-[5.5rem] lg:w-full",
                  i === active
                    ? "ring-1 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                )}
                aria-label={`View image ${i + 1} of ${list.length}`}
                aria-current={i === active ? "true" : undefined}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className="group relative order-1 aspect-[3/4] w-full overflow-hidden bg-well lg:order-2"
          onClick={() => activeImage && setZoomOpen(true)}
          aria-label={activeImage ? "Enlarge image" : productName}
          disabled={!activeImage}
        >
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-end p-6 text-left font-display text-4xl text-stone">
              {productName}
            </span>
          )}
          {activeImage ? (
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-background/90 text-foreground">
              <Plus className="h-4 w-4" />
            </span>
          ) : null}
        </button>
      </div>

      <AnimatePresence>
        {zoomOpen && activeImage ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Product image"
          >
            <button
              type="button"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-background"
              onClick={() => setZoomOpen(false)}
              aria-label="Close image"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              className="relative h-[min(85vh,900px)] w-full max-w-4xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={activeImage.url}
                alt={activeImage.alt || productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
