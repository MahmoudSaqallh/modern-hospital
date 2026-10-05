"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { gsap, useGSAP } from "@/animations/gsap";
import { prefersReducedMotion } from "@/animations/motion";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/localized";

type CopyState = "idle" | "copied" | "failed";

/**
 * Copies a value and confirms inline ("تم النسخ ✓") — no dialog, no toast
 * stack. The button keeps its width so nothing around it shifts, and the
 * result is announced to screen readers through a polite live region.
 */
export function CopyButton({
  value,
  label,
  copiedText,
  failedText,
  announcement,
  className,
}: {
  value: string;
  /** Visible action, e.g. "نسخ الرقم". The value itself is appended for screen readers. */
  label: string;
  copiedText: string;
  failedText: string;
  /** Spoken after a successful copy, e.g. "تم نسخ رقم الهاتف". */
  announcement: string;
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);
  const icon = useRef<HTMLSpanElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useGSAP(
    () => {
      if (state !== "copied" || !icon.current || prefersReducedMotion()) return;
      gsap.fromTo(icon.current, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" });
    },
    { dependencies: [state] },
  );

  const onCopy = async () => {
    const ok = await copyText(value);
    window.clearTimeout(timer.current);
    setState(ok ? "copied" : "failed");
    timer.current = window.setTimeout(() => setState("idle"), ok ? 2400 : 5000);
  };

  const copied = state === "copied";

  return (
    <span className={cn("relative inline-flex flex-col", className)}>
      <button
        type="button"
        onClick={onCopy}
        data-state={state}
        className={cn(
          "group/copy inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[3px] border px-4 text-[0.9375rem] font-medium transition-colors duration-200",
          copied
            ? "border-care-deep/40 bg-care-tint text-care-deep"
            : "border-line-strong bg-white/80 text-ink hover:border-ink/40 hover:bg-white",
        )}
      >
        <span ref={icon} className="inline-flex">
          {copied ? (
            <Check aria-hidden strokeWidth={2} className="size-4" />
          ) : (
            <Copy aria-hidden strokeWidth={1.5} className="size-4 text-muted transition-colors group-hover/copy:text-ink" />
          )}
        </span>
        {/* Both labels share one grid cell, so the button never changes width. */}
        <span className="grid">
          <span className={cn("col-start-1 row-start-1", copied && "invisible")}>
            {label}
            <span className="visually-hidden">: {value}</span>
          </span>
          <span aria-hidden={!copied} className={cn("col-start-1 row-start-1", !copied && "invisible")}>
            {copiedText}
          </span>
        </span>
      </button>
      {state === "failed" && <span className="mt-1.5 text-[0.8125rem] leading-5 text-medical">{failedText}</span>}
      <span role="status" className="visually-hidden">
        {copied ? announcement : state === "failed" ? failedText : ""}
      </span>
    </span>
  );
}
