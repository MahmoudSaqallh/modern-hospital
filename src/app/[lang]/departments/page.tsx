import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/layout/PageHeader";
import { CareTogether } from "@/features/departments/components/CareTogether";
import { DepartmentCatalog } from "@/features/departments/components/DepartmentCatalog";
import { DepartmentsSplit } from "@/features/departments/components/DepartmentsSplit";

export async function generateMetadata({ params }: PageProps<"/[lang]/departments">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.departments, description: dict.departmentsPage.description };
}

/**
 * Departments: an organizational view (not booking). Introduction → the two
 * groups around the patient (with the WebGL care network) → therapeutic
 * departments → supporting departments → how they work together.
 */
export default async function DepartmentsPage({ params }: PageProps<"/[lang]/departments">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.departmentsPage;

  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <div className="container-site pb-20 lg:pb-28">
        <DepartmentsSplit />
      </div>
      <DepartmentCatalog category="therapeutic" locale={lang} dict={dict} />
      <DepartmentCatalog category="supporting" locale={lang} dict={dict} />
      <CareTogether />
    </>
  );
}
