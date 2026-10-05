"use client";

import { CalendarDays, Clock3, Stethoscope, UserRound, type LucideIcon } from "lucide-react";
import { getClinic } from "@/data/clinics";
import { getDoctor } from "@/data/doctors";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatTime } from "@/lib/dates";
import { cn } from "@/lib/localized";
import type { BookingState } from "../hooks/bookingState";
import { ANY_DOCTOR } from "../types";

function useSummaryRows(state: BookingState) {
  const { locale, dict } = useI18n();
  const copy = dict.booking;
  const clinic = getClinic(state.clinicId);
  const doctor = getDoctor(state.assignedDoctorId ?? (state.doctorChoice !== ANY_DOCTOR ? state.doctorChoice : null));
  const doctorLabel = doctor
    ? doctor.name[locale]
    : state.doctorChoice === ANY_DOCTOR
      ? copy.summary.anyDoctor
      : null;

  const rows: Array<{ key: string; icon: LucideIcon; label: string; value: string | null }> = [
    { key: "clinic", icon: Stethoscope, label: copy.review.clinic, value: clinic?.name[locale] ?? null },
    { key: "doctor", icon: UserRound, label: copy.review.doctor, value: doctorLabel },
    {
      key: "date",
      icon: CalendarDays,
      label: copy.review.date,
      value: state.date ? formatDate(state.date, locale, { weekday: "long", day: "numeric", month: "long" }) : null,
    },
    { key: "time", icon: Clock3, label: copy.review.time, value: state.time ? formatTime(state.time, locale) : null },
  ];
  return rows;
}

/** Desktop rail: the appointment taking shape, styled as a clinic slip. */
export function BookingSummary({ state }: { state: BookingState }) {
  const { dict } = useI18n();
  const rows = useSummaryRows(state);

  return (
    <aside aria-labelledby="booking-summary-title" className="sticky top-28 border border-line bg-white">
      <div aria-hidden className="flex h-[3px]">
        <span className="flex-[3] bg-care" />
        <span className="flex-[3] bg-medical" />
        <span className="flex-[2] bg-ink" />
      </div>
      <div className="p-6">
        <h2 id="booking-summary-title" className="text-eyebrow">
          {dict.booking.summary.title}
        </h2>
        <dl className="mt-5 space-y-5">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.key} className="flex gap-3.5">
                <Icon
                  aria-hidden
                  strokeWidth={1.5}
                  className={cn("mt-0.5 size-[1.1rem] shrink-0", row.value ? "text-care-deep" : "text-muted/50")}
                />
                <div className="min-w-0">
                  <dt className="text-[0.8125rem] text-muted">{row.label}</dt>
                  <dd className={cn("mt-0.5 text-[0.9375rem]", row.value ? "font-medium text-ink tabular" : "text-muted/70")}>
                    {row.value ?? dict.booking.summary.empty}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
      <div className="border-t border-dashed border-line-strong px-6 py-4 text-meta">{dict.booking.details.privacyTitle}</div>
    </aside>
  );
}

/** Mobile: the same selections as one compact line under the progress bar. */
export function BookingSummaryInline({ state }: { state: BookingState }) {
  const rows = useSummaryRows(state).filter((row) => row.value);
  if (rows.length === 0) return null;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-ink-2 lg:hidden">
      {rows.map((row, i) => (
        <span key={row.key} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="size-1 rounded-full bg-line-strong" />}
          <span className="tabular">{row.value}</span>
        </span>
      ))}
    </p>
  );
}
