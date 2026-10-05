import { Mail, Phone } from "lucide-react";
import { mailtoHref, phoneHref, supportPrograms } from "@/data/patientSupport";
import type { PatientSupportProgram } from "@/features/patient-support/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";
import { ContributeLink, PendingValue } from "./ProgramParts";
import { ProgramIcon } from "./ProgramIcon";

/**
 * The two programs as an asymmetric editorial pair — a wide, lifted lead
 * panel and a narrower, offset tinted one — rather than twin cards. Each
 * answers at a glance: what it supports, its project number, how to give,
 * and who to ask.
 */
export function ProgramsOverview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.patientSupport.programs;
  return (
    <Reveal as="section" id="programs" aria-labelledby="programs-title" className="relative scroll-mt-20 border-t border-line bg-white/85 py-20 lg:py-28">
      <div className="container-site">
        <SectionHeader id="programs-title" index="01" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
          {supportPrograms.map((program, i) => (
            <ProgramFeature key={program.id} program={program} index={i} locale={locale} dict={dict} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function ProgramFeature({
  program,
  index,
  locale,
  dict,
}: {
  program: PatientSupportProgram;
  index: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const lead = index === 0;
  const copy = dict.patientSupport;
  const titleId = `program-${program.id}-title`;

  return (
    <article
      data-reveal
      aria-labelledby={titleId}
      className={cn(
        "relative flex flex-col p-7 sm:p-10",
        lead
          ? "border-t-2 border-care-deep bg-paper shadow-[var(--shadow-lift)] lg:col-span-7"
          : "border border-line bg-mist lg:col-span-5 lg:mt-20",
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <span
          aria-hidden
          className={cn(
            "flex size-14 items-center justify-center rounded-full border",
            lead ? "border-care/30 bg-care-tint/60 text-care-deep" : "border-line-strong bg-paper text-care-deep",
          )}
        >
          <ProgramIcon icon={program.icon} size={26} />
        </span>
        <span aria-hidden className="font-mono text-[3rem] leading-none text-line-strong tabular sm:text-[3.5rem]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 id={titleId} className="mt-8 font-display text-[1.75rem] leading-snug text-ink sm:text-[2rem]">
        {program.title[locale]}
      </h3>
      <p className="mt-3 max-w-[46ch] text-[1.0625rem] leading-8 text-muted">{program.summary[locale]}</p>

      <dl className="mt-8 grid border-t border-ink/10 sm:grid-cols-2">
        <div className="border-b border-line py-4 sm:pe-6">
          <dt className="text-meta">{copy.program.projectNumber}</dt>
          <dd className="mt-1 text-[1rem] text-ink">
            {program.donation.projectNumber ? (
              <bdi dir="ltr" className="font-mono tabular">
                {program.donation.projectNumber}
              </bdi>
            ) : (
              <PendingValue dict={dict} />
            )}
          </dd>
        </div>
        <div className="border-b border-line py-4">
          <dt className="text-meta">{copy.program.method}</dt>
          <dd className="mt-1 text-[1rem] text-ink">{copy.program.methodText}</dd>
        </div>
        <div className="border-b border-line py-4 sm:col-span-2">
          <dt className="text-meta">{dict.patientSupportPreview.inquiry}</dt>
          <dd className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
            <a href={phoneHref(program.contact.phone)} className="inline-flex min-h-11 items-center gap-2 text-ink transition-colors hover:text-care-deep">
              <Phone aria-hidden strokeWidth={1.5} className="size-4 text-care-deep" />
              <span className="visually-hidden">{copy.actions.call}: </span>
              <bdi dir="ltr">{program.contact.phone}</bdi>
            </a>
            <a href={mailtoHref(program.contact.email)} className="inline-flex min-h-11 items-center gap-2 text-ink transition-colors hover:text-care-deep">
              <Mail aria-hidden strokeWidth={1.5} className="size-4 text-care-deep" />
              <span className="visually-hidden">{copy.actions.sendEmail}: </span>
              <bdi dir="ltr">{program.contact.email}</bdi>
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-auto lg:pt-8">
        <ContributeLink program={program} dict={dict} variant={lead ? "primary" : "secondary"} />
        <TextLink href={`#${program.slug}`}>{copy.programs.details}</TextLink>
      </div>
    </article>
  );
}
