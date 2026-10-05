"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { BookingApiError, isAbortError, submitBooking } from "../services/bookingApi";
import type { PatientBooking } from "../types";
import { normalizeName, normalizePhone, parseAge, sanitizeNotes } from "../validation/patient";
import { bookingReducer, createInitialState, type BookingState } from "./bookingState";

function toPayload(state: BookingState): PatientBooking | null {
  const { departmentId, assignedDoctorId, date, time, patient } = state;
  const age = parseAge(patient.age);
  if (!departmentId || !assignedDoctorId || !date || !time || age === null) return null;
  const notes = sanitizeNotes(patient.notes);
  return {
    departmentId,
    doctorId: assignedDoctorId,
    date,
    time,
    patient: {
      fullName: normalizeName(patient.fullName),
      phone: normalizePhone(patient.phone),
      age,
      ...(notes ? { notes } : {}),
    },
  };
}

/**
 * Booking flow controller: URL prefill, step state and submission.
 * Patient details live in memory only — nothing is written to storage.
 */
export function useBookingFlow() {
  const params = useSearchParams();
  const [state, dispatch] = useReducer(bookingReducer, params, (search) =>
    // Time-independent prefill here; past slots are cleared after mount (see below).
    createInitialState(
      {
        department: search.get("department"),
        doctor: search.get("doctor"),
        date: search.get("date"),
        time: search.get("time"),
      },
      null,
    ),
  );

  // A prefilled time that has already passed (e.g. an old link) sends the patient back to choose again.
  useEffect(() => {
    if (!state.date || !state.time) return;
    if (new Date(`${state.date}T${state.time}:00`).getTime() < Date.now()) {
      dispatch({ type: "clearSlot" });
      dispatch({ type: "goToStep", step: 3 });
    }
    // Run once for the initial (possibly prefilled) selection only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inFlight = useRef<AbortController | null>(null);
  useEffect(() => () => inFlight.current?.abort(), []);

  const submit = useCallback(async () => {
    if (inFlight.current) return; // double-submit guard
    const payload = toPayload(state);
    if (!payload) {
      dispatch({ type: "submitFailure", code: "invalid_request" });
      return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    dispatch({ type: "submitStart" });
    try {
      const appointment = await submitBooking(payload, controller.signal);
      dispatch({ type: "submitSuccess", appointment });
    } catch (error) {
      if (isAbortError(error)) return;
      dispatch({ type: "submitFailure", code: error instanceof BookingApiError ? error.code : "server" });
    } finally {
      inFlight.current = null;
    }
  }, [state]);

  return { state, dispatch, submit };
}
