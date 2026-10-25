"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateStoreSettings } from "@/actions/settings";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";

interface Settings {
  brandName: string;
  tagline?: string;
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
  shippingFlatRate: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  codEnabled: boolean;
  logo?: UploadedImage | null;
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const [logo, setLogo] = useState<UploadedImage[]>(
    initial.logo?.url ? [initial.logo] : []
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await updateStoreSettings(
        {
          brandName: String(form.get("brandName")),
          tagline: String(form.get("tagline") || ""),
          contactEmail: String(form.get("contactEmail")),
          contactPhone: String(form.get("contactPhone") || ""),
          address: String(form.get("address") || ""),
          socialLinks: {
            instagram: String(form.get("instagram") || ""),
            twitter: String(form.get("twitter") || ""),
            youtube: String(form.get("youtube") || ""),
          },
          policies: {
            shipping: String(form.get("shipping") || ""),
            returns: String(form.get("returns") || ""),
            privacy: String(form.get("privacy") || ""),
            terms: String(form.get("terms") || ""),
          },
          shippingFlatRate: Number(form.get("shippingFlatRate")),
          freeShippingThreshold: Number(form.get("freeShippingThreshold")),
          lowStockThreshold: Number(form.get("lowStockThreshold")),
          codEnabled: form.get("codEnabled") === "on",
        },
        logo[0] ?? null
      );
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-neutral-200 bg-white p-6">
      <input name="brandName" defaultValue={initial.brandName} required className="w-full border px-3 py-2 text-sm" placeholder="Brand name" />
      <input name="tagline" defaultValue={initial.tagline} className="w-full border px-3 py-2 text-sm" placeholder="Tagline" />
      <input name="contactEmail" type="email" defaultValue={initial.contactEmail} required className="w-full border px-3 py-2 text-sm" />
      <input name="contactPhone" defaultValue={initial.contactPhone} className="w-full border px-3 py-2 text-sm" />
      <textarea name="address" defaultValue={initial.address} className="w-full border px-3 py-2 text-sm" rows={2} />
      <div className="grid gap-3 md:grid-cols-3">
        <input name="instagram" defaultValue={initial.socialLinks?.instagram} placeholder="Instagram URL" className="border px-3 py-2 text-sm" />
        <input name="twitter" defaultValue={initial.socialLinks?.twitter} placeholder="Twitter URL" className="border px-3 py-2 text-sm" />
        <input name="youtube" defaultValue={initial.socialLinks?.youtube} placeholder="YouTube URL" className="border px-3 py-2 text-sm" />
      </div>
      <textarea name="shipping" defaultValue={initial.policies?.shipping} className="w-full border px-3 py-2 text-sm" rows={2} placeholder="Shipping policy" />
      <textarea name="returns" defaultValue={initial.policies?.returns} className="w-full border px-3 py-2 text-sm" rows={2} placeholder="Returns policy" />
      <textarea name="privacy" defaultValue={initial.policies?.privacy} className="w-full border px-3 py-2 text-sm" rows={2} placeholder="Privacy policy" />
      <textarea name="terms" defaultValue={initial.policies?.terms} className="w-full border px-3 py-2 text-sm" rows={2} placeholder="Terms" />
      <div className="grid gap-3 md:grid-cols-3">
        <input name="shippingFlatRate" type="number" defaultValue={initial.shippingFlatRate} className="border px-3 py-2 text-sm" />
        <input name="freeShippingThreshold" type="number" defaultValue={initial.freeShippingThreshold} className="border px-3 py-2 text-sm" />
        <input name="lowStockThreshold" type="number" defaultValue={initial.lowStockThreshold} className="border px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="codEnabled" type="checkbox" defaultChecked={initial.codEnabled} />
        Enable Cash on Delivery
      </label>
      <div>
        <p className="mb-2 text-sm font-medium">Logo</p>
        <ImageUploader value={logo} onChange={setLogo} multiple={false} folder="drift/brand" />
      </div>
      <button type="submit" disabled={loading} className="bg-neutral-900 px-5 py-2.5 text-sm text-white disabled:opacity-50">
        {loading ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
