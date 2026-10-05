"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { onAppReady } from "@/animations/appReady";
import { MEDIA } from "@/animations/motion";
import { useSceneAnchor } from "@/animations/sceneBridge";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { SUPPORT_CORE_RADIUS, SUPPORT_NODES, controlPoint, rimPoint } from "../network";

/**
 * Patient care network: care at the centre, joined to the patient, the
 * medical procedure, community support and the hospital. The SVG is the
 * complete, crisp diagram (works without WebGL); the shared 3D scene adds
 * light flowing along the same paths through the `support-network` anchor.
 */
export function SupportNetworkVisual({ className }: { className?: string }) {
  const { dir, dict } = useI18n();
  const copy = dict.patientSupport.hero;
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  useSceneAnchor(frame, "support-network");
  const mirror = dir === "rtl" ? -1 : 1;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        // Hidden by the intro guard until the app is ready, so this never flashes.
        gsap.set("[data-net-path]", { strokeDashoffset: 1 });
        gsap.set("[data-net-node], [data-net-label]", { opacity: 0 });
        gsap.set("[data-net-core]", { scale: 0.85, opacity: 0, transformOrigin: "50% 50%" });
        let tl: gsap.core.Timeline | undefined;
        const cancel = onAppReady(() => {
          tl = gsap
            .timeline({ delay: 0.35 })
            .to("[data-net-core]", { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" })
            .to("[data-net-path]", { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut", stagger: 0.12 }, 0.2)
            .to("[data-net-node]", { opacity: 1, duration: 0.5, stagger: 0.12 }, 0.9)
            .to("[data-net-label]", { opacity: 1, duration: 0.6, stagger: 0.12 }, 1.05);
        });
        return () => {
          cancel();
          tl?.kill();
        };
      });
    },
    { scope: root },
  );

  // SVG y grows downward; unit space y grows upward.
  const pt = (p: { x: number; y: number }) => `${(p.x * mirror).toFixed(3)} ${(-p.y).toFixed(3)}`;

  return (
    <div ref={root} className={cn("relative", className)}>
      <div ref={frame} className="relative mx-auto aspect-square w-full max-w-[30rem]">
        <svg aria-hidden viewBox="-1 -1 2 2" className="absolute inset-0 size-full overflow-visible">
          <circle r={0.92} fill="none" className="stroke-line" strokeWidth={0.004} strokeDasharray="0.012 0.02" />
          {SUPPORT_NODES.map((node) => (
            <path
              key={node.key}
              data-net-path
              d={`M ${pt(node)} Q ${pt(controlPoint(node))} ${pt(rimPoint(node))}`}
              pathLength={1}
              strokeDasharray="1"
              fill="none"
              className={node.tone === "medical" ? "stroke-medical/45" : "stroke-care/45"}
              strokeWidth={0.008}
              strokeLinecap="round"
            />
          ))}
          {SUPPORT_NODES.map((node) => (
            <g key={node.key} data-net-node transform={`translate(${pt(node)})`}>
              <circle r={0.07} className="fill-paper" />
              <circle r={0.045} fill="none" className={node.tone === "medical" ? "stroke-medical" : "stroke-care-deep"} strokeWidth={0.008} />
              <circle r={0.016} className={node.tone === "medical" ? "fill-medical" : "fill-care-deep"} />
            </g>
          ))}
          <g data-net-core>
            <circle r={SUPPORT_CORE_RADIUS} className="fill-white" />
            <circle r={SUPPORT_CORE_RADIUS} fill="none" className="stroke-care-deep" strokeWidth={0.01} />
            <circle r={SUPPORT_CORE_RADIUS - 0.035} fill="none" className="stroke-line-strong" strokeWidth={0.004} />
            <circle r={0.034} className="fill-medical" />
          </g>
        </svg>

        {/* Labels in HTML so they stay sharp, translatable and readable. */}
        {SUPPORT_NODES.map((node) => {
          const above = node.y > 0;
          return (
            <span
              key={node.key}
              aria-hidden
              data-net-label
              className={cn(
                "absolute -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-paper/90 px-3 py-1 text-[0.8125rem] text-ink-2",
                above ? "-translate-y-[calc(100%+1.6rem)]" : "translate-y-[1.6rem]",
              )}
              style={{ left: `${((node.x * mirror + 1) / 2) * 100}%`, top: `${((1 - node.y) / 2) * 100}%` }}
            >
              {copy.nodes[node.key]}
            </span>
          );
        })}
        <span
          aria-hidden
          data-net-label
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.875rem] font-medium text-care-deep"
          style={{ top: `calc(${50 + SUPPORT_CORE_RADIUS * 50}% + 0.75rem)` }}
        >
          {copy.nodes.care}
        </span>
      </div>
      <p className="visually-hidden">{copy.networkLabel}</p>
    </div>
  );
}
