import type { ClinicSession, Doctor } from "@/features/doctors/types";
import { addDays, minutesOf, nowMinutes, toIsoDate, weekdayOf } from "@/lib/dates";
import type { AppointmentSlot, ClockTime, DayAvailability, IsoDate } from "../types";

/**
 * Deterministic mock availability engine.
 *
 * Stands in for the hospital scheduling backend: the same doctor + date
 * always produces the same slots, so the client preview and the booking API
 * agree on which times are free. Replace with real schedule data when the
 * backend is connected — callers only depend on the exported functions.
 */

export const SESSION_TIMES: Record<ClinicSession, ClockTime[]> = {
  morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"],
  evening: ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"],
};

/** Friday — clinics follow department-specific hours, so no online booking. */
const CLOSED_WEEKDAY = 5;
const BOOKED_SLOT_PERCENT = 34;
const FULLY_BOOKED_DAY_PERCENT = 14;
/** Minimum notice before a same-day slot can still be booked. */
export const SAME_DAY_NOTICE_MINUTES = 30;
export const BOOKING_HORIZON_DAYS = 21;

/** FNV-1a 32-bit — tiny, stable, good enough for spreading mock bookings. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function sessionOf(time: ClockTime): ClinicSession {
  return minutesOf(time) < 13 * 60 ? "morning" : "evening";
}

export function isWorkingDay(doctor: Doctor, date: IsoDate): boolean {
  const weekday = weekdayOf(date);
  return weekday !== CLOSED_WEEKDAY && (doctor.workingDays as number[]).includes(weekday);
}

export function getDoctorDay(doctor: Doctor, date: IsoDate): DayAvailability {
  if (!isWorkingDay(doctor, date)) return { date, closed: true, slots: [] };

  const fullyBooked = hash(`${doctor.id}|${date}|day`) % 100 < FULLY_BOOKED_DAY_PERCENT;
  const slots: AppointmentSlot[] = doctor.sessions.flatMap((session) =>
    SESSION_TIMES[session].map((time) => ({
      time,
      session,
      available: !fullyBooked && hash(`${doctor.id}|${date}|${time}`) % 100 >= BOOKED_SLOT_PERCENT,
      doctorId: doctor.id,
    })),
  );
  return { date, closed: false, slots };
}

/** Merge several doctors into one "any available doctor" schedule. */
export function getPooledDay(pool: Doctor[], date: IsoDate): DayAvailability {
  const days = pool.map((doctor) => getDoctorDay(doctor, date));
  if (days.every((day) => day.closed)) return { date, closed: true, slots: [] };

  const byTime = new Map<ClockTime, AppointmentSlot>();
  for (const day of days) {
    for (const slot of day.slots) {
      const existing = byTime.get(slot.time);
      if (!existing || (!existing.available && slot.available)) byTime.set(slot.time, slot);
    }
  }
  const slots = [...byTime.values()].sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
  return {
    date,
    closed: false,
    slots: slots.map((slot) => ({ ...slot, session: sessionOf(slot.time), doctorId: slot.available ? slot.doctorId : null })),
  };
}

export function getAvailability(pool: Doctor[], from: IsoDate, days: number): DayAvailability[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i);
    return pool.length === 1 ? getDoctorDay(pool[0], date) : getPooledDay(pool, date);
  });
}

export function isSlotAvailable(doctor: Doctor, date: IsoDate, time: ClockTime): boolean {
  return getDoctorDay(doctor, date).slots.some((slot) => slot.time === time && slot.available);
}

/**
 * Mark today's slots that are already in the past (or too close to book)
 * as unavailable. Runs on the client, where the patient's clock is known.
 */
export function applySameDayCutoff(days: DayAvailability[], now: Date): DayAvailability[] {
  const today = toIsoDate(now);
  const cutoff = nowMinutes(now) + SAME_DAY_NOTICE_MINUTES;
  return days.map((day) =>
    day.date !== today
      ? day
      : {
          ...day,
          slots: day.slots.map((slot) =>
            minutesOf(slot.time) < cutoff ? { ...slot, available: false, doctorId: null } : slot,
          ),
        },
  );
}

export function dayHasAvailability(day: DayAvailability): boolean {
  return !day.closed && day.slots.some((slot) => slot.available);
}

export interface NextAvailable {
  doctorId: string;
  date: IsoDate;
  time: ClockTime;
}

/** Earliest bookable slot across the given doctors, from `now` onward. */
export function findNextAvailable(pool: Doctor[], now: Date, horizonDays = 14): NextAvailable | null {
  const today = toIsoDate(now);
  for (let i = 0; i < horizonDays; i++) {
    const date = addDays(today, i);
    let best: NextAvailable | null = null;
    for (const doctor of pool) {
      const [day] = applySameDayCutoff([getDoctorDay(doctor, date)], now);
      const slot = day.slots.find((s) => s.available);
      if (slot && (!best || minutesOf(slot.time) < minutesOf(best.time))) {
        best = { doctorId: doctor.id, date, time: slot.time };
      }
    }
    if (best) return best;
  }
  return null;
}
