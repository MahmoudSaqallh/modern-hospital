import type { ReactNode } from "react";
import { cn } from "@/lib/localized";
import { ArcMark } from "./ArcMark";

/**
 * Section opener: emblem mark · index · eyebrow, then a display heading.
 * Uses `data-reveal` hooks so a parent <Reveal> can choreograph it.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
  id,
  tone = "light",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        <p data-reveal className={cn("text-eyebrow flex items-center gap-2.5", dark && "text-white/60")}>
          <ArcMark size={14} className={dark ? "[&_.stroke-ink]:stroke-white/80" : undefined} />
          {index && <span className="font-mono text-[0.75rem] tabular">{index}</span>}
          {index && <span aria-hidden className={cn("h-px w-5", dark ? "bg-white/25" : "bg-line-strong")} />}
          <span>{eyebrow}</span>
        </p>
        <h2 id={id} data-reveal="mask" className={cn("text-h2 mt-4", dark ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {description && (
          <p data-reveal className={cn("text-lead mt-4 max-w-[54ch]", dark ? "text-white/70" : "text-muted")}>
            {description}
          </p>
        )}
      </div>
      {action && (
        <div data-reveal className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
