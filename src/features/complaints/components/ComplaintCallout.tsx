import { MessageSquareText } from "lucide-react";
import { localePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/localized";
import { ButtonLink } from "@/components/ui/Button";

/**
 * A calm, respectful route to the complaints form — care-green, never alarm
 * red. Used on the home page (after direct contact) and the Contact page.
 */
export function ComplaintCallout({
  locale,
  title,
  text,
  cta,
  className,
}: {
  locale: Locale;
  title: string;
  text: string;
  cta: string;
  className?: string;
}) {
  return (
    <section aria-labelledby="complaint-callout-title" className={cn("relative", className)}>
      <div className="container-site">
        <div className="flex flex-col gap-6 border border-line bg-white/90 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:px-10">
          <div className="flex items-start gap-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-care-tint text-care-deep">
              <MessageSquareText aria-hidden strokeWidth={1.5} className="size-5" />
            </span>
            <div>
              <h2 id="complaint-callout-title" className="font-display text-[1.35rem] text-ink">
                {title}
              </h2>
              <p className="mt-1 max-w-[52ch] text-[0.9375rem] leading-7 text-muted">{text}</p>
            </div>
          </div>
          <ButtonLink href={localePath(locale, "/complaints")} variant="secondary" arrow className="shrink-0">
            {cta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
