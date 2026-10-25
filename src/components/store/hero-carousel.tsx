"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  url: string;
  publicId?: string;
  alt?: string;
  mobileUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  isActive?: boolean;
};

const AUTOPLAY_MS = 6500;

export function HeroCarousel({
  slides,
  brandFallback = "Tailorstouch",
  fallback,
}: {
  slides: HeroSlide[];
  brandFallback?: string;
  fallback?: Pick<
    HeroSlide,
    "title" | "subtitle" | "description" | "buttonText" | "buttonLink" | "buttonTextSecondary" | "buttonLinkSecondary"
  >;
}) {
  const reduce = useReducedMotion();
  const activeSlides = slides.filter((s) => s.isActive !== false && s.url);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const count = activeSlides.length;
  const slide = activeSlides[index] ?? activeSlides[0];

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
      setProgress(0);
    },
    [count]
  );

  const go = useCallback(
    (dir: 1 | -1) => goTo(index + dir),
    [goTo, index]
  );

  useEffect(() => {
    if (reduce || paused || count <= 1) return;

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % count);
      setProgress(0);
    }, AUTOPLAY_MS);

    const progressTimer = window.setInterval(() => {
      if (document.hidden) return;
      setProgress((p) => Math.min(100, p + 100 / (AUTOPLAY_MS / 40)));
    }, 40);

    return () => {
      clearInterval(interval);
      clearInterval(progressTimer);
    };
  }, [count, paused, reduce, index]);

  if (!slide) {
    return (
      <section className="flex h-[78svh] min-h-[520px] max-h-[860px] items-end bg-ink px-6 pb-16 text-background sm:px-10">
        <div className="max-w-xl">
          {fallback?.subtitle ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-background/70">
              {fallback.subtitle}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            {fallback?.title || brandFallback}
          </h1>
          {fallback?.description ? (
            <p className="mt-4 max-w-md text-sm text-background/75">
              {fallback.description}
            </p>
          ) : null}
          <Link
            href={fallback?.buttonLink || "/shop?tag=new-arrival"}
            className="mt-6 inline-block text-sm underline decoration-1 underline-offset-4"
          >
            {fallback?.buttonText || "Shop new arrivals"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative h-[78svh] min-h-[520px] max-h-[860px] w-full overflow-hidden bg-[#111111] text-white sm:h-[82svh]"
      onTouchStart={(e) => setTouchStart(e.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStart == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        setTouchStart(null);
      }}
      aria-roledescription="carousel"
      aria-label="Campaign"
    >
      {/* Horizontal sliding track — no fade / no black blink */}
      <div
        className={cn(
          "flex h-full w-full",
          reduce ? "" : "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        )}
        style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
      >
        {activeSlides.map((item, i) => (
          <div
            key={`${item.publicId || item.url}-${i}`}
            className="relative h-full w-full shrink-0 grow-0 basis-full"
          >
            <Image
              src={item.url}
              alt={item.alt || item.title || "Campaign"}
              fill
              priority={i === 0}
              sizes="100vw"
              className="hidden object-cover md:block"
            />
            <Image
              src={item.mobileUrl || item.url}
              alt={item.alt || item.title || "Campaign"}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover md:hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-black/15" />
          </div>
        ))}
      </div>

      {/* Bottom-left editorial copy — Brkthru style */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-12 pt-28 sm:px-8 sm:pb-14 md:px-12">
        <div className="pointer-events-auto max-w-xl">
          {slide.subtitle ? (
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/75">
              {slide.subtitle}
            </p>
          ) : null}
          <h1 className="mt-2 max-w-[14ch] font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
            {slide.title || brandFallback}
          </h1>
          {slide.description ? (
            <p className="mt-3 max-w-md text-sm text-white/85">
              {slide.description}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href={slide.buttonLink || "/shop"}
              className="text-sm underline decoration-1 underline-offset-4 transition-opacity hover:opacity-75"
            >
              {slide.buttonText || "Shop new arrivals"}
            </Link>
            {slide.buttonTextSecondary && slide.buttonLinkSecondary ? (
              <Link
                href={slide.buttonLinkSecondary}
                className="text-sm text-white/80 underline decoration-1 underline-offset-4 transition-opacity hover:text-white"
              >
                {slide.buttonTextSecondary}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom-right progress + pause */}
      {count > 1 ? (
        <div className="absolute bottom-10 right-5 z-10 flex items-center gap-3 sm:right-8 md:right-12">
          <div className="h-[2px] w-24 overflow-hidden bg-white/35 sm:w-32">
            <div
              className="h-full bg-white transition-[width] duration-75 ease-linear"
              style={{ width: `${reduce ? 100 : progress}%` }}
            />
          </div>
          <button
            type="button"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => setPaused((p) => !p)}
            className="text-white/90 transition hover:text-white"
          >
            {paused || reduce ? (
              <Play className="h-4 w-4 fill-current" />
            ) : (
              <Pause className="h-4 w-4 fill-current" />
            )}
          </button>
        </div>
      ) : null}

      {/* Invisible click zones for desktop prev/next without heavy arrows */}
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute inset-y-0 left-0 z-[5] hidden w-1/5 cursor-w-resize bg-transparent md:block"
          />
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute inset-y-0 right-0 z-[5] hidden w-1/5 cursor-e-resize bg-transparent md:block"
          />
        </>
      ) : null}
    </section>
  );
}
