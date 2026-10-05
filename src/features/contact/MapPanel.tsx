import { MapPin, Minus, Navigation, Plus } from "lucide-react";
import { directionsHref, organization } from "@/config/organization";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { ArcMark } from "@/components/ui/ArcMark";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Map area. With a confirmed location it embeds OpenStreetMap (no API key,
 * no tracking script) and links to turn-by-turn directions. Without one, it
 * shows a calm placeholder — never invented coordinates.
 */
export function MapPanel({ locale, dict, className }: { locale: Locale; dict: Dictionary; className?: string }) {
  const location = organization.contact.location;
  const address = organization.contact.address?.[locale];
  const copy = dict.contact;

  return (
    <figure className={cn("relative flex flex-col overflow-hidden border border-line bg-sage", className)}>
      <div className="relative min-h-[18rem] flex-1">
        {location ? (
          <iframe
            title={copy.mapTitle}
            className="absolute inset-0 size-full border-0 grayscale-[35%]"
            loading="lazy"
            referrerPolicy="no-referrer"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.008}%2C${location.lat - 0.005}%2C${location.lng + 0.008}%2C${location.lat + 0.005}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
          />
        ) : (
          <>
            {/* Abstract cartography — deliberately not any real place. */}
            <svg aria-hidden className="absolute inset-0 size-full text-line-strong" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 480">
              <g fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M-20 120 C 80 100, 160 160, 240 130 S 380 90, 430 120" />
                <path d="M-20 300 C 60 280, 140 330, 220 300 S 360 250, 430 280" />
                <path d="M120 -20 C 110 100, 150 200, 130 300 S 140 420, 120 500" />
                <path d="M300 -20 C 320 80, 280 220, 310 330 S 290 440, 300 500" />
              </g>
              <g fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6">
                {Array.from({ length: 6 }, (_, i) => (
                  <ellipse key={i} cx="210" cy="215" rx={40 + i * 26} ry={28 + i * 19} />
                ))}
              </g>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="relative flex size-20 items-center justify-center rounded-full border border-dashed border-ink/25 bg-paper/80">
                <ArcMark size={30} strokeWidth={2.2} />
              </span>
            </div>
          </>
        )}

        {/* The embedded map brings its own zoom controls; the placeholder shows where they live. */}
        {!location && (
          <div aria-hidden className="absolute end-3 top-3 flex flex-col border border-line bg-paper text-muted/60">
            <span className="flex size-10 items-center justify-center border-b border-line">
              <Plus strokeWidth={1.5} className="size-4" />
            </span>
            <span className="flex size-10 items-center justify-center">
              <Minus strokeWidth={1.5} className="size-4" />
            </span>
          </div>
        )}
      </div>

      <figcaption className="flex flex-col gap-4 border-t border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MapPin aria-hidden strokeWidth={1.5} className="mt-1 size-5 shrink-0 text-medical" />
          <div>
            <p className="font-medium text-ink">{copy.mapTitle}</p>
            <p className="text-[0.9375rem] leading-7 text-muted">{address ?? copy.mapPending}</p>
          </div>
        </div>
        {location ? (
          <a
            href={directionsHref(location)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ size: "md", className: "shrink-0" })}
          >
            <Navigation aria-hidden strokeWidth={1.5} className="size-4" />
            <span>{copy.directions}</span>
            <span className="visually-hidden">({dict.a11y.opensExternal})</span>
          </a>
        ) : (
          <span aria-disabled="true" className={buttonClasses({ variant: "secondary", size: "md", className: "shrink-0" })}>
            <Navigation aria-hidden strokeWidth={1.5} className="size-4" />
            <span>{copy.directions}</span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
