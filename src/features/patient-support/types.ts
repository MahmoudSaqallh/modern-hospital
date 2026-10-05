import type { LocalizedText } from "@/lib/localized";

export type SupportProgramId = "operations" | "patient-fund";

/** Public inquiry details for patient sponsorship — only values the society has approved for publication. */
export interface SupportContact {
  /** Shown and dialled exactly as written. */
  phone: string;
  email: string;
}

/**
 * How to contribute to a program. Every field stays `null` until the society
 * supplies and approves the real value — the page never shows placeholders
 * dressed up as data, and never invents banking details.
 */
export interface DonationDetails {
  projectNumber: string | null;
  accountNumber: string | null;
  iban: string | null;
  bankName: LocalizedText | null;
  /** An official, approved donation page (https only). */
  donationUrl: string | null;
  /** A QR code image (in /public) with its text alternative. */
  qrCode: { src: string; alt: LocalizedText } | null;
}

export interface PatientSupportProgram {
  id: SupportProgramId;
  /** In-page anchor and future detail-route slug. */
  slug: string;
  icon: "operations" | "fund";
  title: LocalizedText;
  /** One line for overviews and the home page. */
  summary: LocalizedText;
  description: LocalizedText;
  contact: SupportContact;
  donation: DonationDetails;
}
