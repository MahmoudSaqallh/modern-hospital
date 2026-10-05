import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { Hero } from "@/components/sections/hero/Hero";
import { ClinicsShowcase } from "@/components/sections/ClinicsShowcase";
import { DepartmentsPreview } from "@/components/sections/DepartmentsPreview";
import { DoctorsShowcase } from "@/components/sections/DoctorsShowcase";
import { BookingPreview } from "@/components/sections/BookingPreview";
import { NewsPreview } from "@/components/sections/NewsPreview";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { PatientSupportPreview } from "@/components/sections/PatientSupportPreview";
import { AboutIdentity } from "@/components/sections/AboutIdentity";
import { ContactStrip } from "@/components/sections/ContactStrip";
import { ComplaintCallout } from "@/features/complaints/components/ComplaintCallout";

/**
 * Home: hero + quick booking → clinics → departments → doctors → booking
 * journey → news → projects → patient sponsorship → about → direct contact
 * → complaints.
 * One persistent WebGL scene tells the story underneath.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero />
      <ClinicsShowcase />
      <DepartmentsPreview />
      <DoctorsShowcase />
      <BookingPreview />
      <NewsPreview />
      <ProjectsPreview />
      <PatientSupportPreview locale={lang} dict={dict} />
      <AboutIdentity />
      <ContactStrip />
      <ComplaintCallout
        locale={lang}
        title={dict.complaintCta.title}
        text={dict.complaintCta.text}
        cta={dict.complaintCta.cta}
        className="pb-24 lg:pb-32"
      />
    </>
  );
}
