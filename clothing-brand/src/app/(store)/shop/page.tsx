import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/store/product-grid";
import { ShopFilters } from "@/components/store/shop-filters";
import { getActiveCategories, getPublishedProducts } from "@/lib/queries";

export const metadata = {
  title: "Shop",
  description: "Browse Tailorstouch — tees, hoodies, bottoms, and outerwear.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    q?: string;
    sort?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const [result, categories] = await Promise.all([
    getPublishedProducts({
      page,
      limit: 12,
      category: params.category,
      tag: params.tag,
      q: params.q,
      sort: params.sort,
      size: params.size,
      color: params.color,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    }),
    getActiveCategories(),
  ]);

  const title = params.tag
    ? params.tag.replace("-", " ")
    : params.category
      ? categories.find((c: { slug: string }) => c.slug === params.category)?.name ||
        "Shop"
      : params.q
        ? `Results for “${params.q}”`
        : "Shop all";

  const pieceLabel = result.total === 1 ? "1 piece" : `${result.total} pieces`;

  return (
    <div className="page-shell py-8 sm:py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Collection</p>
          <h1 className="mt-2 font-display text-4xl capitalize tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
        </div>
        <p className="pb-1 text-sm text-muted">{pieceLabel}</p>
      </header>

      <div className="mb-8">
        <Suspense fallback={<div className="h-12" aria-hidden />}>
          <ShopFilters />
        </Suspense>
      </div>

      <ProductGrid products={result.items} />

      {result.total === 0 && (params.color || params.size) ? (
        <div className="mt-8 text-center">
          <Link
            href={`/shop${params.category ? `?category=${params.category}` : ""}`}
            className="text-sm underline underline-offset-4"
          >
            Clear filters for this collection
          </Link>
        </div>
      ) : null}

      {result.pages > 1 ? (
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => {
              if (v && k !== "page") sp.set(k, v);
            });
            sp.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/shop?${sp.toString()}`}
                className={`min-h-11 min-w-11 px-4 py-2 text-sm ${
                  p === result.page
                    ? "bg-ink text-background"
                    : "border border-border text-foreground"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
