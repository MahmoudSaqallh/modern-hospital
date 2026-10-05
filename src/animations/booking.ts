"use client";

import { gsap } from "./gsap";
import { ease, readingDirection } from "./motion";

/**
 * Step change: the incoming panel slides a short distance in the direction of
 * travel (forward follows reading direction, back reverses it). Kept under
 * half a second so the flow never feels slower than a plain form.
 */
export function animateStepIn(panel: HTMLElement, direction: 1 | -1): gsap.core.Timeline {
  const offset = 28 * direction * readingDirection();
  const items = panel.querySelectorAll("[data-step-item]");
  // Opacity only (never visibility): the step heading must stay focusable during the transition.
  return gsap
    .timeline()
    .fromTo(panel, { opacity: 0, x: offset }, { opacity: 1, x: 0, duration: 0.45, ease: ease.out, clearProps: "transform" })
    .fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: ease.out }, 0.08);
}

/**
 * Success: the emblem ring completes, then the check mark draws, then the
 * details settle in. Calm and brief — no confetti, no bounce.
 */
export function playSuccess(root: HTMLElement): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const arcs = Array.from(root.querySelectorAll<SVGPathElement>("[data-success-arc]"));
  const check = root.querySelector<SVGPathElement>("[data-success-check]");

  arcs.forEach((arc) => {
    const length = arc.getTotalLength();
    gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length });
  });
  if (check) {
    const length = check.getTotalLength();
    gsap.set(check, { strokeDasharray: length, strokeDashoffset: length });
  }

  const tl = gsap.timeline({ defaults: { ease: ease.drawLine } });
  arcs.forEach((arc, i) => tl.to(arc, { strokeDashoffset: 0, duration: 0.55 }, i * 0.18));
  if (check) tl.to(check, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, ">-0.1");
  tl.fromTo(q("[data-success-item]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: ease.out }, "-=0.25");
  return tl;
}
