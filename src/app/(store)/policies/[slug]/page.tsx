import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/queries";

const KEYS = ["shipping", "returns", "privacy", "terms"] as const;

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!KEYS.includes(slug as (typeof KEYS)[number])) notFound();
  const settings = await getStoreSettings();
  const body =
    settings.policies?.[slug as (typeof KEYS)[number]] ||
    "Policy content coming soon.";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Policy</p>
      <h1 className="mt-3 font-display text-4xl capitalize tracking-tight sm:text-5xl">
        {slug}
      </h1>
      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
        {body}
      </p>
    </div>
  );
}
