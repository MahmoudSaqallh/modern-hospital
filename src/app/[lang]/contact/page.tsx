import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { ContactSection } from "@/features/contact/ContactSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { HoursAndNotices } from "@/components/sections/HoursAndNotices";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.contact, description: dict.contact.description };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <div className="pt-[calc(76px+1rem)] lg:pt-[88px]">
        <ContactSection locale={lang} dict={dict} headingLevel="h1" />
      </div>
      <HoursAndNotices locale={lang} dict={dict} />
      <FaqSection index="03" />
    </>
  );
}
