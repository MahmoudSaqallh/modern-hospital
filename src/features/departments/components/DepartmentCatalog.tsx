import Link from "next/link";
import { getClinic } from "@/data/clinics";
import { departmentsByCategory } from "@/data/departments";
import type { DepartmentCategory } from "@/features/departments/types";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { MedicalIcon } from "@/components/icons/MedicalIcon";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";

/**
 * Detailed department listings. The two categories use different
 * structures on purpose: therapeutic departments as wide rows (role,
 * services, related clinics), supporting departments as a ruled grid on a
 * quieter surface.
 */
export function DepartmentCatalog({
  category,
  locale,
  dict,
}: {
  category: DepartmentCategory;
  locale: Locale;
  dict: Dictionary;
}) {
  const copy = dict.departmentsPage;
  const group = copy[category];
  const list = departmentsByCategory(category);
  const therapeutic = category === "therapeutic";

  return (
    <Reveal
      as="section"
      aria-labelledby={`${category}-title`}
      className={cn("relative py-20 lg:py-28", therapeutic ? "border-t border-line" : "border-y border-line bg-mist/80")}
      stagger={0.05}
    >
      <div className="container-site">
        <div className="max-w-2xl">
          <p data-reveal className={cn("text-eyebrow flex items-center gap-2.5", therapeutic ? "text-care-deep" : "text-ink-2")}>
            <ArcMark size={14} />
            {group.short}
          </p>
          <h2 id={`${category}-title`} data-reveal="mask" className="text-h2 mt-4 text-ink">
            {group.title}
          </h2>
          <p data-reveal className="text-lead mt-4 text-muted">
            {group.text}
          </p>
        </div>

        {therapeutic ? (
          <ol className="mt-12 border-t border-ink/15">
            {list.map((department) => (
              <li
                key={department.id}
                id={department.id}
                data-reveal
                className="group relative grid scroll-mt-28 gap-6 border-b border-line py-8 transition-colors hover:bg-white/70 md:grid-cols-12 md:px-4"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 hidden w-[2px] origin-top scale-y-0 bg-care-deep transition-transform duration-500 group-hover:scale-y-100 md:block"
                />
                <div className="flex gap-4 md:col-span-5">
                  <span className="flex size-12 shrink-0 items-center justify-center border border-line bg-paper text-care-deep">
                    <MedicalIcon name={department.icon} size={24} />
                  </span>
                  <div>
                    <h3 className="text-h3 text-ink">{department.name[locale]}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{department.role[locale]}</p>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <p className="text-meta">{copy.services}</p>
                  <ul className="mt-2 space-y-1">
                    {department.services.map((service) => (
                      <li key={service.en} className="flex items-center gap-2.5 text-[0.9375rem] text-ink-2">
                        <span aria-hidden className="size-1 rounded-full bg-care" />
                        {service[locale]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-3">
                  {department.clinicIds.length > 0 && (
                    <>
                      <p className="text-meta">{copy.relatedClinics}</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {department.clinicIds.map((id) => {
                          const clinic = getClinic(id);
                          if (!clinic) return null;
                          return (
                            <li key={id}>
                              <Link
                                href={`${localePath(locale, "/clinics")}#${clinic.id}`}
                                className="inline-flex min-h-9 items-center border border-line-strong px-3 text-[0.8125rem] text-ink-2 transition-colors hover:border-care-deep hover:text-care-deep"
                              >
                                {clinic.name[locale]}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="mt-12 grid border-s border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {list.map((department) => (
              <li
                key={department.id}
                id={department.id}
                data-reveal
                className="group scroll-mt-28 border-b border-e border-line bg-paper/60 p-6 transition-colors hover:bg-white lg:p-7"
              >
                <MedicalIcon
                  name={department.icon}
                  size={26}
                  className="text-ink-2 transition-transform duration-500 group-hover:-translate-y-0.5"
                />
                <h3 className="text-h3 mt-6 text-ink">{department.name[locale]}</h3>
                <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{department.role[locale]}</p>
                <p className="mt-4 border-t border-line pt-3 text-[0.8125rem] text-ink-2">
                  {department.services.map((s) => s[locale]).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}
