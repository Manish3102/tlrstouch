"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { decrementMediaRefs, incrementMediaRefs } from "@/lib/media-refs";

export async function createCategory(input: unknown) {
  await requireAdmin();
  const data = categorySchema.parse(input);
  await connectDB();
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const exists = await Category.findOne({ slug });
  if (exists) throw new Error("Category slug already exists");

  const category = await Category.create({ ...data, slug });
  if (data.image?.publicId) {
    await incrementMediaRefs([data.image.publicId]);
  }
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { id: String(category._id) };
}

export async function updateCategory(id: string, input: unknown) {
  await requireAdmin();
  const data = categorySchema.parse(input);
  await connectDB();
  const existing = await Category.findById(id);
  if (!existing) throw new Error("Category not found");

  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const prevPublicId = existing.image?.publicId;
  existing.set({ ...data, slug });
  await existing.save();

  const nextPublicId = data.image?.publicId;
  if (prevPublicId && prevPublicId !== nextPublicId) {
    await decrementMediaRefs([prevPublicId]);
  }
  if (nextPublicId && nextPublicId !== prevPublicId) {
    await incrementMediaRefs([nextPublicId]);
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { id };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await connectDB();
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    throw new Error("Cannot delete a category that still has products");
  }
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  const publicId = category.image?.publicId;
  await category.deleteOne();
  if (publicId) await decrementMediaRefs([publicId]);
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function reorderCategories(orderedIds: string[]) {
  await requireAdmin();
  await connectDB();
  await Promise.all(
    orderedIds.map((id, index) =>
      Category.findByIdAndUpdate(id, { order: index + 1 })
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}
