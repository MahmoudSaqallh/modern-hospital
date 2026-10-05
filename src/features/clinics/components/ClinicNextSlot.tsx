"use client";

import { useMemo } from "react";
import { getDoctorsByClinic } from "@/data/doctors";
import { findNextAvailable } from "@/features/booking/services/availability";
import { availabilityStatus, nextSlotLabel } from "@/features/doctors/availability";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { StatusDot } from "@/components/ui/StatusDot";
import { Skeleton } from "@/components/ui/Skeleton";

/** Nearest bookable time across all of a clinic's doctors, on the patient's clock. */
export function ClinicNextSlot({ clinicId, now, className }: { clinicId: string; now: Date | null; className?: string }) {
  const { locale, dict } = useI18n();
  const next = useMemo(() => (now ? findNextAvailable(getDoctorsByClinic(clinicId), now) : null), [clinicId, now]);

  if (!now) {
    return (
      <span className={cn("flex flex-col gap-1.5", className)} aria-hidden>
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-4 w-36" />
      </span>
    );
  }

  const status = availabilityStatus(next, now);
  return (
    <span className={cn("flex flex-col", className)}>
      <span className="flex items-center gap-2 text-meta">
        <StatusDot status={status} />
        {next ? dict.clinicsPage.nextSlot : dict.clinicsPage.noSlots}
      </span>
      {next && <span className="mt-0.5 text-[0.9375rem] font-medium text-ink tabular">{nextSlotLabel(next, now, locale, dict)}</span>}
    </span>
  );
}
