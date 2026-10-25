import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { StoreSettings } from "@/models/StoreSettings";
import { effectivePrice } from "@/lib/utils";
import type { ProductSize } from "@/types";

export interface CheckoutLineInput {
  productId: string;
  size: ProductSize;
  color: string;
  quantity: number;
}

export async function calculateOrderTotals(
  items: CheckoutLineInput[],
  couponCode?: string
) {
  await connectDB();

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    status: "published",
  }).lean();

  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const lines = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product unavailable: ${item.productId}`);
    }
    if (!product.sizes.includes(item.size)) {
      throw new Error(`Size ${item.size} unavailable for ${product.name}`);
    }
    if (
      !product.colors.some(
        (c: { name: string }) => c.name === item.color
      )
    ) {
      throw new Error(`Color ${item.color} unavailable for ${product.name}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const unitPrice = effectivePrice(product.price, product.salePrice);
    lines.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      image:
        product.images.find((img: { isPrimary?: boolean }) => img.isPrimary)
          ?.url ?? product.images[0]?.url,
      sku: `${product.sku}-${item.size}-${item.color}`
        .replace(/\s+/g, "")
        .slice(0, 50),
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      stock: product.stock,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  let discount = 0;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });
    if (!coupon) throw new Error("Invalid coupon code");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("Coupon has expired");
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("Coupon usage limit reached");
    }
    if (subtotal < (coupon.minOrderAmount ?? 0)) {
      throw new Error(
        `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`
      );
    }

    discount =
      coupon.type === "percent"
        ? (subtotal * coupon.value) / 100
        : coupon.value;

    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, subtotal);
    appliedCoupon = coupon.code;
  }

  const settings = await StoreSettings.findOne().lean();
  const freeThreshold = settings?.freeShippingThreshold ?? 2999;
  const flatRate = settings?.shippingFlatRate ?? 99;
  const shipping = subtotal - discount >= freeThreshold ? 0 : flatRate;
  const total = Math.max(0, subtotal - discount + shipping);

  return {
    lines,
    subtotal,
    discount,
    shipping,
    total,
    couponCode: appliedCoupon,
    settings,
  };
}
