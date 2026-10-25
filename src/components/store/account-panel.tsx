"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AccountPanel({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">Account</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
        {name || "Your account"}
      </h1>
      {email ? <p className="mt-3 text-sm text-muted">{email}</p> : null}
      <div className="mt-8 space-y-3 text-sm">
        <Link href="/wishlist" className="block underline">
          Wishlist
        </Link>
        <Link href="/cart" className="block underline">
          Cart
        </Link>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-8"
        onClick={() =>
          signOut({ callbackUrl: `${window.location.origin}/account` })
        }
      >
        Sign out
      </Button>
    </div>
  );
}
