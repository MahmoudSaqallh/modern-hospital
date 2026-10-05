import { intlLocale, type Locale } from "@/i18n/config";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const date = parseIsoDate(value);
  return toIsoDate(date) === value;
}

export function isClockTime(value: string): boolean {
  return CLOCK_TIME.test(value);
}

/** Local calendar date → "YYYY-MM-DD" (never via toISOString, which shifts to UTC). */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → Date at local midnight. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function weekdayOf(iso: string): number {
  return parseIsoDate(iso).getDay();
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime();
  return Math.round(ms / 86_400_000);
}

export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** "16:30" → "4:30 م" / "4:30 PM". */
export function formatTime(time: string, locale: Locale): string {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = locale === "ar" ? (h < 12 ? "ص" : "م") : h < 12 ? "AM" : "PM";
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "16:30" → "4:30" — used inside a slot group that already says morning/evening. */
export function formatTimeShort(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")}`;
}

export function formatDate(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" },
): string {
  return new Intl.DateTimeFormat(intlLocale[locale], options).format(parseIsoDate(iso));
}

export interface RelativeDayLabels {
  today: string;
  tomorrow: string;
}

/** "اليوم" / "غداً" / weekday name. */
export function relativeDay(iso: string, todayIso: string, locale: Locale, labels: RelativeDayLabels): string {
  const diff = daysBetween(todayIso, iso);
  if (diff === 0) return labels.today;
  if (diff === 1) return labels.tomorrow;
  return formatDate(iso, locale, { weekday: "long" });
}
