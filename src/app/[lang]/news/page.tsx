import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { featuredNews } from "@/data/news";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsList } from "@/features/news/components/NewsList";
import { NewsSlider } from "@/features/news/components/NewsSlider";

export async function generateMetadata({ params }: PageProps<"/[lang]/news">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.news, description: dict.news.description };
}

/** Newsroom: featured stories, then the latest news with categories. */
export default async function NewsPage({ params }: PageProps<"/[lang]/news">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHeader eyebrow={dict.news.eyebrow} title={dict.news.title} description={dict.news.description} compact />
      <div className="container-site pb-20">
        <h2 className="visually-hidden">{dict.news.featured}</h2>
        <NewsSlider articles={featuredNews()} />
      </div>
      <section aria-labelledby="latest-news-title" className="border-t border-line bg-white/90 py-20 lg:py-24">
        <div className="container-site">
          <h2 id="latest-news-title" className="text-h2 text-ink">
            {dict.news.latest}
          </h2>
          <div className="mt-8">
            <NewsList />
          </div>
        </div>
      </section>
    </>
  );
}
