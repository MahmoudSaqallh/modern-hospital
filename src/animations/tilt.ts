"use client";

import { gsap } from "./gsap";
import { MEDIA } from "./motion";

/**
 * Restrained pointer tilt for `[data-tilt]` cards inside `scope`
 * (max ±2.5°, fine pointers only, never with reduced motion).
 * Returns a cleanup function; call inside useGSAP.
 */
export function attachTilt(scope: HTMLElement, maxDeg = 2.5): () => void {
  const mm = gsap.matchMedia();
  mm.add(`${MEDIA.finePointer} and ${MEDIA.motionOk}`, () => {
    const cleanups = gsap.utils.toArray<HTMLElement>("[data-tilt]", scope).map((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * maxDeg * 2);
        rx(-((e.clientY - r.top) / r.height - 0.5) * maxDeg * 2);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        gsap.set(card, { rotationX: 0, rotationY: 0 });
      };
    });
    return () => cleanups.forEach((fn) => fn());
  });
  return () => mm.revert();
}
