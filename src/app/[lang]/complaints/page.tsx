import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageIntro } from "@/components/motion/PageIntro";
import { ArcMark } from "@/components/ui/ArcMark";
import { TextLink } from "@/components/ui/Button";
import { ComplaintFormPanel } from "@/features/complaints/components/ComplaintForm";

export async function generateMetadata({ params }: PageProps<"/[lang]/complaints">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  // Complaints are a private channel; keep the page out of search results.
  return { title: dict.nav.complaints, description: dict.complaints.description, robots: { index: false, follow: true } };
}

/**
 * Complaints: private, respectful, clear. Reassurance and "what happens next"
 * on one side, a focused form on the other. Near-still background.
 */
export default async function ComplaintsPage({ params }: PageProps<"/[lang]/complaints">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const copy = dict.complaints;

  return (
    <div className="relative bg-paper/90 pb-24 pt-[calc(76px+2.5rem)] lg:pt-[calc(88px+3.5rem)]">
      <PageIntro className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p data-intro className="text-eyebrow flex items-center gap-2.5">
              <ArcMark size={14} />
              {copy.eyebrow}
            </p>
            <h1 data-intro className="text-h1 mt-5 text-ink">
              {copy.title}
            </h1>
            <p data-intro className="text-lead mt-5 text-ink-2">
              {copy.description}
            </p>

            <p data-intro className="mt-8 flex items-start gap-3 border-s-2 border-care-deep bg-care-tint/50 px-4 py-3.5 text-[0.9375rem] leading-7 text-ink-2">
              <ShieldCheck aria-hidden strokeWidth={1.5} className="mt-1 size-5 shrink-0 text-care-deep" />
              {copy.privacy}
            </p>

            <div data-intro className="mt-10">
              <h2 className="text-h3 text-ink">{copy.stepsTitle}</h2>
              <ol className="mt-4 border-t border-line">
                {copy.steps.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] border-b border-line py-4">
                    <span className="font-mono text-sm text-care-deep tabular">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-medium text-ink">{step.title}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-muted">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p data-intro className="mt-8 text-[0.9375rem] text-ink-2">
              {dict.contact.description}{" "}
              <Link href={localePath(lang, "/contact")} className="text-care-deep underline underline-offset-4">
                {dict.nav.contact}
              </Link>
            </p>
          </div>
        </div>

        <div data-intro className="lg:col-span-8">
          <div className="border border-line bg-white shadow-[var(--shadow-soft)]">
            <ComplaintFormPanel />
          </div>
          <div className="mt-6">
            <TextLink href={localePath(lang)}>{dict.notFound.home}</TextLink>
          </div>
        </div>
      </PageIntro>
    </div>
  );
}
