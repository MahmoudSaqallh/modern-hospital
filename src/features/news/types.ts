import type { LocalizedText } from "@/lib/localized";

export type NewsCategory = "announcements" | "awareness" | "activities" | "services";

export const NEWS_CATEGORIES: readonly NewsCategory[] = ["announcements", "awareness", "activities", "services"];

/** A block of article body content. */
export type NewsBlock = { type: "paragraph"; text: LocalizedText } | { type: "heading"; text: LocalizedText };

export interface NewsArticle {
  slug: string;
  category: NewsCategory;
  /** ISO publication date. */
  date: string;
  /** Shown in the featured slider at the top of the newsroom. */
  featured: boolean;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: NewsBlock[];
  /** Real photo path once supplied; a designed placeholder is shown otherwise. */
  image?: string;
  imageCaption: LocalizedText;
}
