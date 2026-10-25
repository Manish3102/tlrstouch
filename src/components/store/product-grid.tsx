import { cn } from "@/lib/utils";
import { ProductCard, type StoreProduct } from "@/components/store/product-card";

export function ProductGrid({
  products,
  className,
}: {
  products: StoreProduct[];
  className?: string;
}) {
  if (!products.length) {
    return (
      <div className="border border-border px-6 py-20 text-center">
        <p className="font-display text-3xl tracking-tight">Nothing here yet</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          This selection is empty. Clear a filter or browse the full collection.
        </p>
        <a
          href="/shop"
          className="mt-8 inline-flex h-12 items-center bg-ink px-6 text-[11px] uppercase tracking-[0.16em] text-background"
        >
          View all pieces
        </a>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4 xl:gap-x-6",
        className
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product._id}
          product={product}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
