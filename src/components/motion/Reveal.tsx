"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";

/**
 * Scroll-reveal wrapper. Children opt in with `data-reveal`; content is fully
 * visible without JavaScript and with reduced motion (no animation is set up).
 */
type RevealTag = "div" | "section" | "ul" | "ol" | "header" | "article" | "aside";

export function Reveal({
  as = "div",
  children,
  className,
  start,
  stagger,
  id,
  ...rest
}: {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  start?: string;
  stagger?: number;
  id?: string;
  "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // All allowed tags are plain block elements; typing them as "div" keeps the ref simple.
  const Tag = as as "div";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (ref.current) revealGroup(ref.current, { start, stagger });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} id={id} {...rest}>
      {children}
    </Tag>
  );
}
