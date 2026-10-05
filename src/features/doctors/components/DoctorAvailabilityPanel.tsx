"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Doctor } from "@/features/doctors/types";
import { DateStrip } from "@/features/booking/components/DateStrip";
import { TimeSlots } from "@/features/booking/components/TimeSlots";
import { useAvailability } from "@/features/booking/hooks/useAvailability";
import { bookingHref } from "@/features/booking/links";
import { dayHasAvailability } from "@/features/booking/services/availability";
import type { ClockTime, IsoDate } from "@/features/booking/types";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatTime, toIsoDate } from "@/lib/dates";
import { cn } from "@/lib/localized";
import { Button, buttonClasses, ForwardArrow } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { Skeleton } from "@/components/ui/Skeleton";
import { useClientNow } from "../hooks/useClientNow";

/**
 * Availability beside the profile: pick a day and time here, then continue
 * straight to the patient-details step with the slot pre-selected.
 */
export function DoctorAvailabilityPanel({ doctor }: { doctor: Doctor }) {
  const { locale, dict } = useI18n();
  const copy = dict.doctorProfile;
  const now = useClientNow();
  const { state, retry } = useAvailability(doctor.departmentId, doctor.id, now);
  const [pickedDate, setPickedDate] = useState<IsoDate | null>(null);
  const [time, setTime] = useState<ClockTime | null>(null);
  const labelId = useId();

  const days = state.status === "success" ? state.days : [];
  const firstAvailable = days.find(dayHasAvailability);
  const date = pickedDate ?? firstAvailable?.date ?? null;
  const day = days.find((d) => d.date === date);

  const href = bookingHref(locale, {
    department: doctor.departmentId,
    doctor: doctor.id,
    ...(date && time ? { date, time } : {}),
  });

  return (
    <section aria-labelledby={labelId} className="border border-line bg-white">
      <div aria-hidden className="flex h-[3px]">
        <span className="flex-[3] bg-care" />
        <span className="flex-[3] bg-medical" />
        <span className="flex-[2] bg-ink" />
      </div>
      <div className="p-5 sm:p-6">
        <h2 id={labelId} className="font-display text-[1.35rem] text-ink">
          {copy.availabilityTitle}
        </h2>
        <p className="mt-1 text-meta">{copy.availabilityDescription}</p>

        <div className="mt-6">
          {(state.status === "loading" || state.status === "idle") && (
            <div aria-busy="true">
              <p role="status" className="visually-hidden">
                {dict.booking.schedule.loading}
              </p>
              <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-[5.75rem] w-[4.75rem] shrink-0" />
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            </div>
          )}

          {state.status === "error" && (
            <Notice
              tone="error"
              title={dict.booking.schedule.error}
              action={
                <Button variant="secondary" size="sm" onClick={retry}>
                  {dict.common.retry}
                </Button>
              }
            >
              {dict.booking.schedule.errorHint}
            </Notice>
          )}

          {state.status === "success" && !firstAvailable && (
            <Notice tone="info" title={dict.booking.schedule.noDays}>
              {dict.booking.schedule.noDaysHint}
            </Notice>
          )}

          {state.status === "success" && firstAvailable && now && (
            <>
              <DateStrip
                days={days}
                selected={date}
                todayIso={toIsoDate(now)}
                labelledBy={labelId}
                onSelect={(d) => {
                  setPickedDate(d);
                  setTime(null);
                }}
              />
              <div className="mt-8">
                {day && dayHasAvailability(day) ? (
                  <TimeSlots day={day} selectedTime={time} onSelect={(slot) => setTime(slot.time)} />
                ) : (
                  <div className="border border-dashed border-line-strong px-5 py-6">
                    <p className="font-medium text-ink">{dict.booking.schedule.noSlots}</p>
                    <p className="mt-1 text-meta">{dict.booking.schedule.noSlotsHint}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-mist/60 p-5 sm:p-6">
        <p className={cn("text-[0.9375rem]", date && time ? "font-medium text-ink" : "text-muted")} aria-live="polite">
          {date && time
            ? `${formatDate(date, locale, { weekday: "long", day: "numeric", month: "long" })} • ${formatTime(time, locale)}`
            : copy.pickSlot}
        </p>
        <Link href={href} className={buttonClasses({ size: "lg", className: "mt-4 w-full" })}>
          <span>{date && time ? copy.bookSelected : copy.bookGeneral}</span>
          <ForwardArrow />
        </Link>
      </div>
    </section>
  );
}
