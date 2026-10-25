import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    alt: { type: String, default: "" },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    bytes: { type: Number },
    folder: { type: String, default: "drift" },
    refCount: { type: Number, default: 0, min: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export type MediaAssetDocument = InferSchemaType<typeof MediaAssetSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MediaAsset =
  models.MediaAsset || model("MediaAsset", MediaAssetSchema);
