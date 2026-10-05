"use client";

import { useMemo } from "react";
import { getDepartment } from "@/data/departments";
import { doctors, getDoctor } from "@/data/doctors";
import { findNextAvailable } from "@/features/booking/services/availability";
import { bookingHref } from "@/features/booking/links";
import { nextSlotLabel } from "@/features/doctors/availability";
import { useClientNow } from "@/features/doctors/hooks/useClientNow";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { localePath } from "@/i18n/config";
import { StatusDot } from "@/components/ui/StatusDot";
import { Skeleton } from "@/components/ui/Skeleton";
import { TextLink } from "@/components/ui/Button";

/**
 * Live "next available appointment" line — the hero shows a real, bookable
 * time instead of a stock photo.
 */
export function NextSlotWidget({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const now = useClientNow();
  const next = useMemo(() => (now ? findNextAvailable(doctors, now) : null), [now]);
  const doctor = getDoctor(next?.doctorId);
  const department = getDepartment(doctor?.departmentId);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border-s-2 border-care-deep bg-paper/85 py-3 ps-4 pe-5", className)}>
      <span className="flex items-center gap-2.5 text-meta">
        <StatusDot status={next ? "available" : "none"} />
        {dict.hero.nextSlot.label}
      </span>
      {now === null ? (
        <span className="flex items-center gap-3" aria-busy="true">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </span>
      ) : next && doctor && department ? (
        <>
          <span className="text-[0.9375rem] font-medium text-ink tabular" aria-live="polite">
            {nextSlotLabel(next, now, locale, dict)}
            <span className="font-normal text-muted"> — {doctor.name[locale]}</span>
          </span>
          <TextLink
            className="text-[0.875rem] text-care-deep"
            href={bookingHref(locale, { department: department.id, doctor: doctor.id, date: next.date, time: next.time })}
          >
            {dict.hero.nextSlot.cta}
          </TextLink>
        </>
      ) : (
        <TextLink className="text-[0.875rem]" href={localePath(locale, "/booking")}>
          {dict.hero.nextSlot.noneCta}
        </TextLink>
      )}
    </div>
  );
}
