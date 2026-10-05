import { describe, expect, it } from "vitest";
import ar from "@/i18n/dictionaries/ar";
import en from "@/i18n/dictionaries/en";
import { switchLocalePath } from "@/i18n/config";
import { plural } from "@/i18n/plural";
import { buildCalendarFile } from "@/features/booking/services/calendarFile";
import { addDays, formatTime, isIsoDate, toIsoDate } from "./dates";
import { matchesQuery } from "./search";

describe("dates", () => {
  it("validates real calendar dates only", () => {
    expect(isIsoDate("2026-10-04")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("26-10-04")).toBe(false);
  });

  it("adds days across month boundaries in local time", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("formats times for each language", () => {
    expect(formatTime("16:30", "ar")).toBe("4:30 م");
    expect(formatTime("09:00", "en")).toBe("9:00 AM");
    expect(formatTime("12:00", "en")).toBe("12:00 PM");
  });
});

describe("search", () => {
  it("matches Arabic letter variants and the definite article", () => {
    expect(matchesQuery("اطفال", "الأطفال")).toBe(true);
    expect(matchesQuery("الباطنه", "الباطنة")).toBe(true);
    expect(matchesQuery("pedia", "Pediatrics")).toBe(true);
    expect(matchesQuery("قلب", "الأسنان")).toBe(false);
  });
});

describe("i18n", () => {
  it("uses the right Arabic plural forms", () => {
    expect(plural(ar.common.doctorsCount, 1, "ar")).toBe("طبيب واحد");
    expect(plural(ar.common.doctorsCount, 2, "ar")).toBe("طبيبان");
    expect(plural(ar.common.doctorsCount, 3, "ar")).toBe("3 أطباء");
    expect(plural(ar.common.doctorsCount, 11, "ar")).toBe("11 طبيباً");
    expect(plural(en.common.doctorsCount, 3, "en")).toBe("3 doctors");
  });

  it("switches language while keeping the route", () => {
    expect(switchLocalePath("/ar/doctors/ahmad-mohammad", "en")).toBe("/en/doctors/ahmad-mohammad");
    expect(switchLocalePath("/en", "ar")).toBe("/ar");
  });

  it("has an English string for every Arabic key", () => {
    const keys = (obj: object, prefix = ""): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
      );
    expect(keys(en).sort()).toEqual(keys(ar).sort());
  });
});

describe("calendar file", () => {
  it("produces a valid, escaped VEVENT", () => {
    const ics = buildCalendarFile({
      uid: "PAS-1",
      date: "2026-10-10",
      time: "16:30",
      durationMinutes: 30,
      title: "موعد طبي — الأطفال",
      description: "Doctor: A, B; ref",
    });
    expect(ics).toContain("DTSTART:20261010T163000");
    expect(ics).toContain("DTEND:20261010T170000");
    expect(ics).toContain("DESCRIPTION:Doctor: A\\, B\\; ref");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});
