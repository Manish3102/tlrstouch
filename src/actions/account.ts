"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { User } from "@/models/User";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export async function registerCustomer(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Enter a valid name, email, and a password of at least 8 characters.");
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();
  const limited = rateLimit(`register:${email}`, 5, 60_000);
  if (!limited.success) {
    throw new Error("Too many attempts. Try again later.");
  }

  await connectDB();
  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  await User.create({
    name: data.name,
    email,
    passwordHash: await bcrypt.hash(data.password, 12),
    role: "customer",
  });

  return { ok: true as const };
}
