"use client";

import { useRef, useState } from "react";
import { newsInCategory } from "@/data/news";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { NEWS_CATEGORIES, type NewsCategory } from "@/features/news/types";
import { useI18n } from "@/i18n/I18nProvider";
import { plural } from "@/i18n/plural";
import { cn } from "@/lib/localized";
import { Button } from "@/components/ui/Button";
import { NewsCard } from "./NewsCard";

const PAGE_SIZE = 6;

/**
 * Latest news: category filter, then an editorial composition — one lead
 * story, supporting stories beside it, the rest as a ruled list — with
 * "load more" instead of page reloads.
 */
export function NewsList() {
  const { locale, dict } = useI18n();
  const copy = dict.news;
  const root = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const items = newsInCategory(category);
  const visible = items.slice(0, limit);
  const [lead, ...rest] = visible;
  const supporting = rest.slice(0, 3);
  const more = rest.slice(3);

  // New results settle in (not on first paint).
  useGSAP(
    () => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        gsap.fromTo("[data-news-item]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" });
      });
    },
    { scope: root, dependencies: [category, limit] },
  );

  const filter = (value: NewsCategory | null, label: string) => (
    <button
      key={value ?? "all"}
      type="button"
      aria-pressed={category === value}
      onClick={() => {
        setCategory(value);
        setLimit(PAGE_SIZE);
      }}
      className={cn(
        "min-h-10 shrink-0 border px-4 text-[0.875rem] transition-colors duration-200",
        category === value ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink-2 hover:border-ink/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );

  return (
    <div ref={root}>
      <div role="group" aria-label={copy.filterLabel} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filter(null, copy.allCategories)}
        {NEWS_CATEGORIES.map((c) => filter(c, copy.categories[c]))}
      </div>
      <p role="status" aria-live="polite" className="visually-hidden">
        {plural(dict.common.resultsCount, items.length, locale)}
      </p>

      {!lead ? (
        <p className="mt-10 border border-dashed border-line-strong px-6 py-12 text-center text-muted">{copy.empty}</p>
      ) : (
        <>
          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div data-news-item className="lg:col-span-7">
              <NewsCard article={lead} locale={locale} dict={dict} variant="lead" />
            </div>
            {supporting.length > 0 && (
              <ul className="space-y-8 lg:col-span-5">
                {supporting.map((article) => (
                  <li key={article.slug} data-news-item>
                    <NewsCard article={article} locale={locale} dict={dict} variant="compact" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          {more.length > 0 && (
            <ul className="mt-12 grid gap-x-12 border-t border-ink/15 md:grid-cols-2">
              {more.map((article) => (
                <li key={article.slug} data-news-item>
                  <NewsCard article={article} locale={locale} dict={dict} variant="row" />
                </li>
              ))}
            </ul>
          )}
          {items.length > limit && (
            <div className="mt-10 flex justify-center">
              <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                {copy.loadMore}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
