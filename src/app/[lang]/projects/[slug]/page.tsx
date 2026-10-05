import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProject, projects, relatedProjects } from "@/data/projects";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/localized";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { CATEGORY_ACCENT, ProjectCard, ProjectStatusLabel } from "@/features/projects/components/ProjectCard";
import { ProjectGallery } from "@/features/projects/components/ProjectGallery";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) return {};
  return { title: project.title[lang], description: project.summary[lang] };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.projects;
  const accent = CATEGORY_ACCENT[project.category];
  const related = relatedProjects(project);
  const dateOptions = { day: "numeric", month: "long", year: "numeric" } as const;

  const facts: Array<{ label: string; value: React.ReactNode }> = [
    { label: copy.category, value: copy.categories[project.category] },
    { label: copy.statusLabel, value: <ProjectStatusLabel status={project.status} dict={dict} /> },
    ...(project.startDate ? [{ label: copy.start, value: formatDate(project.startDate, lang, dateOptions) }] : []),
    ...(project.endDate ? [{ label: copy.end, value: formatDate(project.endDate, lang, dateOptions) }] : []),
    ...(project.partner ? [{ label: copy.partner, value: project.partner[lang] }] : []),
  ];

  return (
    <article className="relative bg-paper/90">
      <header className="pt-[calc(76px+2rem)] lg:pt-[calc(88px+3rem)]">
        <PageIntro className="container-site">
          <Link
            data-intro
            href={localePath(lang, "/projects")}
            className="group/back inline-flex min-h-10 items-center gap-2 text-[0.9375rem] text-ink-2 hover:text-ink"
          >
            <ArrowLeft
              aria-hidden
              strokeWidth={1.75}
              className="size-4 transition-transform duration-300 group-hover/back:-translate-x-1 rtl:-scale-x-100 rtl:group-hover/back:translate-x-1"
            />
            {copy.back}
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p data-intro className={cn("flex items-center gap-2.5 text-[0.875rem] font-medium", accent.text)}>
                <span aria-hidden className={cn("h-[2px] w-6", accent.bar)} />
                {copy.categories[project.category]}
              </p>
              <h1 data-intro className="text-h1 mt-4 text-ink">
                {project.title[lang]}
              </h1>
              <p data-intro className="text-lead mt-4 max-w-[52ch] text-ink-2">
                {project.summary[lang]}
              </p>
            </div>
            <dl data-intro className="border-t border-ink/15 lg:col-span-5">
              {facts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-4 border-b border-line py-3">
                  <dt className="text-meta">{fact.label}</dt>
                  <dd className="text-[0.9375rem] text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-intro className="mt-10 overflow-hidden">
            <ImageSlot
              src={project.cover.src}
              caption={project.cover.caption[lang]}
              slotLabel={dict.common.imageSlot}
              className="aspect-[16/7] w-full"
              priority
              sizes="100vw"
            />
          </div>
        </PageIntro>
      </header>

      <Reveal className="container-site grid gap-14 py-16 lg:grid-cols-12 lg:py-20">
        <div className="space-y-12 lg:col-span-7">
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" data-reveal className="text-eyebrow">
              {copy.overview}
            </h2>
            <p data-reveal className="mt-3 text-[1.125rem] leading-[2] text-ink-2 ltr:leading-[1.8]">
              {project.overview[lang]}
            </p>
          </section>

          <section aria-labelledby="objectives-title" className="border-t border-line pt-8">
            <h2 id="objectives-title" data-reveal className="text-eyebrow">
              {copy.objectives}
            </h2>
            <ol className="mt-4">
              {project.objectives.map((item, i) => (
                <li key={item.en} data-reveal className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-line py-3.5 text-[1rem] text-ink">
                  <span className={cn("font-mono text-sm tabular", accent.text)}>{String(i + 1).padStart(2, "0")}</span>
                  {item[lang]}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="implementation-title" className="border-t border-line pt-8">
            <h2 id="implementation-title" data-reveal className="text-eyebrow">
              {copy.implementation}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {project.implementation.map((item) => (
                <li key={item.en} data-reveal className="flex items-start gap-3 text-[1rem] leading-7 text-ink-2">
                  <span aria-hidden className={cn("mt-3 size-1.5 shrink-0 rounded-full", accent.dot)} />
                  {item[lang]}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="results-title" className="border-t border-line pt-8">
            <h2 id="results-title" data-reveal className="text-eyebrow">
              {copy.resultsTitle}
            </h2>
            {project.results.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {project.results.map((item) => (
                  <li key={item.en} data-reveal className="text-[1rem] leading-7 text-ink-2">
                    {item[lang]}
                  </li>
                ))}
              </ul>
            ) : (
              <p data-reveal className="mt-3 text-[0.9375rem] text-muted">
                {copy.resultsPending}
              </p>
            )}
          </section>
        </div>

        {project.gallery.length > 0 && (
          <section aria-labelledby="gallery-title" className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h2 id="gallery-title" data-reveal className="text-eyebrow">
                {copy.gallery}
              </h2>
              <div data-reveal className="mt-4">
                <ProjectGallery images={project.gallery} />
              </div>
            </div>
          </section>
        )}
      </Reveal>

      {related.length > 0 && (
        <Reveal as="section" aria-labelledby="related-projects-title" className="border-t border-line bg-white/90 py-16 lg:py-20">
          <div className="container-site">
            <h2 id="related-projects-title" data-reveal className="text-h2 text-ink">
              {copy.related}
            </h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} data-reveal>
                  <ProjectCard project={item} locale={lang} dict={dict} compact />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </article>
  );
}
