import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { daysBetween, formatDate, formatTime, relativeDay, toIsoDate } from "@/lib/dates";
import type { Availability } from "@/components/ui/StatusDot";
import type { NextAvailable } from "@/features/booking/services/availability";

/** Within this many days, a doctor reads as "available" rather than "later". */
const SOON_DAYS = 2;

export function availabilityStatus(next: NextAvailable | null, now: Date): Availability {
  if (!next) return "none";
  return daysBetween(toIsoDate(now), next.date) <= SOON_DAYS ? "available" : "later";
}

/** "اليوم • 4:30 م" · "غداً • 9:00 ص" · "الأحد 12 أكتوبر • 9:00 ص" */
export function nextSlotLabel(next: NextAvailable, now: Date, locale: Locale, dict: Dictionary): string {
  const today = toIsoDate(now);
  const diff = daysBetween(today, next.date);
  const day =
    diff <= 1
      ? relativeDay(next.date, today, locale, dict.common)
      : formatDate(next.date, locale, { weekday: "long", day: "numeric", month: "long" });
  return `${day} • ${formatTime(next.time, locale)}`;
}
