import { describe, expect, it } from "vitest";
import type { ComplaintForm } from "./types";
import { checkComplaint, complaintSchema, complaintTarget, isKnownTarget, toSubmission, validateComplaint } from "./validation";

const valid: ComplaintForm = {
  type: "appointments",
  target: complaintTarget("clinic", "dental"),
  subject: "تأخر الموعد",
  details: "انتظرت أكثر من ساعة بعد موعدي المحدد دون توضيح.",
  name: "سارة أحمد",
  phone: "٠٥٩١٢٣٤٥٦٧",
  email: "",
  contactPreference: "phone",
};

describe("complaint validation", () => {
  it("accepts a complete complaint and normalizes it", () => {
    expect(validateComplaint(valid)).toEqual({});
    expect(toSubmission(valid)).toEqual({
      type: "appointments",
      target: "clinic:dental",
      subject: "تأخر الموعد",
      details: valid.details,
      name: "سارة أحمد",
      phone: "0591234567",
      contactPreference: "phone",
    });
  });

  it("reports each missing or malformed field", () => {
    const errors = validateComplaint({ ...valid, type: "" as never, subject: "a", details: "short", name: "", phone: "12" });
    expect(errors).toEqual({
      type: "typeRequired",
      subject: "subjectRequired",
      details: "detailsShort",
      name: "nameRequired",
      phone: "phoneInvalid",
    });
  });

  it("requires an email only when it is the chosen contact method", () => {
    expect(validateComplaint({ ...valid, contactPreference: "email" }).email).toBe("emailRequired");
    expect(validateComplaint({ ...valid, email: "not-an-email" }).email).toBe("emailInvalid");
    expect(validateComplaint({ ...valid, email: "sara@example.org", contactPreference: "email" })).toEqual({});
  });

  it("keeps clinic and department targets apart even when ids overlap", () => {
    expect(isKnownTarget(complaintTarget("clinic", "surgery"))).toBe(true);
    expect(isKnownTarget(complaintTarget("department", "surgery"))).toBe(true);
    expect(isKnownTarget(complaintTarget("department", "laboratory"))).toBe(true);
    expect(isKnownTarget(complaintTarget("clinic", "laboratory"))).toBe(false);
    expect(isKnownTarget("surgery")).toBe(false);
  });
});

describe("complaint API schema", () => {
  const payload = { ...valid, phone: "0591234567", email: undefined };

  it("rejects unknown keys and unknown types", () => {
    expect(complaintSchema.safeParse({ ...payload, nationalId: "123" }).success).toBe(false);
    expect(complaintSchema.safeParse({ ...payload, type: "billing" }).success).toBe(false);
  });

  it("re-runs the form rules on the server", () => {
    const parsed = complaintSchema.parse(payload);
    expect(checkComplaint(parsed)).not.toBeNull();
    expect(checkComplaint({ ...parsed, target: "clinic:unknown" })).toBeNull();
    expect(checkComplaint({ ...parsed, details: "too short" })).toBeNull();
  });
});
