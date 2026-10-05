"use client";

import Link from "next/link";
import { useRef } from "react";
import { getClinic } from "@/data/clinics";
import { getDoctor } from "@/data/doctors";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { useSceneChapter } from "@/animations/sceneBridge";
import { bookingHref } from "@/features/booking/links";
import { DoctorNextSlot } from "@/features/doctors/components/DoctorNextSlot";
import { useClientNow } from "@/features/doctors/hooks/useClientNow";
import type { Doctor } from "@/features/doctors/types";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { ForwardArrow, TextLink } from "@/components/ui/Button";
import { Portrait } from "@/components/ui/Portrait";
import { SectionHeader } from "@/components/ui/SectionHeader";

const FEATURED_IDS = ["ahmad-mohammad", "rana-khalil", "khaled-yousef", "hani-mansour"];

/**
 * Doctors as a quiet gallery: large portrait areas, minimal text, the next
 * available time and a direct booking action. Images reveal with a mask;
 * on hover they gain a little depth (scale + pointer parallax, never tilt).
 */
export function DoctorsShowcase() {
  const { locale, dict } = useI18n();
  const copy = dict.doctorsSection;
  const now = useClientNow();
  const section = useRef<HTMLElement>(null);
  const featured = FEATURED_IDS.map((id) => getDoctor(id)).filter((d): d is Doctor => Boolean(d));
  useSceneChapter(section, "doctors");

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-doctor]", root);
        if (root.getBoundingClientRect().top < window.innerHeight * 0.85) return;
        gsap
          .timeline({ scrollTrigger: { trigger: "[data-doctor-list]", start: "top 80%", once: true } })
          .fromTo(
            cards.map((c) => c.querySelector("[data-doctor-image]")),
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out", stagger: 0.1, clearProps: "clipPath" },
          )
          .fromTo(
            cards.flatMap((c) => Array.from(c.querySelectorAll("[data-doctor-meta]"))),
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.04 },
            0.35,
          );
      });

      // Pointer depth: the portrait drifts a few pixels with the cursor.
      mm.add(`${MEDIA.finePointer} and ${MEDIA.motionOk}`, () => {
        const cleanups = gsap.utils.toArray<HTMLElement>("[data-doctor-image]", root).map((frame) => {
          const inner = frame.querySelector<HTMLElement>("[data-portrait-inner]");
          if (!inner) return () => {};
          const xTo = gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3.out" });
          const yTo = gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = frame.getBoundingClientRect();
            xTo(((e.clientX - r.left) / r.width - 0.5) * -10);
            yTo(((e.clientY - r.top) / r.height - 0.5) * -10);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          frame.addEventListener("pointermove", move);
          frame.addEventListener("pointerleave", leave);
          return () => {
            frame.removeEventListener("pointermove", move);
            frame.removeEventListener("pointerleave", leave);
          };
        });
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="doctors-title" className="relative border-y border-line bg-white/92 py-24 lg:py-32">
      <div className="container-site">
        <SectionHeader
          id="doctors-title"
          index="03"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={<TextLink href={localePath(locale, "/doctors")}>{copy.viewAll}</TextLink>}
        />

        <ul
          data-doctor-list
          className="-mx-5 mt-14 grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-5 overflow-x-auto px-5 pb-4 sm:auto-cols-[44%] lg:mx-0 lg:grid-flow-row lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featured.map((doctor) => {
            const department = getClinic(doctor.clinicId);
            const profile = localePath(locale, `/doctors/${doctor.id}`);
            return (
              <li key={doctor.id} data-doctor className="group snap-start">
                <Link href={profile} data-doctor-image className="block" tabIndex={-1} aria-hidden>
                  <Portrait
                    name={doctor.name[locale]}
                    photo={doctor.photo}
                    large
                    className="aspect-[3/4] w-full"
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 78vw"
                  />
                </Link>
                <div className="mt-5">
                  <p data-doctor-meta className="text-meta">
                    {department?.name[locale]}
                  </p>
                  <h3 data-doctor-meta className="mt-1">
                    <Link href={profile} className="text-[1.125rem] font-medium text-ink transition-colors hover:text-care-deep">
                      {doctor.name[locale]}
                    </Link>
                  </h3>
                  <p data-doctor-meta className="text-[0.9375rem] text-ink-2">
                    {doctor.title[locale]}
                  </p>
                  <div data-doctor-meta className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
                    <DoctorNextSlot doctor={doctor} now={now} />
                    <Link
                      href={bookingHref(locale, { clinic: doctor.clinicId, doctor: doctor.id })}
                      aria-label={`${dict.common.bookAppointment} — ${doctor.name[locale]}`}
                      className="group/btn inline-flex min-h-10 shrink-0 items-center gap-1.5 text-[0.875rem] font-medium text-care-deep"
                    >
                      {dict.common.bookAppointment}
                      <ForwardArrow />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
