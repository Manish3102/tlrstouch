import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const HomepageSectionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: [
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
      ],
    },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    buttonText: { type: String, default: "" },
    buttonLink: { type: String, default: "" },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
        mobileUrl: String,
        mobilePublicId: String,
        title: String,
        subtitle: String,
        description: String,
        buttonText: String,
        buttonLink: String,
        buttonTextSecondary: String,
        buttonLinkSecondary: String,
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type HomepageSectionDocument = InferSchemaType<
  typeof HomepageSectionSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const HomepageSection =
  models.HomepageSection || model("HomepageSection", HomepageSectionSchema);
