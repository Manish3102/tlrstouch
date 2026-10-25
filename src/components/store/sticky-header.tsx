"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?tag=new-arrival", label: "New arrivals" },
  { href: "/shop?tag=bestseller", label: "Bestsellers" },
];

export function StickyHeader({
  brandName,
  categories = [],
  contactEmail,
}: {
  brandName: string;
  categories?: { name: string; slug: string; image?: { url?: string } | null }[];
  contactEmail?: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }
  const cartCount = useCartStore((s) => s.count());
  const cartReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const visibleCount = cartReady ? cartCount : 0;
  const openCart = useUiStore((s) => s.openCart);
  const openSearch = useUiStore((s) => s.openSearch);

  const overHero = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const iconButton =
    "flex h-11 w-11 items-center justify-center transition-opacity duration-200 hover:opacity-60";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        overHero
          ? "bg-transparent text-white"
          : "border-b border-border bg-background/95 text-foreground backdrop-blur-md"
      )}
    >
      <div className="mx-auto grid h-14 max-w-page grid-cols-[1fr_auto_1fr] items-center px-2 sm:h-16 sm:px-4 lg:px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="flex h-11 items-center gap-2 px-2 text-[11px] uppercase tracking-[0.18em]"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="hidden sm:inline">{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>

        <Link href="/" className="justify-self-center" aria-label={brandName}>
          <Image
            src="/brand/wordmark.png"
            alt={brandName}
            width={858}
            height={212}
            priority
            className={cn(
              "h-8 w-auto sm:h-10",
              overHero && "brightness-0 invert"
            )}
          />
        </Link>

        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-label="Search"
            onClick={openSearch}
            className={iconButton}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className={cn(iconButton, "hidden sm:flex")}
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            aria-label={visibleCount > 0 ? `Shopping bag, ${visibleCount} items` : "Shopping bag"}
            onClick={openCart}
            className={cn(iconButton, "relative")}
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {visibleCount > 0 ? (
              <span
                className={cn(
                  "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] font-medium",
                  overHero
                    ? "bg-white text-ink"
                    : "bg-ink text-background"
                )}
              >
                {visibleCount > 99 ? "99+" : visibleCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="site-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full z-50 h-[calc(100svh-100%)] overflow-y-auto bg-background text-foreground"
          >
            <div className="mx-auto grid max-w-page gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-12">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      data-active={pathname === link.href.split("?")[0] && link.href === "/shop" ? "true" : undefined}
                      className="nav-link inline-block py-2 font-display text-[2.35rem] leading-none tracking-tight sm:text-5xl"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="grid content-start gap-8 sm:grid-cols-2 lg:grid-cols-1">
                {categories.length > 0 ? (
                  <div>
                    <p className="eyebrow">Collections</p>
                    <ul className="mt-3 space-y-2">
                      {categories.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm text-foreground transition-opacity hover:opacity-60"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div>
                  <p className="eyebrow">Account</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li>
                      <Link href="/account" onClick={() => setMenuOpen(false)}>
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
                        Wishlist
                      </Link>
                    </li>
                    <li>
                      <Link href="/cart" onClick={() => setMenuOpen(false)}>
                        Bag
                      </Link>
                    </li>
                    {contactEmail ? (
                      <li>
                        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
