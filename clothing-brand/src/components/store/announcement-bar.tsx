"use client";

import { cn } from "@/lib/utils";

export function AnnouncementBar({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text?.trim()) return null;

  return (
    <div
      className={cn(
        "relative z-50 bg-ink px-4 py-2 text-center text-background",
        className
      )}
      role="region"
      aria-label="Announcement"
    >
      <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px]">
        {text.trim()}
      </p>
    </div>
  );
}
