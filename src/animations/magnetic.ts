"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { MEDIA } from "./motion";

/**
 * Gentle magnetic pull for primary CTAs — max a few pixels, fine pointers only,
 * disabled for reduced motion. The hit area never moves away from the cursor.
 */
export function useMagnetic(ref: RefObject<HTMLElement | null>, maxOffset = 6) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MEDIA.finePointer} and ${MEDIA.motionOk}`, () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          xTo(gsap.utils.clamp(-1, 1, dx) * maxOffset);
          yTo(gsap.utils.clamp(-1, 1, dy) * maxOffset * 0.6);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          gsap.set(el, { x: 0, y: 0 });
        };
      });
      return () => mm.revert();
    },
    { dependencies: [maxOffset] },
  );
}
