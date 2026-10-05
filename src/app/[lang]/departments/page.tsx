import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { departments } from "@/data/departments";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { DepartmentGrid } from "@/features/departments/components/DepartmentGrid";
import { PatientJourney } from "@/components/sections/PatientJourney";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";

export async function generateMetadata({ params }: PageProps<"/[lang]/departments">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.departmentsPage.title, description: dict.departmentsPage.description };
}

export default async function DepartmentsPage({ params }: PageProps<"/[lang]/departments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHeader eyebrow={dict.nav.departments} title={dict.departmentsPage.title} description={dict.departmentsPage.description} />
      <Reveal className="container-site pb-24" stagger={0.05}>
        <DepartmentGrid departments={departments} locale={lang} dict={dict} detailed className="bg-paper/80" />
      </Reveal>
      <ServicesShowcase locale={lang} dict={dict} />
      <div className="border-t border-line bg-white">
        <PatientJourney />
      </div>
    </>
  );
}
