import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supportPrograms } from "@/data/patientSupport";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { ContributionMethods } from "@/features/patient-support/components/ContributionMethods";
import { ProgramDetail } from "@/features/patient-support/components/ProgramDetail";
import { ProgramsOverview } from "@/features/patient-support/components/ProgramsOverview";
import { RelatedSupportProjects } from "@/features/patient-support/components/RelatedSupportProjects";
import { SupportContactBlock } from "@/features/patient-support/components/SupportContactBlock";
import { SupportHero } from "@/features/patient-support/components/SupportHero";
import { SupportJourney } from "@/features/patient-support/components/SupportJourney";
import { SupportTrust } from "@/features/patient-support/components/SupportTrust";

export async function generateMetadata({ params }: PageProps<"/[lang]/patient-support">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.patientSupport.title, description: dict.patientSupport.description };
}

/**
 * كفالة المرضى — patient sponsorship. Hero → the two programs at a glance →
 * each program in full → how it works → ways to contribute → inquiries →
 * how the programs are run → related projects. Statically rendered; only
 * the copy buttons, reveals and the hero visual hydrate.
 */
export default async function PatientSupportPage({ params }: PageProps<"/[lang]/patient-support">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <SupportHero dict={dict} />
      <ProgramsOverview locale={lang} dict={dict} />
      {supportPrograms.map((program, i) => (
        <ProgramDetail key={program.id} program={program} index={i} locale={lang} dict={dict} />
      ))}
      <SupportJourney />
      <ContributionMethods locale={lang} dict={dict} />
      <SupportContactBlock dict={dict} />
      <SupportTrust dict={dict} />
      <RelatedSupportProjects locale={lang} dict={dict} />
    </>
  );
}
