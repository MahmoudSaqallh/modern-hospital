"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { onAppReady } from "@/animations/appReady";
import { MEDIA } from "@/animations/motion";

/**
 * Entrance for inner-page headers. `[data-intro]` children are pre-hidden by
 * CSS only when motion is allowed, then revealed here once the app is ready.
 */
export function PageIntro({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        let tween: gsap.core.Tween | undefined;
        const cancel = onAppReady(() => {
          document.documentElement.classList.add("intro-started");
          const items = ref.current?.querySelectorAll("[data-intro]") ?? [];
          tween = gsap.fromTo(
            items,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" },
          );
        });
        return () => {
          cancel();
          tween?.kill();
        };
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
