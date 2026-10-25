"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/StoreSettings";
import { storeSettingsSchema } from "@/lib/validations";
import { decrementMediaRefs, incrementMediaRefs } from "@/lib/media-refs";

export async function updateStoreSettings(
  input: unknown,
  logo?: { url: string; publicId: string; alt?: string } | null
) {
  await requireAdmin();
  const data = storeSettingsSchema.parse(input);
  await connectDB();

  const existing = await StoreSettings.findOne();
  const prevLogo = existing?.logo?.publicId;

  if (!existing) {
    await StoreSettings.create({
      ...data,
      ...(logo ? { logo } : {}),
    });
  } else {
    existing.set({
      ...data,
      ...(logo !== undefined ? { logo: logo || undefined } : {}),
    });
    await existing.save();
  }

  if (logo?.publicId && logo.publicId !== prevLogo) {
    await incrementMediaRefs([logo.publicId]);
  }
  if (prevLogo && prevLogo !== logo?.publicId) {
    await decrementMediaRefs([prevLogo]);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}
