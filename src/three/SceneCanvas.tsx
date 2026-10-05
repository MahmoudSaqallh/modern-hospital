"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { MEDIA } from "@/animations/motion";
import { bookableClinics } from "@/data/clinics";
import { getDoctor } from "@/data/doctors";
import { applyScenePreset, type ScenePreset } from "./envPresets";
import { detectQuality, supportsWebGL, type SceneQuality } from "./quality";
import { requestSceneFrames, sceneStore, setSceneMode, type SceneMode } from "./sceneStore";
import type { JourneyCopy } from "./HeroScene/CareCore";
import type { PlaneCopy } from "./textures";

const SceneRoot = dynamic(() => import("./SceneRoot"), { ssr: false });

/** WebGL must never take the site down — any scene error simply removes the canvas. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** First path segment after the locale ("" for the home page). */
function sectionOf(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments.length && isLocale(segments[0]) ? segments.slice(1) : segments;
  return rest[0] ?? "";
}

/** Task pages (booking, complaints) keep the scene nearly still — the form comes first. */
const QUIET_SECTIONS = new Set(["booking", "complaints"]);

const PAGE_PRESETS: Record<string, ScenePreset> = {
  clinics: "clinics",
  departments: "departments",
  doctors: "doctors",
  news: "news",
  projects: "projects",
  about: "about",
  contact: "contact",
  "patient-support": "support",
};

function modeForSection(section: string): SceneMode {
  if (section === "") return "home";
  return QUIET_SECTIONS.has(section) ? "quiet" : "ambient";
}

/**
 * The single, persistent WebGL canvas behind every page. Loaded lazily after
 * the page is interactive; the site is fully usable without it.
 */
export function SceneCanvas() {
  const pathname = usePathname();
  const { locale, dir, dict } = useI18n();
  const [quality, setQuality] = useState<SceneQuality | null>(null);

  const journey = useMemo<JourneyCopy>(
    () => ({
      rtl: dir === "rtl",
      labels: [
        dict.hero.journey.patient,
        dict.hero.journey.department,
        dict.hero.journey.doctor,
        dict.hero.journey.appointment,
        dict.hero.journey.care,
      ],
    }),
    [dict, dir],
  );

  const planes = useMemo<PlaneCopy>(() => {
    const sample = getDoctor("ahmad-mohammad");
    const steps = dict.bookingPreview.steps;
    return {
      rtl: dir === "rtl",
      specialtyTitle: steps[0].title,
      specialties: bookableClinics.slice(0, 4).map((d) => d.name[locale]),
      doctorTitle: steps[1].title,
      doctorName: sample?.name[locale] ?? "",
      doctorRole: dict.bookingPreview.plane.doctorRole,
      nextSlot: dict.bookingPreview.plane.nextSlot,
      scheduleTitle: steps[2].title,
      confirmTitle: steps[3].title,
      confirmText: dict.bookingPreview.plane.confirmText,
    };
  }, [dict, dir, locale]);

  useEffect(() => {
    if (!supportsWebGL()) return;
    const start = () => setQuality(detectQuality());
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 400);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    const section = sectionOf(pathname);
    const mode = modeForSection(section);
    setSceneMode(mode);
    sceneStore.dir = document.documentElement.dir === "rtl" ? -1 : 1;
    sceneStore.focusJourney = -1;
    sceneStore.focusClinic = -1;
    sceneStore.focusNetwork = null;
    if (mode !== "home") {
      sceneStore.heroProgress = 1;
      applyScenePreset(mode === "quiet" ? "quiet" : (PAGE_PRESETS[section] ?? "ambient"));
    }
    requestSceneFrames();
  }, [pathname]);

  useEffect(() => {
    const reduced = window.matchMedia(MEDIA.reduced);
    const sync = () => {
      sceneStore.reducedMotion = reduced.matches;
      requestSceneFrames(4);
    };
    sync();
    reduced.addEventListener("change", sync);

    const fine = window.matchMedia(MEDIA.finePointer);
    const onMove = (e: PointerEvent) => {
      if (!fine.matches) return;
      sceneStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneStore.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      reduced.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div aria-hidden="true" className="no-print pointer-events-none fixed inset-0 z-0">
      {quality && (
        <SceneErrorBoundary>
          <SceneRoot quality={quality} journey={journey} planes={planes} />
        </SceneErrorBoundary>
      )}
    </div>
  );
}
