import { getHomepageSections } from "@/lib/queries";
import { HomepageCms } from "@/components/admin/homepage-cms";

export default async function AdminHomepagePage() {
  const sections = await getHomepageSections();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Homepage CMS</h1>
        <p className="text-sm text-neutral-500">
          Control banners, copy, and section visibility
        </p>
      </div>
      <HomepageCms sections={sections} />
    </div>
  );
}
