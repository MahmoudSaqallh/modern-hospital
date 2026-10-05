import type { ComplaintType, ContactPreference } from "@/features/complaints/types";
import type { LocalizedText } from "@/lib/localized";

/**
 * Complaint configuration — edit here, not in the UI.
 * Categories and settings should be confirmed with the society.
 */
export const complaintTypes: ReadonlyArray<{ id: ComplaintType; label: LocalizedText }> = [
  { id: "medical", label: { ar: "خدمة طبية", en: "Medical service" } },
  { id: "appointments", label: { ar: "مواعيد", en: "Appointments" } },
  { id: "conduct", label: { ar: "تعامل", en: "Staff conduct" } },
  { id: "facilities", label: { ar: "مرافق", en: "Facilities" } },
  { id: "digital", label: { ar: "خدمة إلكترونية", en: "Online service" } },
  { id: "other", label: { ar: "أخرى", en: "Other" } },
];

export const contactPreferences: readonly ContactPreference[] = ["phone", "email", "none"];

export const complaintSettings = {
  /**
   * Anonymous complaints are NOT enabled. If the society approves them, set
   * this to true: name and phone become optional and contact is set to "none".
   */
  allowAnonymous: false,
  subjectMax: 120,
  detailsMin: 20,
  detailsMax: 1500,
  /** Attachments are intentionally not accepted until secure storage and scanning exist. */
  attachments: false,
} as const;
