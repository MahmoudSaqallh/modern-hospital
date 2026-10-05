"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/animations/gsap";
import { onAppReady } from "@/animations/appReady";
import { playHeroIntro, showHeroInstantly } from "@/animations/hero";
import { MEDIA } from "@/animations/motion";
import { useSceneChapter } from "@/animations/sceneBridge";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { requestSceneFrames, sceneStore } from "@/three/sceneStore";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { TextLink } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusDot";
import { HeroFallbackVisual } from "./HeroFallbackVisual";
import { NextSlotWidget } from "./NextSlotWidget";
import { QuickAccess } from "./QuickAccess";

/**
 * Signature hero: the message on the reading-start side, the patient-journey
 * network (WebGL) occupying the rest of the frame, and the quick-access band
 * closing the composition.
 */
export function Hero() {
  const { locale, dict } = useI18n();
  const section = useRef<HTMLElement>(null);
  useSceneChapter(section, "hero");

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      sceneStore.heroProgress = 0;

      // The 3D scene recedes as the hero scrolls away (state only — no scrub tween).
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          sceneStore.heroProgress = self.progress;
          if (sceneStore.reducedMotion) requestSceneFrames(2);
        },
      });

      // Copy drifts up a touch slower than the page — depth without hurting readability.
      const mm = gsap.matchMedia();
      mm.add(MEDIA.reduced, () => showHeroInstantly());
      mm.add(MEDIA.motionOk, () => {
        gsap.to("[data-hero-copy]", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
        let tl: gsap.core.Timeline | undefined;
        const cancel = onAppReady(() => {
          tl = playHeroIntro(el);
        });
        return () => {
          cancel();
          tl?.kill();
        };
      });
    },
    { scope: section },
  );

  const { hero } = dict;

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col pt-[76px] lg:min-h-[min(100svh,64rem)] lg:pt-[88px]"
    >
      <HeroFallbackVisual />
      <p className="visually-hidden">{hero.journey.description}</p>

      <div className="container-site flex flex-1 flex-col">
        <div className="flex flex-1 items-center pb-10 pt-[37svh] lg:pb-14 lg:pt-6">
          <div data-hero-copy className="w-full max-w-[36rem] lg:w-[46%] lg:max-w-[40rem]">
            <p data-intro="label" className="inline-flex items-center gap-2.5 text-[0.9375rem] text-ink-2">
              <StatusDot status="available" />
              {hero.label}
            </p>

            <h1 id="hero-title" className="text-hero mt-5 text-ink lg:mt-7">
              <span data-intro="line" className="block py-[0.04em]">
                {hero.titleLine1}
              </span>
              <span data-intro="line" className="block py-[0.04em] text-care-deep">
                {hero.titleLine2}
                <span aria-hidden className="ms-[0.1em] inline-block size-[0.14em] rounded-full bg-medical align-baseline" />
              </span>
            </h1>

            <p data-intro="copy" className="mt-6 font-display text-[clamp(1.15rem,1rem+0.5vw,1.45rem)] leading-relaxed text-ink-2">
              {hero.secondLine}
            </p>
            <p data-intro="copy" className="text-lead mt-3 max-w-[42ch] text-muted">
              {hero.description}
            </p>

            <div data-intro="cta" className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <MagneticLink href={localePath(locale, "/booking")} size="lg">
                {hero.primary}
              </MagneticLink>
              <TextLink href={localePath(locale, "/departments")}>{hero.secondary}</TextLink>
            </div>

            <ul data-intro="meta" className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-meta">
              {hero.trust.map((item, i) => (
                <li key={item} className="flex items-center gap-4">
                  {i > 0 && <span aria-hidden className="size-1 rounded-full bg-line-strong" />}
                  {item}
                </li>
              ))}
            </ul>

            <div data-intro="meta" className="mt-7">
              <NextSlotWidget />
            </div>
          </div>
        </div>

        <QuickAccess />
      </div>
    </section>
  );
}
