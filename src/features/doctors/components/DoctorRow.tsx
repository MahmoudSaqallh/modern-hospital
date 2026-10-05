"use client";

import Link from "next/link";
import type { Doctor } from "@/features/doctors/types";
import { getClinic } from "@/data/clinics";
import { bookingHref } from "@/features/booking/links";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { Portrait } from "@/components/ui/Portrait";
import { buttonClasses } from "@/components/ui/Button";
import { DoctorNextSlot } from "./DoctorNextSlot";

/**
 * One line of the doctors roster: identity · department · next slot · book.
 * Columns align across rows like a clinic duty board.
 */
export function DoctorRow({
  doctor,
  now,
  active = false,
  showThumb = true,
  onActivate,
}: {
  doctor: Doctor;
  now: Date | null;
  active?: boolean;
  /** Hide the thumbnail where a featured portrait panel is shown instead. */
  showThumb?: boolean;
  onActivate?: () => void;
}) {
  const { locale, dict } = useI18n();
  const department = getClinic(doctor.clinicId);
  const profile = localePath(locale, `/doctors/${doctor.id}`);

  return (
    <li
      data-reveal
      onMouseEnter={onActivate}
      onFocusCapture={onActivate}
      className={cn(
        "group relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-line py-5 transition-colors duration-300 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_10rem] md:gap-x-6 md:px-4",
        active && "md:bg-white",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 start-0 hidden w-[2px] origin-top bg-care-deep transition-transform duration-500 md:block",
          active ? "scale-y-100" : "scale-y-0",
        )}
      />

      <div className="col-span-2 flex min-w-0 items-center gap-4 md:col-span-1">
        <Portrait
          name={doctor.name[locale]}
          photo={doctor.photo}
          className={cn("size-14 shrink-0 sm:size-16", !showThumb && "lg:hidden")}
          sizes="64px"
        />
        <div className="min-w-0">
          <Link
            href={profile}
            className="text-[1.0625rem] font-medium text-ink transition-colors hover:text-care-deep"
          >
            {doctor.name[locale]}
          </Link>
          <p className="truncate text-meta">{doctor.title[locale]}</p>
        </div>
      </div>

      <p className="hidden text-[0.9375rem] text-ink-2 md:block">{department?.name[locale]}</p>

      <DoctorNextSlot doctor={doctor} now={now} className="col-span-1 md:col-span-1" />

      <Link
        href={bookingHref(locale, { clinic: doctor.clinicId, doctor: doctor.id })}
        aria-label={`${dict.common.bookAppointment} — ${doctor.name[locale]}`}
        className={buttonClasses({
          variant: active ? "primary" : "secondary",
          size: "sm",
          className: "justify-self-end",
        })}
      >
        {dict.common.bookAppointment}
      </Link>
    </li>
  );
}
