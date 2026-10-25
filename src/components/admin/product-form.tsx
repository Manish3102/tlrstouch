"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/products";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SortableImages, type SortableImage } from "@/components/admin/sortable-images";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const TAGS = [
  { value: "new-arrival", label: "New arrival" },
  { value: "bestseller", label: "Bestseller" },
  { value: "featured", label: "Featured" },
] as const;

interface CategoryOption {
  _id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initial?: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    category: string | { _id: string };
    price: number;
    salePrice?: number | null;
    sku: string;
    stock: number;
    sizes: string[];
    colors: { name: string; hex: string }[];
    tags: string[];
    isFeatured: boolean;
    status: "draft" | "published";
    images: SortableImage[];
    metaTitle?: string;
    metaDescription?: string;
  };
}

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<SortableImage[]>(initial?.images ?? []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? ["S", "M", "L", "XL"]);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [colors, setColors] = useState(
    initial?.colors ?? [{ name: "Black", hex: "#111111" }]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const payload = {
        name: String(form.get("name")),
        slug: String(form.get("slug") || ""),
        description: String(form.get("description")),
        category: String(form.get("category")),
        price: Number(form.get("price")),
        salePrice: form.get("salePrice")
          ? Number(form.get("salePrice"))
          : null,
        sku: String(form.get("sku")),
        stock: Number(form.get("stock")),
        sizes,
        colors,
        tags,
        isFeatured: form.get("isFeatured") === "on",
        status: String(form.get("status")) as "draft" | "published",
        metaTitle: String(form.get("metaTitle") || ""),
        metaDescription: String(form.get("metaDescription") || ""),
        images: images.map((img, order) => ({
          ...img,
          order,
          isPrimary: img.isPrimary ?? order === 0,
        })),
      };

      if (initial?._id) {
        await updateProduct(initial._id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  const categoryId =
    typeof initial?.category === "string"
      ? initial.category
      : initial?.category?._id;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input name="name" required defaultValue={initial?.name} className={fieldClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={initial?.slug} className={fieldClass} placeholder="auto from name" />
        </Field>
        <Field label="SKU">
          <input name="sku" required defaultValue={initial?.sku} className={fieldClass} />
        </Field>
        <Field label="Category">
          <select name="category" required defaultValue={categoryId} className={fieldClass}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price (INR)">
          <input name="price" type="number" min={0} required defaultValue={initial?.price} className={fieldClass} />
        </Field>
        <Field label="Sale price">
          <input name="salePrice" type="number" min={0} defaultValue={initial?.salePrice ?? ""} className={fieldClass} />
        </Field>
        <Field label="Stock">
          <input name="stock" type="number" min={0} required defaultValue={initial?.stock ?? 0} className={fieldClass} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={initial?.status ?? "draft"} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" required rows={5} defaultValue={initial?.description} className={fieldClass} />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <label key={size} className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={(e) =>
                  setSizes((prev) =>
                    e.target.checked
                      ? [...prev, size]
                      : prev.filter((s) => s !== size)
                  )
                }
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Colors</p>
          <button
            type="button"
            className="text-sm underline"
            onClick={() =>
              setColors((prev) => [...prev, { name: "New", hex: "#888888" }])
            }
          >
            Add color
          </button>
        </div>
        <div className="space-y-2">
          {colors.map((color, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={color.name}
                onChange={(e) =>
                  setColors((prev) =>
                    prev.map((c, i) =>
                      i === index ? { ...c, name: e.target.value } : c
                    )
                  )
                }
                className={fieldClass}
                placeholder="Name"
              />
              <input
                type="color"
                value={color.hex}
                onChange={(e) =>
                  setColors((prev) =>
                    prev.map((c, i) =>
                      i === index ? { ...c, hex: e.target.value } : c
                    )
                  )
                }
                className="h-10 w-14 border border-neutral-200"
              />
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() =>
                  setColors((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Tags</p>
        <p className="mb-2 text-xs text-neutral-500">
          Tick New arrival to show this product on the homepage. It also has to be Published.
        </p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <label key={tag.value} className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={tags.includes(tag.value)}
                onChange={(e) =>
                  setTags((prev) =>
                    e.target.checked
                      ? [...prev, tag.value]
                      : prev.filter((t) => t !== tag.value)
                  )
                }
              />
              {tag.label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" defaultChecked={initial?.isFeatured} />
        Featured product
      </label>

      <div>
        <p className="mb-2 text-sm font-medium">Images</p>
        <ImageUploader
          value={images}
          onChange={(imgs) =>
            setImages(
              imgs.map((img, order) => ({
                ...img,
                order,
                isPrimary: order === 0,
              }))
            )
          }
          folder="drift/products"
        />
        {images.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs text-neutral-500">
              Drag to reorder · star sets primary
            </p>
            <SortableImages images={images} onChange={setImages} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Meta title">
          <input name="metaTitle" defaultValue={initial?.metaTitle} className={fieldClass} />
        </Field>
        <Field label="Meta description">
          <input name="metaDescription" defaultValue={initial?.metaDescription} className={fieldClass} />
        </Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-900 px-6 py-3 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Saving…" : initial ? "Update product" : "Create product"}
      </button>
    </form>
  );
}

const fieldClass =
  "field w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
