import { getAdminMedia } from "@/lib/queries";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const data = await getAdminMedia(Number(params.page || 1));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Media library</h1>
        <p className="text-sm text-neutral-500">
          Upload, preview, replace, and safely delete unused assets
        </p>
      </div>
      <MediaLibrary initial={data} />
    </div>
  );
}
