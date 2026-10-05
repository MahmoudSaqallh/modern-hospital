"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { SCENE_READY_EVENT, sceneStore } from "@/three/sceneStore";
import { arcPath, ARC_SEGMENTS } from "@/components/ui/ArcMark";

/**
 * Static stand-in for the WebGL care core: shown before the canvas is ready
 * and permanently when WebGL is unavailable. Same composition, so the
 * hand-over to the 3D scene reads as the visual "gaining depth".
 */
export function HeroFallbackVisual() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hide = (instant: boolean) => {
      if (!ref.current) return;
      gsap.to(ref.current, { autoAlpha: 0, duration: instant ? 0 : 1.1, ease: "power2.out" });
    };
    if (sceneStore.ready) {
      hide(true);
      return;
    }
    const onReady = () => hide(false);
    window.addEventListener(SCENE_READY_EVENT, onReady);
    return () => window.removeEventListener(SCENE_READY_EVENT, onReady);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={
        // Centered over the 3D core: top-center on small screens, centre of the
        // "end" half on desktop (left in RTL, right in LTR).
        "pointer-events-none absolute left-1/2 top-[25svh] size-[min(80vw,24rem)] -translate-x-1/2 -translate-y-1/2 " +
        "lg:top-1/2 lg:size-[38vw] lg:max-h-[40rem] lg:max-w-[40rem] lg:rtl:left-[25%] lg:ltr:left-auto lg:ltr:right-[25%] lg:ltr:translate-x-1/2"
      }
    >
      <div data-intro="visual" className="size-full">
        <svg viewBox="0 0 400 400" className="size-full" fill="none">
          <defs>
            <radialGradient id="pearl" cx="58%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#eef1ec" />
              <stop offset="100%" stopColor="#dfe5dd" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="200" rx="186" ry="62" stroke="#cdd5cc" strokeWidth="1" transform="rotate(-14 200 200)" />
          {ARC_SEGMENTS.map((segment) => (
            <path
              key={segment.key}
              d={arcPath(200, 200, 128, segment.from, segment.to)}
              className={segment.className}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <circle cx="200" cy="200" r="64" fill="url(#pearl)" />
          {/* Rim light crescent */}
          <path d="M163 158a64 64 0 0 0 30 105 72 72 0 0 1-30-105Z" fill="#c9151e" opacity="0.55" />
          <circle cx="317" cy="246" r="4" fill="#169b3a" />
          <circle cx="92" cy="152" r="4" fill="#c9151e" />
        </svg>
      </div>
    </div>
  );
}
