"use client";

import { useMemo } from "react";
import type { Doctor } from "@/features/doctors/types";
import { findNextAvailable } from "@/features/booking/services/availability";
import { availabilityStatus, nextSlotLabel } from "@/features/doctors/availability";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { StatusDot } from "@/components/ui/StatusDot";
import { Skeleton } from "@/components/ui/Skeleton";

/** Status dot + "next available" text, computed on the client clock. */
export function DoctorNextSlot({ doctor, now, className }: { doctor: Doctor; now: Date | null; className?: string }) {
  const { locale, dict } = useI18n();
  const next = useMemo(() => (now ? findNextAvailable([doctor], now) : null), [doctor, now]);

  if (!now) {
    return (
      <span className={cn("flex flex-col gap-1.5", className)} aria-hidden>
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-32" />
      </span>
    );
  }

  const status = availabilityStatus(next, now);
  return (
    <span className={cn("flex flex-col", className)}>
      <span className="flex items-center gap-2 text-meta">
        <StatusDot status={status} />
        {status === "none" ? dict.doctorsSection.limited : dict.common.nextAvailable}
      </span>
      {next && <span className="mt-0.5 text-[0.9375rem] font-medium text-ink tabular">{nextSlotLabel(next, now, locale, dict)}</span>}
    </span>
  );
}
