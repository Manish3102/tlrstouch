"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { deleteMediaAsset, updateMediaAlt } from "@/actions/media";
import { ImageUploader } from "@/components/admin/image-uploader";

interface Asset {
  _id: string;
  url: string;
  publicId: string;
  alt?: string;
  refCount?: number;
  bytes?: number;
}

export function MediaLibrary({
  initial,
}: {
  initial: { items: Asset[]; page: number; pages: number; total: number };
}) {
  const [items, setItems] = useState(initial.items);

  async function onDelete(publicId: string) {
    if (!confirm("Delete this media asset if unused?")) return;
    try {
      const result = await deleteMediaAsset(publicId);
      if (!result.deleted) {
        toast.error(result.reason || "Could not delete");
        return;
      }
      setItems((prev) => prev.filter((i) => i.publicId !== publicId));
      toast.success("Media deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function onAltBlur(publicId: string, alt: string) {
    try {
      await updateMediaAlt(publicId, alt);
    } catch {
      toast.error("Could not update alt text");
    }
  }

  return (
    <div className="space-y-8">
      <div className="border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-medium">Upload</h2>
        <ImageUploader
          value={[]}
          onChange={() => window.location.reload()}
          folder="drift/library"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        {items.map((asset) => (
          <div key={asset._id} className="space-y-2 border border-neutral-200 bg-white p-2">
            <div className="relative aspect-square bg-neutral-100">
              <Image
                src={asset.url}
                alt={asset.alt || "Media"}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
            <input
              defaultValue={asset.alt}
              onBlur={(e) => onAltBlur(asset.publicId, e.target.value)}
              className="w-full border border-neutral-200 px-2 py-1 text-xs"
              placeholder="Alt text"
            />
            <p className="text-[11px] text-neutral-400">
              refs: {asset.refCount ?? 0}
            </p>
            <button
              type="button"
              onClick={() => onDelete(asset.publicId)}
              className="text-xs text-red-600 underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No media yet. Upload above.</p>
      ) : null}
    </div>
  );
}
