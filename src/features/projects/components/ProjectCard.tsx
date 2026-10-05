import Link from "next/link";
import type { Project, ProjectCategory, ProjectStatus } from "@/features/projects/types";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { ForwardArrow } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";

/** One restrained accent per category — the three groups read differently at a glance. */
export const CATEGORY_ACCENT: Record<ProjectCategory, { bar: string; dot: string; text: string }> = {
  development: { bar: "bg-care-deep", dot: "bg-care", text: "text-care-deep" },
  "patient-support": { bar: "bg-medical", dot: "bg-medical", text: "text-medical" },
  completed: { bar: "bg-ink", dot: "bg-ink-2", text: "text-ink-2" },
};

export function projectHref(locale: Locale, project: Project): string {
  return localePath(locale, `/projects/${project.slug}`);
}

export function ProjectStatusLabel({ status, dict, className }: { status: ProjectStatus; dict: Dictionary; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[0.8125rem] text-ink-2", className)}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "completed" ? "bg-ink-2" : status === "planned" ? "border border-muted bg-transparent" : "bg-care",
        )}
      />
      {dict.projects.status[status]}
    </span>
  );
}

/**
 * Project card: strong image, category tag, status, title, summary, arrow.
 * Hover: image drifts, a thin category line draws, the card lifts a touch.
 * (Pointer tilt is added by the explorer on capable devices.)
 */
export function ProjectCard({
  project,
  locale,
  dict,
  compact = false,
  className,
}: {
  project: Project;
  locale: Locale;
  dict: Dictionary;
  compact?: boolean;
  className?: string;
}) {
  const accent = CATEGORY_ACCENT[project.category];
  return (
    <article
      data-tilt
      className={cn(
        "group group/btn relative h-full border border-line bg-paper transition-[box-shadow,border-color] duration-500 ease-[var(--ease-out-quart)] hover:border-line-strong hover:shadow-[var(--shadow-lift)] [transform-style:preserve-3d]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-x-100 group-focus-within:scale-x-100 rtl:origin-right",
          accent.bar,
        )}
      />
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.04] motion-reduce:transition-none">
          <ImageSlot
            src={project.cover.src}
            caption={project.cover.caption[locale]}
            slotLabel={dict.common.imageSlot}
            className={cn("w-full", compact ? "aspect-[16/10]" : "aspect-[4/3]")}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          />
        </div>
        <span className="absolute start-3 top-3 inline-flex items-center gap-2 bg-paper/95 px-2.5 py-1 text-[0.75rem] font-medium text-ink">
          <span aria-hidden className={cn("size-1.5 rounded-full", accent.dot)} />
          {dict.projects.categories[project.category]}
        </span>
      </div>
      <div className={cn("flex flex-col", compact ? "p-5" : "p-6")}>
        <ProjectStatusLabel status={project.status} dict={dict} />
        <h3 className={cn("mt-3 text-ink", compact ? "text-[1.0625rem] font-medium leading-7" : "text-h3")}>
          <Link href={projectHref(locale, project)} className="after:absolute after:inset-0 transition-colors group-hover:text-care-deep">
            {project.title[locale]}
          </Link>
        </h3>
        {!compact && <p className="mt-2 text-[0.9375rem] leading-7 text-muted">{project.summary[locale]}</p>}
        <span aria-hidden className={cn("mt-5 inline-flex items-center gap-2 text-[0.875rem] font-medium", accent.text)}>
          {dict.projects.view}
          <ForwardArrow />
        </span>
      </div>
    </article>
  );
}
