"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MediaAsset } from "@/models/MediaAsset";
import { safeDeleteMedia } from "@/lib/media-refs";
import {
  isCloudinaryConfigured,
  uploadImageBuffer,
  validateImageFile,
} from "@/lib/cloudinary";

export async function deleteMediaAsset(publicId: string) {
  await requireAdmin();
  const result = await safeDeleteMedia(publicId);
  revalidatePath("/admin/media");
  return result;
}

export async function updateMediaAlt(publicId: string, alt: string) {
  await requireAdmin();
  await connectDB();
  await MediaAsset.findOneAndUpdate({ publicId }, { alt });
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function replaceMediaAsset(formData: FormData) {
  await requireAdmin();
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const publicId = String(formData.get("publicId") ?? "");
  const file = formData.get("file");
  if (!publicId || !(file instanceof File)) {
    throw new Error("Missing file or publicId");
  }

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadImageBuffer(buffer, {
    publicId,
    overwrite: true,
  });

  await connectDB();
  await MediaAsset.findOneAndUpdate(
    { publicId },
    {
      url: uploaded.url,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    }
  );

  revalidatePath("/admin/media");
  return { url: uploaded.url, publicId: uploaded.publicId };
}
