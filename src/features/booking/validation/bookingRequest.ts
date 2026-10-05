import { z } from "zod";
import { getDepartment } from "@/data/departments";
import { getDoctor } from "@/data/doctors";
import { daysBetween, isClockTime, isIsoDate } from "@/lib/dates";
import { BOOKING_HORIZON_DAYS } from "../services/availability";
import type { PatientBooking } from "../types";
import {
  LIMITS,
  normalizeName,
  normalizePhone,
  sanitizeNotes,
  validateName,
  validatePhone,
} from "./patient";

/**
 * Structural schema for the booking API. Unknown keys are rejected and every
 * string is length-capped before any semantic check runs.
 */
export const bookingRequestSchema = z
  .object({
    departmentId: z.string().min(1).max(40),
    doctorId: z.string().min(1).max(60),
    date: z.string().refine(isIsoDate),
    time: z.string().refine(isClockTime),
    patient: z
      .object({
        fullName: z.string().max(LIMITS.nameMax * 2),
        phone: z.string().max(32),
        age: z.number().int().min(0).max(LIMITS.ageMax),
        notes: z.string().max(LIMITS.notesMax).optional(),
      })
      .strict(),
  })
  .strict();

export type BookingRequestIssue = "invalid_request" | "slot_unavailable";

/**
 * Validate business rules on an already-parsed request and return the
 * normalized booking, or the reason it must be rejected.
 */
export function checkBookingRules(
  input: z.infer<typeof bookingRequestSchema>,
  serverToday: string,
): { ok: true; booking: PatientBooking } | { ok: false; issue: BookingRequestIssue } {
  const department = getDepartment(input.departmentId);
  const doctor = getDoctor(input.doctorId);
  if (!department?.bookable || !doctor || doctor.departmentId !== department.id) {
    return { ok: false, issue: "invalid_request" };
  }
  if (validateName(input.patient.fullName) || validatePhone(input.patient.phone)) {
    return { ok: false, issue: "invalid_request" };
  }
  // Allow one day of slack for patients in time zones ahead of the server.
  const offset = daysBetween(serverToday, input.date);
  if (offset < -1 || offset > BOOKING_HORIZON_DAYS) return { ok: false, issue: "invalid_request" };

  const notes = input.patient.notes ? sanitizeNotes(input.patient.notes) : undefined;
  return {
    ok: true,
    booking: {
      departmentId: department.id,
      doctorId: doctor.id,
      date: input.date,
      time: input.time,
      patient: {
        fullName: normalizeName(input.patient.fullName),
        phone: normalizePhone(input.patient.phone),
        age: input.patient.age,
        ...(notes ? { notes } : {}),
      },
    },
  };
}
