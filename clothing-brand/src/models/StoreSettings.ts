import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const StoreSettingsSchema = new Schema(
  {
    brandName: { type: String, default: "Tailorstouch" },
    tagline: { type: String, default: "Worn differently." },
    logo: {
      url: String,
      publicId: String,
      alt: String,
    },
    contactEmail: { type: String, default: "hello@drift.store" },
    contactPhone: { type: String, default: "+91 98765 43210" },
    address: {
      type: String,
      default: "12 Studio Lane, Mumbai, India",
    },
    socialLinks: {
      instagram: { type: String, default: "https://instagram.com" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    policies: {
      shipping: { type: String, default: "Free shipping on orders over ₹2,999." },
      returns: {
        type: String,
        default: "Easy 7-day returns on unworn items with tags.",
      },
      privacy: {
        type: String,
        default: "We respect your privacy and never sell your data.",
      },
      terms: {
        type: String,
        default: "By shopping with Tailorstouch you agree to our store terms.",
      },
    },
    shippingFlatRate: { type: Number, default: 99 },
    freeShippingThreshold: { type: Number, default: 2999 },
    lowStockThreshold: { type: Number, default: 5 },
    codEnabled: { type: Boolean, default: true },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export type StoreSettingsDocument = InferSchemaType<
  typeof StoreSettingsSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const StoreSettings =
  models.StoreSettings || model("StoreSettings", StoreSettingsSchema);
