import type { LocalizedText } from "@/lib/localized";

export type AnnouncementKind = "schedule" | "availability" | "awareness" | "service";

export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  /** ISO date of publication. */
  date: string;
  title: LocalizedText;
  body: LocalizedText;
}

/**
 * SAMPLE DATA — example notices that demonstrate the announcements layout.
 * Replace with real notices from the organization (or a CMS) before launch.
 */
export const announcements: Announcement[] = [
  {
    id: "pediatrics-evening",
    kind: "schedule",
    date: "2026-10-01",
    title: {
      ar: "تحديث مواعيد العيادة المسائية لقسم الأطفال",
      en: "Updated evening clinic hours for Pediatrics",
    },
    body: {
      ar: "يمكنكم الاطلاع على المواعيد المتاحة الجديدة مباشرة عند الحجز.",
      en: "The new available times are shown directly when you book.",
    },
  },
  {
    id: "dental-children",
    kind: "availability",
    date: "2026-09-24",
    title: {
      ar: "مواعيد إضافية لعيادة أسنان الأطفال",
      en: "Additional appointments at the children's dental clinic",
    },
    body: {
      ar: "أُضيفت مواعيد مسائية جديدة يومي الاثنين والأربعاء.",
      en: "New evening appointments are available on Mondays and Wednesdays.",
    },
  },
  {
    id: "awareness-diabetes",
    kind: "awareness",
    date: "2026-09-15",
    title: {
      ar: "لقاء توعوي حول الوقاية من السكري",
      en: "Community talk on diabetes prevention",
    },
    body: {
      ar: "سيتم الإعلان عن الموعد والمكان عبر قنوات الجمعية الرسمية.",
      en: "Date and venue will be announced through the society's official channels.",
    },
  },
  {
    id: "online-booking",
    kind: "service",
    date: "2026-09-01",
    title: {
      ar: "إطلاق خدمة حجز المواعيد عبر الموقع",
      en: "Online appointment booking is now available",
    },
    body: {
      ar: "اختر القسم والطبيب والموعد المناسب خلال دقائق.",
      en: "Choose a department, doctor and time in a few minutes.",
    },
  },
];
