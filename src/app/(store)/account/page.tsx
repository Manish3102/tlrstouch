import Link from "next/link";

export const metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Account</h1>
      <p className="mt-3 text-sm text-muted">
        Guest checkout is available. Admin access is separate and secured.
      </p>
      <div className="mt-8 space-y-3 text-sm">
        <Link href="/admin/login" className="block underline">
          Admin sign in
        </Link>
        <Link href="/wishlist" className="block underline">
          Wishlist
        </Link>
        <Link href="/cart" className="block underline">
          Cart
        </Link>
      </div>
    </div>
  );
}
