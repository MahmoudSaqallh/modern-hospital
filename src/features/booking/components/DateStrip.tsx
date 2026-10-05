"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/localized";
import { plural } from "@/i18n/plural";
import { dayHasAvailability } from "../services/availability";
import type { DayAvailability, IsoDate } from "../types";

/**
 * Horizontal two-week date strip.
 * Keyboard: one tab stop (roving tabindex); arrow keys move along the reading
 * direction, Home/End jump to the ends, Enter/Space selects. Unavailable days
 * stay focusable (aria-disabled) so their status is still announced.
 */
export function DateStrip({
  days,
  selected,
  todayIso,
  labelledBy,
  onSelect,
}: {
  days: DayAvailability[];
  selected: IsoDate | null;
  todayIso: IsoDate;
  labelledBy: string;
  onSelect: (date: IsoDate) => void;
}) {
  const { locale, dir, dict } = useI18n();
  const copy = dict.booking.schedule;
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = days.findIndex((d) => d.date === selected);
  const [focusIndex, setFocusIndex] = useState(Math.max(selectedIndex, 0));
  const tabStop = selectedIndex >= 0 ? selectedIndex : Math.min(focusIndex, days.length - 1);

  const focusAt = (index: number) => {
    const next = Math.min(Math.max(index, 0), days.length - 1);
    setFocusIndex(next);
    const button = buttons.current[next];
    button?.focus();
    button?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const current = buttons.current.findIndex((b) => b === document.activeElement);
    if (current < 0) return;
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const moves: Record<string, number> = { [forward]: current + 1, [backward]: current - 1, Home: 0, End: days.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      focusAt(moves[event.key]);
    }
  };

  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const sign = dir === "rtl" ? -1 : 1;
    el.scrollBy({ left: direction * sign * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="relative">
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => page(-1)}
          className="hidden w-10 shrink-0 items-center justify-center border border-line text-ink-2 transition-colors hover:bg-white sm:flex"
        >
          <PrevIcon aria-hidden strokeWidth={1.5} className="size-5" />
          <span className="visually-hidden">{copy.prevDays}</span>
        </button>

        <div ref={scroller} className="min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul role="list" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="flex gap-2 py-1">
            {days.map((day, i) => {
              const available = dayHasAvailability(day);
              const isSelected = day.date === selected;
              const isToday = day.date === todayIso;
              const freeCount = day.slots.filter((s) => s.available).length;
              const status = day.closed ? copy.closed : available ? plural(dict.common.slotsCount, freeCount, locale) : copy.full;
              return (
                <li key={day.date} className="snap-start">
                  <button
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    type="button"
                    tabIndex={i === tabStop ? 0 : -1}
                    aria-pressed={isSelected}
                    aria-disabled={!available}
                    aria-label={`${isToday ? `${dict.common.today}${locale === "ar" ? "،" : ","} ` : ""}${formatDate(day.date, locale)} — ${status}`}
                    onFocus={() => setFocusIndex(i)}
                    onClick={() => available && onSelect(day.date)}
                    className={cn(
                      "relative flex h-[5.75rem] w-[4.75rem] flex-col items-center justify-center gap-0.5 border transition-[background-color,border-color,color] duration-200",
                      isSelected && "border-care-deep bg-care-deep text-white",
                      !isSelected && available && "border-line-strong bg-white text-ink hover:border-care-deep",
                      !available && "cursor-not-allowed border-line bg-mist/60 text-muted/70",
                    )}
                  >
                    {isToday && (
                      <span
                        className={cn(
                          "absolute inset-x-0 top-0 h-[3px]",
                          isSelected ? "bg-white/70" : "bg-medical",
                        )}
                        aria-hidden
                      />
                    )}
                    <span className={cn("text-[0.75rem]", isSelected ? "text-white/80" : "text-muted")}>
                      {isToday ? dict.common.today : formatDate(day.date, locale, { weekday: "short" })}
                    </span>
                    <span className={cn("font-display text-[1.45rem] leading-none tabular", !available && "line-through decoration-1")}>
                      {formatDate(day.date, locale, { day: "numeric" })}
                    </span>
                    <span className={cn("text-[0.6875rem]", isSelected ? "text-white/80" : "text-muted")}>
                      {formatDate(day.date, locale, { month: "short" })}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 size-1.5 rounded-full",
                        available ? (isSelected ? "bg-white" : "bg-care") : "bg-transparent",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => page(1)}
          className="hidden w-10 shrink-0 items-center justify-center border border-line text-ink-2 transition-colors hover:bg-white sm:flex"
        >
          <NextIcon aria-hidden strokeWidth={1.5} className="size-5" />
          <span className="visually-hidden">{copy.nextDays}</span>
        </button>
      </div>

      <ul aria-hidden className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-muted">
        <li className="flex items-center gap-2">
          <span className="size-3 border border-line-strong bg-white" />
          {copy.legendAvailable}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 border border-line bg-mist" />
          {copy.legendUnavailable}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 bg-care-deep" />
          {copy.legendSelected}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-[3px] w-3 bg-medical" />
          {dict.common.today}
        </li>
      </ul>
    </div>
  );
}
