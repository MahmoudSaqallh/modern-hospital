/**
 * Motion language — one coherent set of durations and eases.
 * Micro 0.18–0.3s · UI 0.35–0.5s · Section reveals 0.6–0.9s.
 * No elastic, back or bounce eases anywhere: this is a healthcare product.
 */
export const duration = {
  micro: 0.22,
  ui: 0.45,
  reveal: 0.8,
  scene: 1.4,
} as const;

export const ease = {
  out: "power3.out",
  outStrong: "expo.out",
  inOut: "sine.inOut",
  drawLine: "power2.inOut",
} as const;

export const stagger = {
  tight: 0.05,
  base: 0.08,
  loose: 0.12,
} as const;

export const MEDIA = {
  motionOk: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
  desktop: "(min-width: 64rem)",
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MEDIA.reduced).matches;
}

/** +1 for LTR, -1 for RTL — so "forward" motion follows the reading direction. */
export function readingDirection(): 1 | -1 {
  return typeof document !== "undefined" && document.documentElement.dir === "rtl" ? -1 : 1;
}
