import type { LocalizedText } from "@/lib/localized";

/**
 * Organization details shown across the site.
 *
 * IMPORTANT: Contact details and the map location have NOT been supplied yet.
 * They are intentionally `null` so the UI renders a clear "being confirmed"
 * state instead of fake numbers or coordinates. Fill them in here once the
 * organization provides official values — every contact surface reads from
 * this single object.
 */
export interface OrganizationContact {
  /** E.164 format, e.g. "+970599000000". */
  phone: string | null;
  /** E.164 format without spaces, used for https://wa.me links. */
  whatsapp: string | null;
  email: string | null;
  address: LocalizedText | null;
  /** Only set when the real location is confirmed. */
  location: { lat: number; lng: number } | null;
}

export interface WorkingHoursRow {
  /** Weekday indexes covered by this row (0 = Sunday … 6 = Saturday). */
  days: number[];
  label: LocalizedText;
  hours: LocalizedText;
  note?: LocalizedText;
}

export const organization = {
  name: {
    ar: "جمعية الخدمة العامة",
    en: "Public Aid Society",
  } satisfies LocalizedText,
  logo: "/brand/logo.webp",
  contact: {
    phone: null,
    whatsapp: null,
    email: null,
    address: null,
    location: null,
  } satisfies OrganizationContact as OrganizationContact,
  /**
   * Working hours taken from the project brief. Confirm with the organization
   * before launch. Emergency availability is deliberately not listed.
   */
  workingHours: [
    {
      days: [6, 0, 1, 2, 3, 4],
      label: { ar: "السبت — الخميس", en: "Saturday — Thursday" },
      hours: { ar: "8:00 صباحاً — 8:00 مساءً", en: "8:00 AM — 8:00 PM" },
    },
    {
      days: [5],
      label: { ar: "الجمعة", en: "Friday" },
      hours: { ar: "حسب العيادة", en: "Varies by clinic" },
      note: {
        ar: "تواصل مع القسم لمعرفة مواعيد يوم الجمعة.",
        en: "Contact the department for Friday hours.",
      },
    },
  ] satisfies WorkingHoursRow[] as WorkingHoursRow[],
};

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

export function directionsHref(location: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}
