"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?tag=new-arrival", label: "New Arrivals" },
  { href: "/shop?tag=bestseller", label: "Bestsellers" },
];

export function Navbar({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.count());

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:h-16 sm:px-6">
        <button
          type="button"
          className="lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        <Link
          href="/"
          className="font-display text-lg tracking-[0.28em] text-neutral-900 sm:text-xl"
        >
          {brandName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-sans text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-60",
                pathname === "/shop" && link.href === "/shop"
                  ? "text-neutral-900"
                  : "text-neutral-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/shop"
            aria-label="Search shop"
            className="text-neutral-900 hover:opacity-60"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden text-neutral-900 hover:opacity-60 sm:block"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="text-neutral-900 hover:opacity-60"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-neutral-900 hover:opacity-60"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-neutral-900 px-1 text-[10px] font-medium text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-sans text-sm uppercase tracking-[0.16em] text-neutral-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="block font-sans text-sm uppercase tracking-[0.16em] text-neutral-900"
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
