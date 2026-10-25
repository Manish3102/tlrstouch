import { getAdminCategories } from "@/lib/queries";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Categories</h1>
      <CategoriesManager initial={categories} />
    </div>
  );
}
