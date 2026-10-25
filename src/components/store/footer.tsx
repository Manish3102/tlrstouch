import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FooterProps {
  brandName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
    privacy?: string;
    terms?: string;
  };
  className?: string;
}

export function Footer({
  brandName,
  contactEmail,
  contactPhone,
  address,
  socialLinks,
  policies,
  className,
}: FooterProps) {
  const policyEntries = [
    { key: "shipping", label: "Shipping", href: "/policies/shipping" },
    { key: "returns", label: "Returns", href: "/policies/returns" },
    { key: "privacy", label: "Privacy", href: "/policies/privacy" },
    { key: "terms", label: "Terms", href: "/policies/terms" },
  ] as const;

  const socials = [
    socialLinks?.instagram
      ? { label: "Instagram", href: socialLinks.instagram }
      : null,
    socialLinks?.twitter ? { label: "X", href: socialLinks.twitter } : null,
    socialLinks?.youtube
      ? { label: "YouTube", href: socialLinks.youtube }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className={cn("border-t border-border bg-background text-foreground", className)}>
      <div className="mx-auto grid max-w-page gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8 lg:py-20">
        <div>
          <Link href="/" className="inline-flex flex-col items-start gap-4" aria-label={brandName}>
            <Image
              src="/brand/mark.png"
              alt=""
              width={137}
              height={125}
              className="h-16 w-auto"
            />
            <Image
              src="/brand/lockup.png"
              alt={brandName}
              width={284}
              height={174}
              className="h-20 w-auto"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Quiet silhouettes for days that do not follow a dress code.
          </p>
          {socials.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.16em]">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition-opacity hover:opacity-60"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="eyebrow">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="hover:opacity-60">
                All pieces
              </Link>
            </li>
            <li>
              <Link href="/shop?tag=new-arrival" className="hover:opacity-60">
                New arrivals
              </Link>
            </li>
            <li>
              <Link href="/shop?tag=bestseller" className="hover:opacity-60">
                Bestsellers
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:opacity-60">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Support</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {policyEntries.map(({ key, label, href }) => (
              <li key={key}>
                <Link href={href} className="hover:opacity-60">
                  {label}
                </Link>
                {policies?.[key] ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {policies[key]}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${contactEmail}`} className="hover:opacity-60">
                {contactEmail}
              </a>
            </li>
            {contactPhone ? <li>{contactPhone}</li> : null}
            {address ? (
              <li className="whitespace-pre-line text-muted">{address}</li>
            ) : null}
            <li className="pt-2">
              <Link href="/account" className="hover:opacity-60">
                Account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 sm:px-6">
        <p className="text-center text-[11px] uppercase tracking-[0.16em] text-muted">
          © {new Date().getFullYear()} {brandName}
        </p>
      </div>
    </footer>
  );
}
