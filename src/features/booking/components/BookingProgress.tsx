"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { format, cn } from "@/lib/localized";
import { BOOKING_STEPS, type BookingStep } from "../hooks/bookingState";

/**
 * Desktop: five numbered steps on one rule; completed steps are buttons for
 * going back. Mobile: "Step 2 of 5 — Doctor" with a segmented bar.
 */
export function BookingProgress({
  current,
  maxReachable,
  onSelect,
}: {
  current: BookingStep;
  maxReachable: BookingStep;
  onSelect: (step: BookingStep) => void;
}) {
  const { dict } = useI18n();
  const labels = dict.booking.steps;
  const total = BOOKING_STEPS.length;

  return (
    <nav aria-label={dict.booking.progressLabel}>
      {/* Mobile */}
      <div className="md:hidden">
        <p className="flex items-baseline justify-between text-[0.9375rem]">
          <span className="font-medium text-ink">{labels[BOOKING_STEPS[current - 1]]}</span>
          <span className="text-meta tabular">{format(dict.booking.stepOf, { current, total })}</span>
        </p>
        <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden>
          {BOOKING_STEPS.map((key, i) => (
            <span
              key={key}
              className={cn(
                "h-1 transition-colors duration-500",
                i + 1 < current ? "bg-care-deep" : i + 1 === current ? "bg-care" : "bg-line",
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden grid-cols-5 border-t border-line md:grid">
        {BOOKING_STEPS.map((key, i) => {
          const step = (i + 1) as BookingStep;
          const done = step < current;
          const isCurrent = step === current;
          const reachable = step <= maxReachable && !isCurrent;
          const content = (
            <>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 -top-px h-[2px] transition-[transform,background-color] duration-500 ease-[var(--ease-out-quart)]",
                  isCurrent ? "scale-x-100 bg-care-deep" : done ? "scale-x-100 bg-care/40" : "scale-x-0 bg-line",
                  "origin-left rtl:origin-right",
                )}
              />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[0.75rem] tabular transition-colors duration-300",
                  isCurrent && "border-care-deep bg-care-deep text-white",
                  done && "border-care/40 bg-care-tint text-care-deep",
                  !isCurrent && !done && "border-line-strong text-muted",
                )}
              >
                {done ? <Check strokeWidth={2} className="size-3.5" /> : String(step).padStart(2, "0")}
              </span>
              <span className={cn("text-[0.9375rem]", isCurrent ? "font-medium text-ink" : done ? "text-ink-2" : "text-muted")}>
                {labels[key]}
              </span>
            </>
          );
          return (
            <li key={key} className="relative">
              {reachable ? (
                <button
                  type="button"
                  onClick={() => onSelect(step)}
                  className="relative flex w-full items-center gap-3 py-4 text-start transition-colors hover:bg-mist/70"
                >
                  {content}
                  {done && <span className="visually-hidden">({dict.common.edit})</span>}
                </button>
              ) : (
                <span aria-current={isCurrent ? "step" : undefined} className="relative flex items-center gap-3 py-4">
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
