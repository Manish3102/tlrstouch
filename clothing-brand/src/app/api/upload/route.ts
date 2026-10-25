import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MediaAsset } from "@/models/MediaAsset";
import {
  isCloudinaryConfigured,
  uploadImageBuffer,
  validateImageFile,
} from "@/lib/cloudinary";
import { saveLocalImage } from "@/lib/local-upload";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`upload:${session.user.id}`, 30, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") ?? "");
    const folder = String(form.get("folder") ?? "drift");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = isCloudinaryConfigured()
      ? await uploadImageBuffer(buffer, { folder })
      : await saveLocalImage(buffer, file, folder);

    await connectDB();
    const asset = await MediaAsset.create({
      url: uploaded.url,
      publicId: uploaded.publicId,
      alt,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
      folder,
      refCount: 0,
    });

    return NextResponse.json({
      asset: {
        id: String(asset._id),
        url: asset.url,
        publicId: asset.publicId,
        alt: asset.alt,
        width: asset.width,
        height: asset.height,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
