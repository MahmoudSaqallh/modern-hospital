import { getDoctor } from "@/data/doctors";
import { isSlotAvailable } from "@/features/booking/services/availability";
import { createReference, isRateLimited, json, MAX_BODY_BYTES, readSimulation } from "@/features/booking/services/server";
import type { Appointment } from "@/features/booking/types";
import { bookingRequestSchema, checkBookingRules } from "@/features/booking/validation/bookingRequest";
import { toIsoDate } from "@/lib/dates";

/**
 * Mock booking endpoint. Validates everything server-side and never logs or
 * stores patient details. A production backend must additionally persist the
 * appointment atomically (to prevent double booking) and notify the clinic.
 */
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "invalid_request" }, 415);
  }
  if (isRateLimited(request)) return json({ error: "rate_limited" }, 429);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "invalid_request" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const simulation = readSimulation(request);
  if (simulation === "slow") await new Promise((r) => setTimeout(r, 2500));
  if (simulation === "fail") return json({ error: "server" }, 500);
  if (simulation === "taken") return json({ error: "slot_unavailable" }, 409);

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_request" }, 400);

  const result = checkBookingRules(parsed.data, toIsoDate(new Date()));
  if (!result.ok) return json({ error: result.issue }, result.issue === "slot_unavailable" ? 409 : 400);

  const { booking } = result;
  const doctor = getDoctor(booking.doctorId);
  if (!doctor || !isSlotAvailable(doctor, booking.date, booking.time)) {
    return json({ error: "slot_unavailable" }, 409);
  }

  const appointment: Appointment = {
    reference: createReference(booking.date),
    status: "pending",
    departmentId: booking.departmentId,
    doctorId: booking.doctorId,
    date: booking.date,
    time: booking.time,
  };
  return json({ appointment }, 201);
}
