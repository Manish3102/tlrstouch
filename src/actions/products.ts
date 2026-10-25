"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { decrementMediaRefs, incrementMediaRefs } from "@/lib/media-refs";

export async function createProduct(input: unknown) {
  await requireAdmin();
  const data = productSchema.parse(input);
  await connectDB();

  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const exists = await Product.findOne({
    $or: [{ slug }, { sku: data.sku }],
  });
  if (exists) throw new Error("Product with this slug or SKU already exists");

  const images = (data.images ?? []).map((img, index) => ({
    ...img,
    order: img.order ?? index,
    isPrimary: img.isPrimary ?? index === 0,
    alt: img.alt ?? data.name,
  }));

  const product = await Product.create({ ...data, slug, images });
  await incrementMediaRefs(images.map((i) => i.publicId));

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { id: String(product._id) };
}

export async function updateProduct(id: string, input: unknown) {
  await requireAdmin();
  const data = productSchema.parse(input);
  await connectDB();

  const existing = await Product.findById(id);
  if (!existing) throw new Error("Product not found");

  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const conflict = await Product.findOne({
    _id: { $ne: id },
    $or: [{ slug }, { sku: data.sku }],
  });
  if (conflict) throw new Error("Product with this slug or SKU already exists");

  const prevIds = existing.images.map((i: { publicId: string }) => i.publicId);
  const images = (data.images ?? []).map((img, index) => ({
    ...img,
    order: img.order ?? index,
    isPrimary: img.isPrimary ?? index === 0,
    alt: img.alt ?? data.name,
  }));
  const nextIds = images.map((i) => i.publicId);

  existing.set({ ...data, slug, images });
  await existing.save();

  const removed = prevIds.filter((pid: string) => !nextIds.includes(pid));
  const added = nextIds.filter((pid: string) => !prevIds.includes(pid));
  await decrementMediaRefs(removed);
  await incrementMediaRefs(added);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/products");
  return { id };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await connectDB();
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  const publicIds = product.images.map((i: { publicId: string }) => i.publicId);
  await product.deleteOne();
  await decrementMediaRefs(publicIds);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateProductStock(id: string, stock: number) {
  await requireAdmin();
  await connectDB();
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Invalid stock value");
  }
  await Product.findByIdAndUpdate(id, { stock });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { ok: true };
}
