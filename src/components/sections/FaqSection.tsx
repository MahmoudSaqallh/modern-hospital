"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * FAQ accordion. Native buttons with aria-expanded/aria-controls; the panel
 * animates with a CSS grid-rows transition (instant under reduced motion).
 */
export function FaqSection({ index = "08", className }: { index?: string; className?: string }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const copy = dict.faq;

  return (
    <Reveal as="section" aria-labelledby={`${baseId}-title`} className={cn("relative border-t border-line bg-white py-24 lg:py-32", className)}>
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader id={`${baseId}-title`} index={index} eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          </div>
        </div>

        <div className="border-t border-ink/15 lg:col-span-8">
          {copy.items.map((item, i) => {
            const expanded = open === i;
            const buttonId = `${baseId}-q${i}`;
            const panelId = `${baseId}-a${i}`;
            return (
              <div key={item.question} data-reveal className="border-b border-line">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="group flex w-full items-start gap-6 py-6 text-start"
                  >
                    <span className="flex-1">
                      <span className="block text-[0.8125rem] text-muted">{item.category}</span>
                      <span className="mt-1 block text-[1.0625rem] font-medium leading-7 text-ink transition-colors group-hover:text-care-deep">
                        {item.question}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "mt-5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-300",
                        expanded ? "rotate-45 border-care-deep bg-care-deep text-white" : "border-line-strong text-ink",
                      )}
                    >
                      <Plus strokeWidth={1.5} className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-400 ease-[var(--ease-out-quart)]",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                  inert={!expanded}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pb-7 pe-14 text-[0.9375rem] leading-8 text-ink-2">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
