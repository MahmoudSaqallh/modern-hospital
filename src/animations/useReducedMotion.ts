"use client";

import { useSyncExternalStore } from "react";
import { MEDIA } from "./motion";

function subscribe(callback: () => void) {
  const query = window.matchMedia(MEDIA.reduced);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/** Live `prefers-reduced-motion` value; `false` during server rendering. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MEDIA.reduced).matches,
    () => false,
  );
}
