/**
 * Shared, mutable scene state. Written by DOM-side code (GSAP, ScrollTrigger,
 * pointer listeners, anchor tracking) and read inside useFrame — never React
 * state, so scroll and pointer updates cause zero re-renders.
 */
export type SceneMode =
  /** Home page: the full scroll-driven story. */
  | "home"
  /** Content pages: ambient field only, softened. */
  | "ambient"
  /** Booking flow: barely-there field, rendering parks once settled. */
  | "quiet";

/** DOM elements the 3D scene aligns itself to (home page and inner pages). */
export type AnchorKey =
  | "about-logo"
  | "clinic-orbit"
  | "care-network"
  | "booking-stage"
  | "contact-strip"
  | "support-network";

export interface SceneAnchor {
  /** Centre in normalized device coordinates (-1…1, y up). */
  x: number;
  y: number;
  /** Size in NDC units (full viewport = 2). */
  w: number;
  h: number;
  /** 0 → 1: how centred/visible the anchor is — drives the object's presence. */
  weight: number;
}

/**
 * Background "mood" — every layer reads these. GSAP tweens them between
 * chapter presets as the visitor scrolls (see envPresets.ts).
 */
export interface SceneEnv {
  /** Wave amplitude of the care field. */
  wave: number;
  /** Global time scale for ambient motion. */
  speed: number;
  /** Particle presence. */
  particles: number;
  /** Technical grid visibility. */
  grid: number;
  /** Soft moving lights. */
  glow: number;
  /** 0 neutral → 1 greener light (reassurance / confirmation moments). */
  care: number;
  /** Subtle camera travel for the chapter (ignored on small screens / reduced motion). */
  camZ: number;
  camY: number;
}

const emptyAnchor = (): SceneAnchor => ({ x: 0, y: 0, w: 0, h: 0, weight: 0 });

export const sceneStore = {
  mode: "ambient" as SceneMode,
  /** 1 = LTR (hero visual on the right), -1 = RTL (hero visual on the left). */
  dir: 1 as 1 | -1,
  /** Accumulated scene time, advanced at `env.speed` — lets motion slow down gracefully. */
  time: 0,
  env: {
    wave: 0.7,
    speed: 0.7,
    particles: 0.7,
    grid: 0.25,
    glow: 0.5,
    care: 0,
    camZ: 0,
    camY: 0,
  } as SceneEnv,
  /** 0 → 1 hero entrance (core + lights), driven by the GSAP intro timeline. */
  intro: 0,
  /** 0 → 1 the journey connections drawing in. */
  introLines: 0,
  /** 0 → 1 as the hero scrolls out of view. */
  heroProgress: 0,
  anchors: {
    "about-logo": emptyAnchor(),
    "clinic-orbit": emptyAnchor(),
    "care-network": emptyAnchor(),
    "booking-stage": emptyAnchor(),
    "contact-strip": emptyAnchor(),
    "support-network": emptyAnchor(),
  } as Record<AnchorKey, SceneAnchor>,
  /** Highlighted journey node (quick actions hover), -1 for none. */
  focusJourney: -1,
  /** Highlighted clinic in a clinic list (index into the clinics data), -1 for none. */
  focusClinic: -1,
  /** Highlighted department in the care network (department id), null for none. */
  focusNetwork: null as string | null,
  /** Booking preview step as a continuous value (0…3), tweened by GSAP. */
  bookingStep: 0,
  /** Normalized pointer, -1 … 1. */
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
  /** Frames still owed after a state change (lets the scene settle, then park). */
  pendingFrames: 0,
  /** First frame rendered — lets the CSS fallback visual fade out. */
  ready: false,
};

export const SCENE_READY_EVENT = "pas:scene-ready";

/** Ask the frame driver for a burst of frames (e.g. after a mode change). */
export function requestSceneFrames(count = 90): void {
  sceneStore.pendingFrames = Math.max(sceneStore.pendingFrames, count);
}

export function setSceneMode(mode: SceneMode): void {
  if (sceneStore.mode === mode) return;
  sceneStore.mode = mode;
  requestSceneFrames();
}

/** Highlight a journey node (quick actions), or -1 to clear. */
export function setFocusJourney(index: number): void {
  sceneStore.focusJourney = index;
  requestSceneFrames(30);
}

/** Highlight a clinic node (clinic lists), or -1 to clear. */
export function setFocusClinic(index: number): void {
  sceneStore.focusClinic = index;
  requestSceneFrames(40);
}

/** Highlight a department in the care network, or null to clear. */
export function setFocusNetwork(departmentId: string | null): void {
  sceneStore.focusNetwork = departmentId;
  requestSceneFrames(40);
}

/** True when a story object (hero or an anchored visual) is on screen and deserves full frame rate. */
export function storyVisualsActive(): boolean {
  if (sceneStore.mode === "home" && sceneStore.heroProgress < 1) return true;
  return Object.values(sceneStore.anchors).some((a) => a.weight > 0.01);
}
