import type {
  Appointment,
  AvailabilityResponse,
  BookingErrorCode,
  DoctorChoice,
  IsoDate,
  PatientBooking,
} from "../types";

/**
 * Typed client for the booking backend. Components never call `fetch`
 * directly — swap `API_BASE` (or this module) to point at the real service.
 */
const API_BASE = process.env.NEXT_PUBLIC_BOOKING_API_BASE ?? "/api";

export class BookingApiError extends Error {
  constructor(public readonly code: BookingErrorCode) {
    super(code);
    this.name = "BookingApiError";
  }
}

/** Development-only: `?simulate=offline|fail|taken|empty|slow` to review error states. */
function simulation(): string | null {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("simulate");
}

function codeForStatus(status: number): BookingErrorCode {
  if (status === 409) return "slot_unavailable";
  if (status === 429) return "rate_limited";
  if (status >= 400 && status < 500) return "invalid_request";
  return "server";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const simulate = simulation();
  if (simulate === "offline") throw new BookingApiError("network");

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(simulate ? { "x-simulate": simulate } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new BookingApiError("network");
  }

  if (!response.ok) throw new BookingApiError(codeForStatus(response.status));
  try {
    return (await response.json()) as T;
  } catch {
    throw new BookingApiError("server");
  }
}

export interface AvailabilityQuery {
  clinicId: string;
  doctorId: DoctorChoice;
  from: IsoDate;
  days: number;
}

export function fetchAvailability(query: AvailabilityQuery, signal?: AbortSignal): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({
    clinicId: query.clinicId,
    doctorId: query.doctorId,
    from: query.from,
    days: String(query.days),
  });
  return request<AvailabilityResponse>(`/availability?${params}`, { signal });
}

export async function submitBooking(booking: PatientBooking, signal?: AbortSignal): Promise<Appointment> {
  const { appointment } = await request<{ appointment: Appointment }>("/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
    signal,
  });
  return appointment;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
