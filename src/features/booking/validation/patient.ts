import type { PatientDetails } from "../types";

/**
 * Patient-detail validation shared by the booking form and the booking API.
 * Client-side checks are for guidance only — the API re-validates everything.
 */

export type PatientErrorCode =
  | "nameRequired"
  | "nameFull"
  | "nameChars"
  | "nameLong"
  | "phoneRequired"
  | "phoneInvalid"
  | "ageRequired"
  | "ageInvalid"
  | "notesLong";

export type PatientErrors = Partial<Record<keyof PatientDetails, PatientErrorCode>>;

export const LIMITS = {
  nameMax: 80,
  notesMax: 300,
  ageMax: 120,
  phoneMinDigits: 7,
  phoneMaxDigits: 15,
} as const;

const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;

/** Convert Arabic-Indic digits (٠١٢ / ۰۱۲) to Latin digits so patients can type naturally. */
export function normalizeDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= EXTENDED_ARABIC_INDIC_ZERO ? EXTENDED_ARABIC_INDIC_ZERO : ARABIC_INDIC_ZERO;
    return String(code - base);
  });
}

/** Keep a leading "+" and digits only. */
export function normalizePhone(value: string): string {
  const digits = normalizeDigits(value).trim();
  const plus = digits.startsWith("+") || digits.startsWith("00") ? "+" : "";
  const body = digits.replace(/^(\+|00)/, "").replace(/\D/g, "");
  return plus + body;
}

export function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Strip control characters (except newlines) from free text. */
export function sanitizeNotes(value: string): string {
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim();
}

const NAME_PATTERN = /^[\p{L}\p{M}' .\-]+$/u;

export function validateName(value: string): PatientErrorCode | null {
  const name = normalizeName(value);
  if (!name) return "nameRequired";
  if (name.length > LIMITS.nameMax) return "nameLong";
  if (!NAME_PATTERN.test(name)) return "nameChars";
  if (name.split(" ").filter((part) => part.replace(/[.'\-]/g, "").length > 0).length < 2) return "nameFull";
  return null;
}

export function validatePhone(value: string): PatientErrorCode | null {
  if (!value.trim()) return "phoneRequired";
  const digits = normalizePhone(value).replace("+", "");
  if (digits.length < LIMITS.phoneMinDigits || digits.length > LIMITS.phoneMaxDigits) return "phoneInvalid";
  // Anything other than digits, spaces, dashes, dots, brackets or a leading plus is not a phone number.
  if (/[^\d\s\-+().]/.test(normalizeDigits(value))) return "phoneInvalid";
  return null;
}

export function parseAge(value: string): number | null {
  const normalized = normalizeDigits(value).trim();
  if (!/^\d{1,3}$/.test(normalized)) return null;
  const age = Number(normalized);
  return age <= LIMITS.ageMax ? age : null;
}

export function validateAge(value: string): PatientErrorCode | null {
  if (!value.trim()) return "ageRequired";
  return parseAge(value) === null ? "ageInvalid" : null;
}

export function validateNotes(value: string): PatientErrorCode | null {
  return value.length > LIMITS.notesMax ? "notesLong" : null;
}

const validators: Record<keyof PatientDetails, (value: string) => PatientErrorCode | null> = {
  fullName: validateName,
  phone: validatePhone,
  age: validateAge,
  notes: validateNotes,
};

export function validatePatientField(field: keyof PatientDetails, value: string): PatientErrorCode | null {
  return validators[field](value);
}

export function validatePatient(details: PatientDetails): PatientErrors {
  const errors: PatientErrors = {};
  for (const field of Object.keys(validators) as Array<keyof PatientDetails>) {
    const error = validators[field](details[field]);
    if (error) errors[field] = error;
  }
  return errors;
}
