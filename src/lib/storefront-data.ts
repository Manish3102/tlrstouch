import { cache } from "react";
import {
  getActiveCategories,
  getBestsellers,
  getHomepageSections,
  getNewArrivals,
  getProductsByIds,
  getStoreSettings,
} from "@/lib/queries";

/** Deduplicate identical reads within a single request (layout + page). */
export const getCachedStoreSettings = cache(getStoreSettings);
export const getCachedHomepageSections = cache(getHomepageSections);
export const getCachedCategories = cache(getActiveCategories);
export const getCachedNewArrivals = cache(async () => getNewArrivals(10));
export const getCachedBestsellers = cache(async () => getBestsellers(10));

/** One parallel bundle for the homepage. */
export const getHomepageBundle = cache(async () => {
  const [settings, sections, categories, newArrivals, bestsellers] =
    await Promise.all([
      getCachedStoreSettings(),
      getCachedHomepageSections(),
      getCachedCategories(),
      getCachedNewArrivals(),
      getCachedBestsellers(),
    ]);

  const byKey = Object.fromEntries(
    sections.map((s: { key: string }) => [s.key, s])
  ) as Record<
    string,
    {
      key: string;
      title?: string;
      subtitle?: string;
      description?: string;
      buttonText?: string;
      buttonLink?: string;
      isVisible?: boolean;
      images?: Array<Record<string, unknown>>;
      productIds?: string[];
      settings?: {
        hotspots?: Array<{ x: number; y: number; productId: string }>;
        items?: Array<{ title: string; body: string }>;
      };
    }
  >;

  const look = byKey["shop-the-look"];
  const lookProductIds =
    look?.settings?.hotspots?.map((h) => h.productId).filter(Boolean) ||
    look?.productIds ||
    [];
  const featuredIds = byKey.featured?.productIds || [];

  const [lookProducts, featuredProducts] = await Promise.all([
    lookProductIds.length > 0
      ? getProductsByIds(lookProductIds).catch(() => [])
      : Promise.resolve(newArrivals.slice(0, 3)),
    featuredIds.length > 0
      ? getProductsByIds(featuredIds).catch(() => bestsellers)
      : Promise.resolve(bestsellers),
  ]);

  return {
    settings,
    sections,
    categories,
    newArrivals,
    bestsellers,
    byKey,
    lookProducts,
    featuredProducts,
  };
});
