import path from "path";
import dns from "dns";
import { config as loadEnv } from "dotenv";

// Load .env.local first (Next.js convention), then .env as fallback
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

// Windows/ISP DNS often fails SRV lookup for mongodb+srv://
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { HomepageSection } from "../src/models/HomepageSection";
import { StoreSettings } from "../src/models/StoreSettings";
import { Coupon } from "../src/models/Coupon";

const img = (id: string, w = 1200, h = 1500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    HomepageSection.deleteMany({}),
    StoreSettings.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@drift.store";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMeImmediately123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await User.create({
    name: "DRIFT Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  const categories = await Category.insertMany([
    {
      name: "Tees",
      slug: "tees",
      description: "Heavyweight blanks and graphic cuts.",
      order: 1,
      image: {
        url: img("photo-1521572163474-6864f9cf17ab", 900, 1100),
        publicId: "seed/tees",
        alt: "Oversized tee",
      },
    },
    {
      name: "Hoodies",
      slug: "hoodies",
      description: "Soft fleece with a sharp silhouette.",
      order: 2,
      image: {
        url: img("photo-1556821840-3a63f95609a7", 900, 1100),
        publicId: "seed/hoodies",
        alt: "Street hoodie",
      },
    },
    {
      name: "Bottoms",
      slug: "bottoms",
      description: "Relaxed fits built for movement.",
      order: 3,
      image: {
        url: img("photo-1473966968600-fa801b869a1a", 900, 1100),
        publicId: "seed/bottoms",
        alt: "Relaxed pants",
      },
    },
    {
      name: "Outerwear",
      slug: "outerwear",
      description: "Layer pieces with presence.",
      order: 4,
      image: {
        url: img("photo-1551028719-00167b16eac5", 900, 1100),
        publicId: "seed/outerwear",
        alt: "Jacket",
      },
    },
  ]);

  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const products = [
    {
      name: "Void Oversized Tee",
      slug: "void-oversized-tee",
      description:
        "A 280gsm cotton tee with dropped shoulders and a clean boxy cut. Built for everyday rotation.",
      category: bySlug.tees,
      price: 1499,
      salePrice: 1299,
      sku: "DRF-TEE-001",
      stock: 42,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#111111" },
        { name: "Bone", hex: "#E8E4DC" },
      ],
      images: [
        {
          url: img("photo-1521572163474-6864f9cf17ab"),
          publicId: "seed/void-tee-1",
          alt: "Void Oversized Tee front",
          isPrimary: true,
          order: 0,
        },
        {
          url: img("photo-1583743814966-8936f5b7be1a"),
          publicId: "seed/void-tee-2",
          alt: "Void Oversized Tee detail",
          isPrimary: false,
          order: 1,
        },
      ],
      tags: ["new-arrival", "bestseller", "featured"],
      isFeatured: true,
      status: "published",
    },
    {
      name: "Concrete Hoodie",
      slug: "concrete-hoodie",
      description:
        "Brushed fleece hoodie with a recessed hood and matte hardware. Structured without feeling stiff.",
      category: bySlug.hoodies,
      price: 3499,
      sku: "DRF-HDY-001",
      stock: 28,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#111111" },
        { name: "Grey", hex: "#8A8680" },
      ],
      images: [
        {
          url: img("photo-1556821840-3a63f95609a7"),
          publicId: "seed/concrete-hoodie-1",
          alt: "Concrete Hoodie",
          isPrimary: true,
          order: 0,
        },
        {
          url: img("photo-1556821840-3a63f95609a7", 1200, 1500),
          publicId: "seed/concrete-hoodie-2",
          alt: "Concrete Hoodie back",
          isPrimary: false,
          order: 1,
        },
      ],
      tags: ["bestseller", "featured"],
      isFeatured: true,
      status: "published",
    },
    {
      name: "Drift Cargo Pant",
      slug: "drift-cargo-pant",
      description:
        "Relaxed cargo with articulated knees and tonal stitching. Soft twill that holds shape.",
      category: bySlug.bottoms,
      price: 2999,
      salePrice: 2499,
      sku: "DRF-PNT-001",
      stock: 18,
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "Olive", hex: "#556B2F" }, { name: "Black", hex: "#111111" }],
      images: [
        {
          url: img("photo-1473966968600-fa801b869a1a"),
          publicId: "seed/cargo-1",
          alt: "Drift Cargo Pant",
          isPrimary: true,
          order: 0,
        },
        {
          url: img("photo-1624378439575-d8705ad7ae80"),
          publicId: "seed/cargo-2",
          alt: "Drift Cargo Pant detail",
          isPrimary: false,
          order: 1,
        },
      ],
      tags: ["new-arrival"],
      isFeatured: false,
      status: "published",
    },
    {
      name: "Studio Track Jacket",
      slug: "studio-track-jacket",
      description:
        "Lightweight track jacket with contrast piping and a quiet logo mark at the chest.",
      category: bySlug.outerwear,
      price: 4499,
      sku: "DRF-JKT-001",
      stock: 12,
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "Charcoal", hex: "#36454F" }],
      images: [
        {
          url: img("photo-1551028719-00167b16eac5"),
          publicId: "seed/jacket-1",
          alt: "Studio Track Jacket",
          isPrimary: true,
          order: 0,
        },
        {
          url: img("photo-1591047139829-d91aecb6caea"),
          publicId: "seed/jacket-2",
          alt: "Studio Track Jacket alternate",
          isPrimary: false,
          order: 1,
        },
      ],
      tags: ["new-arrival", "featured"],
      isFeatured: true,
      status: "published",
    },
    {
      name: "Mono Longsleeve",
      slug: "mono-longsleeve",
      description:
        "Ribbed cuff longsleeve in dense cotton jersey. Minimal mark, maximum wear.",
      category: bySlug.tees,
      price: 1899,
      sku: "DRF-TEE-002",
      stock: 35,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [
        { name: "White", hex: "#F5F5F5" },
        { name: "Black", hex: "#111111" },
      ],
      images: [
        {
          url: img("photo-1618354691373-d851c5c3a990"),
          publicId: "seed/longsleeve-1",
          alt: "Mono Longsleeve",
          isPrimary: true,
          order: 0,
        },
        {
          url: img("photo-1583743814966-8936f5b7be1a"),
          publicId: "seed/longsleeve-2",
          alt: "Mono Longsleeve alternate",
          isPrimary: false,
          order: 1,
        },
      ],
      tags: ["bestseller"],
      isFeatured: false,
      status: "published",
    },
    {
      name: "Night Runner Half-Zip",
      slug: "night-runner-half-zip",
      description:
        "Technical half-zip with a soft handfeel and reflective seam tape for late city runs.",
      category: bySlug.outerwear,
      price: 3999,
      salePrice: 3599,
      sku: "DRF-JKT-002",
      stock: 4,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [{ name: "Night", hex: "#0D0D0D" }],
      images: [
        {
          url: img("photo-1591047139829-d91aecb6caea"),
          publicId: "seed/halfzip-1",
          alt: "Night Runner Half-Zip",
          isPrimary: true,
          order: 0,
        },
        {
          url: img("photo-1551028719-00167b16eac5"),
          publicId: "seed/halfzip-2",
          alt: "Night Runner Half-Zip alternate",
          isPrimary: false,
          order: 1,
        },
      ],
      tags: ["new-arrival"],
      isFeatured: true,
      status: "published",
    },
  ];

  const createdProducts = await Product.insertMany(products);

  await StoreSettings.create({});

  const lookIds = createdProducts.slice(0, 3).map((p) => p._id);

  await HomepageSection.insertMany([
    {
      key: "announcement",
      title:
        "SS '26 COLLECTION LIVE NOW — FREE SHIPPING ON ALL ORDERS ABOVE ₹2,999!",
      isVisible: true,
      order: 0,
    },
    {
      key: "hero",
      title: "Cut for the night shift",
      subtitle: "SS26 ESSENTIALS",
      description: "Oversized silhouettes. Quiet details. Built to move.",
      buttonText: "Shop New Arrivals",
      buttonLink: "/shop?tag=new-arrival",
      isVisible: true,
      order: 1,
      images: [
        {
          url: img("photo-1483985988355-763728e1935b", 2000, 1400),
          mobileUrl: img("photo-1515886657613-9f3515b0c78f", 900, 1200),
          publicId: "seed/hero-1",
          alt: "Night shift campaign",
          title: "Void Oversized Tee",
          subtitle: "Spring Summer Collection 2026",
          description: "Spring Summer Collection 2026",
          buttonText: "Shop Now",
          buttonLink: "/shop?tag=new-arrival",
          isActive: true,
          order: 0,
        },
        {
          url: img("photo-1469334031218-e382a71b716b", 2000, 1400),
          mobileUrl: img("photo-1509631179647-0177331693ae", 900, 1200),
          publicId: "seed/hero-2",
          alt: "City light campaign",
          title: "Concrete Hoodie",
          subtitle: "Spring Summer Collection 2026",
          description: "Spring Summer Collection 2026",
          buttonText: "Shop Now",
          buttonLink: "/shop?tag=bestseller",
          isActive: true,
          order: 1,
        },
        {
          url: img("photo-1496747611176-843222e1e57c", 2000, 1400),
          mobileUrl: img("photo-1487222477894-8943e31ef7b2", 900, 1200),
          publicId: "seed/hero-3",
          alt: "Studio essentials",
          title: "Essentials Edit",
          subtitle: "Core Collection",
          description: "Spring Summer Collection 2026",
          buttonText: "Shop Now",
          buttonLink: "/shop",
          isActive: true,
          order: 2,
        },
      ],
    },
    {
      key: "new-arrivals",
      title: "New Arrivals",
      subtitle: "Just landed",
      isVisible: true,
      order: 2,
    },
    {
      key: "categories",
      title: "Shop by Collection",
      isVisible: true,
      order: 3,
    },
    {
      key: "campaign",
      title: "After Hours",
      description: "A limited capsule for late light and louder nights.",
      buttonText: "Explore the Lookbook",
      buttonLink: "/shop?tag=featured",
      isVisible: true,
      order: 4,
      images: [
        {
          url: img("photo-1469334031218-e382a71b716b", 1800, 1000),
          publicId: "seed/campaign",
          alt: "After Hours campaign",
          order: 0,
        },
      ],
    },
    {
      key: "shop-the-look",
      title: "Compose the outfit",
      description:
        "A complete silhouette from the latest drop — tap the markers to shop each piece.",
      isVisible: true,
      order: 5,
      productIds: lookIds,
      images: [
        {
          url: img("photo-1515886657613-9f3515b0c78f", 1400, 1800),
          publicId: "seed/look",
          alt: "Shop the look",
          order: 0,
        },
      ],
      settings: {
        hotspots: [
          { x: 32, y: 28, productId: String(lookIds[0]) },
          { x: 58, y: 52, productId: String(lookIds[1]) },
          { x: 44, y: 74, productId: String(lookIds[2]) },
        ],
      },
    },
    {
      key: "bestsellers",
      title: "Bestsellers",
      subtitle: "Most worn",
      isVisible: true,
      order: 6,
    },
    {
      key: "featured",
      title: "Featured",
      subtitle: "Editor's pick",
      isVisible: true,
      order: 7,
      productIds: createdProducts
        .filter((p) => p.isFeatured)
        .slice(0, 6)
        .map((p) => p._id),
    },
    {
      key: "brand-story",
      title: "Made to be lived in",
      description:
        "Tailorstouch designs for the in-between — studio days, city nights, and everything that refuses a dress code. Minimal forms. Honest materials. No noise.",
      isVisible: true,
      order: 8,
    },
    {
      key: "instagram",
      title: "@drift",
      isVisible: true,
      order: 9,
      images: [
        {
          url: img("photo-1515886657613-9f3515b0c78f", 800, 800),
          publicId: "seed/ig1",
          alt: "Look 1",
          order: 0,
        },
        {
          url: img("photo-1509631179647-0177331693ae", 800, 800),
          publicId: "seed/ig2",
          alt: "Look 2",
          order: 1,
        },
        {
          url: img("photo-1496747611176-843222e1e57c", 800, 800),
          publicId: "seed/ig3",
          alt: "Look 3",
          order: 2,
        },
        {
          url: img("photo-1487222477894-8943e31ef7b2", 800, 800),
          publicId: "seed/ig4",
          alt: "Look 4",
          order: 3,
        },
        {
          url: img("photo-1521572163474-6864f9cf17ab", 800, 800),
          publicId: "seed/ig5",
          alt: "Look 5",
          order: 4,
        },
        {
          url: img("photo-1556821840-3a63f95609a7", 800, 800),
          publicId: "seed/ig6",
          alt: "Look 6",
          order: 5,
        },
      ],
    },
    {
      key: "newsletter",
      title: "Stay close",
      description: "Early access to drops. No spam — just signal.",
      isVisible: true,
      order: 10,
    },
    {
      key: "trust",
      title: "Designed for the everyday",
      isVisible: true,
      order: 11,
      settings: {
        items: [
          {
            title: "Pan-India shipping",
            body: "Free delivery on orders over ₹2,999.",
          },
          {
            title: "Secure payments",
            body: "Encrypted checkout with trusted payment partners.",
          },
          {
            title: "Easy returns",
            body: "7-day returns on unworn pieces with tags.",
          },
          {
            title: "Support",
            body: "Write to us anytime — we reply within 24 hours.",
          },
        ],
      },
    },
  ]);

  await Coupon.create({
    code: "DRIFT10",
    type: "percent",
    value: 10,
    minOrderAmount: 999,
    maxDiscount: 500,
    usageLimit: 100,
    isActive: true,
  });

  console.log("Seed complete.");
  console.log(`Admin: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Products: ${createdProducts.length}`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
