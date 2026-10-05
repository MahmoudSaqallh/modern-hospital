import { describe, expect, it } from "vitest";
import {
  normalizeDigits,
  normalizePhone,
  parseAge,
  sanitizeNotes,
  validateAge,
  validateName,
  validatePatient,
  validatePhone,
} from "./patient";

describe("patient validation", () => {
  it("converts Arabic-Indic digits", () => {
    expect(normalizeDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(normalizeDigits("۰۹")).toBe("09");
  });

  it("normalizes phone numbers", () => {
    expect(normalizePhone("+970 59-123 4567")).toBe("+970591234567");
    expect(normalizePhone("00970591234567")).toBe("+970591234567");
    expect(normalizePhone("٠٥٩١٢٣٤٥٦٧")).toBe("0591234567");
  });

  it("validates phone numbers with clear codes", () => {
    expect(validatePhone("")).toBe("phoneRequired");
    expect(validatePhone("123")).toBe("phoneInvalid");
    expect(validatePhone("05912abc67")).toBe("phoneInvalid");
    expect(validatePhone("0591234567")).toBeNull();
    expect(validatePhone("٠٥٩١٢٣٤٥٦٧")).toBeNull();
  });

  it("requires a full name of letters", () => {
    expect(validateName("  ")).toBe("nameRequired");
    expect(validateName("أحمد")).toBe("nameFull");
    expect(validateName("Ahmad 99")).toBe("nameChars");
    expect(validateName("أحمد محمد")).toBeNull();
    expect(validateName("Mary-Jane O'Neil")).toBeNull();
    expect(validateName("<script>alert(1)</script> x")).toBe("nameChars");
  });

  it("parses ages, including 0 for infants and Arabic digits", () => {
    expect(parseAge("0")).toBe(0);
    expect(parseAge("٣٥")).toBe(35);
    expect(parseAge("121")).toBeNull();
    expect(parseAge("3.5")).toBeNull();
    expect(validateAge("")).toBe("ageRequired");
    expect(validateAge("abc")).toBe("ageInvalid");
  });

  it("strips control characters from notes but keeps line breaks", () => {
    expect(sanitizeNotes("line one\nline\u0007 two\u0000")).toBe("line one\nline two");
  });

  it("validates a whole form", () => {
    expect(validatePatient({ fullName: "أحمد محمد", phone: "0591234567", age: "30", notes: "" })).toEqual({});
    expect(validatePatient({ fullName: "", phone: "", age: "", notes: "x".repeat(301) })).toEqual({
      fullName: "nameRequired",
      phone: "phoneRequired",
      age: "ageRequired",
      notes: "notesLong",
    });
  });
});
