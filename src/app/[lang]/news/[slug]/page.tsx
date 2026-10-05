import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArticle, news, readingMinutes, relatedNews } from "@/data/news";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { format } from "@/lib/localized";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { NewsCard, NewsMeta } from "@/features/news/components/NewsCard";
import { ShareLinks } from "@/features/news/components/ShareLinks";

export const dynamicParams = false;

export function generateStaticParams() {
  return news.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(lang) || !article) return {};
  return {
    title: article.title[lang],
    description: article.excerpt[lang],
    openGraph: { type: "article", title: article.title[lang], description: article.excerpt[lang], publishedTime: article.date },
  };
}

/** Long-form article: calm typography, no 3D in the reading column. */
export default async function ArticlePage({ params }: PageProps<"/[lang]/news/[slug]">) {
  const { lang, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(lang) || !article) notFound();
  const dict = await getDictionary(lang);
  const related = relatedNews(article);

  return (
    <article className="relative bg-paper/90">
      <header className="pt-[calc(76px+2rem)] lg:pt-[calc(88px+3rem)]">
        <PageIntro className="container-site">
          <Link
            data-intro
            href={localePath(lang, "/news")}
            className="group/back inline-flex min-h-10 items-center gap-2 text-[0.9375rem] text-ink-2 hover:text-ink"
          >
            <ArrowLeft
              aria-hidden
              strokeWidth={1.75}
              className="size-4 transition-transform duration-300 group-hover/back:-translate-x-1 rtl:-scale-x-100 rtl:group-hover/back:translate-x-1"
            />
            {dict.news.back}
          </Link>
          <div className="mx-auto mt-8 max-w-3xl">
            <div data-intro className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <NewsMeta article={article} locale={lang} dict={dict} />
              <span className="text-[0.8125rem] text-muted">{format(dict.news.readingTime, { count: readingMinutes(article, lang) })}</span>
            </div>
            <h1 data-intro className="mt-5 font-display text-[clamp(1.9rem,1.3rem+2.2vw,3.1rem)] leading-[1.4] text-ink ltr:leading-[1.15]">
              {article.title[lang]}
            </h1>
            <p data-intro className="text-lead mt-5 text-ink-2">
              {article.excerpt[lang]}
            </p>
          </div>
          <div data-intro className="mx-auto mt-10 max-w-5xl overflow-hidden">
            <ImageSlot
              src={article.image}
              caption={article.imageCaption[lang]}
              slotLabel={dict.common.imageSlot}
              className="aspect-[16/8] w-full"
              priority
              sizes="(min-width: 1024px) 64rem, 100vw"
            />
          </div>
        </PageIntro>
      </header>

      <div className="container-site">
        <div className="mx-auto max-w-[44rem] py-12 lg:py-16">
          {article.body.map((block, i) =>
            block.type === "heading" ? (
              <h2 key={i} className="mt-10 font-display text-[1.45rem] leading-snug text-ink first:mt-0">
                {block.text[lang]}
              </h2>
            ) : (
              <p key={i} className="mt-5 text-[1.125rem] leading-[2.05] text-ink-2 first:mt-0 ltr:leading-[1.8]">
                {block.text[lang]}
              </p>
            ),
          )}
          <div className="mt-12 border-t border-line pt-6">
            <ShareLinks title={article.title[lang]} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Reveal as="section" aria-labelledby="related-title" className="border-t border-line bg-white/90 py-16 lg:py-20">
          <div className="container-site">
            <h2 id="related-title" data-reveal className="text-h2 text-ink">
              {dict.news.related}
            </h2>
            <ul className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} data-reveal>
                  <NewsCard article={item} locale={lang} dict={dict} variant="lead" headingLevel="h3" />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}
    </article>
  );
}
