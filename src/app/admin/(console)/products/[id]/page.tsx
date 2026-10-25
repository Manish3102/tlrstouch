import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Product } from "@/models/Product";
import { getAdminCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";
import { serialize } from "@/lib/serialize";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  await connectDB();
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  const initial = serialize({
    ...product,
    _id: String(product._id),
    category: String(product.category),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl">Edit product</h1>
      <ProductForm categories={categories} initial={initial} />
    </div>
  );
}
