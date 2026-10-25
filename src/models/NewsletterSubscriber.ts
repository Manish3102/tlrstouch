import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const NewsletterSubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type NewsletterSubscriberDocument = InferSchemaType<
  typeof NewsletterSubscriberSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const NewsletterSubscriber =
  models.NewsletterSubscriber ||
  model("NewsletterSubscriber", NewsletterSubscriberSchema);
