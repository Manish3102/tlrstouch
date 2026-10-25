import { connectDB } from "@/lib/db";
import { MediaAsset } from "@/models/MediaAsset";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { HomepageSection } from "@/models/HomepageSection";
import { StoreSettings } from "@/models/StoreSettings";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export async function incrementMediaRefs(publicIds: string[]) {
  if (!publicIds.length) return;
  await connectDB();
  await Promise.all(
    publicIds.map((publicId) =>
      MediaAsset.findOneAndUpdate(
        { publicId },
        { $inc: { refCount: 1 } },
        { upsert: false }
      )
    )
  );
}

export async function decrementMediaRefs(publicIds: string[]) {
  if (!publicIds.length) return;
  await connectDB();
  for (const publicId of publicIds) {
    const asset = await MediaAsset.findOneAndUpdate(
      { publicId },
      { $inc: { refCount: -1 } },
      { new: true }
    );
    if (asset && asset.refCount <= 0) {
      const stillUsed = await isPublicIdReferenced(publicId);
      if (!stillUsed) {
        await deleteCloudinaryAsset(publicId);
        await MediaAsset.deleteOne({ publicId });
      } else {
        await MediaAsset.updateOne({ publicId }, { refCount: 1 });
      }
    }
  }
}

export async function isPublicIdReferenced(publicId: string) {
  await connectDB();
  const [inProduct, inCategory, inHomepage, inSettings] = await Promise.all([
    Product.exists({ "images.publicId": publicId }),
    Category.exists({ "image.publicId": publicId }),
    HomepageSection.exists({ "images.publicId": publicId }),
    StoreSettings.exists({ "logo.publicId": publicId }),
  ]);
  return Boolean(inProduct || inCategory || inHomepage || inSettings);
}

export async function safeDeleteMedia(publicId: string) {
  await connectDB();
  const referenced = await isPublicIdReferenced(publicId);
  if (referenced) {
    return {
      deleted: false,
      reason: "Image is still referenced by products or content.",
    };
  }
  await deleteCloudinaryAsset(publicId);
  await MediaAsset.deleteOne({ publicId });
  return { deleted: true };
}
