"use client";

import Link from "next/link";
import { useRef } from "react";
import { departmentsByCategory } from "@/data/departments";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useSceneAnchor } from "@/animations/sceneBridge";
import type { DepartmentCategory } from "@/features/departments/types";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { setFocusNetwork } from "@/three/sceneStore";
import { MedicalIcon } from "@/components/icons/MedicalIcon";

/**
 * Therapeutic | care network | supporting. The two groups sit on either
 * side of the patient; the WebGL network between them shows each department
 * connected to patient care. Hovering or focusing a department lights its
 * node and connection.
 */
export function DepartmentsSplit({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const copy = dict.departmentsPage;
  const root = useRef<HTMLDivElement>(null);
  const network = useRef<HTMLDivElement>(null);
  useSceneAnchor(network, "care-network");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (root.current) revealGroup(root.current, { stagger: 0.04 });
      });
      return () => setFocusNetwork(null);
    },
    { scope: root },
  );

  const column = (category: DepartmentCategory) => {
    const list = departmentsByCategory(category);
    const group = copy[category];
    const tone = category === "therapeutic" ? "text-care-deep" : "text-ink-2";
    return (
      <div className="min-w-0">
        <p data-reveal className={cn("text-eyebrow flex items-center gap-2", tone)}>
          <span aria-hidden className={cn("size-2 rounded-full", category === "therapeutic" ? "bg-care" : "bg-ink-2")} />
          {group.short}
        </p>
        <h3 data-reveal className="mt-3 font-display text-[1.6rem] leading-snug text-ink">
          {group.title}
        </h3>
        <p data-reveal className="mt-2 text-[0.9375rem] leading-7 text-muted">
          {group.text}
        </p>
        <p data-reveal className="mt-3 text-meta tabular">
          {plural(copy.count, list.length, locale)}
        </p>
        <ul className="mt-6 border-t border-ink/15">
          {list.map((department) => (
            <li key={department.id} data-reveal className="border-b border-line">
              <Link
                href={`${localePath(locale, "/departments")}#${department.id}`}
                onMouseEnter={() => setFocusNetwork(department.id)}
                onMouseLeave={() => setFocusNetwork(null)}
                onFocus={() => setFocusNetwork(department.id)}
                onBlur={() => setFocusNetwork(null)}
                className="group/item flex min-h-12 items-center gap-3 py-2.5 transition-colors hover:bg-white/70"
              >
                <MedicalIcon
                  name={department.icon}
                  size={20}
                  className={cn("shrink-0 transition-transform duration-300 group-hover/item:-translate-y-0.5", tone)}
                />
                <span className="text-[0.9375rem] text-ink transition-colors group-hover/item:text-care-deep">{department.name[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div ref={root} className={cn("grid gap-12 lg:grid-cols-12 lg:gap-8", className)}>
      <div className="lg:col-span-4">{column("therapeutic")}</div>

      <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div ref={network} aria-hidden className="relative aspect-[6/5] w-full">
          <span className="absolute inset-x-[18%] inset-y-[8%] rounded-full border border-dashed border-line" />
        </div>
        <p className="visually-hidden">{copy.networkLabel}</p>
        <p aria-hidden className="mt-2 text-center text-[0.8125rem] text-muted">
          {dict.departmentsPreview.center}
        </p>
      </div>

      <div className="lg:col-span-4">{column("supporting")}</div>
    </div>
  );
}
