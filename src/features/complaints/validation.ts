import { z } from "zod";
import { complaintSettings, complaintTypes, contactPreferences } from "@/data/complaints";
import { getClinic } from "@/data/clinics";
import { getDepartment } from "@/data/departments";
import { normalizeName, normalizePhone, sanitizeNotes, validatePhone } from "@/features/booking/validation/patient";
import type { ComplaintForm, ComplaintSubmission } from "./types";

/**
 * Complaint rules shared by the form (guidance) and the API (enforcement).
 * The server never trusts the client — it re-runs every rule below.
 */

export type ComplaintErrorCode =
  | "typeRequired"
  | "subjectRequired"
  | "subjectLong"
  | "detailsShort"
  | "detailsLong"
  | "nameRequired"
  | "nameChars"
  | "phoneRequired"
  | "phoneInvalid"
  | "emailInvalid"
  | "emailRequired"
  | "preferenceRequired";

export type ComplaintErrors = Partial<Record<keyof ComplaintForm, ComplaintErrorCode>>;

const NAME_PATTERN = /^[\p{L}\p{M}' .\-]+$/u;
// Deliberately simple: one "@", a dot in the domain, no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Complaint targets are prefixed — clinic and department ids can overlap
 * ("surgery" is both a clinic and a department).
 */
export function complaintTarget(kind: "clinic" | "department", id: string): string {
  return `${kind}:${id}`;
}

export function isKnownTarget(target: string): boolean {
  const [kind, id] = target.split(":");
  if (kind === "clinic") return Boolean(getClinic(id));
  if (kind === "department") return Boolean(getDepartment(id));
  return false;
}

export function validateComplaintField(field: keyof ComplaintForm, form: ComplaintForm): ComplaintErrorCode | null {
  switch (field) {
    case "type":
      return complaintTypes.some((t) => t.id === form.type) ? null : "typeRequired";
    case "target":
      return null;
    case "subject": {
      const subject = normalizeName(form.subject);
      if (subject.length < 3) return "subjectRequired";
      return subject.length > complaintSettings.subjectMax ? "subjectLong" : null;
    }
    case "details": {
      const details = form.details.trim();
      if (details.length < complaintSettings.detailsMin) return "detailsShort";
      return details.length > complaintSettings.detailsMax ? "detailsLong" : null;
    }
    case "name": {
      const name = normalizeName(form.name);
      if (name.length < 2) return "nameRequired";
      return NAME_PATTERN.test(name) && name.length <= 80 ? null : "nameChars";
    }
    case "phone": {
      const code = validatePhone(form.phone);
      return code === "phoneRequired" ? "phoneRequired" : code ? "phoneInvalid" : null;
    }
    case "email": {
      const email = form.email.trim();
      if (!email) return form.contactPreference === "email" ? "emailRequired" : null;
      return EMAIL_PATTERN.test(email) && email.length <= 254 ? null : "emailInvalid";
    }
    case "contactPreference":
      return contactPreferences.includes(form.contactPreference as never) ? null : "preferenceRequired";
  }
}

const FIELDS: Array<keyof ComplaintForm> = ["type", "target", "subject", "details", "name", "phone", "email", "contactPreference"];

export function validateComplaint(form: ComplaintForm): ComplaintErrors {
  const errors: ComplaintErrors = {};
  for (const field of FIELDS) {
    const code = validateComplaintField(field, form);
    if (code) errors[field] = code;
  }
  return errors;
}

/** Normalize a valid form into the API payload. */
export function toSubmission(form: ComplaintForm): ComplaintSubmission | null {
  if (Object.keys(validateComplaint(form)).length > 0) return null;
  const email = form.email.trim();
  const target = form.target && isKnownTarget(form.target) ? form.target : undefined;
  return {
    type: form.type as ComplaintSubmission["type"],
    ...(target ? { target } : {}),
    subject: normalizeName(form.subject),
    details: sanitizeNotes(form.details),
    name: normalizeName(form.name),
    phone: normalizePhone(form.phone),
    ...(email ? { email } : {}),
    contactPreference: form.contactPreference as ComplaintSubmission["contactPreference"],
  };
}

/** Structural schema for the API: unknown keys rejected, every string capped. */
export const complaintSchema = z
  .object({
    type: z.enum(complaintTypes.map((t) => t.id) as [string, ...string[]]),
    target: z.string().max(60).optional(),
    subject: z.string().max(complaintSettings.subjectMax * 2),
    details: z.string().max(complaintSettings.detailsMax + 100),
    name: z.string().max(160),
    phone: z.string().max(32),
    email: z.string().max(254).optional(),
    contactPreference: z.enum(contactPreferences as unknown as [string, ...string[]]),
  })
  .strict();

/** Re-run the form rules on the server against the structurally valid payload. */
export function checkComplaint(input: z.infer<typeof complaintSchema>): ComplaintSubmission | null {
  if (input.target && !isKnownTarget(input.target)) return null;
  return toSubmission({
    type: input.type as ComplaintForm["type"],
    target: input.target ?? "",
    subject: input.subject,
    details: input.details,
    name: input.name,
    phone: input.phone,
    email: input.email ?? "",
    contactPreference: input.contactPreference as ComplaintForm["contactPreference"],
  });
}
