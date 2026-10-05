"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { markAppReady } from "@/animations/appReady";
import { useI18n } from "@/i18n/I18nProvider";
import { organization } from "@/config/organization";
import { VISITED_KEY } from "@/lib/storageKeys";
import { arcPath, ARC_SEGMENTS } from "@/components/ui/ArcMark";

const MAX_WAIT_MS = 2600;

/** Resolves when fonts and the window load event are done — real readiness, not a timer. */
function whenReady(): Promise<void> {
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
  const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
  return Promise.all([loaded, fonts]).then(() => undefined);
}

/**
 * Branded first-visit loader: the emblem ring draws itself (green → red →
 * ink), the care pulse activates, the logo settles in, then the platform
 * reports ready. Shown once per session; skipped for reduced motion. It
 * leaves as soon as the page is ready (hard cap 2.6s) — never padded.
 */
export function Preloader() {
  const { dict, locale } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState(dict.preloader.loading);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const skip = document.documentElement.classList.contains("preloader-skip");
      if (skip) {
        markAppReady();
        setDone(true);
        return;
      }
      try {
        sessionStorage.setItem(VISITED_KEY, "1");
      } catch {
        /* storage unavailable — loader simply shows again next time */
      }

      const arcs = gsap.utils.toArray<SVGPathElement>("[data-arc]", el);
      arcs.forEach((arc) => {
        const length = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length });
      });

      const intro = gsap
        .timeline()
        .to(arcs[0], { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" })
        .to(arcs[1], { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, "-=0.3")
        .to(arcs[2], { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, "-=0.3")
        .fromTo("[data-pulse]", { scale: 0.6, autoAlpha: 0.5 }, { scale: 1.5, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, "-=0.25")
        .fromTo("[data-logo]", { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, "<")
        .fromTo("[data-name]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.25");

      let exited = false;
      const exit = () => {
        if (exited) return;
        exited = true;
        setStatus(dict.preloader.ready);
        gsap
          .timeline({ delay: 0.25 })
          .add(() => markAppReady(), 0.15)
          .to(el, { autoAlpha: 0, duration: 0.5, ease: "power2.out", onComplete: () => setDone(true) });
      };

      const cap = window.setTimeout(exit, MAX_WAIT_MS);
      Promise.all([whenReady(), intro.then()]).then(exit);
      return () => window.clearTimeout(cap);
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex items-center justify-center bg-paper"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        <div className="relative size-40">
          <svg viewBox="0 0 160 160" className="absolute inset-0 size-full" fill="none">
            {ARC_SEGMENTS.map((segment) => (
              <path
                key={segment.key}
                data-arc
                d={arcPath(80, 80, 74, segment.from, segment.to)}
                className={segment.className}
                strokeWidth={3}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <span data-pulse className="absolute inset-[28%] rounded-full border border-care/60 opacity-0" />
          <Image
            data-logo
            src={organization.logo}
            alt=""
            width={112}
            height={112}
            className="absolute inset-[15%] size-[70%] opacity-0"
          />
        </div>
        <p data-name className="mt-7 font-display text-xl text-ink opacity-0">
          {organization.name[locale]}
        </p>
        <p className="mt-2 text-meta">{status}</p>
      </div>
    </div>
  );
}
