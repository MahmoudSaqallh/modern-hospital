import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageIntro } from "@/components/motion/PageIntro";
import { SceneAnchor } from "@/components/motion/SceneAnchor";
import { ArcMark } from "@/components/ui/ArcMark";
import { PatientJourney } from "@/components/sections/PatientJourney";
import { ClinicsDirectory } from "@/features/clinics/components/ClinicsDirectory";

export async function generateMetadata({ params }: PageProps<"/[lang]/clinics">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.clinicsPage.title, description: dict.clinicsPage.description };
}

export default async function ClinicsPage({ params }: PageProps<"/[lang]/clinics">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.clinicsPage;

  return (
    <>
      <header className="relative pb-12 pt-[calc(76px+3.5rem)] lg:pb-14 lg:pt-[calc(88px+4rem)]">
        <PageIntro className="container-site grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p data-intro className="text-eyebrow flex items-center gap-2.5">
              <ArcMark size={14} />
              {dict.nav.clinics}
            </p>
            <h1 data-intro className="text-h1 mt-5 text-ink">
              {copy.title}
            </h1>
            <p data-intro className="text-lead mt-5 max-w-[54ch] text-muted">
              {copy.description}
            </p>
          </div>
          {/* Specialty orbit: the WebGL clinic lattice is composed into this frame (desktop). */}
          <div className="hidden lg:col-span-5 lg:block">
            <SceneAnchor anchor="clinic-orbit" className="relative ms-auto aspect-[5/4] w-full max-w-[26rem]">
              <span aria-hidden className="absolute inset-0 border border-line/70" />
            </SceneAnchor>
          </div>
        </PageIntro>
      </header>

      <ClinicsDirectory />

      <div className="border-t border-line bg-white/90">
        <PatientJourney />
      </div>
    </>
  );
}
