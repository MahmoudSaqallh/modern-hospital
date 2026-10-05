"use client";

import Link from "next/link";
import { CalendarPlus, Phone, Stethoscope, UserRoundSearch, type LucideIcon } from "lucide-react";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { setFocusJourney } from "@/three/sceneStore";
import { ForwardArrow } from "@/components/ui/Button";

type QuickKey = "book" | "doctor" | "departments" | "contact";

/** Each action names the journey node it relates to, so the 3D node can respond. */
const ITEMS: ReadonlyArray<{ key: QuickKey; path: string; icon: LucideIcon; node: number }> = [
  { key: "book", path: "/booking", icon: CalendarPlus, node: 3 },
  { key: "doctor", path: "/doctors", icon: UserRoundSearch, node: 2 },
  { key: "departments", path: "/departments", icon: Stethoscope, node: 1 },
  { key: "contact", path: "/contact", icon: Phone, node: 4 },
];

/**
 * Quick-access strip under the hero: one continuous band with hairline
 * dividers — not four floating cards. Hover/focus lights the matching
 * node of the patient-journey network.
 */
export function QuickAccess() {
  const { locale, dict } = useI18n();
  const focus = (node: number) => () => setFocusJourney(node);
  const blur = () => setFocusJourney(-1);

  return (
    <nav aria-label={dict.quick.label} data-intro="strip" className="relative bg-paper/80">
      <span
        data-intro="strip-line"
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left bg-line-strong rtl:origin-right"
      />
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          const copy = dict.quick[item.key];
          return (
            <li
              key={item.key}
              data-intro="strip-item"
              className={cn(
                "border-line",
                i % 2 === 0 && "border-e",
                i < 2 && "border-b lg:border-b-0",
                i === 1 && "lg:border-e",
              )}
            >
              <Link
                href={localePath(locale, item.path)}
                onMouseEnter={focus(item.node)}
                onMouseLeave={blur}
                onFocus={focus(item.node)}
                onBlur={blur}
                className="group/btn relative flex min-h-[4.75rem] items-center gap-3.5 overflow-hidden px-3 py-4 transition-colors duration-300 hover:bg-white/85 sm:px-5 lg:min-h-24 lg:gap-4 lg:px-6"
              >
                {/* Soft glow that rises from the base line on hover. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 -bottom-8 h-16 rounded-full bg-care/0 blur-2xl transition-colors duration-500 group-hover/btn:bg-care/15"
                />
                <span className="relative flex size-10 shrink-0 items-center justify-center border border-line bg-paper text-care-deep transition-[transform,border-color] duration-300 ease-[var(--ease-out-quart)] group-hover/btn:-translate-y-0.5 group-hover/btn:border-care-deep/40 lg:size-11">
                  <Icon aria-hidden strokeWidth={1.5} className="size-5 transition-transform duration-300 group-hover/btn:-rotate-6" />
                </span>
                <span className="relative min-w-0">
                  <span className="block text-[0.9375rem] font-medium leading-6 text-ink transition-colors group-hover/btn:text-care-deep">
                    {copy.title}
                  </span>
                  <span className="hidden text-meta sm:block">{copy.hint}</span>
                </span>
                <ForwardArrow className="relative ms-auto hidden text-muted group-hover/btn:text-care-deep sm:block" />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-care-deep transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover/btn:scale-x-100 group-focus-visible/btn:scale-x-100 rtl:origin-right"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
