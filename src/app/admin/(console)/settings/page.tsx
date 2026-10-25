import { getStoreSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">Store settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
