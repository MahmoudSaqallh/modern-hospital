"use client";

import { useEffect, type RefObject } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";
import { applyScenePreset, type ScenePreset } from "@/three/envPresets";
import { requestSceneFrames, sceneStore, type AnchorKey } from "@/three/sceneStore";

/**
 * DOM → scene bridge for the home page.
 *
 * Anchors: elements the 3D scene aligns to. One passive scroll/resize
 * listener measures every registered anchor once per animation frame and
 * writes position, size and a visibility "weight" into the scene store.
 */
const registry = new Map<AnchorKey, HTMLElement>();
let frame = 0;
let listening = false;

function measure() {
  frame = 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  for (const [key, el] of registry) {
    const rect = el.getBoundingClientRect();
    const anchor = sceneStore.anchors[key];
    if (rect.width === 0 || rect.height === 0) {
      anchor.weight = 0;
      continue;
    }
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    anchor.x = (cx / vw) * 2 - 1;
    anchor.y = -((cy / vh) * 2 - 1);
    anchor.w = (rect.width / vw) * 2;
    anchor.h = (rect.height / vh) * 2;
    // Full presence while the anchor's centre is in the middle band, easing out toward the edges.
    const distance = Math.abs(cy - vh / 2) / (vh / 2 + rect.height / 2);
    anchor.weight = Math.min(1, Math.max(0, (1 - distance) * 1.8 - 0.25));
  }
  if (sceneStore.reducedMotion) requestSceneFrames(2);
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(measure);
};

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  ScrollTrigger.addEventListener("refresh", schedule);
}

function stopListening() {
  if (!listening || registry.size > 0) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  ScrollTrigger.removeEventListener("refresh", schedule);
  cancelAnimationFrame(frame);
  frame = 0;
}

/** Register a DOM element as the scene anchor `key` for as long as it is mounted. */
export function useSceneAnchor(ref: RefObject<HTMLElement | null>, key: AnchorKey) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registry.set(key, el);
    startListening();
    schedule();
    return () => {
      if (registry.get(key) === el) registry.delete(key);
      sceneStore.anchors[key].weight = 0;
      stopListening();
    };
  }, [ref, key]);
}

/**
 * Chapter: while this section owns the middle of the screen, the background
 * blends toward its preset (GSAP-tweened in applyScenePreset).
 */
export function useSceneChapter(ref: RefObject<HTMLElement | null>, preset: ScenePreset) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive) applyScenePreset(preset);
        },
      });
    },
    { dependencies: [preset] },
  );
}
