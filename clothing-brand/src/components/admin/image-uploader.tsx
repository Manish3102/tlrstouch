"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  publicId: string;
  alt?: string;
}

interface ImageUploaderProps {
  value?: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  multiple?: boolean;
  folder?: string;
  className?: string;
}

export function ImageUploader({
  value = [],
  onChange,
  multiple = true,
  folder = "drift",
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setProgress(10);
    try {
      const uploaded: UploadedImage[] = [];
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        form.append("alt", file.name);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploaded.push({
          url: data.asset.url,
          publicId: data.asset.publicId,
          alt: data.asset.alt,
        });
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
      toast.success(uploaded.length > 1 ? "Images uploaded" : "Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-300 bg-white px-4 py-8 text-center transition hover:border-neutral-900">
        <Upload className="mb-2 h-5 w-5 text-neutral-500" />
        <span className="text-sm text-neutral-700">
          {uploading ? `Uploading… ${progress}%` : "Click to upload images"}
        </span>
        <span className="mt-1 text-xs text-neutral-400">
          JPEG, PNG, WebP, GIF · max 5MB
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Upload in progress
        </div>
      ) : null}
      {value.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((img, index) => (
            <div key={img.publicId} className="relative aspect-square bg-neutral-100">
              <Image
                src={img.url}
                alt={img.alt || "Upload preview"}
                fill
                className="object-cover"
                sizes="160px"
              />
              <button
                type="button"
                className="absolute right-1 top-1 bg-white/90 p-1"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
