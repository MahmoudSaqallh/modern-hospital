import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { organization } from "@/config/organization";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { ArcMark } from "@/components/ui/ArcMark";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { MagneticLink } from "@/components/ui/MagneticLink";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.about, description: dict.aboutPage.intro };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.aboutPage;

  return (
    <>
      <header className="relative pb-20 pt-[calc(76px+3.5rem)] lg:pb-28 lg:pt-[calc(88px+5rem)]">
        <PageIntro className="container-site grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p data-intro className="text-eyebrow flex items-center gap-2.5">
              <ArcMark size={14} />
              {dict.nav.about}
            </p>
            <h1 data-intro className="text-hero mt-5 text-ink">
              {copy.title}
            </h1>
            <p data-intro lang="en" dir="ltr" className="mt-3 text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-muted rtl:text-right">
              {organization.name.en}
            </p>
            <p data-intro className="text-lead mt-8 max-w-[48ch] text-ink-2">
              {copy.intro}
            </p>
          </div>
          <div data-intro className="flex justify-center lg:col-span-5">
            <div className="relative aspect-square w-[min(70vw,22rem)]">
              <span aria-hidden className="absolute inset-[-12%] rounded-full border border-line" />
              <span aria-hidden className="absolute inset-[-26%] rounded-full border border-line/60" />
              <div className="relative size-full rounded-full bg-white p-[6%] shadow-[var(--shadow-lift)]">
                <Image src={organization.logo} alt={dict.a11y.logoAlt} width={384} height={384} priority className="size-full" />
              </div>
            </div>
          </div>
        </PageIntro>
      </header>

      <Reveal as="section" aria-labelledby="who-title" className="border-t border-line bg-white py-24 lg:py-32">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="who-title" data-reveal="mask" className="text-h2 text-ink">
              {copy.who.title}
            </h2>
            <p data-reveal className="text-lead mt-6 text-ink-2">
              {copy.who.text}
            </p>
          </div>
          <div data-reveal="fade" className="lg:col-span-7">
            <ImageSlot caption={copy.imageCaption} slotLabel={dict.common.imageSlot} className="aspect-[16/10] w-full" />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" aria-labelledby="mission-title" className="py-24 lg:py-32">
        <div className="container-site">
          <h2 id="mission-title" data-reveal className="text-eyebrow flex items-center gap-2.5">
            <ArcMark size={14} />
            {copy.mission.title}
          </h2>
          <p data-reveal="mask" className="mt-8 max-w-[30ch] border-s-2 border-medical ps-8 font-display text-[clamp(1.6rem,1.1rem+1.9vw,2.6rem)] leading-[1.6] text-ink">
            {copy.mission.text}
          </p>
        </div>
      </Reveal>

      <Reveal as="section" aria-labelledby="values-title" className="relative z-10 bg-ink py-24 text-white lg:py-32">
        <div className="container-site">
          <h2 id="values-title" data-reveal="mask" className="text-h2">
            {copy.values.title}
          </h2>
          <ul className="mt-14 grid border-t border-white/12 sm:grid-cols-2 lg:grid-cols-4">
            {copy.values.items.map((value, i) => (
              <li key={value.title} data-reveal className="border-b border-white/12 py-8 sm:px-6 sm:[&:nth-child(odd)]:border-e lg:border-e lg:[&:last-child]:border-e-0 lg:first:ps-0">
                <span className="font-mono text-xs text-care-glow tabular">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-h3 mt-6">{value.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-7 text-white/70">{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" aria-labelledby="community-title" className="py-24 lg:py-32">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div data-reveal="fade" className="order-last lg:order-none lg:col-span-6">
            <ImageSlot caption={copy.imageCaption} slotLabel={dict.common.imageSlot} className="aspect-[4/3] w-full" />
          </div>
          <div className="lg:col-span-6">
            <h2 id="community-title" data-reveal="mask" className="text-h2 text-ink">
              {copy.community.title}
            </h2>
            <p data-reveal className="text-lead mt-6 text-ink-2">
              {copy.community.text}
            </p>
            <ul className="mt-8 border-t border-ink/15">
              {copy.community.points.map((point) => (
                <li key={point} data-reveal className="flex items-center gap-4 border-b border-line py-4 text-ink">
                  <span aria-hidden className="size-1.5 rounded-full bg-care" />
                  {point}
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-10">
              <MagneticLink href={localePath(lang, "/booking")}>{copy.cta}</MagneticLink>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
