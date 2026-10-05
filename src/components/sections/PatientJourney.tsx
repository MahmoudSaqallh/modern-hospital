"use client";

import { useRef } from "react";
import { CalendarClock, CircleCheck, Hospital, Stethoscope, UserRound, type LucideIcon } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ICONS: LucideIcon[] = [Stethoscope, UserRound, CalendarClock, CircleCheck, Hospital];

/**
 * The patient journey as one path. The connecting line progresses with
 * scroll and each step "arrives" as the line reaches it.
 */
export function PatientJourney() {
  const { locale, dict } = useI18n();
  const root = useRef<HTMLElement>(null);
  const copy = dict.journey;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const nodes = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const setActive = (progress: number) => {
        nodes.forEach((node, i) => {
          node.dataset.active = String(progress >= i / Math.max(nodes.length - 1, 1) - 0.02);
        });
      };

      const mm = gsap.matchMedia();
      mm.add(MEDIA.reduced, () => setActive(1));
      mm.add(MEDIA.motionOk, () => {
        revealGroup(el);
        gsap.fromTo(
          "[data-journey-progress]",
          { "--progress": 0 },
          {
            "--progress": 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-journey-track]",
              start: "top 78%",
              end: "bottom 45%",
              scrub: 0.6,
              onUpdate: (self) => setActive(self.progress),
            },
          },
        );
        setActive(0);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="journey-title" className="relative py-24 lg:py-32">
      <div className="container-site">
        <SectionHeader
          id="journey-title"
          index="04"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={
            <MagneticLink href={localePath(locale, "/booking")} size="md">
              {copy.cta}
            </MagneticLink>
          }
        />

        <div data-journey-track className="relative mt-16 lg:mt-20">
          {/* Track + progress: vertical through the node centres on small screens… */}
          <div
            data-journey-progress
            aria-hidden
            style={{ "--progress": 1 } as React.CSSProperties}
            className="pointer-events-none absolute inset-y-6 start-6 w-px bg-line-strong lg:hidden"
          >
            <span className="absolute inset-0 origin-top scale-y-[var(--progress)] bg-care-deep" />
          </div>
          {/* …horizontal from the first to the last column centre on desktop. */}
          <div
            data-journey-progress
            aria-hidden
            style={{ "--progress": 1 } as React.CSSProperties}
            className="pointer-events-none absolute inset-x-[10%] top-6 hidden h-px bg-line-strong lg:block"
          >
            <span className="absolute inset-0 origin-left scale-x-[var(--progress)] bg-care-deep rtl:origin-right" />
          </div>

          <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
            {copy.steps.map((step, i) => {
              const Icon = ICONS[i];
              return (
                <li
                  key={step.title}
                  data-step
                  data-active="true"
                  className="group/step flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                >
                  <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper text-muted transition-colors duration-500 group-data-[active=true]/step:border-care-deep group-data-[active=true]/step:text-care-deep">
                    <Icon aria-hidden strokeWidth={1.5} className="size-5" />
                    <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-paper font-mono text-[0.6875rem] text-muted tabular">
                      {i + 1}
                    </span>
                  </span>
                  <div className="pt-2 lg:pt-6">
                    <h3 className="text-h3 text-ink">{step.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-7 text-muted lg:mx-auto lg:max-w-[22ch]">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
