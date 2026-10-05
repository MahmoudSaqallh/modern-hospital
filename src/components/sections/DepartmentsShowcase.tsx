"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { bookableDepartments } from "@/data/departments";
import { getDoctorsByDepartment } from "@/data/doctors";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useSceneAnchor, useSceneChapter } from "@/animations/sceneBridge";
import { bookingHref } from "@/features/booking/links";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { setFocusDept } from "@/three/sceneStore";
import { DepartmentIcon } from "@/components/icons/DepartmentIcon";
import { ForwardArrow, TextLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * Departments as an interactive specialty index. Intro + a "visual window"
 * on the reading-start side (where the WebGL lattice appears); the list on
 * the other side. The active row opens to show its description and actions,
 * and its lattice node lights up.
 */
export function DepartmentsShowcase() {
  const { locale, dict } = useI18n();
  const copy = dict.departmentsSection;
  const section = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useSceneChapter(section, "departments");
  useSceneAnchor(visual, "dept-visual");

  const activate = (index: number) => {
    setActive(index);
    setFocusDept(index);
  };

  useGSAP(
    () => {
      setFocusDept(0);
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (section.current) revealGroup(section.current, { stagger: 0.05 });
      });
      return () => setFocusDept(-1);
    },
    { scope: section },
  );

  const current = bookableDepartments[active];

  return (
    <section ref={section} aria-labelledby="departments-title" className="relative py-24 lg:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              id="departments-title"
              index="01"
              eyebrow={copy.eyebrow}
              title={copy.title}
              description={copy.description}
            />
            {/* The WebGL lattice is drawn into this window (desktop). */}
            <div ref={visual} aria-hidden className="relative mt-10 hidden aspect-[5/4] w-full max-w-[28rem] lg:block">
              <span className="absolute inset-0 border border-line/80" />
              <span className="absolute start-4 top-4 text-[0.75rem] text-muted">{copy.explore}</span>
            </div>
            {current && (
              <p aria-live="polite" className="mt-5 hidden items-center gap-3 text-[0.9375rem] text-ink-2 lg:flex">
                <span className="size-1.5 rounded-full bg-care" aria-hidden />
                <span className="font-medium text-ink">{current.name[locale]}</span>
                <span className="text-muted">· {plural(dict.common.doctorsCount, getDoctorsByDepartment(current.id).length, locale)}</span>
              </p>
            )}
            <div data-reveal className="mt-8">
              <TextLink href={localePath(locale, "/departments")}>{copy.viewAll}</TextLink>
            </div>
          </div>
        </div>

        <ol className="border-t border-ink/15 lg:col-span-7">
          {bookableDepartments.map((department, i) => {
            const isActive = i === active;
            const count = getDoctorsByDepartment(department.id).length;
            return (
              <li
                key={department.id}
                data-reveal
                onMouseEnter={() => activate(i)}
                onFocusCapture={() => activate(i)}
                className={cn(
                  "group relative border-b border-line transition-colors duration-300",
                  isActive ? "bg-white" : "hover:bg-white/60",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 start-0 w-[2px] origin-top bg-care-deep transition-transform duration-500 ease-[var(--ease-out-quart)]",
                    isActive ? "scale-y-100" : "scale-y-0",
                  )}
                />
                <Link
                  href={bookingHref(locale, { department: department.id })}
                  className={cn(
                    "group/btn flex items-center gap-4 px-3 transition-[padding] duration-300 sm:gap-5 sm:px-5",
                    isActive ? "pb-3 pt-6" : "py-5",
                  )}
                >
                  <span className="w-6 font-mono text-[0.75rem] text-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center border transition-[transform,background-color,border-color,color] duration-300",
                      isActive ? "border-care-deep bg-care-deep text-white" : "border-line bg-paper text-care-deep group-hover/btn:-translate-y-0.5",
                    )}
                  >
                    <DepartmentIcon name={department.icon} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[1.0625rem] font-medium transition-colors", isActive ? "text-ink" : "text-ink-2")}>
                      {department.name[locale]}
                    </span>
                    <span className="block text-meta lg:hidden">{department.summary[locale]}</span>
                  </span>
                  <span className="hidden text-meta tabular sm:block">{plural(dict.common.doctorsCount, count, locale)}</span>
                  <ForwardArrow className={cn(isActive ? "text-care-deep" : "text-muted")} />
                </Link>

                {/* Detail opens for the active row (hover, keyboard focus or tap). */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-quart)]",
                    isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-wrap items-end justify-between gap-4 px-3 pb-6 ps-[4.25rem] sm:px-5 sm:ps-[6.5rem]">
                      <p className="max-w-[46ch] text-[0.9375rem] leading-7 text-muted">{department.description[locale]}</p>
                      <Link
                        href={`${localePath(locale, "/doctors")}?department=${department.id}`}
                        tabIndex={isActive ? 0 : -1}
                        className="text-[0.875rem] font-medium text-care-deep underline decoration-care-deep/30 underline-offset-[6px] hover:decoration-care-deep"
                      >
                        {copy.doctors}
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          <li data-reveal className="flex flex-wrap items-center justify-between gap-3 px-3 py-5 sm:px-5">
            <span className="flex items-center gap-3 text-[0.9375rem] text-ink-2">
              <DepartmentIcon name="emergency" size={20} className="text-medical" />
              {dict.booking.department.urgentText}
            </span>
            <Link href={localePath(locale, "/contact")} className="text-[0.875rem] font-medium text-medical underline underline-offset-4">
              {copy.urgentAction}
            </Link>
          </li>
        </ol>
      </div>
    </section>
  );
}
