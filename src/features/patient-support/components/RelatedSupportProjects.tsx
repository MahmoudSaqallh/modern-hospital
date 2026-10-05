import { projectsInCategory } from "@/data/projects";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";

/** Patient-support projects from the projects catalogue, with a link to the filtered list. */
export function RelatedSupportProjects({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.patientSupport.related;
  const related = projectsInCategory("patient-support").slice(0, 3);
  const href = `${localePath(locale, "/projects")}#patient-support`;

  return (
    <Reveal as="section" aria-labelledby="support-projects-title" className="relative border-t border-line bg-white/85 py-20 lg:py-28">
      <div className="container-site">
        <SectionHeader
          id="support-projects-title"
          index="06"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={dict.projects.categoryText["patient-support"]}
          action={<TextLink href={href}>{copy.cta}</TextLink>}
        />
        {related.length > 0 && (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((project) => (
              <li key={project.slug} data-reveal>
                <ProjectCard project={project} locale={locale} dict={dict} compact />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}
