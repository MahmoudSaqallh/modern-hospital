"use client";

import { organization } from "@/config/organization";
import { useClientNow } from "@/features/doctors/hooks/useClientNow";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";

/** Working hours as a ruled table; today's row is marked once the client clock is known. */
export function HoursTable({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { locale, dict } = useI18n();
  const now = useClientNow();
  const today = now?.getDay();
  const dark = tone === "dark";

  return (
    <dl className={cn("border-t", dark ? "border-white/15" : "border-ink/15", className)}>
      {organization.workingHours.map((row) => {
        const isToday = today !== undefined && row.days.includes(today);
        return (
          <div
            key={row.label.en}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-b py-5",
              dark ? "border-white/15" : "border-line",
            )}
          >
            <dt className={cn("flex items-center gap-2.5", dark ? "text-white/80" : "text-ink-2")}>
              {row.label[locale]}
              {isToday && (
                <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-care-deep">
                  <span aria-hidden className="size-1.5 rounded-full bg-care" />
                  {dict.hours.today}
                </span>
              )}
            </dt>
            <dd className={cn("font-medium tabular", dark ? "text-white" : "text-ink")}>{row.hours[locale]}</dd>
            {row.note && <dd className="col-span-2 text-meta">{row.note[locale]}</dd>}
          </div>
        );
      })}
    </dl>
  );
}
