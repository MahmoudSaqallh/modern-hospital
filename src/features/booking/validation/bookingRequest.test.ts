import { describe, expect, it } from "vitest";
import { bookingRequestSchema, checkBookingRules } from "./bookingRequest";

const valid = {
  clinicId: "pediatrics",
  doctorId: "ahmad-mohammad",
  date: "2026-10-10",
  time: "09:30",
  patient: { fullName: "أحمد  محمد", phone: "٠٥٩ ١٢٣ ٤٥٦٧", age: 30, notes: "ملاحظة\u0007" },
};

describe("booking request (server-side rules)", () => {
  it("rejects unknown keys and malformed values", () => {
    expect(bookingRequestSchema.safeParse({ ...valid, admin: true }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, date: "2026-02-30" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, time: "25:00" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...valid, patient: { ...valid.patient, age: -1 } }).success).toBe(false);
  });

  it("normalizes a valid request", () => {
    const parsed = bookingRequestSchema.parse(valid);
    const result = checkBookingRules(parsed, "2026-10-04");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.booking.patient.fullName).toBe("أحمد محمد");
      expect(result.booking.patient.phone).toBe("0591234567");
      expect(result.booking.patient.notes).toBe("ملاحظة");
    }
  });

  it("rejects a doctor from another department", () => {
    const parsed = bookingRequestSchema.parse({ ...valid, doctorId: "rana-khalil" });
    expect(checkBookingRules(parsed, "2026-10-04")).toEqual({ ok: false, issue: "invalid_request" });
  });

  it("rejects non-bookable departments and out-of-range dates", () => {
    expect(checkBookingRules(bookingRequestSchema.parse({ ...valid, clinicId: "emergency" }), "2026-10-04").ok).toBe(false);
    expect(checkBookingRules(bookingRequestSchema.parse({ ...valid, date: "2026-09-01" }), "2026-10-04").ok).toBe(false);
    expect(checkBookingRules(bookingRequestSchema.parse({ ...valid, date: "2027-01-01" }), "2026-10-04").ok).toBe(false);
  });

  it("re-validates patient details instead of trusting the client", () => {
    const parsed = bookingRequestSchema.parse({ ...valid, patient: { ...valid.patient, phone: "12" } });
    expect(checkBookingRules(parsed, "2026-10-04").ok).toBe(false);
  });
});
