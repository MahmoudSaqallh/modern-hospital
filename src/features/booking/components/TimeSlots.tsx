"use client";

import { useId } from "react";
import type { ClinicSession } from "@/features/doctors/types";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { formatTime, formatTimeShort } from "@/lib/dates";
import { cn } from "@/lib/localized";
import type { AppointmentSlot, ClockTime, DayAvailability } from "../types";

const SESSIONS: ClinicSession[] = ["morning", "evening"];

/** Times for one day, grouped by morning / evening. Booked times stay visible but disabled. */
export function TimeSlots({
  day,
  selectedTime,
  onSelect,
}: {
  day: DayAvailability;
  selectedTime: ClockTime | null;
  onSelect: (slot: AppointmentSlot) => void;
}) {
  const { locale, dict } = useI18n();
  const baseId = useId();
  const groups = SESSIONS.map((session) => ({
    session,
    slots: day.slots.filter((slot) => slot.session === session),
  })).filter((group) => group.slots.length > 0);

  return (
    <div className="space-y-8">
      {groups.map(({ session, slots }) => {
        const headingId = `${baseId}-${session}`;
        const free = slots.filter((s) => s.available).length;
        return (
          <div key={session} role="group" aria-labelledby={headingId}>
            <div className="flex items-baseline justify-between border-b border-line pb-2">
              <h4 id={headingId} className="font-medium text-ink">
                {dict.common[session]}
              </h4>
              <span className="text-meta tabular">{plural(dict.common.slotsCount, free, locale)}</span>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {slots.map((slot) => {
                const isSelected = slot.time === selectedTime && slot.available;
                return (
                  <li key={slot.time}>
                    <button
                      type="button"
                      disabled={!slot.available}
                      aria-pressed={slot.available ? isSelected : undefined}
                      aria-label={`${formatTime(slot.time, locale)}${slot.available ? "" : ` — ${dict.booking.schedule.booked}`}`}
                      onClick={() => onSelect(slot)}
                      className={cn(
                        "flex h-12 w-full items-center justify-center border text-[1rem] tabular transition-[background-color,border-color,color] duration-200",
                        isSelected && "border-care-deep bg-care-deep font-medium text-white",
                        !isSelected && slot.available && "border-line-strong bg-white text-ink hover:border-care-deep hover:text-care-deep",
                        !slot.available && "cursor-not-allowed border-line bg-mist/60 text-muted/60 line-through decoration-1",
                      )}
                    >
                      {formatTimeShort(slot.time)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
