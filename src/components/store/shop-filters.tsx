"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price · Low to high" },
  { value: "price-desc", label: "Price · High to low" },
  { value: "name", label: "Name A–Z" },
] as const;

const SIZE_OPTIONS: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL"];

const COLOR_OPTIONS = [
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Grey", hex: "#737373" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Olive", hex: "#4d5d2c" },
];

type Panel = "sort" | "size" | "color" | "mobile" | null;

export function ShopFilters({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);

  const sort = searchParams.get("sort") ?? "newest";
  const size = searchParams.get("size") ?? "";
  const color = searchParams.get("color") ?? "";

  const [open, setOpen] = useState<Panel>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === "") params.delete(key);
        else params.set(key, value);
      });
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filterCount = useMemo(() => {
    let n = 0;
    if (size) n += 1;
    if (color) n += 1;
    return n;
  }, [size, color]);

  const clearFilters = () => {
    updateParams({ sort: null, size: null, color: null });
    setOpen(null);
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open === "mobile") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest";

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="hidden items-center justify-between gap-4 border-y border-border py-2 sm:flex">
        <div className="flex flex-wrap items-center gap-2">
          <FilterTrigger
            label="Size"
            value={size || "All"}
            active={open === "size" || !!size}
            onClick={() => setOpen(open === "size" ? null : "size")}
          />
          <FilterTrigger
            label="Color"
            value={color || "All"}
            active={open === "color" || !!color}
            onClick={() => setOpen(open === "color" ? null : "color")}
          />
          {filterCount > 0 || (sort && sort !== "newest") ? (
            <button
              type="button"
              onClick={clearFilters}
              className="px-2 py-2 text-[11px] uppercase tracking-[0.14em] text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <FilterTrigger
          label="Sort"
          value={sortLabel}
          active={open === "sort"}
          onClick={() => setOpen(open === "sort" ? null : "sort")}
        />
      </div>

      {/* Desktop dropdown panels */}
      {open === "sort" ? (
        <DropdownPanel align="end">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                updateParams({
                  sort: opt.value === "newest" ? null : opt.value,
                });
                setOpen(null);
              }}
              className={cn(
                "block w-full px-4 py-2.5 text-left text-sm",
                sort === opt.value
                  ? "bg-ink text-background"
                  : "text-foreground hover:bg-well"
              )}
            >
              {opt.label}
            </button>
          ))}
        </DropdownPanel>
      ) : null}

      {open === "size" ? (
        <DropdownPanel>
          <div className="flex flex-wrap gap-2 p-3">
            {SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  updateParams({ size: size === s ? null : s });
                }}
                className={cn(
                  "min-h-11 min-w-11 border px-2 py-2 text-xs uppercase tracking-wide",
                  size === s
                    ? "border-ink bg-ink text-background"
                    : "border-border text-foreground hover:border-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </DropdownPanel>
      ) : null}

      {open === "color" ? (
        <DropdownPanel>
          <div className="flex flex-wrap gap-2 p-3">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  updateParams({
                    color: color === c.name ? null : c.name,
                  });
                }}
                className={cn(
                  "flex min-h-11 items-center gap-2 border px-2.5 py-2 text-xs uppercase tracking-wide",
                  color === c.name
                    ? "border-foreground"
                    : "border-border hover:border-foreground"
                )}
              >
                <span
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden
                />
                {c.name}
              </button>
            ))}
          </div>
        </DropdownPanel>
      ) : null}

      {/* Mobile: filter button + sheet */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen("mobile")}
          className="inline-flex h-11 items-center gap-2 border border-foreground px-3 text-[11px] uppercase tracking-[0.14em] text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter & sort
          {filterCount > 0 ? (
            <span className="bg-ink px-1.5 py-0.5 text-[10px] text-background">
              {filterCount}
            </span>
          ) : null}
        </button>
        <p className="text-xs text-muted">{sortLabel}</p>
      </div>

      {open === "mobile" ? (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => setOpen(null)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-background pb-[env(safe-area-inset-bottom)]">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-4">
              <span className="text-xs font-medium uppercase tracking-[0.16em]">
                Filter & sort
              </span>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-4 py-5">
              <MobileSection title="Sort">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      updateParams({
                        sort: opt.value === "newest" ? null : opt.value,
                      })
                    }
                      className={cn(
                      "block w-full border px-3 py-3 text-left text-sm",
                      sort === opt.value
                        ? "border-ink bg-ink text-background"
                        : "border-border text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </MobileSection>

              <MobileSection title="Size">
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        updateParams({ size: size === s ? null : s })
                      }
                      className={cn(
                        "min-h-11 min-w-11 border px-2 py-2 text-xs uppercase",
                        size === s
                          ? "border-ink bg-ink text-background"
                          : "border-border"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </MobileSection>

              <MobileSection title="Color">
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() =>
                        updateParams({
                          color: color === c.name ? null : c.name,
                        })
                      }
                      className={cn(
                        "flex min-h-11 items-center gap-2 border px-2.5 py-2 text-xs uppercase",
                        color === c.name
                          ? "border-foreground"
                          : "border-border"
                      )}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </MobileSection>
            </div>

            <div className="sticky bottom-0 flex gap-2 border-t border-border bg-background p-4">
              <button
                type="button"
                onClick={clearFilters}
                className="h-12 flex-1 border border-foreground text-[11px] uppercase tracking-[0.14em]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="h-12 flex-1 bg-ink text-[11px] uppercase tracking-[0.14em] text-background"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterTrigger({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(
        "inline-flex h-11 items-center gap-2 border px-3 text-[11px] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-ink bg-ink text-background"
          : "border-border text-foreground hover:border-foreground"
      )}
    >
      <span className={active ? "text-background/70" : "text-muted"}>{label}</span>
      <span>{value}</span>
      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
    </button>
  );
}

function DropdownPanel({
  children,
  align = "start",
}: {
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "absolute top-full z-20 mt-2 hidden w-full max-w-sm border border-border bg-surface sm:block",
        align === "end" ? "right-0" : "left-0"
      )}
    >
      {children}
    </div>
  );
}

function MobileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
