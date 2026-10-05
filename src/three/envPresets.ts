"use client";

import { gsap } from "@/animations/gsap";
import { requestSceneFrames, sceneStore, type SceneEnv } from "./sceneStore";

/**
 * Background moods per home-page chapter. The story moves from a soft,
 * glowing care network to structure, clinical calm, focus, community, and
 * finally a quiet close.
 */
export type ScenePreset =
  | "hero"
  | "departments"
  | "doctors"
  | "booking"
  | "trust"
  | "about"
  | "contact"
  | "closing"
  | "ambient"
  | "quiet";

export const ENV_PRESETS: Record<ScenePreset, SceneEnv> = {
  hero: { wave: 1, speed: 1, particles: 1, grid: 0.35, glow: 1, care: 0.2, camZ: 0, camY: 0 },
  departments: { wave: 0.75, speed: 0.8, particles: 0.85, grid: 0.7, glow: 0.7, care: 0.1, camZ: 1.4, camY: -0.15 },
  doctors: { wave: 0.35, speed: 0.5, particles: 0.45, grid: 0.85, glow: 0.35, care: 0, camZ: 0.8, camY: 0.1 },
  booking: { wave: 0.3, speed: 0.45, particles: 0.4, grid: 0.5, glow: 0.65, care: 0.35, camZ: -0.5, camY: 0 },
  trust: { wave: 0.6, speed: 0.6, particles: 0.65, grid: 0.4, glow: 0.6, care: 0.15, camZ: 0.6, camY: 0.1 },
  about: { wave: 0.9, speed: 0.7, particles: 0.9, grid: 0.25, glow: 0.9, care: 0.3, camZ: 0.4, camY: 0 },
  contact: { wave: 0.3, speed: 0.35, particles: 0.35, grid: 0.25, glow: 0.35, care: 0.1, camZ: 1, camY: -0.1 },
  closing: { wave: 0.2, speed: 0.25, particles: 0.15, grid: 0.15, glow: 0.55, care: 0.25, camZ: 0.2, camY: 0 },
  ambient: { wave: 0.7, speed: 0.7, particles: 0.7, grid: 0.25, glow: 0.5, care: 0, camZ: 0, camY: 0 },
  quiet: { wave: 0.4, speed: 0.5, particles: 0.4, grid: 0.15, glow: 0.3, care: 0, camZ: 0, camY: 0 },
};

let current: ScenePreset | null = null;

/** Blend the whole background toward a chapter's mood (instant with reduced motion). */
export function applyScenePreset(preset: ScenePreset, instant = false): void {
  if (preset === current && !instant) return;
  current = preset;
  const target = ENV_PRESETS[preset];
  if (instant || sceneStore.reducedMotion) {
    gsap.killTweensOf(sceneStore.env);
    Object.assign(sceneStore.env, target);
    requestSceneFrames(4);
    return;
  }
  gsap.to(sceneStore.env, {
    ...target,
    duration: 1.6,
    ease: "sine.inOut",
    overwrite: "auto",
    onUpdate: () => requestSceneFrames(2),
  });
}
