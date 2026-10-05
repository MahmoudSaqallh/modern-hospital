import { getDepartment } from "@/data/departments";
import { getDoctor } from "@/data/doctors";
import { isClockTime, isIsoDate } from "@/lib/dates";
import { isSlotAvailable } from "../services/availability";
import {
  ANY_DOCTOR,
  type Appointment,
  type BookingErrorCode,
  type ClockTime,
  type DoctorChoice,
  type IsoDate,
  type PatientDetails,
} from "../types";
import { validatePatient } from "../validation/patient";

export const BOOKING_STEPS = ["department", "doctor", "schedule", "details", "review"] as const;
export type BookingStepKey = (typeof BOOKING_STEPS)[number];
/** 1-based step number, matching the "01 … 05" progress labels. */
export type BookingStep = 1 | 2 | 3 | 4 | 5;

export type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; code: BookingErrorCode };

export interface BookingState {
  step: BookingStep;
  /** +1 when moving forward, -1 when moving back — drives transition direction. */
  direction: 1 | -1;
  departmentId: string | null;
  doctorChoice: DoctorChoice | null;
  date: IsoDate | null;
  time: ClockTime | null;
  /** The doctor who will take the selected slot (resolved for "any doctor"). */
  assignedDoctorId: string | null;
  patient: PatientDetails;
  submission: SubmissionState;
  appointment: Appointment | null;
}

export type BookingAction =
  | { type: "selectDepartment"; departmentId: string }
  | { type: "selectDoctor"; choice: DoctorChoice }
  | { type: "selectDate"; date: IsoDate }
  | { type: "selectSlot"; time: ClockTime; doctorId: string }
  | { type: "clearSlot" }
  | { type: "updatePatient"; field: keyof PatientDetails; value: string }
  | { type: "goToStep"; step: BookingStep }
  | { type: "next" }
  | { type: "back" }
  | { type: "submitStart" }
  | { type: "submitSuccess"; appointment: Appointment }
  | { type: "submitFailure"; code: BookingErrorCode }
  | { type: "reset" };

export const emptyPatient: PatientDetails = { fullName: "", phone: "", age: "", notes: "" };

export const initialBookingState: BookingState = {
  step: 1,
  direction: 1,
  departmentId: null,
  doctorChoice: null,
  date: null,
  time: null,
  assignedDoctorId: null,
  patient: emptyPatient,
  submission: { status: "idle" },
  appointment: null,
};

/** Furthest step the patient may open given what is already selected. */
export function maxReachableStep(state: BookingState): BookingStep {
  if (!state.departmentId) return 1;
  if (!state.doctorChoice) return 2;
  if (!state.date || !state.time || !state.assignedDoctorId) return 3;
  if (Object.keys(validatePatient(state.patient)).length > 0) return 4;
  return 5;
}

function clampStep(step: number): BookingStep {
  return Math.min(5, Math.max(1, step)) as BookingStep;
}

function moveTo(state: BookingState, target: number): BookingState {
  const step = clampStep(Math.min(target, maxReachableStep(state)));
  if (step === state.step) return state;
  return { ...state, step, direction: step > state.step ? 1 : -1, submission: { status: "idle" } };
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "selectDepartment": {
      if (state.departmentId === action.departmentId) return moveTo(state, 2);
      const next: BookingState = {
        ...state,
        departmentId: action.departmentId,
        doctorChoice: null,
        date: null,
        time: null,
        assignedDoctorId: null,
      };
      return moveTo(next, 2);
    }
    case "selectDoctor": {
      if (state.doctorChoice === action.choice) return moveTo(state, 3);
      return moveTo({ ...state, doctorChoice: action.choice, date: null, time: null, assignedDoctorId: null }, 3);
    }
    case "selectDate":
      if (state.date === action.date) return state;
      return { ...state, date: action.date, time: null, assignedDoctorId: null };
    case "selectSlot":
      return { ...state, time: action.time, assignedDoctorId: action.doctorId, submission: { status: "idle" } };
    case "clearSlot":
      return { ...state, time: null, assignedDoctorId: null };
    case "updatePatient":
      return { ...state, patient: { ...state.patient, [action.field]: action.value } };
    case "goToStep":
      return moveTo(state, action.step);
    case "next":
      return moveTo(state, state.step + 1);
    case "back":
      return moveTo(state, state.step - 1);
    case "submitStart":
      if (maxReachableStep(state) < 5 || state.submission.status === "submitting") return state;
      return { ...state, submission: { status: "submitting" } };
    case "submitSuccess":
      return { ...state, submission: { status: "idle" }, appointment: action.appointment };
    case "submitFailure":
      return { ...state, submission: { status: "error", code: action.code } };
    case "reset":
      return initialBookingState;
  }
}

export interface BookingPrefill {
  department?: string | null;
  doctor?: string | null;
  date?: string | null;
  time?: string | null;
}

/**
 * Build the starting state from URL parameters (e.g. "Book" on a doctor
 * profile). Every value is checked against real data; anything invalid is
 * dropped silently and the patient simply starts one step earlier.
 */
export function createInitialState(prefill: BookingPrefill, now: Date | null): BookingState {
  let state = initialBookingState;

  const doctor = getDoctor(prefill.doctor);
  const departmentId = prefill.department ?? doctor?.departmentId;
  const department = getDepartment(departmentId);
  if (!department?.bookable) return state;
  state = { ...state, departmentId: department.id, step: 2 };

  const choice: DoctorChoice | null =
    prefill.doctor === ANY_DOCTOR ? ANY_DOCTOR : doctor?.departmentId === department.id ? doctor.id : null;
  if (!choice) return state;
  state = { ...state, doctorChoice: choice, step: 3 };

  const { date, time } = prefill;
  if (!doctor || choice === ANY_DOCTOR || !date || !time || !isIsoDate(date) || !isClockTime(time)) return state;
  // Unavailable slot: keep the day so the patient lands on it and picks another time.
  if (!isSlotAvailable(doctor, date, time)) return { ...state, date };
  // Without a clock (first render) the past-time check runs after mount instead.
  if (now && new Date(`${date}T${time}:00`).getTime() < now.getTime()) return state;
  return { ...state, date, time, assignedDoctorId: doctor.id, step: 4 };
}
