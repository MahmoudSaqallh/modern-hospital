"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { homeVisualsActive, SCENE_READY_EVENT, sceneStore } from "./sceneStore";

const AMBIENT_INTERVAL_MS = 1000 / 30;

/**
 * Drives the canvas with `frameloop="demand"`:
 * - full frame rate while a home-page story object is on screen,
 * - 30 fps for the ambient field elsewhere,
 * - nothing on the booking flow once settled, in hidden tabs, or with reduced motion
 *   (beyond the few frames needed to reflect a state change).
 */
export function FrameDriver() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;

      if (sceneStore.pendingFrames > 0) {
        sceneStore.pendingFrames -= 1;
        invalidate();
        last = now;
        return;
      }
      if (sceneStore.reducedMotion || sceneStore.mode === "quiet") return;

      if (homeVisualsActive() || now - last >= AMBIENT_INTERVAL_MS) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate]);

  return null;
}

/** Fires once after the first rendered frame so the CSS fallback can step aside. */
export function SceneReadySignal() {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    requestAnimationFrame(() => {
      sceneStore.ready = true;
      window.dispatchEvent(new Event(SCENE_READY_EVENT));
    });
  });
  return null;
}
