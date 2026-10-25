"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateHomepageSection } from "@/actions/homepage";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/image-uploader";

interface SlideImage extends UploadedImage {
  mobileUrl?: string;
  mobilePublicId?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  isActive?: boolean;
  order?: number;
}

interface Section {
  key: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  isVisible?: boolean;
  order?: number;
  images?: SlideImage[];
  settings?: Record<string, unknown>;
}

const LABELS: Record<string, string> = {
  announcement: "Announcement bar",
  hero: "Hero carousel",
  categories: "Collections",
  "new-arrivals": "New arrivals",
  bestsellers: "Bestsellers",
  featured: "Featured",
  campaign: "Campaign / Lookbook",
  "shop-the-look": "Shop the look",
  "brand-story": "Brand story",
  instagram: "Social gallery",
  newsletter: "Newsletter",
  trust: "Trust & service",
};

export function HomepageCms({ sections }: { sections: Section[] }) {
  const [items, setItems] = useState(
    [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  async function save(section: Section) {
    try {
      await updateHomepageSection(section);
      toast.success(`${LABELS[section.key] || section.key} saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  }

  function update(key: string, patch: Partial<Section>) {
    setItems((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...patch } : s))
    );
  }

  function updateSlide(
    sectionKey: string,
    index: number,
    patch: Partial<SlideImage>
  ) {
    setItems((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        const images = [...(s.images || [])];
        images[index] = { ...images[index], ...patch };
        return { ...s, images };
      })
    );
  }

  return (
    <div className="space-y-6">
      {items.map((section) => (
        <div
          key={section.key}
          className="space-y-4 border border-neutral-200 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium">
              {LABELS[section.key] || section.key}
            </h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={section.isVisible ?? true}
                onChange={(e) =>
                  update(section.key, { isVisible: e.target.checked })
                }
              />
              Visible
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={section.title || ""}
              onChange={(e) => update(section.key, { title: e.target.value })}
              placeholder="Title"
              className="border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={section.subtitle || ""}
              onChange={(e) =>
                update(section.key, { subtitle: e.target.value })
              }
              placeholder="Subtitle"
              className="border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={section.buttonText || ""}
              onChange={(e) =>
                update(section.key, { buttonText: e.target.value })
              }
              placeholder="Button text"
              className="border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={section.buttonLink || ""}
              onChange={(e) =>
                update(section.key, { buttonLink: e.target.value })
              }
              placeholder="Button link"
              className="border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>

          <textarea
            value={section.description || ""}
            onChange={(e) =>
              update(section.key, { description: e.target.value })
            }
            placeholder="Description"
            rows={3}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
          />

          {section.key === "hero" ? (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                Hero slides (desktop + optional mobile image, CTAs, order)
              </p>
              {(section.images || []).map((slide, index) => (
                <div
                  key={slide.publicId || index}
                  className="space-y-3 border border-neutral-100 bg-[#FAFAF8] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Slide {index + 1}</p>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={slide.isActive !== false}
                        onChange={(e) =>
                          updateSlide(section.key, index, {
                            isActive: e.target.checked,
                          })
                        }
                      />
                      Active
                    </label>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={slide.title || ""}
                      onChange={(e) =>
                        updateSlide(section.key, index, {
                          title: e.target.value,
                        })
                      }
                      placeholder="Slide title"
                      className="border px-3 py-2 text-sm"
                    />
                    <input
                      value={slide.subtitle || ""}
                      onChange={(e) =>
                        updateSlide(section.key, index, {
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Slide subtitle"
                      className="border px-3 py-2 text-sm"
                    />
                    <input
                      value={slide.buttonText || ""}
                      onChange={(e) =>
                        updateSlide(section.key, index, {
                          buttonText: e.target.value,
                        })
                      }
                      placeholder="Primary CTA"
                      className="border px-3 py-2 text-sm"
                    />
                    <input
                      value={slide.buttonLink || ""}
                      onChange={(e) =>
                        updateSlide(section.key, index, {
                          buttonLink: e.target.value,
                        })
                      }
                      placeholder="Primary CTA link"
                      className="border px-3 py-2 text-sm"
                    />
                    <input
                      value={slide.buttonTextSecondary || ""}
                      onChange={(e) =>
                        updateSlide(section.key, index, {
                          buttonTextSecondary: e.target.value,
                        })
                      }
                      placeholder="Secondary CTA"
                      className="border px-3 py-2 text-sm"
                    />
                    <input
                      value={slide.buttonLinkSecondary || ""}
                      onChange={(e) =>
                        updateSlide(section.key, index, {
                          buttonLinkSecondary: e.target.value,
                        })
                      }
                      placeholder="Secondary CTA link"
                      className="border px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={slide.description || ""}
                    onChange={(e) =>
                      updateSlide(section.key, index, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Slide description"
                    rows={2}
                    className="w-full border px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-neutral-500">Desktop image</p>
                  <ImageUploader
                    value={
                      slide.url
                        ? [
                            {
                              url: slide.url,
                              publicId: slide.publicId,
                              alt: slide.alt,
                            },
                          ]
                        : []
                    }
                    onChange={(imgs) => {
                      const img = imgs[0];
                      updateSlide(section.key, index, {
                        url: img?.url || "",
                        publicId: img?.publicId || "",
                        alt: img?.alt,
                      });
                    }}
                    multiple={false}
                    folder="drift/homepage/hero"
                  />
                  <p className="text-xs text-neutral-500">Mobile image</p>
                  <ImageUploader
                    value={
                      slide.mobileUrl
                        ? [
                            {
                              url: slide.mobileUrl,
                              publicId: slide.mobilePublicId || `${slide.publicId}-m`,
                              alt: slide.alt,
                            },
                          ]
                        : []
                    }
                    onChange={(imgs) => {
                      const img = imgs[0];
                      updateSlide(section.key, index, {
                        mobileUrl: img?.url,
                        mobilePublicId: img?.publicId,
                      });
                    }}
                    multiple={false}
                    folder="drift/homepage/hero-mobile"
                  />
                  <button
                    type="button"
                    className="text-xs text-red-600 underline"
                    onClick={() =>
                      update(
                        section.key,
                        {
                          images: (section.images || []).filter(
                            (_, i) => i !== index
                          ),
                        }
                      )
                    }
                  >
                    Remove slide
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="border border-neutral-900 px-4 py-2 text-sm"
                onClick={() =>
                  update(section.key, {
                    images: [
                      ...(section.images || []),
                      {
                        url: "",
                        publicId: `slide-${Date.now()}`,
                        title: "New slide",
                        isActive: true,
                        order: (section.images || []).length,
                      },
                    ],
                  })
                }
              >
                Add slide
              </button>
            </div>
          ) : ["campaign", "instagram", "shop-the-look"].includes(
              section.key
            ) ? (
            <ImageUploader
              value={section.images || []}
              onChange={(images) => update(section.key, { images })}
              multiple={section.key === "instagram"}
              folder={`drift/homepage/${section.key}`}
            />
          ) : null}

          <button
            type="button"
            onClick={() => save(section)}
            className="bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Save section
          </button>
        </div>
      ))}
    </div>
  );
}
