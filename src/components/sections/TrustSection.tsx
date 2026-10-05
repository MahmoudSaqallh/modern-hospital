"use client";

import { useRef } from "react";
import { useSceneChapter } from "@/animations/sceneBridge";
import { useI18n } from "@/i18n/I18nProvider";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";

/** Editorial trust section: one strong statement, four commitments. No statistics. */
export function TrustSection() {
  const { dict } = useI18n();
  const copy = dict.trust;
  const anchor = useRef<HTMLDivElement>(null);
  useSceneChapter(anchor, "trust");

  return (
    <div ref={anchor}>
      <Reveal as="section" aria-labelledby="trust-title" className="relative py-24 lg:py-28">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p data-reveal className="text-eyebrow flex items-center gap-2.5">
              <ArcMark size={14} />
              <span className="font-mono text-[0.75rem] tabular">04</span>
              <span aria-hidden className="h-px w-5 bg-line-strong" />
              {copy.eyebrow}
            </p>
            <h2
              id="trust-title"
              data-reveal="mask"
              className="mt-6 font-display text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] leading-[1.45] text-ink"
            >
              {copy.statement}
            </h2>
            <p data-reveal className="text-lead mt-6 max-w-[44ch] text-muted">
              {copy.text}
            </p>
          </div>

          <ol className="self-end border-t border-ink/15 lg:col-span-6">
            {copy.values.map((value, i) => (
              <li key={value.title} data-reveal className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline border-b border-line py-7">
                <span className="font-display text-[1.5rem] text-care-deep tabular">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-h3 text-ink">{value.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{value.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}
