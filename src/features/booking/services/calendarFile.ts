import { minutesOf } from "@/lib/dates";

export interface CalendarEventInput {
  uid: string;
  date: string;
  time: string;
  durationMinutes: number;
  title: string;
  description: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "2026-10-04" + "16:30" → "20261004T163000" (floating local time — the clinic's calendar). */
function stamp(date: string, minutes: number): string {
  return `${date.replaceAll("-", "")}T${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}00`;
}

/** RFC 5545 text escaping. */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function buildCalendarFile(event: CalendarEventInput): string {
  const start = minutesOf(event.time);
  const now = new Date();
  const dtstamp =
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Public Aid Society//Appointments//AR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeText(event.uid)}@public-aid-society`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${stamp(event.date, start)}`,
    `DTEND:${stamp(event.date, start + event.durationMinutes)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadCalendarFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
