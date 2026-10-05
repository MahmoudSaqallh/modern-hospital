import Link from "next/link";
import type { Department } from "@/features/departments/types";
import { getDoctorsByDepartment } from "@/data/doctors";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { plural } from "@/i18n/plural";
import { bookingHref } from "@/features/booking/links";
import { cn } from "@/lib/localized";
import { DepartmentIcon } from "@/components/icons/DepartmentIcon";
import { ForwardArrow } from "@/components/ui/Button";

/**
 * Departments as one ruled grid — cells share hairlines instead of floating
 * as separate cards. Hover/focus draws a thin top line and lifts the icon.
 */
export function DepartmentGrid({
  departments,
  locale,
  dict,
  detailed = false,
  className,
}: {
  departments: Department[];
  locale: Locale;
  dict: Dictionary;
  /** Show the long description (departments page). */
  detailed?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid border-s border-t border-line sm:grid-cols-2",
        detailed ? "lg:grid-cols-3" : "lg:grid-cols-5",
        className,
      )}
    >
      {departments.map((department) => {
        const count = getDoctorsByDepartment(department.id).length;
        const urgent = department.urgent;
        return (
          <li
            key={department.id}
            id={detailed ? department.id : undefined}
            data-reveal
            className="group relative scroll-mt-28 border-b border-e border-line transition-colors duration-300 hover:bg-white focus-within:bg-white"
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 -top-px h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-x-100 group-focus-within:scale-x-100 rtl:origin-right",
                urgent ? "bg-medical" : "bg-care-deep",
              )}
            />
            <div className={cn("flex h-full flex-col p-5 sm:p-6", detailed && "lg:p-8")}>
              <div className="flex items-start justify-between gap-3">
                <DepartmentIcon
                  name={department.icon}
                  size={detailed ? 30 : 26}
                  className={cn(
                    "transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:-translate-y-0.5",
                    urgent ? "text-medical" : "text-care-deep",
                  )}
                />
                {!urgent && (
                  <span className="text-meta tabular">{plural(dict.common.doctorsCount, count, locale)}</span>
                )}
              </div>

              <h3 className={cn("text-h3 text-ink", detailed ? "mt-10" : "mt-7")}>{department.name[locale]}</h3>
              <p className="mt-1 text-[0.9375rem] leading-7 text-muted">
                {detailed ? department.description[locale] : department.summary[locale]}
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-[0.9375rem]">
                {department.bookable ? (
                  <>
                    <Link
                      href={bookingHref(locale, { department: department.id })}
                      className="group/btn inline-flex min-h-10 items-center gap-1.5 font-medium text-care-deep"
                      aria-label={`${dict.departmentsSection.book} — ${department.name[locale]}`}
                    >
                      {dict.departmentsSection.book}
                      <ForwardArrow />
                    </Link>
                    <Link
                      href={`${localePath(locale, "/doctors")}?department=${department.id}`}
                      className="inline-flex min-h-10 items-center text-ink-2 underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink"
                      aria-label={`${dict.departmentsSection.doctors} — ${department.name[locale]}`}
                    >
                      {dict.departmentsSection.doctors}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={localePath(locale, "/contact")}
                      className="group/btn inline-flex min-h-10 items-center gap-1.5 font-medium text-medical"
                    >
                      {dict.departmentsSection.urgentAction}
                      <ForwardArrow />
                    </Link>
                    <span className="text-meta">{dict.departmentsSection.notBookable}</span>
                  </>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
