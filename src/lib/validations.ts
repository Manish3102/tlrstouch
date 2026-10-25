import { z } from "zod";

const imageUrl = z.string().refine(
  (value) =>
    value.startsWith("/") || z.string().url().safeParse(value).success,
  "Enter a valid image URL"
);

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).optional(),
  description: z.string().min(10),
  category: z.string().min(1),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).nullable().optional(),
  sku: z.string().min(2).max(64),
  stock: z.coerce.number().int().min(0),
  sizes: z.array(z.enum(["XS", "S", "M", "L", "XL", "XXL"])).min(1),
  colors: z
    .array(
      z.object({
        name: z.string().min(1),
        hex: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
      })
    )
    .min(1),
  tags: z
    .array(z.enum(["new-arrival", "bestseller", "featured"]))
    .default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        url: imageUrl,
        publicId: z.string(),
        alt: z.string().optional(),
        isPrimary: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .default([]),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  image: z
    .object({
      url: imageUrl,
      publicId: z.string(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(32),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const shippingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4).max(12),
  country: z.string().min(2).default("IN"),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
        color: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
  shippingAddress: shippingSchema,
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["razorpay", "cod"]),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const storeSettingsSchema = z.object({
  brandName: z.string().min(1),
  tagline: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
  }),
  policies: z.object({
    shipping: z.string().optional(),
    returns: z.string().optional(),
    privacy: z.string().optional(),
    terms: z.string().optional(),
  }),
  shippingFlatRate: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  codEnabled: z.boolean(),
});

export const homepageSectionSchema = z.object({
  key: z.enum([
    "announcement",
    "hero",
    "categories",
    "new-arrivals",
    "bestsellers",
    "featured",
    "campaign",
    "shop-the-look",
    "brand-story",
    "instagram",
    "newsletter",
    "trust",
  ]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  isVisible: z.boolean().default(true),
  order: z.coerce.number().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string(),
        alt: z.string().optional(),
        mobileUrl: z.string().optional(),
        mobilePublicId: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        buttonTextSecondary: z.string().optional(),
        buttonLinkSecondary: z.string().optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .optional(),
  productIds: z.array(z.string()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});
