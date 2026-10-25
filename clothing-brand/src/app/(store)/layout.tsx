import { AnnouncementBar } from "@/components/store/announcement-bar";
import { StickyHeader } from "@/components/store/sticky-header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SearchModal } from "@/components/store/search-modal";
import {
  getCachedCategories,
  getCachedHomepageSections,
  getCachedStoreSettings,
} from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

const fallbackSettings = {
  brandName: "Tailorstouch",
  contactEmail: "hello@drift.store",
  contactPhone: "",
  address: "",
  socialLinks: {},
  policies: {},
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = fallbackSettings;
  let sections: { key: string; title?: string; isVisible?: boolean }[] = [];
  let categories: Awaited<ReturnType<typeof getCachedCategories>> = [];

  try {
    [settings, sections, categories] = await Promise.all([
      getCachedStoreSettings(),
      getCachedHomepageSections(),
      getCachedCategories(),
    ]);
  } catch {
    // Allow UI to render before MongoDB is configured
  }

  const announcement = sections.find((s) => s.key === "announcement");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {announcement?.isVisible !== false && announcement?.title ? (
        <AnnouncementBar text={announcement.title} />
      ) : null}
      <StickyHeader
        brandName="Tailorstouch"
        categories={categories}
        contactEmail={settings.contactEmail}
      />
      <main className="flex-1">{children}</main>
      <Footer
        brandName="Tailorstouch"
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        address={settings.address}
        socialLinks={settings.socialLinks}
        policies={settings.policies}
      />
      <CartDrawer />
      <SearchModal />
    </div>
  );
}
