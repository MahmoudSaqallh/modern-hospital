"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import type { ProjectImage } from "@/features/projects/types";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, format } from "@/lib/localized";
import { ImageSlot } from "@/components/ui/ImageSlot";

/**
 * Project gallery: one large image, thumbnails beneath. Changing image
 * cross-fades with a slight scale; arrows follow reading direction.
 */
export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const { locale, dir, dict } = useI18n();
  const copy = dict.projects;
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [index, setIndex] = useState(0);
  const count = images.length;

  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        gsap.fromTo("[data-gallery-current]", { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
      });
    },
    { scope: stage, dependencies: [index] },
  );

  if (count === 0) return null;
  const go = (next: number) => setIndex((next + count) % count);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward) go(index + 1);
    if (e.key === backward) go(index - 1);
  };
  const current = images[index];
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div onKeyDown={onKeyDown}>
      <div ref={stage} className="relative overflow-hidden">
        <div key={index} data-gallery-current>
          <ImageSlot src={current.src} caption={current.caption[locale]} slotLabel={dict.common.imageSlot} className="aspect-[16/10] w-full" />
        </div>
        {count > 1 && (
          <div className="absolute end-3 top-3 flex gap-1">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="flex size-10 items-center justify-center border border-line bg-paper/95 text-ink hover:bg-white"
            >
              <PrevIcon aria-hidden strokeWidth={1.5} className="size-5" />
              <span className="visually-hidden">{copy.galleryPrev}</span>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="flex size-10 items-center justify-center border border-line bg-paper/95 text-ink hover:bg-white"
            >
              <NextIcon aria-hidden strokeWidth={1.5} className="size-5" />
              <span className="visually-hidden">{copy.galleryNext}</span>
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-meta" aria-live="polite">
        {current.caption[locale]} · <bdi dir="ltr">{index + 1} / {count}</bdi>
      </p>
      {count > 1 && (
        <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={format(copy.galleryItem, { index: i + 1, total: count })}
                className={cn(
                  "block w-full overflow-hidden border-2 transition-colors",
                  i === index ? "border-care-deep" : "border-transparent hover:border-line-strong",
                )}
              >
                <ImageSlot
                  src={image.src}
                  caption={image.caption[locale]}
                  slotLabel={dict.common.imageSlot}
                  className="aspect-[4/3] w-full [&_figcaption]:hidden"
                  sizes="120px"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
