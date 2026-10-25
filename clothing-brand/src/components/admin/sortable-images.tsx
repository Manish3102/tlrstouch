"use client";

import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortableImage {
  url: string;
  publicId: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

function SortableItem({
  image,
  onPrimary,
  onAlt,
  onRemove,
}: {
  image: SortableImage;
  onPrimary: () => void;
  onAlt: (alt: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.publicId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="space-y-2 border border-neutral-200 bg-white p-2"
    >
      <div className="relative aspect-[4/5] bg-neutral-100">
        <Image
          src={image.url}
          alt={image.alt || "Product image"}
          fill
          className="object-cover"
          sizes="200px"
        />
        <button
          type="button"
          className="absolute left-1 top-1 bg-white/90 p-1"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onPrimary}
          className={cn(
            "absolute right-1 top-1 bg-white/90 p-1",
            image.isPrimary && "text-amber-500"
          )}
          aria-label="Set primary"
        >
          <Star className="h-4 w-4" />
        </button>
      </div>
      <input
        value={image.alt ?? ""}
        onChange={(e) => onAlt(e.target.value)}
        placeholder="Alt text"
        className="w-full border border-neutral-200 px-2 py-1 text-xs"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-xs text-red-600 underline"
      >
        Remove
      </button>
    </div>
  );
}

export function SortableImages({
  images,
  onChange,
}: {
  images: SortableImage[];
  onChange: (images: SortableImage[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.publicId === active.id);
    const newIndex = images.findIndex((i) => i.publicId === over.id);
    const next = arrayMove(images, oldIndex, newIndex).map((img, order) => ({
      ...img,
      order,
    }));
    onChange(next);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={images.map((i) => i.publicId)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image, index) => (
            <SortableItem
              key={image.publicId}
              image={image}
              onPrimary={() =>
                onChange(
                  images.map((img, i) => ({
                    ...img,
                    isPrimary: i === index,
                  }))
                )
              }
              onAlt={(alt) =>
                onChange(
                  images.map((img, i) => (i === index ? { ...img, alt } : img))
                )
              }
              onRemove={() =>
                onChange(images.filter((_, i) => i !== index))
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
