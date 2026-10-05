"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CalendarClock, CircleCheck, Pause, Play, Stethoscope, UserRound, type LucideIcon } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/animations/gsap";
import { MEDIA, prefersReducedMotion } from "@/animations/motion";
import { useReducedMotion } from "@/animations/useReducedMotion";
import { revealGroup } from "@/animations/sections";
import { useSceneAnchor, useSceneChapter } from "@/animations/sceneBridge";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { requestSceneFrames, SCENE_READY_EVENT, sceneStore } from "@/three/sceneStore";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ICONS: LucideIcon[] = [Stethoscope, UserRound, CalendarClock, CircleCheck];
const STEP_MS = 3800;

/**
 * Booking preview — a short product demo. Four steps (accessible tabs) drive
 * the WebGL interface planes: the active step's plane comes forward, the
 * progress line advances and the caption panel transitions. It plays on its
 * own while in view (pausable; never with reduced motion).
 */
export function BookingPreview() {
  const { locale, dir, dict } = useI18n();
  const copy = dict.bookingPreview;
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timer = useRef<gsap.core.Tween | null>(null);
  const [step, setStep] = useState(0);
  const [userPlaying, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [sceneReady, setSceneReady] = useState(() => typeof window !== "undefined" && sceneStore.ready);
  const reducedMotion = useReducedMotion();
  const playing = userPlaying && !reducedMotion;
  const baseId = useId();
  useSceneChapter(section, "booking");
  useSceneAnchor(stage, "booking-stage");

  useEffect(() => {
    if (sceneStore.ready) return;
    const onReady = () => setSceneReady(true);
    window.addEventListener(SCENE_READY_EVENT, onReady);
    return () => window.removeEventListener(SCENE_READY_EVENT, onReady);
  }, []);

  const goTo = useCallback((next: number) => {
    setStep(next);
    gsap.to(sceneStore, {
      bookingStep: next,
      duration: prefersReducedMotion() ? 0 : 0.9,
      ease: "power3.inOut",
      overwrite: "auto",
      onUpdate: () => requestSceneFrames(2),
    });
  }, []);

  // Section reveal + visibility tracking for autoplay.
  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      sceneStore.bookingStep = 0;
      ScrollTrigger.create({
        trigger: root,
        start: "top 70%",
        end: "bottom 30%",
        onToggle: (self) => setInView(self.isActive),
      });
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => revealGroup(root));
    },
    { scope: section },
  );

  // Autoplay: a progress tween per step; when it completes, advance.
  const autoplay = playing && inView && !hovering;
  useEffect(() => {
    timer.current?.kill();
    const bar = document.getElementById(`${baseId}-progress-${step}`);
    if (!bar) return;
    if (!autoplay || prefersReducedMotion()) {
      gsap.set(bar, { scaleX: autoplay ? 0 : 1 });
      return;
    }
    timer.current = gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, duration: STEP_MS / 1000, ease: "none", onComplete: () => goTo((step + 1) % 4) },
    );
    return () => {
      timer.current?.kill();
    };
  }, [autoplay, step, goTo, baseId]);

  // Caption panel transition on step change.
  useGSAP(
    () => {
      if (!panel.current || prefersReducedMotion()) return;
      gsap.fromTo(panel.current.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
    },
    { dependencies: [step], scope: panel },
  );

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const moves: Record<string, number> = { [forward]: (step + 1) % 4, [backward]: (step + 3) % 4, Home: 0, End: 3 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setPlaying(false);
    goTo(moves[event.key]);
    tabRefs.current[moves[event.key]]?.focus();
  };

  const Icon = ICONS[step];
  const current = copy.steps[step];

  return (
    <section ref={section} aria-labelledby="preview-title" className="relative py-24 lg:py-32">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div
          className="lg:col-span-5"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocusCapture={() => setHovering(true)}
          onBlurCapture={() => setHovering(false)}
        >
          <SectionHeader id="preview-title" index="03" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

          <div className="relative mt-10" data-reveal>
            <div role="tablist" aria-label={copy.stepsLabel} aria-orientation="vertical" onKeyDown={onTabKey} className="relative">
              <span aria-hidden className="absolute inset-y-6 start-[1.4rem] w-px bg-line-strong" />
              <span
                aria-hidden
                className="absolute start-[1.4rem] top-6 w-px origin-top bg-care-deep transition-[height] duration-700 ease-[var(--ease-out-quart)]"
                style={{ height: `calc(${(step / 3) * 100}% - ${(step / 3) * 3}rem)` }}
              />
              {copy.steps.map((item, i) => {
                const StepIcon = ICONS[i];
                const selected = i === step;
                return (
                  <button
                    key={item.title}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`${baseId}-tab-${i}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => {
                      setPlaying(false);
                      goTo(i);
                    }}
                    className="group relative flex w-full items-center gap-4 py-3 text-start"
                  >
                    <span
                      className={cn(
                        "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                        selected
                          ? "border-care-deep bg-care-deep text-white"
                          : i < step
                            ? "border-care-deep bg-paper text-care-deep"
                            : "border-line-strong bg-paper text-muted group-hover:text-ink",
                      )}
                    >
                      <StepIcon aria-hidden strokeWidth={1.5} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="font-mono text-[0.75rem] text-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                        <span className={cn("text-[1.0625rem] transition-colors", selected ? "font-medium text-ink" : "text-ink-2")}>
                          {item.title}
                        </span>
                      </span>
                      <span aria-hidden className="mt-2 block h-[2px] bg-line">
                        <span
                          id={`${baseId}-progress-${i}`}
                          className={cn(
                            "block h-full origin-left bg-care-deep rtl:origin-right",
                            selected ? "" : i < step ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <MagneticLink href={localePath(locale, "/booking")}>{copy.cta}</MagneticLink>
              {!reducedMotion && (
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex min-h-10 items-center gap-2 px-2 text-[0.875rem] text-ink-2 hover:text-ink"
                >
                  {playing ? <Pause aria-hidden strokeWidth={1.5} className="size-4" /> : <Play aria-hidden strokeWidth={1.5} className="size-4" />}
                  {playing ? copy.pause : copy.play}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* The WebGL interface planes are composed into this stage. */}
          <div ref={stage} className="relative aspect-[4/3] w-full">
            {!sceneReady && (
              <div aria-hidden className="absolute inset-[12%] flex flex-col items-center justify-center gap-4 border border-line bg-white/90 shadow-[var(--shadow-lift)]">
                <span className="flex size-14 items-center justify-center rounded-full bg-care-tint text-care-deep">
                  <Icon strokeWidth={1.5} className="size-7" />
                </span>
                <span className="font-display text-xl text-ink">{current.title}</span>
              </div>
            )}
          </div>
          <div
            ref={panel}
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${step}`}
            aria-live="polite"
            className="mx-auto -mt-4 max-w-md border-t-2 border-care-deep bg-paper/90 px-6 py-5 text-center"
          >
            <p className="font-mono text-[0.75rem] text-care-deep tabular">
              <bdi dir="ltr">{String(step + 1).padStart(2, "0")} / 04</bdi>
            </p>
            <p className="mt-1 font-display text-[1.35rem] text-ink">{current.title}</p>
            <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{current.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
