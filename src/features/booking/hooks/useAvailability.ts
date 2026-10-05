"use client";

import { useEffect, useMemo, useState } from "react";
import { applySameDayCutoff } from "../services/availability";
import { BookingApiError, fetchAvailability, isAbortError } from "../services/bookingApi";
import type { BookingErrorCode, DayAvailability, DoctorChoice } from "../types";
import { toIsoDate } from "@/lib/dates";

export const SCHEDULE_DAYS = 14;

export type AvailabilityState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; code: BookingErrorCode }
  | { status: "success"; days: DayAvailability[] };

type Settled = { key: string } & ({ status: "error"; code: BookingErrorCode } | { status: "success"; days: DayAvailability[] });

/**
 * Loads the next two weeks of availability for a department + doctor choice.
 * Loading is derived from "no settled result for the current request", so a
 * new selection immediately shows the skeleton and stale data never flashes.
 */
export function useAvailability(clinicId: string | null, doctorChoice: DoctorChoice | null, now: Date | null) {
  const [settled, setSettled] = useState<Settled | null>(null);
  const [attempt, setAttempt] = useState(0);
  const from = now ? toIsoDate(now) : null;
  const key = clinicId && doctorChoice && from ? `${clinicId}|${doctorChoice}|${from}|${attempt}` : null;

  useEffect(() => {
    if (!key || !clinicId || !doctorChoice || !from) return;
    const controller = new AbortController();
    fetchAvailability({ clinicId, doctorId: doctorChoice, from, days: SCHEDULE_DAYS }, controller.signal).then(
      (response) => setSettled({ key, status: "success", days: response.days }),
      (error: unknown) => {
        if (isAbortError(error)) return;
        setSettled({ key, status: "error", code: error instanceof BookingApiError ? error.code : "server" });
      },
    );
    return () => controller.abort();
  }, [key, clinicId, doctorChoice, from]);

  const state: AvailabilityState = useMemo(() => {
    if (!key) return { status: "idle" };
    if (!settled || settled.key !== key) return { status: "loading" };
    if (settled.status === "error") return { status: "error", code: settled.code };
    // The patient's clock decides which of today's slots are already past.
    return { status: "success", days: now ? applySameDayCutoff(settled.days, now) : settled.days };
  }, [key, settled, now]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}
