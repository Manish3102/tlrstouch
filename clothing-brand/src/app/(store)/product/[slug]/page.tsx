import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCart } from "@/components/store/add-to-cart";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeader } from "@/components/store/section-header";
import { RecentlyViewedTracker } from "@/components/store/recently-viewed-tracker";
import {
  getProductBySlug,
  getRelatedProducts,
  getStoreSettings,
} from "@/lib/queries";
import { effectivePrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const image =
    product.images?.find((i: { isPrimary?: boolean }) => i.isPrimary)?.url ||
    product.images?.[0]?.url;
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const settings = await getStoreSettings().catch(() => null);
  const brandName = "Tailorstouch";

  const categoryId =
    typeof product.category === "object" && product.category
      ? product.category._id
      : product.category;
  const related = await getRelatedProducts(String(categoryId), product._id, 4);
  const price = effectivePrice(product.price, product.salePrice);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images?.map((i: { url: string }) => i.url) || [],
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const policies = (settings?.policies ?? {}) as {
    shipping?: string;
    returns?: string;
  };

  return (
    <div className="page-shell pb-16 pt-6 sm:pb-24 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecentlyViewedTracker productId={product._id} />

      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <ProductGallery
          images={(product.images || []).map(
            (img: { url: string; alt?: string }) => ({
              url: img.url,
              alt: img.alt || product.name,
            })
          )}
          productName={product.name}
        />

        <div>
          <AddToCart product={product} brandName={brandName} />

          {product.description ? (
            <div className="mt-10 space-y-3 border-t border-border pt-8">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">
                Details
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            </div>
          ) : null}

          {policies.shipping || policies.returns ? (
            <div className="mt-8 space-y-3 border-t border-border pt-8">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">
                Shipping & returns
              </h2>
              <div className="max-w-md space-y-2 text-sm leading-relaxed text-muted">
                {policies.shipping ? <p>{policies.shipping}</p> : null}
                {policies.returns ? <p>{policies.returns}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-border pt-14 sm:mt-28">
          <SectionHeader title="You may also like" />
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
