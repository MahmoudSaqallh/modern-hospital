"use client";

import { useRef } from "react";
import { HandHeart, Microscope, Stethoscope, UserRound, type LucideIcon } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useI18n } from "@/i18n/I18nProvider";
import { ArcMark } from "@/components/ui/ArcMark";

const ICONS: LucideIcon[] = [UserRound, Stethoscope, Microscope, HandHeart];

/**
 * Patient → therapeutic care → supporting services → a better care journey.
 * The connecting line draws with scroll; each stage "arrives" as it does.
 */
export function CareTogether() {
  const { dict } = useI18n();
  const copy = dict.departmentsPage.together;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const stages = gsap.utils.toArray<HTMLElement>("[data-stage]", el);
      const mark = (progress: number) =>
        stages.forEach((stage, i) => (stage.dataset.active = String(progress >= i / (stages.length - 1) - 0.02)));
      const mm = gsap.matchMedia();
      mm.add(MEDIA.reduced, () => mark(1));
      mm.add(MEDIA.motionOk, () => {
        revealGroup(el);
        mark(0);
        gsap.fromTo(
          "[data-together-line]",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-together-track]", start: "top 75%", end: "bottom 50%", scrub: 0.6, onUpdate: (s) => mark(s.progress) },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="together-title" className="relative py-20 lg:py-28">
      <div className="container-site">
        <p data-reveal className="text-eyebrow flex items-center gap-2.5">
          <ArcMark size={14} />
          {copy.eyebrow}
        </p>
        <h2 id="together-title" data-reveal="mask" className="text-h2 mt-4 text-ink">
          {copy.title}
        </h2>

        <div data-together-track className="relative mt-14">
          <span aria-hidden className="absolute inset-x-[12.5%] top-7 hidden h-px bg-line-strong md:block" />
          <span
            data-together-line
            aria-hidden
            className="absolute inset-x-[12.5%] top-7 hidden h-px origin-left bg-care-deep md:block rtl:origin-right"
          />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {copy.steps.map((step, i) => {
              const Icon = ICONS[i];
              const last = i === copy.steps.length - 1;
              return (
                <li key={step.title} data-stage data-active="true" className="group/stage flex gap-5 md:flex-col md:items-center md:text-center">
                  <span
                    className={
                      "relative flex size-14 shrink-0 items-center justify-center rounded-full border bg-paper transition-colors duration-500 " +
                      (last
                        ? "border-line-strong text-muted group-data-[active=true]/stage:border-medical group-data-[active=true]/stage:text-medical"
                        : "border-line-strong text-muted group-data-[active=true]/stage:border-care-deep group-data-[active=true]/stage:text-care-deep")
                    }
                  >
                    <Icon aria-hidden strokeWidth={1.5} className="size-6" />
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
