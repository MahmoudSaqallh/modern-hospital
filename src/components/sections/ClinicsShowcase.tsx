"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { bookableClinics } from "@/data/clinics";
import { getDoctorsByClinic } from "@/data/doctors";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useSceneAnchor, useSceneChapter } from "@/animations/sceneBridge";
import { bookingHref } from "@/features/booking/links";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { setFocusClinic } from "@/three/sceneStore";
import { MedicalIcon } from "@/components/icons/MedicalIcon";
import { ForwardArrow, TextLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FEATURED_COUNT = 6;

/**
 * Home clinics preview: an interactive specialty index. Intro + a "visual
 * window" on the reading-start side (where the WebGL clinic lattice appears);
 * featured clinics on the other. The active row opens to show its description
 * and actions, and its lattice node lights up.
 */
export function ClinicsShowcase() {
  const { locale, dict } = useI18n();
  const copy = dict.clinicsSection;
  const section = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const featured = bookableClinics.slice(0, FEATURED_COUNT);
  useSceneChapter(section, "clinics");
  useSceneAnchor(visual, "clinic-orbit");

  const activate = (index: number) => {
    setActive(index);
    setFocusClinic(index);
  };

  useGSAP(
    () => {
      setFocusClinic(0);
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (section.current) revealGroup(section.current, { stagger: 0.05 });
      });
      return () => setFocusClinic(-1);
    },
    { scope: section },
  );

  const current = featured[active];

  return (
    <section ref={section} aria-labelledby="clinics-title" className="relative py-24 lg:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeader id="clinics-title" index="01" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
            {/* The WebGL clinic lattice is drawn into this window (desktop). */}
            <div ref={visual} aria-hidden className="relative mt-10 hidden aspect-[5/4] w-full max-w-[28rem] lg:block">
              <span className="absolute inset-0 border border-line/80" />
              <span className="absolute start-4 top-4 text-[0.75rem] text-muted">{copy.explore}</span>
            </div>
            {current && (
              <p aria-live="polite" className="mt-5 hidden items-center gap-3 text-[0.9375rem] text-ink-2 lg:flex">
                <span className="size-1.5 rounded-full bg-care" aria-hidden />
                <span className="font-medium text-ink">{current.name[locale]}</span>
                <span className="text-muted">· {plural(dict.common.doctorsCount, getDoctorsByClinic(current.id).length, locale)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <ol className="border-t border-ink/15">
            {featured.map((clinic, i) => {
              const isActive = i === active;
              const count = getDoctorsByClinic(clinic.id).length;
              return (
                <li
                  key={clinic.id}
                  data-reveal
                  onMouseEnter={() => activate(i)}
                  onFocusCapture={() => activate(i)}
                  className={cn("group relative border-b border-line transition-colors duration-300", isActive ? "bg-white" : "hover:bg-white/60")}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 start-0 w-[2px] origin-top bg-care-deep transition-transform duration-500 ease-[var(--ease-out-quart)]",
                      isActive ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                  <Link
                    href={bookingHref(locale, { clinic: clinic.id })}
                    className={cn("group/btn flex items-center gap-4 px-3 transition-[padding] duration-300 sm:gap-5 sm:px-5", isActive ? "pb-3 pt-6" : "py-5")}
                  >
                    <span className="w-6 font-mono text-[0.75rem] text-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center border transition-[transform,background-color,border-color,color] duration-300",
                        isActive ? "border-care-deep bg-care-deep text-white" : "border-line bg-paper text-care-deep group-hover/btn:-translate-y-0.5",
                      )}
                    >
                      <MedicalIcon name={clinic.icon} size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[1.0625rem] font-medium transition-colors", isActive ? "text-ink" : "text-ink-2")}>
                        {clinic.name[locale]}
                      </span>
                      <span className="block text-meta lg:hidden">{clinic.summary[locale]}</span>
                    </span>
                    <span className="hidden text-meta tabular sm:block">{plural(dict.common.doctorsCount, count, locale)}</span>
                    <ForwardArrow className={cn(isActive ? "text-care-deep" : "text-muted")} />
                  </Link>

                  {/* Detail opens for the active row (hover, keyboard focus or tap). */}
                  <div className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-quart)]", isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap items-end justify-between gap-4 px-3 pb-6 ps-[4.25rem] sm:px-5 sm:ps-[6.5rem]">
                        <p className="max-w-[46ch] text-[0.9375rem] leading-7 text-muted">{clinic.description[locale]}</p>
                        <Link
                          href={`${localePath(locale, "/doctors")}?clinic=${clinic.id}`}
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
          </ol>
          <div data-reveal className="mt-8">
            <TextLink href={localePath(locale, "/clinics")}>{copy.viewAll}</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
