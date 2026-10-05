"use client";

import { useRef } from "react";
import { newsByDate } from "@/data/news";
import { gsap, useGSAP } from "@/animations/gsap";
import { MEDIA } from "@/animations/motion";
import { useSceneChapter } from "@/animations/sceneBridge";
import { NewsCard } from "@/features/news/components/NewsCard";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/Button";

/** Home: one large story and three smaller ones; images unmask as they arrive. */
export function NewsPreview() {
  const { locale, dict } = useI18n();
  const copy = dict.newsPreview;
  const section = useRef<HTMLElement>(null);
  const [lead, ...rest] = newsByDate;
  const supporting = rest.slice(0, 3);
  useSceneChapter(section, "news");

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        if (root.getBoundingClientRect().top < window.innerHeight * 0.85) return;
        gsap
          .timeline({ scrollTrigger: { trigger: root, start: "top 72%", once: true } })
          .fromTo("[data-reveal]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 })
          .fromTo(
            "[data-news-image]",
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.out", stagger: 0.1, clearProps: "clipPath" },
            0.15,
          )
          .fromTo("[data-news-text]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.4);
      });
    },
    { scope: section },
  );

  if (!lead) return null;

  return (
    <section ref={section} aria-labelledby="news-preview-title" className="relative border-t border-line bg-white/92 py-24 lg:py-32">
      <div className="container-site">
        <SectionHeader
          id="news-preview-title"
          index="05"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={<TextLink href={localePath(locale, "/news")}>{copy.cta}</TextLink>}
        />
        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div data-news-text className="lg:col-span-7">
            <NewsCard article={lead} locale={locale} dict={dict} variant="lead" />
          </div>
          <ul className="space-y-8 border-t border-ink/15 pt-8 lg:col-span-5 lg:border-t-0 lg:pt-0">
            {supporting.map((article) => (
              <li key={article.slug} data-news-text>
                <NewsCard article={article} locale={locale} dict={dict} variant="compact" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
