import { z } from "zod";
import { getDepartment } from "@/data/departments";
import { getDoctor, getDoctorsByDepartment } from "@/data/doctors";
import { BOOKING_HORIZON_DAYS, getAvailability } from "@/features/booking/services/availability";
import { json, readSimulation } from "@/features/booking/services/server";
import type { Doctor } from "@/features/doctors/types";
import { ANY_DOCTOR, type AvailabilityResponse } from "@/features/booking/types";
import { daysBetween, isIsoDate, toIsoDate } from "@/lib/dates";

const querySchema = z.object({
  departmentId: z.string().min(1).max(40),
  doctorId: z.string().min(1).max(60),
  from: z.string().refine(isIsoDate),
  days: z.coerce.number().int().min(1).max(BOOKING_HORIZON_DAYS),
});

function resolvePool(departmentId: string, doctorId: string): Doctor[] {
  if (doctorId === ANY_DOCTOR) return getDoctorsByDepartment(departmentId);
  const doctor = getDoctor(doctorId);
  return doctor && doctor.departmentId === departmentId ? [doctor] : [];
}

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return json({ error: "invalid_request" }, 400);

  const { departmentId, doctorId, from, days } = parsed.data;
  const offset = daysBetween(toIsoDate(new Date()), from);
  if (offset < -1 || offset > BOOKING_HORIZON_DAYS) return json({ error: "invalid_request" }, 400);

  const department = getDepartment(departmentId);
  const pool = department?.bookable ? resolvePool(department.id, doctorId) : [];
  if (pool.length === 0) return json({ error: "invalid_request" }, 400);

  const simulation = readSimulation(request);
  if (simulation === "slow") await new Promise((r) => setTimeout(r, 2500));
  if (simulation === "fail") return json({ error: "server" }, 500);

  const schedule = getAvailability(pool, from, days);
  const response: AvailabilityResponse = {
    days: simulation === "empty" ? schedule.map((day) => ({ ...day, slots: day.slots.map((s) => ({ ...s, available: false, doctorId: null })) })) : schedule,
  };
  return json(response);
}
