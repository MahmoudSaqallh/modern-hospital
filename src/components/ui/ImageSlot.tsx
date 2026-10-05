import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/localized";

/**
 * A reserved photography area. Until real imagery is supplied it renders a
 * quiet, intentional placeholder (the emblem's wave lines) with a caption
 * describing the photo that belongs there. Pass `src` to show the real image.
 */
export function ImageSlot({
  caption,
  slotLabel,
  src,
  alt = "",
  className,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  caption: string;
  slotLabel: string;
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <figure className={cn("relative overflow-hidden bg-sage", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <>
          <svg aria-hidden className="absolute inset-0 size-full text-line-strong" preserveAspectRatio="none" viewBox="0 0 400 300">
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M -10 ${150 + i * 16} C 90 ${120 + i * 16}, 160 ${185 + i * 16}, 260 ${150 + i * 16} S 380 ${128 + i * 16}, 420 ${148 + i * 16}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
                opacity={1 - i * 0.09}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <figcaption className="absolute bottom-0 start-0 flex items-center gap-2 bg-paper/85 px-3 py-2 text-meta">
            <ImageIcon aria-hidden strokeWidth={1.5} className="size-3.5" />
            <span>
              {slotLabel} — {caption}
            </span>
          </figcaption>
        </>
      )}
    </figure>
  );
}
