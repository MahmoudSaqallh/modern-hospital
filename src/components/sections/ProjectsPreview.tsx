"use client";

import { useRef } from "react";
import { highlightedProjects } from "@/data/projects";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { revealGroup } from "@/animations/sections";
import { useSceneChapter } from "@/animations/sceneBridge";
import { attachTilt } from "@/animations/tilt";
import { CATEGORY_ACCENT, ProjectCard } from "@/features/projects/components/ProjectCard";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/localized";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";

/** Home: the three project groups side by side, one highlighted project each. */
export function ProjectsPreview() {
  const { locale, dict } = useI18n();
  const copy = dict.projectsPreview;
  const section = useRef<HTMLElement>(null);
  const highlights = highlightedProjects();
  useSceneChapter(section, "projects");

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => revealGroup(root, { stagger: 0.08 }));
      return attachTilt(root);
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="projects-preview-title" className="relative py-24 lg:py-32">
      <div className="container-site">
        <SectionHeader
          id="projects-preview-title"
          index="06"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={<TextLink href={localePath(locale, "/projects")}>{copy.cta}</TextLink>}
        />
        {highlights.length === 0 ? (
          <p className="mt-14 text-muted">{copy.empty}</p>
        ) : (
          <ul className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {highlights.map((project) => {
              const accent = CATEGORY_ACCENT[project.category];
              return (
                <li key={project.slug} data-reveal className="flex flex-col">
                  <div className="mb-5 border-t border-ink/15 pt-4">
                    <p className={cn("flex items-center gap-2.5 text-[0.9375rem] font-medium", accent.text)}>
                      <span aria-hidden className={cn("h-[2px] w-6", accent.bar)} />
                      {dict.projects.categories[project.category]}
                    </p>
                    <p className="mt-1.5 text-[0.875rem] leading-6 text-muted">{dict.projects.categoryText[project.category]}</p>
                  </div>
                  <ProjectCard project={project} locale={locale} dict={dict} compact className="flex-1" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
