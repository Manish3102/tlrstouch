export type UserRole = "admin" | "customer";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ProductTag = "new-arrival" | "bestseller" | "featured";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "razorpay" | "cod";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded";

export interface MediaImage {
  url: string;
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image: string;
  size: ProductSize;
  color: string;
  quantity: number;
  stock: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
