"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { HomepageSection } from "@/models/HomepageSection";
import { homepageSectionSchema } from "@/lib/validations";
import { decrementMediaRefs, incrementMediaRefs } from "@/lib/media-refs";

export async function updateHomepageSection(input: unknown) {
  await requireAdmin();
  const data = homepageSectionSchema.parse(input);
  await connectDB();

  const existing = await HomepageSection.findOne({ key: data.key });
  const prevIds =
    existing?.images?.map((i: { publicId: string }) => i.publicId) ?? [];
  const nextImages = data.images ?? [];
  const nextIds = nextImages.map((i) => i.publicId);

  await HomepageSection.findOneAndUpdate(
    { key: data.key },
    { ...data, images: nextImages },
    { upsert: true, new: true }
  );

  const removed = prevIds.filter((id: string) => !nextIds.includes(id));
  const added = nextIds.filter((id: string) => !prevIds.includes(id));
  await decrementMediaRefs(removed);
  await incrementMediaRefs(added);

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { ok: true };
}
