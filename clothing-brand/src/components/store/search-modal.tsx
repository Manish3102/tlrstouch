"use client";

import { FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useUiStore } from "@/store/ui";

export function SearchModal() {
  const open = useUiStore((s) => s.searchOpen);
  const closeSearch = useUiStore((s) => s.closeSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeSearch]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    const query = String(q || "").trim();
    closeSearch();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close search"
            className="fixed inset-0 z-50 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
          />
          <motion.div
            className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background px-4 py-8 sm:px-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <form
              onSubmit={onSubmit}
              className="mx-auto flex max-w-3xl items-center gap-3"
              role="search"
            >
              <Search className="h-5 w-5 text-muted" />
              <input
                ref={inputRef}
                name="q"
                aria-label="Search products"
                placeholder="Search"
                className="w-full bg-transparent py-2 font-display text-2xl tracking-tight outline-none placeholder:text-stone sm:text-4xl"
              />
              <button type="button" aria-label="Close" onClick={closeSearch}>
                <X className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
