import type { LocalizedText } from "@/lib/localized";

/** 0 = Sunday … 6 = Saturday (matches Date#getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ClinicSession = "morning" | "evening";

export interface Doctor {
  id: string;
  clinicId: string;
  name: LocalizedText;
  /** e.g. "استشاري طب الأطفال" */
  title: LocalizedText;
  qualification: LocalizedText;
  bio: LocalizedText;
  services: LocalizedText[];
  workingDays: Weekday[];
  sessions: ClinicSession[];
  /** Real portrait path once available; a designed placeholder is shown otherwise. */
  photo?: string;
}
