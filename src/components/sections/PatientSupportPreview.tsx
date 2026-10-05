import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { mailtoHref, phoneHref, supportContact, supportPrograms } from "@/data/patientSupport";
import { ProgramIcon } from "@/features/patient-support/components/ProgramIcon";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";
import { ForwardArrow, TextLink } from "@/components/ui/Button";

/**
 * Home: a quiet band (no chapter number, no 3D) so it never competes with
 * booking — the two programs as direct links, the inquiry details, and a
 * way into the full page.
 */
export function PatientSupportPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.patientSupportPreview;
  const actions = dict.patientSupport.actions;
  const page = localePath(locale, "/patient-support");

  return (
    <Reveal as="section" aria-labelledby="support-preview-title" className="relative border-t border-line bg-white/90 py-16 lg:py-20">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="lg:col-span-5">
          <p data-reveal className="text-eyebrow flex items-center gap-2.5">
            <ArcMark size={14} />
            {copy.eyebrow}
          </p>
          <h2 id="support-preview-title" data-reveal className="mt-3 font-display text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] leading-snug text-ink">
            {copy.title}
          </h2>
          <p data-reveal className="mt-3 max-w-[46ch] text-[1rem] leading-8 text-muted">
            {copy.text}
          </p>
          <div data-reveal className="mt-6">
            <TextLink href={page}>{copy.cta}</TextLink>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {supportPrograms.map((program) => (
              <li key={program.id} data-reveal className="bg-paper">
                <Link
                  href={`${page}#${program.slug}`}
                  className="group/btn flex min-h-24 items-center gap-4 p-5 transition-colors duration-300 hover:bg-white"
                >
                  <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-care-tint/70 text-care-deep">
                    <ProgramIcon icon={program.icon} size={22} />
                  </span>
                  <span className="min-w-0 flex-1 font-display text-[1.15rem] leading-snug text-ink transition-colors group-hover/btn:text-care-deep">
                    {program.title[locale]}
                  </span>
                  <ForwardArrow className="text-care-deep" />
                </Link>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem]">
            <span className="text-meta">{copy.inquiry}:</span>
            <a href={phoneHref(supportContact.phone)} className="inline-flex min-h-11 items-center gap-2 text-ink transition-colors hover:text-care-deep">
              <Phone aria-hidden strokeWidth={1.5} className="size-4 text-care-deep" />
              <span className="visually-hidden">{actions.call}: </span>
              <bdi dir="ltr">{supportContact.phone}</bdi>
            </a>
            <a href={mailtoHref(supportContact.email)} className="inline-flex min-h-11 items-center gap-2 text-ink transition-colors hover:text-care-deep">
              <Mail aria-hidden strokeWidth={1.5} className="size-4 text-care-deep" />
              <span className="visually-hidden">{actions.sendEmail}: </span>
              <bdi dir="ltr">{supportContact.email}</bdi>
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
