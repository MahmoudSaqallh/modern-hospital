import type { LocalizedText } from "@/lib/localized";

export type ProjectCategory = "development" | "patient-support" | "completed";

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = ["development", "patient-support", "completed"];

export type ProjectStatus = "planned" | "in-progress" | "ongoing" | "completed";

export interface ProjectImage {
  /** Real photo path once supplied; a designed placeholder is shown otherwise. */
  src?: string;
  caption: LocalizedText;
}

export interface Project {
  slug: string;
  category: ProjectCategory;
  status: ProjectStatus;
  title: LocalizedText;
  /** One or two sentences for cards. */
  summary: LocalizedText;
  overview: LocalizedText;
  objectives: LocalizedText[];
  implementation: LocalizedText[];
  /** Only real, approved results — leave empty until confirmed. */
  results: LocalizedText[];
  /** ISO dates, only when provided by the society. */
  startDate?: string;
  endDate?: string;
  /** Supporting organization, only when provided and approved for publication. */
  partner?: LocalizedText;
  cover: ProjectImage;
  gallery: ProjectImage[];
  /** Highlighted on the home page (one per category). */
  highlight?: boolean;
}
