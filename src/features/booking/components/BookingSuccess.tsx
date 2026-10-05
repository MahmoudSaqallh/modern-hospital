"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CalendarPlus } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { playSuccess } from "@/animations/booking";
import { MEDIA } from "@/animations/motion";
import { getClinic } from "@/data/clinics";
import { getDoctor } from "@/data/doctors";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatTime } from "@/lib/dates";
import { format } from "@/lib/localized";
import { arcPath, ARC_SEGMENTS } from "@/components/ui/ArcMark";
import { Button, buttonClasses } from "@/components/ui/Button";
import { buildCalendarFile, downloadCalendarFile } from "../services/calendarFile";
import type { Appointment } from "../types";
import { normalizePhone } from "../validation/patient";

export function BookingSuccess({
  appointment,
  phone,
  onBookAnother,
}: {
  appointment: Appointment;
  phone: string;
  onBookAnother: () => void;
}) {
  const { locale, dict } = useI18n();
  const copy = dict.booking.success;
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const doctor = getDoctor(appointment.doctorId);
  const clinic = getClinic(appointment.clinicId);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (root.current) playSuccess(root.current);
      });
    },
    { scope: root },
  );

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const addToCalendar = () => {
    const doctorName = doctor?.name[locale] ?? "";
    const clinicName = clinic?.name[locale] ?? "";
    const file = buildCalendarFile({
      uid: appointment.reference,
      date: appointment.date,
      time: appointment.time,
      durationMinutes: 30,
      title: format(copy.calendarTitle, { clinic: clinicName }),
      description: format(copy.calendarDescription, { doctor: doctorName, reference: appointment.reference }),
    });
    downloadCalendarFile(`${appointment.reference}.ics`, file);
  };

  const details = [
    { label: dict.booking.review.doctor, value: doctor?.name[locale] },
    { label: dict.booking.review.clinic, value: clinic?.name[locale] },
    {
      label: dict.booking.review.date,
      value: formatDate(appointment.date, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    },
    { label: dict.booking.review.time, value: formatTime(appointment.time, locale) },
  ];

  return (
    <div ref={root} className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center text-center">
        <svg viewBox="0 0 120 120" className="size-28" fill="none" aria-hidden>
          {ARC_SEGMENTS.map((segment) => (
            <path
              key={segment.key}
              data-success-arc
              d={arcPath(60, 60, 54, segment.from, segment.to)}
              className={segment.className}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
          <path data-success-check d="M40 61.5 54 75l27-30" className="stroke-care-deep" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h2 ref={heading} tabIndex={-1} data-success-item className="mt-8 font-display text-[2rem] leading-snug text-ink sm:text-[2.4rem]">
          {copy.title}
        </h2>
        <p data-success-item className="mt-3 max-w-[48ch] text-lead text-muted">
          {format(copy.description, { phone: "⁦" + normalizePhone(phone) + "⁩" })}
        </p>
      </div>

      <div data-success-item className="mt-10 border border-line bg-white">
        <div className="flex flex-col items-center gap-1 border-b border-dashed border-line-strong px-6 py-6 text-center">
          <span className="text-meta">{copy.reference}</span>
          <span dir="ltr" className="font-mono text-[1.6rem] font-medium tracking-[0.06em] text-ink">
            {appointment.reference}
          </span>
          <span className="text-meta">{copy.keepReference}</span>
        </div>
        <dl className="grid sm:grid-cols-2">
          {details.map((item, i) => (
            <div key={item.label} className={`border-line px-6 py-4 ${i < 2 ? "border-b" : "border-b sm:border-b-0"} ${i % 2 === 0 ? "sm:border-e" : ""}`}>
              <dt className="text-meta">{item.label}</dt>
              <dd className="mt-0.5 font-medium text-ink tabular">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p data-success-item className="mt-6 text-center text-meta">
        {copy.arrive}
      </p>

      <div data-success-item className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Button variant="secondary" onClick={addToCalendar} icon={<CalendarPlus aria-hidden strokeWidth={1.5} className="size-4" />}>
          {copy.calendar}
        </Button>
        <Button variant="secondary" onClick={onBookAnother}>
          {copy.another}
        </Button>
        <Link href={localePath(locale)} className={buttonClasses({ className: "sm:ms-2" })}>
          {copy.home}
        </Link>
      </div>
    </div>
  );
}
