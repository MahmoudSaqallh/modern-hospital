import { describe, expect, it } from "vitest";
import { doctors, getDoctor, getDoctorsByClinic } from "@/data/doctors";
import { addDays, toIsoDate, weekdayOf } from "@/lib/dates";
import {
  applySameDayCutoff,
  findNextAvailable,
  getAvailability,
  getDoctorDay,
  getPooledDay,
  isSlotAvailable,
  SESSION_TIMES,
} from "./availability";

const ahmad = getDoctor("ahmad-mohammad")!;

/** First date on/after `from` with the given weekday. */
function nextWeekday(from: string, weekday: number): string {
  let date = from;
  while (weekdayOf(date) !== weekday) date = addDays(date, 1);
  return date;
}

describe("availability engine", () => {
  it("is deterministic for the same doctor and date", () => {
    const date = nextWeekday("2026-10-01", 6);
    expect(getDoctorDay(ahmad, date)).toEqual(getDoctorDay(ahmad, date));
  });

  it("closes on Fridays and on days the doctor does not work", () => {
    expect(getDoctorDay(ahmad, nextWeekday("2026-10-01", 5)).closed).toBe(true);
    // Ahmad does not work Thursdays (4).
    expect(getDoctorDay(ahmad, nextWeekday("2026-10-01", 4)).closed).toBe(true);
  });

  it("only offers the doctor's own sessions", () => {
    const lina = getDoctor("lina-haddad")!; // morning only
    const day = getDoctorDay(lina, nextWeekday("2026-10-01", 0));
    expect(day.slots.length).toBe(SESSION_TIMES.morning.length);
    expect(day.slots.every((s) => s.session === "morning")).toBe(true);
  });

  it("pools doctors so a time is free if any doctor is free, and assigns that doctor", () => {
    const pool = getDoctorsByClinic("pediatrics");
    const date = nextWeekday("2026-10-01", 0);
    const pooled = getPooledDay(pool, date);
    for (const slot of pooled.slots.filter((s) => s.available)) {
      expect(slot.doctorId).not.toBeNull();
      const doctor = getDoctor(slot.doctorId)!;
      expect(isSlotAvailable(doctor, date, slot.time)).toBe(true);
    }
    for (const slot of pooled.slots.filter((s) => !s.available)) expect(slot.doctorId).toBeNull();
  });

  it("returns one entry per requested day", () => {
    expect(getAvailability([ahmad], "2026-10-01", 14)).toHaveLength(14);
  });

  it("marks today's past slots (plus notice period) as unavailable", () => {
    const date = nextWeekday("2026-10-01", 6);
    const [y, m, d] = date.split("-").map(Number);
    const now = new Date(y, m - 1, d, 10, 10);
    const [day] = applySameDayCutoff([getDoctorDay(ahmad, date)], now);
    for (const slot of day.slots) {
      const [h, min] = slot.time.split(":").map(Number);
      if (h * 60 + min < 10 * 60 + 40) expect(slot.available).toBe(false);
    }
  });

  it("finds a next available slot that is genuinely free and in the future", () => {
    const now = new Date(2026, 9, 4, 8, 0);
    const next = findNextAvailable(doctors, now);
    expect(next).not.toBeNull();
    const doctor = getDoctor(next!.doctorId)!;
    expect(isSlotAvailable(doctor, next!.date, next!.time)).toBe(true);
    expect(next!.date >= toIsoDate(now)).toBe(true);
  });
});
