import { FileCheck2, HeartHandshake, LayoutList, MessagesSquare, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";

const ICONS: LucideIcon[] = [LayoutList, MessagesSquare, FileCheck2, HeartHandshake];

/** A restrained statement of how the programs are run — no figures, no unverifiable claims. */
export function SupportTrust({ dict }: { dict: Dictionary }) {
  const copy = dict.patientSupport.trust;
  return (
    <Reveal as="section" aria-labelledby="support-trust-title" className="relative py-20 lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p data-reveal className="text-eyebrow flex items-center gap-2.5">
            <ArcMark size={14} />
            <span className="font-mono text-[0.75rem] tabular">05</span>
            <span aria-hidden className="h-px w-5 bg-line-strong" />
            <span>{copy.eyebrow}</span>
          </p>
          <h2
            id="support-trust-title"
            data-reveal="mask"
            className="mt-4 max-w-[22ch] font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.35rem)] leading-snug text-ink"
          >
            {copy.title}
          </h2>
        </div>
        <ul className="grid border-t border-ink/15 sm:grid-cols-2 lg:col-span-7">
          {copy.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <li key={item.title} data-reveal className="flex gap-4 border-b border-line py-6 sm:pe-6">
                <Icon aria-hidden strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-care-deep" />
                <div>
                  <h3 className="text-[1.0625rem] font-medium text-ink">{item.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-7 text-muted">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Reveal>
  );
}
