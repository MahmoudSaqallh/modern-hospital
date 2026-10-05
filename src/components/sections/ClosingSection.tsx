"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { useSceneAnchor, useSceneChapter } from "@/animations/sceneBridge";
import { organization } from "@/config/organization";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { MagneticLink } from "@/components/ui/MagneticLink";

/**
 * Calm close before the footer: motion slows, particles thin out, the care
 * core returns around the logo, and one message remains.
 */
export function ClosingSection() {
  const { locale, dict } = useI18n();
  const copy = dict.closing;
  const section = useRef<HTMLElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  useSceneChapter(section, "closing");
  useSceneAnchor(logo, "closing-logo");

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (root.getBoundingClientRect().top < window.innerHeight * 0.85) return;
        gsap
          .timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } })
          .fromTo(logo.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" })
          .fromTo("[data-closing]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0.3);
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="closing-title" className="relative py-32 text-center lg:py-44">
      <div className="container-site flex flex-col items-center">
        <div ref={logo} className="size-28 rounded-full bg-white p-2 shadow-[var(--shadow-lift)] lg:size-32">
          <Image src={organization.logo} alt="" width={128} height={128} className="size-full" />
        </div>
        <h2 id="closing-title" data-closing className="text-h1 mt-14 text-ink">
          {copy.title}
        </h2>
        <p data-closing className="text-lead mt-4 max-w-[40ch] text-muted">
          {copy.text}
        </p>
        <div data-closing className="mt-10">
          <MagneticLink href={localePath(locale, "/booking")} size="lg">
            {copy.cta}
          </MagneticLink>
        </div>
      </div>
    </section>
  );
}
