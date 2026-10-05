import { describe, expect, it } from "vitest";
import { getDoctor } from "@/data/doctors";
import { addDays, weekdayOf } from "@/lib/dates";
import { getDoctorDay } from "../services/availability";
import { ANY_DOCTOR } from "../types";
import {
  bookingReducer,
  createInitialState,
  initialBookingState,
  maxReachableStep,
  prefillFromSearch,
  type BookingState,
} from "./bookingState";

const filledPatient = { fullName: "أحمد محمد", phone: "0591234567", age: "30", notes: "" };

function reduce(state: BookingState, ...actions: Parameters<typeof bookingReducer>[1][]): BookingState {
  return actions.reduce(bookingReducer, state);
}

describe("booking prefill from links", () => {
  it("reads ?clinic= and still honours the pre-rename ?department=", () => {
    expect(prefillFromSearch(new URLSearchParams("clinic=dental")).clinic).toBe("dental");
    expect(prefillFromSearch(new URLSearchParams("department=pediatrics")).clinic).toBe("pediatrics");
    expect(prefillFromSearch(new URLSearchParams("clinic=dental&department=pediatrics")).clinic).toBe("dental");
    expect(createInitialState(prefillFromSearch(new URLSearchParams("department=pediatrics")), null)).toMatchObject({
      clinicId: "pediatrics",
      step: 2,
    });
  });

  it("ignores unknown clinics", () => {
    expect(createInitialState(prefillFromSearch(new URLSearchParams("clinic=nope")), null)).toEqual(initialBookingState);
  });
});

describe("booking state machine", () => {
  it("advances as each decision is made", () => {
    let s = reduce(initialBookingState, { type: "selectClinic", clinicId: "pediatrics" });
    expect(s.step).toBe(2);
    s = reduce(s, { type: "selectDoctor", choice: "ahmad-mohammad" });
    expect(s.step).toBe(3);
  });

  it("cannot skip ahead of what has been chosen", () => {
    const s = reduce(initialBookingState, { type: "goToStep", step: 5 });
    expect(s.step).toBe(1);
    expect(reduce(s, { type: "next" }).step).toBe(1);
  });

  it("clears downstream choices when an upstream choice changes", () => {
    const s = reduce(
      initialBookingState,
      { type: "selectClinic", clinicId: "pediatrics" },
      { type: "selectDoctor", choice: "ahmad-mohammad" },
      { type: "selectDate", date: "2026-10-10" },
      { type: "selectSlot", time: "09:00", doctorId: "ahmad-mohammad" },
      { type: "selectClinic", clinicId: "dental" },
    );
    expect(s).toMatchObject({ clinicId: "dental", doctorChoice: null, date: null, time: null, assignedDoctorId: null, step: 2 });
  });

  it("requires valid patient details before review", () => {
    let s = reduce(
      initialBookingState,
      { type: "selectClinic", clinicId: "pediatrics" },
      { type: "selectDoctor", choice: ANY_DOCTOR },
      { type: "selectDate", date: "2026-10-10" },
      { type: "selectSlot", time: "09:00", doctorId: "lina-haddad" },
      { type: "next" },
    );
    expect(s.step).toBe(4);
    expect(reduce(s, { type: "next" }).step).toBe(4);
    for (const [field, value] of Object.entries(filledPatient)) {
      s = reduce(s, { type: "updatePatient", field: field as keyof typeof filledPatient, value });
    }
    expect(maxReachableStep(s)).toBe(5);
    expect(reduce(s, { type: "next" }).step).toBe(5);
  });

  it("ignores a second submit while one is in flight", () => {
    const ready: BookingState = {
      ...initialBookingState,
      step: 5,
      clinicId: "pediatrics",
      doctorChoice: "ahmad-mohammad",
      date: "2026-10-10",
      time: "09:00",
      assignedDoctorId: "ahmad-mohammad",
      patient: filledPatient,
    };
    const submitting = reduce(ready, { type: "submitStart" });
    expect(submitting.submission.status).toBe("submitting");
    expect(reduce(submitting, { type: "submitStart" })).toBe(submitting);
  });

  it("drops invalid URL prefill values", () => {
    expect(createInitialState({ clinic: "not-real" }, null).step).toBe(1);
    // Emergency is a department, not a bookable clinic.
    expect(createInitialState({ clinic: "emergency" }, null).step).toBe(1);
    expect(createInitialState({ clinic: "pediatrics", doctor: "rana-khalil" }, null)).toMatchObject({ step: 2, doctorChoice: null });
  });

  it("prefills straight to patient details for a valid, free, future slot", () => {
    const ahmad = getDoctor("ahmad-mohammad")!;
    let date = "2026-11-01";
    let slot = getDoctorDay(ahmad, date).slots.find((s) => s.available);
    for (let i = 0; !slot && i < 30; i++) {
      date = addDays(date, 1);
      slot = getDoctorDay(ahmad, date).slots.find((s) => s.available);
    }
    expect(slot).toBeDefined();
    const s = createInitialState({ doctor: "ahmad-mohammad", date, time: slot!.time }, new Date(2026, 9, 4));
    expect(s).toMatchObject({ step: 4, clinicId: "pediatrics", date, time: slot!.time, assignedDoctorId: "ahmad-mohammad" });
    expect(weekdayOf(date)).not.toBe(5);
  });
});
