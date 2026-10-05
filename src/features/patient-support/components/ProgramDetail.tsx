import type { PatientSupportProgram } from "@/features/patient-support/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";
import { ButtonLink } from "@/components/ui/Button";
import { ContributeLink, PendingValue } from "./ProgramParts";
import { ProgramIcon } from "./ProgramIcon";
import { SupportContactActions } from "./SupportContactActions";

/**
 * One program in full: purpose and actions on one side, a "data sheet"
 * (project number, how to contribute, direct contact) on the other. The
 * second program mirrors the layout and sits on a tinted band, so the two
 * read as a sequence rather than duplicates.
 */
export function ProgramDetail({
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
  const copy = dict.patientSupport.program;
  const alt = index % 2 === 1;
  const titleId = `${program.slug}-title`;

  return (
    <Reveal
      as="section"
      id={program.slug}
      aria-labelledby={titleId}
      className={cn("relative scroll-mt-20 py-20 lg:py-28", alt ? "border-y border-line bg-mist/80" : "bg-paper/70")}
    >
      <div className="container-site grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
        <div className={cn("lg:col-span-6", alt ? "lg:col-start-7 lg:row-start-1" : "lg:col-start-1")}>
          <p data-reveal className="text-eyebrow flex items-center gap-2.5">
            <ArcMark size={14} />
            <span>{copy.label}</span>
            <span className="font-mono text-[0.75rem] tabular">{String(index + 1).padStart(2, "0")}</span>
          </p>
          <span
            data-reveal
            aria-hidden
            className="mt-7 flex size-16 items-center justify-center rounded-full border border-care/30 bg-care-tint/60 text-care-deep"
          >
            <ProgramIcon icon={program.icon} size={30} />
          </span>
          <h2 id={titleId} data-reveal="mask" className="text-h2 mt-6 text-ink">
            {program.title[locale]}
          </h2>
          <h3 data-reveal className="mt-8 text-meta">
            {copy.about}
          </h3>
          <p data-reveal className="text-lead mt-2 max-w-[52ch] text-ink-2">
            {program.description[locale]}
          </p>
          <div data-reveal className="mt-10 flex flex-wrap gap-3">
            <ContributeLink program={program} dict={dict} size="lg" />
            {program.id === "operations" && (
              <ButtonLink href="#support-contact" variant="secondary" size="lg">
                {copy.inquire}
              </ButtonLink>
            )}
          </div>
        </div>

        <aside
          aria-label={`${copy.contactTitle} — ${program.title[locale]}`}
          className={cn("lg:col-span-5", alt ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-8")}
        >
          <div data-reveal className="border border-line bg-paper p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <dl className="grid gap-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-4">
                <dt className="text-meta">{copy.projectNumber}</dt>
                <dd className="text-[1.0625rem] text-ink">
                  {program.donation.projectNumber ? (
                    <bdi dir="ltr" className="font-mono tabular">
                      {program.donation.projectNumber}
                    </bdi>
                  ) : (
                    <PendingValue dict={dict} />
                  )}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4">
                <dt className="text-meta">{copy.method}</dt>
                <dd className="text-[1rem] text-ink">{copy.methodText}</dd>
              </div>
            </dl>
            <h3 className="mt-8 text-[1rem] font-medium text-ink">{copy.contactTitle}</h3>
            <SupportContactActions contact={program.contact} dict={dict} className="mt-3" />
          </div>
        </aside>
      </div>
    </Reveal>
  );
}
