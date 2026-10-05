import { getDoctor } from "@/data/doctors";
import { isSlotAvailable } from "@/features/booking/services/availability";
import type { Appointment } from "@/features/booking/types";
import { bookingRequestSchema, checkBookingRules } from "@/features/booking/validation/bookingRequest";
import { toIsoDate } from "@/lib/dates";
import { createReference, isRateLimited, json, readJsonBody, readSimulation } from "@/lib/server/api";

const MAX_BODY_BYTES = 4_096;

/**
 * Mock booking endpoint. Validates everything server-side and never logs or
 * stores patient details. A production backend must additionally persist the
 * appointment atomically (to prevent double booking) and notify the clinic.
 */
export async function POST(request: Request) {
  if (isRateLimited(request, "bookings")) return json({ error: "rate_limited" }, 429);

  const read = await readJsonBody(request, MAX_BODY_BYTES);
  if (!read.ok) return read.response;

  const simulation = readSimulation(request);
  if (simulation === "slow") await new Promise((r) => setTimeout(r, 2500));
  if (simulation === "fail") return json({ error: "server" }, 500);
  if (simulation === "taken") return json({ error: "slot_unavailable" }, 409);

  const parsed = bookingRequestSchema.safeParse(read.body);
  if (!parsed.success) return json({ error: "invalid_request" }, 400);

  const result = checkBookingRules(parsed.data, toIsoDate(new Date()));
  if (!result.ok) return json({ error: result.issue }, result.issue === "slot_unavailable" ? 409 : 400);

  const { booking } = result;
  const doctor = getDoctor(booking.doctorId);
  if (!doctor || !isSlotAvailable(doctor, booking.date, booking.time)) {
    return json({ error: "slot_unavailable" }, 409);
  }

  const appointment: Appointment = {
    reference: createReference("PAS", booking.date),
    status: "pending",
    clinicId: booking.clinicId,
    doctorId: booking.doctorId,
    date: booking.date,
    time: booking.time,
  };
  return json({ appointment }, 201);
}
