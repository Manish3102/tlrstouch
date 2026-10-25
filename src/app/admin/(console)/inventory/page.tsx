import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Product } from "@/models/Product";
import { StoreSettings } from "@/models/StoreSettings";
import { serialize } from "@/lib/serialize";
import { InventoryManager } from "@/components/admin/inventory-manager";

export default async function AdminInventoryPage() {
  await requireAdmin();
  await connectDB();
  const settings = await StoreSettings.findOne().lean();
  const threshold = settings?.lowStockThreshold ?? 5;
  const products = serialize(
    await Product.find().sort({ stock: 1 }).select("name sku stock status").lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Inventory</h1>
        <p className="text-sm text-neutral-500">
          Low-stock threshold: {threshold} units
        </p>
      </div>
      <InventoryManager products={products} threshold={threshold} />
    </div>
  );
}
