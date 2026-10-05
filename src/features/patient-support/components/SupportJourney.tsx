"use client";

import { useRef } from "react";
import { FileText, HandHeart, ListChecks, PhoneCall, type LucideIcon } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useI18n } from "@/i18n/I18nProvider";
import { ArcMark } from "@/components/ui/ArcMark";

const ICONS: LucideIcon[] = [ListChecks, FileText, HandHeart, PhoneCall];

/**
 * Choose a program → review its details → contribute → contact if needed.
 * A hairline fills with scroll and each step settles in as it's reached.
 * With reduced motion every step is simply shown complete.
 */
export function SupportJourney() {
  const { dict } = useI18n();
  const copy = dict.patientSupport.journey;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const mark = (progress: number) =>
        steps.forEach((step, i) => (step.dataset.active = String(progress >= i / (steps.length - 1) - 0.02)));
      const mm = gsap.matchMedia();
      mm.add(MEDIA.reduced, () => mark(1));
      mm.add(MEDIA.motionOk, () => {
        revealGroup(el);
        mark(0);
        gsap.fromTo(
          "[data-journey-line]",
          { scaleX: 0, scaleY: 0 },
          {
            scaleX: 1,
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-journey-track]",
              start: "top 75%",
              end: "bottom 55%",
              scrub: 0.6,
              onUpdate: (s) => mark(s.progress),
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="support-journey-title" className="relative py-20 lg:py-28">
      <div className="container-site">
        <p data-reveal className="text-eyebrow flex items-center gap-2.5">
          <ArcMark size={14} />
          <span className="font-mono text-[0.75rem] tabular">02</span>
          <span aria-hidden className="h-px w-5 bg-line-strong" />
          <span>{copy.eyebrow}</span>
        </p>
        <h2 id="support-journey-title" data-reveal="mask" className="text-h2 mt-4 text-ink">
          {copy.title}
        </h2>

        <div data-journey-track className="relative mt-14">
          {/* Track + fill: horizontal from md up, vertical on phones. */}
          <span aria-hidden className="absolute inset-y-7 start-7 w-px bg-line-strong md:inset-x-[12.5%] md:inset-y-auto md:top-7 md:h-px md:w-auto" />
          <span
            aria-hidden
            data-journey-line
            className="absolute inset-y-7 start-7 w-px origin-top bg-care-deep md:inset-x-[12.5%] md:inset-y-auto md:top-7 md:h-px md:w-auto md:origin-left rtl:md:origin-right"
          />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {copy.steps.map((step, i) => {
              const Icon = ICONS[i];
              return (
                <li key={step.title} data-step data-active="true" className="group/step flex gap-5 md:flex-col md:items-center md:text-center">
                  <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper text-muted transition-colors duration-500 group-data-[active=true]/step:border-care-deep group-data-[active=true]/step:text-care-deep">
                    <Icon aria-hidden strokeWidth={1.5} className="size-6" />
                    <span className="visually-hidden">{i + 1}.</span>
                  </span>
                  <div className="md:pt-5">
                    <h3 className="text-h3 text-ink">{step.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-7 text-muted md:mx-auto md:max-w-[24ch]">{step.text}</p>
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
