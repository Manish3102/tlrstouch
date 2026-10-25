import { getAdminCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-3xl">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
