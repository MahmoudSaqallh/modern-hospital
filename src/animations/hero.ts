"use client";

import { gsap } from "./gsap";
import { ease } from "./motion";
import { ENV_PRESETS, applyScenePreset } from "@/three/envPresets";
import { requestSceneFrames, sceneStore } from "@/three/sceneStore";

/**
 * One coordinated hero entrance (≈2s; headline readable by ≈1s):
 *  1  canvas settles, background grid softly appears
 *  2  care core activates as the camera arrives
 *  3  journey connections form, node by node
 *  4  trust label
 *  5  headline, line by line (clip-path)
 *  6  second line + description
 *  7  calls to action
 *  8  trust line + live next slot
 *  9  quick-access navigation draws in
 */
export function playHeroIntro(scope: HTMLElement): gsap.core.Timeline {
  document.documentElement.classList.add("intro-started");
  const q = gsap.utils.selector(scope);
  const frames = () => requestSceneFrames(2);

  applyScenePreset("hero", true);
  sceneStore.env.grid = 0;
  sceneStore.intro = 0;
  sceneStore.introLines = 0;

  const tl = gsap.timeline({ defaults: { ease: ease.out } });
  tl.to(sceneStore.env, { grid: ENV_PRESETS.hero.grid, duration: 1.2, ease: "sine.out", onUpdate: frames }, 0)
    .to(sceneStore, { intro: 1, duration: 1.6, ease: "power2.out", onUpdate: frames }, 0.1)
    .to(sceneStore, { introLines: 1, duration: 1.3, ease: "power1.inOut", onUpdate: frames }, 0.55)
    .fromTo(q("[data-intro='visual']"), { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.2 }, 0.05)
    .fromTo(q("[data-intro='label']"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.25)
    .fromTo(
      q("[data-intro='line']"),
      { opacity: 1, yPercent: 30, clipPath: "inset(0% 0% 100% 0%)" },
      { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: ease.outStrong, stagger: 0.13, clearProps: "clipPath" },
      0.35,
    )
    .fromTo(q("[data-intro='copy']"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.68)
    .fromTo(q("[data-intro='cta']"), { opacity: 0, y: 14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, 0.85)
    .fromTo(q("[data-intro='meta']"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.08 }, 1)
    .fromTo(q("[data-intro='strip']"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 1.05)
    .fromTo(q("[data-intro='strip-line']"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: ease.drawLine }, 1.05)
    .fromTo(q("[data-intro='strip-item']"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 1.15);

  return tl;
}

/** Reduced motion / no-JS-motion path: everything simply present. */
export function showHeroInstantly(): void {
  applyScenePreset("hero", true);
  sceneStore.intro = 1;
  sceneStore.introLines = 1;
  requestSceneFrames(4);
}
