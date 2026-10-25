import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type InstagramPost = {
  id: string;
  imageUrl: string;
  href: string;
  alt?: string;
};

export function InstagramGrid({
  posts,
  profileUrl,
  handle,
  className,
}: {
  posts: InstagramPost[];
  profileUrl?: string;
  handle?: string;
  className?: string;
}) {
  if (!posts.length) return null;

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              {handle || "@drift"}
            </p>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-neutral-900 sm:text-3xl">
              In the feed
            </h2>
          </div>
          {profileUrl ? (
            <Link
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs uppercase tracking-[0.16em] text-neutral-900 hover:opacity-70"
            >
              {handle ? `@${handle.replace(/^@/, "")}` : "Follow"}
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-neutral-200"
            >
              <Image
                src={post.imageUrl}
                alt={post.alt || "Instagram post"}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
