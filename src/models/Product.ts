import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    sku: { type: String, required: true, unique: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sizes: {
      type: [
        {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
        },
      ],
      default: ["S", "M", "L", "XL"],
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    images: [ProductImageSchema],
    tags: {
      type: [
        {
          type: String,
          enum: ["new-arrival", "bestseller", "featured"],
        },
      ],
      default: [],
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", sku: "text" });
ProductSchema.index({ price: 1, createdAt: -1 });

export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product = models.Product || model("Product", ProductSchema);
