"use client";

import { cn } from "@/lib/utils";

/** Full-width black marquee strip — Brkthru-style “Break through ® • NEW ARRIVAL” */
export function BrandTicker({
  brandName = "Tailorstouch",
  label = "NEW ARRIVAL",
  className,
}: {
  brandName?: string;
  label?: string;
  className?: string;
}) {
  const unit = `${brandName} ®  •  ${label}  •  `;
  const items = Array.from({ length: 12 }, () => unit);

  return (
    <div
      className={cn(
        "overflow-hidden bg-ink py-3 text-white",
        className
      )}
      aria-hidden
    >
      <div className="announcement-marquee flex w-max whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="px-2 text-xs font-medium uppercase tracking-[0.22em] sm:text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
