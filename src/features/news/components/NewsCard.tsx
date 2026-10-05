import Link from "next/link";
import type { NewsArticle } from "@/features/news/types";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/localized";
import { ForwardArrow } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";

export function articleHref(locale: Locale, article: NewsArticle): string {
  return localePath(locale, `/news/${article.slug}`);
}

/** Category · date line used across the newsroom. */
export function NewsMeta({
  article,
  locale,
  dict,
  className,
  tone = "light",
}: {
  article: NewsArticle;
  locale: Locale;
  dict: Dictionary;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem]", className)}>
      <span className={cn("font-medium", tone === "dark" ? "text-care-glow" : "text-care-deep")}>
        {dict.news.categories[article.category]}
      </span>
      <span aria-hidden className={cn("size-1 rounded-full", tone === "dark" ? "bg-white/40" : "bg-line-strong")} />
      <time dateTime={article.date} className={cn("tabular", tone === "dark" ? "text-white/70" : "text-muted")}>
        {formatDate(article.date, locale, { day: "numeric", month: "long", year: "numeric" })}
      </time>
    </p>
  );
}

/**
 * Editorial news item in three weights:
 *  · lead     — large image, display headline, excerpt
 *  · compact  — small image beside the text
 *  · row      — text only, ruled
 * The whole item is one link; the image zooms a touch on hover.
 */
export function NewsCard({
  article,
  locale,
  dict,
  variant,
  headingLevel = "h3",
  className,
}: {
  article: NewsArticle;
  locale: Locale;
  dict: Dictionary;
  variant: "lead" | "compact" | "row";
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  const href = articleHref(locale, article);

  if (variant === "row") {
    return (
      <article className={cn("group relative border-b border-line py-6", className)}>
        <NewsMeta article={article} locale={locale} dict={dict} />
        <Heading className="text-h3 mt-2 text-ink">
          <Link href={href} className="after:absolute after:inset-0 group-hover:text-care-deep">
            {article.title[locale]}
          </Link>
        </Heading>
        <p className="mt-1 line-clamp-2 text-[0.9375rem] leading-7 text-muted">{article.excerpt[locale]}</p>
      </article>
    );
  }

  const lead = variant === "lead";
  return (
    <article className={cn("group group/btn relative", lead ? "" : "grid grid-cols-[7.5rem_minmax(0,1fr)] gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]", className)}>
      <div data-news-image className="overflow-hidden">
        <div className="transition-transform duration-700 ease-[var(--ease-out-quart)] group-hover:scale-[1.03] motion-reduce:transition-none">
          <ImageSlot
            src={article.image}
            caption={article.imageCaption[locale]}
            slotLabel={dict.common.imageSlot}
            className={lead ? "aspect-[16/10] w-full" : "aspect-[4/3] w-full [&_figcaption]:hidden"}
            sizes={lead ? "(min-width: 1024px) 55vw, 100vw" : "160px"}
          />
        </div>
      </div>
      <div className={lead ? "mt-6" : ""}>
        <NewsMeta article={article} locale={locale} dict={dict} />
        <Heading className={cn("mt-2 text-ink", lead ? "font-display text-[clamp(1.45rem,1.1rem+1vw,2rem)] leading-snug" : "text-[1.0625rem] font-medium leading-7")}>
          <Link href={href} className="after:absolute after:inset-0 transition-colors group-hover:text-care-deep">
            {article.title[locale]}
          </Link>
        </Heading>
        {lead && <p className="mt-3 max-w-[60ch] text-[1rem] leading-8 text-muted">{article.excerpt[locale]}</p>}
        {lead && (
          <span aria-hidden className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-care-deep">
            {dict.news.readMore}
            <ForwardArrow />
          </span>
        )}
      </div>
    </article>
  );
}
