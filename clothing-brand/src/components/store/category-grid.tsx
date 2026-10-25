import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type StoreCategory = {
  _id?: string;
  name: string;
  slug: string;
  image?: { url: string; alt?: string } | null;
};

export function CategoryGrid({
  categories,
  title = "Shop by Collection",
  className,
}: {
  categories: StoreCategory[];
  title?: string;
  className?: string;
}) {
  return (
    <section className={cn(className)}>
      <div className="mb-8">
        <p className="eyebrow">Collections</p>
        <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const src = cat.image?.url;
          return (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group relative aspect-[4/5] overflow-hidden bg-well"
            >
              {src ? (
                <Image
                  src={src}
                  alt={cat.image?.alt || cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : null}
              <div
                className={cn(
                  "absolute inset-0",
                  src
                    ? "bg-gradient-to-t from-black/50 via-transparent to-transparent"
                    : "bg-well"
                )}
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p
                  className={cn(
                    "font-display text-2xl tracking-tight sm:text-3xl",
                    src ? "text-white" : "text-foreground"
                  )}
                >
                  {cat.name}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[10px] uppercase tracking-[0.18em]",
                    src ? "text-white/80" : "text-muted"
                  )}
                >
                  Shop
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
