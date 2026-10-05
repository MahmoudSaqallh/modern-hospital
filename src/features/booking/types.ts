import type { ClinicSession } from "@/features/doctors/types";

export type { Department } from "@/features/departments/types";
export type { Doctor } from "@/features/doctors/types";

/** ISO calendar date, "YYYY-MM-DD", always interpreted in the clinic's local calendar. */
export type IsoDate = string;
/** 24h clock time, "HH:mm". */
export type ClockTime = string;

/** Sentinel doctor id used when the patient accepts any available doctor. */
export const ANY_DOCTOR = "any" as const;
export type DoctorChoice = string | typeof ANY_DOCTOR;

export interface AppointmentSlot {
  time: ClockTime;
  session: ClinicSession;
  available: boolean;
  /** Doctor who would take this slot (resolved for "any doctor" requests). */
  doctorId: string | null;
}

export interface DayAvailability {
  date: IsoDate;
  /** Clinic closed for this doctor/department on this day. */
  closed: boolean;
  slots: AppointmentSlot[];
}

export interface AvailabilityResponse {
  days: DayAvailability[];
}

export interface PatientDetails {
  fullName: string;
  phone: string;
  age: string;
  notes: string;
}

/** Payload sent to the booking API. */
export interface PatientBooking {
  departmentId: string;
  doctorId: string;
  date: IsoDate;
  time: ClockTime;
  patient: {
    fullName: string;
    phone: string;
    age: number;
    notes?: string;
  };
}

export type AppointmentStatus = "pending" | "confirmed";

/** What the API returns once a booking request is accepted. */
export interface Appointment {
  reference: string;
  status: AppointmentStatus;
  departmentId: string;
  doctorId: string;
  date: IsoDate;
  time: ClockTime;
}

/** Patient-facing failure categories — never surface raw technical errors. */
export type BookingErrorCode =
  | "slot_unavailable"
  | "invalid_request"
  | "network"
  | "server"
  | "rate_limited";
