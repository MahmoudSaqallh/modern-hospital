"use client";

import { gsap } from "./gsap";
import { duration, ease, stagger as staggerTokens } from "./motion";

/**
 * Reveal language for content sections. Elements opt in with `data-reveal`:
 *   data-reveal          → soft rise + fade (default)
 *   data-reveal="mask"   → clip-mask lift, for headings
 *   data-reveal="line"   → hairline draws along the reading direction
 *   data-reveal="fade"   → opacity only (dense content, tables)
 */
export function revealGroup(root: HTMLElement, options: { start?: string; stagger?: number } = {}) {
  const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
  if (items.length === 0) return;
  // Content already on screen when scripts start stays put — hiding it now
  // would flash (visible → hidden → visible). Only below-the-fold content reveals.
  if (root.getBoundingClientRect().top < window.innerHeight * 0.85) return;

  const step = options.stagger ?? staggerTokens.base;
  const tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: options.start ?? "top 82%", once: true },
  });

  items.forEach((el, i) => {
    const at = Math.min(i * step, 0.9);
    switch (el.dataset.reveal) {
      case "mask":
        tl.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)", y: 26 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1, ease: ease.outStrong, clearProps: "clipPath" },
          at,
        );
        break;
      case "line":
        tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: ease.drawLine }, at);
        break;
      case "fade":
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: duration.reveal }, at);
        break;
      default:
        tl.fromTo(el, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: duration.reveal, ease: ease.out }, at);
    }
  });
}
