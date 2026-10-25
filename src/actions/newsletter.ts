"use server";

import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { newsletterSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function subscribeNewsletter(input: unknown) {
  const data = newsletterSchema.parse(input);
  const limited = rateLimit(`newsletter:${data.email}`, 5, 60_000);
  if (!limited.success) throw new Error("Too many attempts. Try again later.");

  await connectDB();
  await NewsletterSubscriber.findOneAndUpdate(
    { email: data.email.toLowerCase() },
    { email: data.email.toLowerCase(), isActive: true },
    { upsert: true, new: true }
  );
  return { ok: true };
}
