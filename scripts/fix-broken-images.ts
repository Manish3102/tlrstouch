import path from "path";
import dns from "dns";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { Product } from "../src/models/Product";

const OLD = "photo-1578587018452-892baccfd274";
const NEXT =
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&h=1500&q=80";

async function main() {
  await connectDB();
  const products = await Product.find({ "images.url": { $regex: OLD } });
  console.log(`matched ${products.length}`);
  for (const p of products) {
    for (const image of p.images) {
      if (image.url.includes(OLD)) image.url = NEXT;
    }
    p.markModified("images");
    await p.save();
    console.log(`updated ${p.slug}`);
  }
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
