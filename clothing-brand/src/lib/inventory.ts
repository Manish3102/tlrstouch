import { Product } from "@/models/Product";

export async function restoreOrderStock(
  items: Array<{ product: unknown; quantity: number }>
) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
}
