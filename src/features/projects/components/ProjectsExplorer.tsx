"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { projects, projectsInCategory } from "@/data/projects";
import { Flip, gsap, useGSAP } from "@/animations/gsap";
import { prefersReducedMotion } from "@/animations/motion";
import { attachTilt } from "@/animations/tilt";
import { PROJECT_CATEGORIES, type ProjectCategory } from "@/features/projects/types";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { CATEGORY_ACCENT, ProjectCard } from "./ProjectCard";

type Filter = ProjectCategory | "all";

const isCategory = (value: string): value is ProjectCategory => (PROJECT_CATEGORIES as readonly string[]).includes(value);
const readHash = () => decodeURIComponent(window.location.hash.slice(1));
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * Projects: the three categories as distinct groups that double as filters,
 * plus "All". Filtering never reloads: leaving cards fade, the grid
 * re-flows with GSAP Flip, entering cards settle in.
 */
export function ProjectsExplorer() {
  const { locale, dict } = useI18n();
  const copy = dict.projects;
  const grid = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  // A category in the URL hash (e.g. /projects#patient-support) pre-selects it; a click takes over.
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const [chosen, setFilter] = useState<Filter | null>(null);
  const filter: Filter = chosen ?? (isCategory(hash) ? hash : "all");

  useGSAP(() => (grid.current ? attachTilt(grid.current) : undefined), { scope: grid });

  const applyFilter = (next: Filter) => {
    if (next === filter) return;
    const el = grid.current;
    if (!el || prefersReducedMotion()) {
      setFilter(next);
      return;
    }
    const cards = gsap.utils.toArray<HTMLElement>("[data-project]", el);
    const leaving = cards.filter((c) => c.dataset.visible === "true" && next !== "all" && c.dataset.category !== next);
    const commit = () => {
      flipState.current = Flip.getState(cards);
      setFilter(next);
    };
    if (leaving.length) gsap.to(leaving, { opacity: 0, scale: 0.97, duration: 0.2, ease: "power2.in", onComplete: commit });
    else commit();
  };

  // After React re-renders the visibility, animate from the captured layout.
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }),
    });
  }, [filter]);

  const visible = (category: ProjectCategory) => filter === "all" || filter === category;

  return (
    <div>
      {/* Category groups — each is also a filter. */}
      <div role="group" aria-label={copy.filterLabel} className="grid border-s border-t border-line md:grid-cols-[minmax(0,0.6fr)_repeat(3,minmax(0,1fr))]">
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => applyFilter("all")}
          className={cn(
            "flex min-h-16 items-center justify-between gap-3 border-b border-e border-line px-5 py-4 text-start transition-colors",
            filter === "all" ? "bg-ink text-white" : "bg-paper/80 hover:bg-white",
          )}
        >
          <span className="font-medium">{copy.all}</span>
          <span className={cn("text-[0.8125rem] tabular", filter === "all" ? "text-white/70" : "text-muted")}>
            {plural(copy.results, projects.length, locale)}
          </span>
        </button>
        {PROJECT_CATEGORIES.map((category) => {
          const active = filter === category;
          const accent = CATEGORY_ACCENT[category];
          return (
            <button
              key={category}
              id={category}
              type="button"
              aria-pressed={active}
              onClick={() => applyFilter(category)}
              className={cn(
                "group relative flex scroll-mt-32 flex-col gap-1.5 border-b border-e border-line px-5 py-5 text-start transition-colors",
                active ? "bg-white" : "bg-paper/80 hover:bg-white",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 top-0 h-[2px] origin-left transition-transform duration-500 rtl:origin-right",
                  accent.bar,
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                )}
              />
              <span className="flex items-center justify-between gap-3">
                <span className={cn("font-medium", active ? "text-ink" : "text-ink-2")}>{copy.categories[category]}</span>
                <span className="text-[0.8125rem] text-muted tabular">{plural(copy.results, projectsInCategory(category).length, locale)}</span>
              </span>
              <span className="text-[0.875rem] leading-6 text-muted">{copy.categoryText[category]}</span>
            </button>
          );
        })}
      </div>

      <p role="status" aria-live="polite" className="visually-hidden">
        {plural(copy.results, projectsInCategory(filter === "all" ? null : filter).length, locale)}
      </p>

      <ul ref={grid} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const shown = visible(project.category);
          return (
            <li
              key={project.slug}
              data-project
              data-category={project.category}
              data-visible={shown ? "true" : "false"}
              hidden={!shown}
            >
              <ProjectCard project={project} locale={locale} dict={dict} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
