import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CampaignBanner({
  title,
  subtitle,
  description,
  href,
  ctaLabel = "Explore the Lookbook",
  imageUrl,
  imageAlt,
  className,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  href: string;
  ctaLabel?: string;
  imageUrl: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-ink text-background",
        className
      )}
    >
      <div className="relative min-h-[460px] sm:min-h-[560px]">
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          fill
          className="object-cover transition duration-[1.2s] ease-out hover:scale-[1.02]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[460px] max-w-page items-end px-4 py-14 sm:min-h-[560px] sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-xl">
            {subtitle ? (
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/75">
                {subtitle}
              </p>
            ) : null}
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
                {description}
              </p>
            ) : null}
            <Link
              href={href}
              className="mt-8 inline-flex h-12 items-center border border-white px-6 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 hover:bg-white hover:text-ink"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
