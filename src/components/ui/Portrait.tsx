import Image from "next/image";
import { cn } from "@/lib/localized";
import { arcPath } from "./ArcMark";

/** Strip the "د." / "Dr." honorific and return the first letter of the name. */
function initialOf(name: string): string {
  const clean = name.replace(/^(د\.|Dr\.)\s*/u, "").trim();
  return clean.charAt(0);
}

/**
 * Doctor portrait. Renders the real photo when available; otherwise a
 * restrained line-drawn placeholder with the doctor's initial (the large
 * variant adds a soft emblem arc so big image areas still feel composed).
 * Decorative — the doctor's name is always rendered as text beside it.
 */
export function Portrait({
  name,
  photo,
  className,
  sizes = "(min-width: 1024px) 25vw, 40vw",
  priority = false,
  large = false,
}: {
  name: string;
  photo?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  large?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-sage", className)}>
      <div
        data-portrait-inner
        className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.035] motion-reduce:transition-none"
      >
        {photo ? (
          <Image src={photo} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <>
            {large && (
              /* A wide, faint emblem arc behind the figure — a backdrop, not an outline of the head. */
              <svg aria-hidden viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
                <path d={arcPath(50, 78, 62, 105, 160)} fill="none" stroke="#169b3a" strokeOpacity="0.16" strokeWidth="0.8" strokeLinecap="round" />
                <path d={arcPath(50, 78, 62, 20, 75)} fill="none" stroke="#c9151e" strokeOpacity="0.13" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
            )}
            <svg aria-hidden viewBox="0 0 100 125" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 h-[86%] w-full">
              <circle cx="50" cy="47" r="16.5" fill="none" stroke="var(--color-line-strong)" strokeWidth="0.9" />
              <path d="M12 125c2.5-24 18-38 38-38s35.5 14 38 38" fill="none" stroke="var(--color-line-strong)" strokeWidth="0.9" />
              <path d="M43 87.5 50 99l7-11.5" fill="none" stroke="var(--color-line-strong)" strokeWidth="0.9" />
            </svg>
          </>
        )}
      </div>
      {!photo && (
        <span
          aria-hidden
          className={cn(
            "absolute start-3 top-2.5 font-display font-light leading-none text-care-deep/70",
            large ? "start-5 top-4 text-[2rem]" : "text-[1.35rem]",
          )}
        >
          {initialOf(name)}
        </span>
      )}
    </div>
  );
}
