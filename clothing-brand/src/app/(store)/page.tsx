import Link from "next/link";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { BrandTicker } from "@/components/store/brand-ticker";
import { CategoryGrid } from "@/components/store/category-grid";
import { ProductCarousel } from "@/components/store/product-carousel";
import { CampaignBanner } from "@/components/store/campaign-banner";
import { BrandStory } from "@/components/store/brand-story";
import { InstagramGrid } from "@/components/store/instagram-grid";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { ShopTheLook } from "@/components/store/shop-the-look";
import { TrustStrip } from "@/components/store/trust-strip";
import { AnimatedSection } from "@/components/store/animated-section";
import { getHomepageBundle } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let bundle: Awaited<ReturnType<typeof getHomepageBundle>> | null = null;

  try {
    bundle = await getHomepageBundle();
  } catch {
    // Empty storefront until DB is seeded
  }

  const settings = bundle?.settings ?? {
    brandName: "Tailorstouch",
    tagline: "Worn differently.",
    socialLinks: {},
  };
  const byKey = bundle?.byKey ?? {};
  const categories = bundle?.categories ?? [];
  const newArrivals = bundle?.newArrivals ?? [];
  const lookProducts = bundle?.lookProducts ?? [];
  const featuredProducts = bundle?.featuredProducts ?? [];

  const hero = byKey.hero as
    | {
        title?: string;
        subtitle?: string;
        description?: string;
        buttonText?: string;
        buttonLink?: string;
        isVisible?: boolean;
        images?: Array<{
          url: string;
          publicId?: string;
          alt?: string;
          mobileUrl?: string;
          title?: string;
          subtitle?: string;
          description?: string;
          buttonText?: string;
          buttonLink?: string;
          buttonTextSecondary?: string;
          buttonLinkSecondary?: string;
          isActive?: boolean;
          order?: number;
        }>;
      }
    | undefined;

  const heroSlides =
    hero?.images && hero.images.length > 0
      ? [...hero.images]
          .filter((img) => img.url)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((img) => ({
            ...img,
            title: img.title || hero.title,
            subtitle: img.subtitle || hero.subtitle,
            description: img.description || hero.description,
            buttonText: img.buttonText || hero.buttonText || "Shop new arrivals",
            buttonLink:
              img.buttonLink || hero.buttonLink || "/shop?tag=new-arrival",
            buttonTextSecondary: img.buttonTextSecondary,
            buttonLinkSecondary: img.buttonLinkSecondary,
          }))
      : [];

  const look = byKey["shop-the-look"] as
    | {
        title?: string;
        description?: string;
        isVisible?: boolean;
        images?: Array<{ url: string; alt?: string }>;
        settings?: {
          hotspots?: Array<{ x: number; y: number; productId: string }>;
        };
      }
    | undefined;

  return (
    <div className="pb-8">
      <div className="relative -mt-14 sm:-mt-16">
        {hero?.isVisible !== false ? (
          <HeroCarousel
            slides={heroSlides}
            brandFallback="Tailorstouch"
            fallback={{
              title: hero?.title || settings.tagline || "Worn differently.",
              subtitle: hero?.subtitle,
              description: hero?.description,
              buttonText: hero?.buttonText || "Shop new arrivals",
              buttonLink: hero?.buttonLink || "/shop?tag=new-arrival",
            }}
          />
        ) : null}
        <BrandTicker brandName="Tailorstouch" />
      </div>

      {byKey["new-arrivals"]?.isVisible !== false ? (
        <AnimatedSection className="page-shell pb-16 pt-10 sm:pb-20 sm:pt-14">
          <ProductCarousel
            products={newArrivals}
            title={byKey["new-arrivals"]?.title || "New Arrivals"}
            subtitle={byKey["new-arrivals"]?.subtitle || "Just landed"}
            viewAllHref="/shop?tag=new-arrival"
          />
        </AnimatedSection>
      ) : null}

      {byKey.categories?.isVisible !== false ? (
        <AnimatedSection className="page-shell py-6 sm:py-10">
          <CategoryGrid
            categories={categories}
            title={byKey.categories?.title || "Shop by Collection"}
          />
        </AnimatedSection>
      ) : null}

      {byKey.campaign?.isVisible !== false &&
      byKey.campaign?.images?.[0] ? (
        <AnimatedSection>
          <CampaignBanner
            title={byKey.campaign.title || "After Hours"}
            subtitle="Lookbook"
            description={byKey.campaign.description}
            ctaLabel={byKey.campaign.buttonText || "Explore the Lookbook"}
            href={byKey.campaign.buttonLink || "/shop?tag=featured"}
            imageUrl={String(
              (byKey.campaign.images[0] as { url: string }).url
            )}
            imageAlt={
              (byKey.campaign.images[0] as { alt?: string }).alt
            }
          />
        </AnimatedSection>
      ) : null}

      {look?.isVisible !== false && look?.images?.[0] ? (
        <ShopTheLook
          title={look.title || "Compose the outfit"}
          description={
            look.description ||
            "A complete silhouette from the latest drop — tap the markers to shop each piece."
          }
          imageUrl={look.images[0].url}
          imageAlt={look.images[0].alt}
          hotspots={
            look.settings?.hotspots?.length
              ? look.settings.hotspots
              : lookProducts
                  .slice(0, 3)
                  .map((p: { _id: string }, i: number) => ({
                    x: 28 + i * 22,
                    y: 35 + i * 12,
                    productId: p._id,
                  }))
          }
          products={lookProducts}
        />
      ) : null}

      {byKey.bestsellers?.isVisible !== false ||
      byKey.featured?.isVisible !== false ? (
        <AnimatedSection className="page-shell py-16 sm:py-24">
          <ProductCarousel
            products={featuredProducts}
            title={
              byKey.featured?.title || byKey.bestsellers?.title || "Featured"
            }
            subtitle={
              byKey.featured?.subtitle ||
              byKey.bestsellers?.subtitle ||
              "Most worn"
            }
            viewAllHref="/shop?tag=bestseller"
          />
        </AnimatedSection>
      ) : null}

      {byKey["brand-story"]?.isVisible !== false ? (
        <BrandStory
          title={byKey["brand-story"]?.title || "Made to be lived in"}
          body={
            byKey["brand-story"]?.description ||
            "Tailorstouch designs for the in-between — studio days, city nights, and everything that refuses a dress code. Minimal forms. Quiet details."
          }
        />
      ) : null}

      {byKey.instagram?.isVisible !== false ? (
        <AnimatedSection>
          <InstagramGrid
            handle={byKey.instagram?.title || "@drift"}
            posts={((byKey.instagram?.images as Array<{
              publicId?: string;
              url: string;
              alt?: string;
            }>) || []).map((img, i) => ({
              id: img.publicId || String(i),
              imageUrl: img.url,
              href: settings.socialLinks?.instagram || "/shop",
              alt: img.alt,
            }))}
            profileUrl={settings.socialLinks?.instagram}
          />
        </AnimatedSection>
      ) : null}

      {byKey.newsletter?.isVisible !== false ? (
        <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
          <AnimatedSection className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              {byKey.newsletter?.title || "Stay close"}
            </h2>
            <p className="mt-3 text-sm text-muted">
              {byKey.newsletter?.description ||
                "Early access to drops. No spam — just signal."}
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
            <p className="mt-5 text-xs text-muted">
              Or{" "}
              <Link href="/shop" className="underline">
                keep shopping
              </Link>
            </p>
          </AnimatedSection>
        </section>
      ) : null}

      {byKey.trust?.isVisible !== false ? (
        <TrustStrip
          title={byKey.trust?.title || "Designed for the everyday"}
          items={byKey.trust?.settings?.items}
        />
      ) : (
        <TrustStrip />
      )}
    </div>
  );
}
