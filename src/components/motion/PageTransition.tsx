"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA, duration, ease } from "@/animations/motion";

/** First mount is the initial page load — the preloader and PageIntro own that moment. */
let hasMounted = false;

/**
 * Client-navigation entrance. The new page is already rendered and
 * interactive when this runs; we only draw a thin brand line across the top
 * and lift the content in softly. Nothing waits on it and reduced motion
 * skips it entirely.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const initial = !hasMounted;
      hasMounted = true;
      if (initial) return;

      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        const content = root.current?.querySelector("[data-page-content]");
        const tl = gsap.timeline();
        tl.fromTo(
          line.current,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, duration: duration.ui + 0.15, ease: ease.outStrong },
        ).to(line.current, { opacity: 0, duration: duration.micro + 0.1 }, ">-0.05");
        if (content) {
          tl.fromTo(
            content,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: duration.ui, ease: ease.out, clearProps: "opacity,transform" },
            0,
          );
        }
        return () => tl.kill();
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <span
        ref={line}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[115] h-[2px] origin-[var(--page-line-origin)] bg-gradient-to-r from-care-deep via-care to-medical opacity-0 [--page-line-origin:left] rtl:[--page-line-origin:right] rtl:bg-gradient-to-l"
      />
      <div data-page-content>{children}</div>
    </div>
  );
}
