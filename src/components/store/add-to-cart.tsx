"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Share2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { cn, effectivePrice, formatRs } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";
import type { ProductSize } from "@/types";

export type AddToCartProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  sizes?: ProductSize[];
  colors?: { name: string; hex: string }[];
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
};

const DEFAULT_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL"];

function primaryImage(product: AddToCartProduct) {
  const imgs = product.images ?? [];
  return imgs.find((i) => i.isPrimary)?.url ?? imgs[0]?.url ?? "";
}

export function AddToCart({
  product,
  brandName = "Tailorstouch",
}: {
  product: AddToCartProduct;
  brandName?: string;
}) {
  const sizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES;
  const colors = product.colors?.length
    ? product.colors
    : [{ name: "Default", hex: "#1a1916" }];

  const [size, setSize] = useState<ProductSize | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [color, setColor] = useState(colors[0].name);
  const [qty, setQty] = useState(1);
  const [chartOpen, setChartOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.openCart);
  const router = useRouter();

  const finalPrice = effectivePrice(product.price, product.salePrice);
  const maxQty = Math.max(1, Math.min(product.stock || 0, 20));
  const disabled = product.stock <= 0;
  const image = useMemo(() => primaryImage(product), [product]);

  const handleAdd = (openDrawer = true) => {
    if (disabled) return;
    if (!size) {
      setSizeError(true);
      toast.error("Select a size.");
      return;
    }
    setSizeError(false);
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image,
      size,
      color,
      stock: product.stock,
      quantity: qty,
    });
    toast.success("Added to bag", { description: product.name });
    if (openDrawer) openCart();
  };

  const handleBuyNow = () => {
    if (disabled) return;
    if (!size) {
      setSizeError(true);
      toast.error("Select a size.");
      return;
    }
    handleAdd(false);
    router.push("/checkout");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-foreground">{brandName}</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-base text-foreground">{formatRs(finalPrice)}</span>
          {finalPrice < product.price ? (
            <span className="text-sm text-muted line-through">
              {formatRs(product.price)}
            </span>
          ) : null}
        </div>
        {disabled ? (
          <p className="mt-3 text-sm uppercase tracking-[0.14em] text-muted">
            Sold out
          </p>
        ) : product.stock <= 5 ? (
          <p className="mt-3 text-sm text-muted">{product.stock} available</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-foreground">
          Color <span className="text-muted">{color}</span>
        </p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={color === c.name}
              disabled={disabled}
              onClick={() => setColor(c.name)}
              className={cn(
                "flex min-h-11 items-center gap-2 border px-3 text-xs uppercase tracking-[0.08em] transition-colors",
                color === c.name
                  ? "border-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
                aria-hidden
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-foreground">
            Size{" "}
            <span className="text-muted">{size ?? "Select"}</span>
          </p>
          <button
            type="button"
            onClick={() => setChartOpen((v) => !v)}
            className="text-[11px] uppercase tracking-[0.14em] underline underline-offset-4"
            aria-expanded={chartOpen}
          >
            Size guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={size === s}
              disabled={disabled}
              onClick={() => {
                setSize(s);
                setSizeError(false);
              }}
              className={cn(
                "flex h-12 min-w-12 items-center justify-center border px-3 text-sm uppercase tracking-wide transition-colors",
                size === s
                  ? "border-ink bg-ink text-background"
                  : "border-border text-foreground hover:border-foreground",
                sizeError && !size ? "border-foreground" : ""
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {sizeError && !size ? (
          <p className="text-sm text-foreground" role="alert">
            Choose a size to continue.
          </p>
        ) : null}

        {chartOpen ? (
          <div className="overflow-x-auto border border-border bg-surface p-4 text-sm text-muted">
            <p className="mb-3 text-xs text-muted">
              A general guide. Fit can vary by style.
            </p>
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 font-medium text-foreground">Size</th>
                  <th className="py-2 pr-4 font-medium text-foreground">Chest</th>
                  <th className="py-2 font-medium text-foreground">Length</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["XS", '34–36"', '26"'],
                  ["S", '36–38"', '27"'],
                  ["M", '38–40"', '28"'],
                  ["L", '40–42"', '29"'],
                  ["XL", '42–44"', '30"'],
                  ["XXL", '44–46"', '31"'],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-border/70">
                    <td className="py-2 pr-4">{row[0]}</td>
                    <td className="py-2 pr-4">{row[1]}</td>
                    <td className="py-2">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex h-12 shrink-0 items-center border border-foreground">
            <button
              type="button"
              className="flex h-full w-11 items-center justify-center disabled:opacity-40"
              aria-label="Decrease quantity"
              disabled={disabled || qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm">{qty}</span>
            <button
              type="button"
              className="flex h-full w-11 items-center justify-center disabled:opacity-40"
              aria-label="Increase quantity"
              disabled={disabled || qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAdd(true)}
            className="h-12 flex-1 bg-ink px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {disabled ? "Sold out" : "Add to bag"}
          </button>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleBuyNow}
          className="h-12 w-full border border-foreground px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy now
        </button>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-11 items-center gap-2 text-[11px] uppercase tracking-[0.14em] transition-opacity hover:opacity-60"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
    </div>
  );
}
