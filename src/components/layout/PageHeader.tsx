import type { ReactNode } from "react";
import { cn } from "@/lib/localized";
import { ArcMark } from "@/components/ui/ArcMark";
import { PageIntro } from "@/components/motion/PageIntro";

/** Header block for inner pages — clears the fixed site header and introduces the page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Task pages (booking) get a shorter header so the work starts above the fold. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative",
        compact
          ? "pb-8 pt-[calc(76px+1.75rem)] lg:pb-10 lg:pt-[calc(88px+2.5rem)]"
          : "pb-12 pt-[calc(76px+3.5rem)] lg:pb-16 lg:pt-[calc(88px+5rem)]",
        className,
      )}
    >
      <PageIntro className="container-site">
        <p data-intro className="text-eyebrow flex items-center gap-2.5">
          <ArcMark size={14} />
          {eyebrow}
        </p>
        <h1
          data-intro
          className={cn(
            "max-w-[20ch] text-ink",
            compact ? "mt-3 font-display text-[2rem] leading-snug sm:text-[2.5rem]" : "text-h1 mt-5",
          )}
        >
          {title}
        </h1>
        {description && (
          <p data-intro className={cn("max-w-[56ch] text-muted", compact ? "mt-2 text-[1rem] leading-7" : "text-lead mt-5")}>
            {description}
          </p>
        )}
        {children && (
          <div data-intro className="mt-8">
            {children}
          </div>
        )}
      </PageIntro>
    </header>
  );
}
