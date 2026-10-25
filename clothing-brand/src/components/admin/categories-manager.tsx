"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  image?: { url: string; publicId: string; alt?: string } | null;
}

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEditing(null);
    setName("");
    setDescription("");
    setImage([]);
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setImage(
      cat.image?.url
        ? [
            {
              url: cat.image.url,
              publicId: cat.image.publicId,
              alt: cat.image.alt,
            },
          ]
        : []
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateCategory(editing._id, {
          name,
          slug: editing.slug,
          description,
          order: editing.order,
          isActive: editing.isActive,
          image: image[0] ?? null,
        });
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === editing._id
              ? {
                  ...cat,
                  name,
                  description,
                  image: image[0]
                    ? {
                        url: image[0].url,
                        publicId: image[0].publicId,
                        alt: image[0].alt,
                      }
                    : null,
                }
              : cat
          )
        );
        toast.success("Category updated");
        resetForm();
      } else {
        await createCategory({
          name,
          description,
          order: categories.length + 1,
          isActive: true,
          image: image[0] ?? null,
        });
        toast.success("Category created");
        resetForm();
        window.location.reload();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await updateCategory(cat._id, {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        isActive: !cat.isActive,
        image: cat.image ?? null,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c._id === cat._id ? { ...c, isActive: !c.isActive } : c
        )
      );
      toast.success("Category updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex items-center gap-4 border border-neutral-200 bg-white p-4"
          >
            <div className="relative h-16 w-14 bg-neutral-100">
              {cat.image?.url ? (
                <Image
                  src={cat.image.url}
                  alt={cat.image.alt || cat.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-neutral-500">/{cat.slug}</p>
            </div>
            <button
              type="button"
              onClick={() => startEdit(cat)}
              className="text-sm underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => toggleActive(cat)}
              className="text-sm underline"
            >
              {cat.isActive ? "Active" : "Hidden"}
            </button>
            <button
              type="button"
              onClick={() => onDelete(cat._id)}
              className="text-sm text-red-600 underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 border border-neutral-200 bg-white p-5">
        <h2 className="font-medium">
          {editing ? `Edit ${editing.name}` : "Add category"}
        </h2>
        {editing ? (
          <p className="text-xs text-neutral-500">
            Upload a new image to replace the current one, then save.
          </p>
        ) : null}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Name"
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          rows={3}
        />
        <ImageUploader
          value={image}
          onChange={setImage}
          multiple={false}
          folder="drift/categories"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Saving…" : editing ? "Save changes" : "Create"}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={resetForm}
            className="w-full border border-neutral-300 py-2.5 text-sm"
          >
            Cancel
          </button>
        ) : null}
      </form>
    </div>
  );
}
