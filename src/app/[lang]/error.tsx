"use client";

import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { ArcMark } from "@/components/ui/ArcMark";
import { Button, TextLink } from "@/components/ui/Button";

/** Patient-facing error boundary — no technical details, always a way forward. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale, dict } = useI18n();
  return (
    <section className="container-site flex min-h-[80svh] flex-col items-start justify-center pb-24 pt-[calc(76px+4rem)]">
      <ArcMark size={44} strokeWidth={2} />
      <h1 className="text-h1 mt-8 text-ink">{dict.errorPage.title}</h1>
      <p className="text-lead mt-4 max-w-[44ch] text-muted">{dict.errorPage.text}</p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <Button size="lg" onClick={reset}>
          {dict.errorPage.retry}
        </Button>
        <TextLink href={localePath(locale)}>{dict.notFound.home}</TextLink>
      </div>
    </section>
  );
}
