"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** Single registration point — import gsap from here, never from "gsap" directly in components. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.6 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { Flip, gsap, ScrollTrigger, useGSAP };
