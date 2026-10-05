import type { ReactNode } from "react";

/**
 * Step title. Receives focus on step change (tabIndex -1) so screen-reader
 * and keyboard users land at the start of the new step.
 */
export function StepHeading({ index, title, description }: { index: number; title: string; description?: ReactNode }) {
  return (
    <div data-step-item>
      <p className="font-mono text-[0.75rem] text-care-deep tabular">
        <bdi dir="ltr">{String(index).padStart(2, "0")} / 05</bdi>
      </p>
      <h2 data-step-heading tabIndex={-1} className="mt-2 font-display text-[1.75rem] leading-snug text-ink sm:text-[2rem]">
        {title}
      </h2>
      {description && <p className="mt-2 text-[1rem] leading-7 text-muted">{description}</p>}
    </div>
  );
}

/** Back / continue row shared by every step. */
export function StepActions({ children }: { children: ReactNode }) {
  return (
    <div data-step-item className="mt-10 flex flex-wrap-reverse items-center justify-between gap-3 border-t border-line pt-6">
      {children}
    </div>
  );
}
