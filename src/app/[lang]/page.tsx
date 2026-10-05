import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { Hero } from "@/components/sections/hero/Hero";
import { DepartmentsShowcase } from "@/components/sections/DepartmentsShowcase";
import { DoctorsShowcase } from "@/components/sections/DoctorsShowcase";
import { BookingPreview } from "@/components/sections/BookingPreview";
import { TrustSection } from "@/components/sections/TrustSection";
import { AboutIdentity } from "@/components/sections/AboutIdentity";
import { ContactStrip } from "@/components/sections/ContactStrip";
import { ClosingSection } from "@/components/sections/ClosingSection";

/**
 * Home: one continuous story told with the persistent WebGL scene —
 * care network → departments → doctors → booking → trust → community →
 * contact → a calm close.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <Hero />
      <DepartmentsShowcase />
      <DoctorsShowcase />
      <BookingPreview />
      <TrustSection />
      <AboutIdentity />
      <ContactStrip />
      <ClosingSection />
    </>
  );
}
