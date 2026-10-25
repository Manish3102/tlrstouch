import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { HomepageSection } from "@/models/HomepageSection";
import { StoreSettings } from "@/models/StoreSettings";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { MediaAsset } from "@/models/MediaAsset";
import { Coupon } from "@/models/Coupon";
import { serialize } from "@/lib/serialize";
import { requireAdmin } from "@/lib/auth";

export async function getStoreSettings() {
  await connectDB();
  let settings = await StoreSettings.findOne().lean();
  if (!settings) {
    settings = (await StoreSettings.create({})).toObject();
  }
  return serialize(settings);
}

export async function getHomepageSections() {
  await connectDB();
  const sections = await HomepageSection.find().lean();
  return serialize(sections);
}

export async function getActiveCategories() {
  await connectDB();
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1 })
    .lean();
  return serialize(categories);
}

export async function getPublishedProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
}) {
  await connectDB();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 12));
  const filter: Record<string, unknown> = { status: "published" };

  if (params.category) {
    const category = await Category.findOne({ slug: params.category }).lean();
    if (category) filter.category = category._id;
  }
  if (params.tag) filter.tags = params.tag;
  if (params.q) filter.$text = { $search: params.q };
  if (params.size) filter.sizes = params.size;
  if (params.color) {
    // Case-insensitive color match (URL may be "Black" / "black")
    filter["colors.name"] = {
      $regex: `^${params.color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    };
  }
  if (params.minPrice != null || params.maxPrice != null) {
    filter.price = {
      ...(params.minPrice != null ? { $gte: params.minPrice } : {}),
      ...(params.maxPrice != null ? { $lte: params.maxPrice } : {}),
    };
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (params.sort === "price-asc") sort = { price: 1 };
  if (params.sort === "price-desc") sort = { price: -1 };
  if (params.sort === "newest") sort = { createdAt: -1 };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: serialize(items),
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, status: "published" })
    .populate("category", "name slug")
    .lean();
  return serialize(product);
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4
) {
  await connectDB();
  const items = await Product.find({
    category: categoryId,
    _id: { $ne: excludeId },
    status: "published",
  })
    .limit(limit)
    .lean();
  return serialize(items);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  await connectDB();
  const items = await Product.find({
    _id: { $in: ids },
    status: "published",
  }).lean();
  const map = new Map(items.map((p) => [String(p._id), p]));
  return serialize(ids.map((id) => map.get(id)).filter(Boolean));
}

export async function getNewArrivals(limit = 8) {
  await connectDB();
  const items = await Product.find({
    status: "published",
    tags: "new-arrival",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return serialize(items);
}

export async function getBestsellers(limit = 8) {
  await connectDB();
  const items = await Product.find({
    status: "published",
    tags: "bestseller",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return serialize(items);
}

export async function getAdminDashboardStats() {
  await requireAdmin();
  await connectDB();
  const settings = await StoreSettings.findOne().lean();
  const lowStockThreshold = settings?.lowStockThreshold ?? 5;

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    revenueAgg,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Product.find({ stock: { $lte: lowStockThreshold } })
      .sort({ stock: 1 })
      .limit(8)
      .lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    lowStock: serialize(lowStock),
    recentOrders: serialize(recentOrders),
  };
}

export async function getAdminProducts(params: {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  await connectDB();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.q) {
    filter.$or = [
      { name: { $regex: params.q, $options: "i" } },
      { sku: { $regex: params.q, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items: serialize(items), total, page, pages: Math.ceil(total / limit) || 1 };
}

export async function getAdminCategories() {
  await requireAdmin();
  await connectDB();
  return serialize(await Category.find().sort({ order: 1 }).lean());
}

export async function getAdminMedia(page = 1, limit = 24) {
  await requireAdmin();
  await connectDB();
  const [items, total] = await Promise.all([
    MediaAsset.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MediaAsset.countDocuments(),
  ]);
  return { items: serialize(items), total, page, pages: Math.ceil(total / limit) || 1 };
}

export async function getAdminOrders(page = 1, limit = 20) {
  await requireAdmin();
  await connectDB();
  const [items, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(),
  ]);
  return { items: serialize(items), total, page, pages: Math.ceil(total / limit) || 1 };
}

export async function getAdminCustomers(page = 1, limit = 20) {
  await requireAdmin();
  await connectDB();
  const [items, total] = await Promise.all([
    User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-passwordHash")
      .lean(),
    User.countDocuments({ role: "customer" }),
  ]);
  return { items: serialize(items), total, page, pages: Math.ceil(total / limit) || 1 };
}

export async function getAdminCoupons() {
  await requireAdmin();
  await connectDB();
  return serialize(await Coupon.find().sort({ createdAt: -1 }).lean());
}
