"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl: string;
  imageAlt?: string;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaLabel = "Shop the drop",
  ctaHref = "/shop",
  imageUrl,
  imageAlt = "",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative min-h-[85vh] w-full overflow-hidden bg-neutral-900 text-white",
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={imageAlt || title}
        fill
        priority
        className="object-cover opacity-70"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-[1400px] flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16 lg:pb-20">
        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-sans text-[11px] uppercase tracking-[0.28em] text-white/80"
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-3 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>

        {description ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-4 max-w-lg font-sans text-sm leading-relaxed text-white/85 sm:text-base"
          >
            {description}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="mt-8"
        >
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white text-white hover:bg-white hover:text-neutral-900"
            )}
          >
            {ctaLabel}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pointer-events-none absolute bottom-6 right-4 hidden font-display text-[10rem] leading-none tracking-tighter text-white/[0.06] sm:block lg:text-[12rem]"
          aria-hidden
        >
          Tailorstouch
        </motion.p>
      </div>
    </section>
  );
}
