"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useSceneAnchor, useSceneChapter } from "@/animations/sceneBridge";
import { organization } from "@/config/organization";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";

/** Three care waves echoing the emblem; drawn in as the section scrolls. */
const WAVES = [
  "M0 40 C 80 18, 160 62, 240 40 S 400 18, 480 40",
  "M0 54 C 90 32, 170 74, 250 52 S 410 32, 480 54",
  "M0 68 C 100 48, 180 86, 260 66 S 420 48, 480 68",
];

/**
 * Identity moment: the logo, large and calm. The WebGL emblem ring returns
 * to orbit it and the journey network widens into a community ring around it.
 */
export function AboutIdentity() {
  const { locale, dict } = useI18n();
  const copy = dict.about;
  const section = useRef<HTMLElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  useSceneChapter(section, "about");
  useSceneAnchor(logo, "about-logo");

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        revealGroup(root);
        gsap.fromTo(
          logo.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: logo.current, start: "top 85%", once: true } },
        );
        gsap.utils.toArray<SVGPathElement>("[data-wave]", root).forEach((path, i) => {
          const length = path.getTotalLength();
          gsap.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: { trigger: root, start: `top ${75 - i * 5}%`, end: "center 45%", scrub: 0.8 },
            },
          );
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="about-title" className="relative py-28 lg:py-40">
      <div className="container-site grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHeader id="about-title" index="07" eyebrow={copy.eyebrow} title={copy.title} description={copy.text} />
          <blockquote data-reveal className="mt-10 border-s-2 border-medical ps-6">
            <p className="font-display text-[1.25rem] leading-relaxed text-ink">{copy.mission}</p>
          </blockquote>
          <ul data-reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-ink-2">
            {dict.aboutPage.values.items.map((value) => (
              <li key={value.title} className="flex items-center gap-2.5">
                <span aria-hidden className="size-1.5 rounded-full bg-care" />
                {value.title}
              </li>
            ))}
          </ul>
          <svg aria-hidden viewBox="0 0 480 90" className="mt-10 h-16 w-full max-w-md text-care" fill="none">
            {WAVES.map((d, i) => (
              <path key={d} data-wave d={d} stroke="currentColor" strokeOpacity={0.55 - i * 0.15} strokeWidth="1.5" strokeLinecap="round" />
            ))}
          </svg>
          <div data-reveal className="mt-8">
            <TextLink href={localePath(locale, "/about")}>{copy.link}</TextLink>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-6">
          <div className="relative flex aspect-square w-[min(64vw,21rem)] items-center justify-center lg:w-[min(28vw,23rem)]">
            <span aria-hidden className="absolute inset-[-14%] rounded-full border border-line" />
            <span aria-hidden className="absolute inset-[-30%] hidden rounded-full border border-line/70 sm:block" />
            <div ref={logo} className="relative size-full rounded-full bg-white p-[6%] shadow-[var(--shadow-lift)]">
              <Image
                src={organization.logo}
                alt={dict.a11y.logoAlt}
                width={384}
                height={384}
                sizes="(min-width: 1024px) 28vw, 64vw"
                className="size-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
