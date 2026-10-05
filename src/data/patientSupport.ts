import type { DonationDetails, PatientSupportProgram, SupportContact, SupportProgramId } from "@/features/patient-support/types";

/**
 * Patient sponsorship (كفالة المرضى).
 *
 * The phone number and email below are the public contact details approved
 * by the society for this purpose. Donation details are intentionally empty:
 * fill a field only with the official, approved value (project numbers,
 * account, IBAN, bank, donation link, QR) — the page shows each one as soon
 * as it exists and a clear "to be added" state until then.
 */

export const supportContact: SupportContact = {
  phone: "0597706883",
  email: "project@pah.ps",
};

const pendingDonation: DonationDetails = {
  projectNumber: null,
  accountNumber: null,
  iban: null,
  bankName: null,
  donationUrl: null,
  qrCode: null,
};

export const supportPrograms: readonly PatientSupportProgram[] = [
  {
    id: "operations",
    slug: "operations",
    icon: "operations",
    title: { ar: "دعم العمليات", en: "Surgery Support" },
    summary: {
      ar: "مساندة المرضى المحتاجين ممن تتطلب حالاتهم إجراءات أو عمليات طبية.",
      en: "Helping patients in need whose condition requires a medical procedure or surgery.",
    },
    description: {
      ar: "يسهم هذا البرنامج في دعم المرضى المحتاجين ممن تتطلب حالاتهم إجراءات أو عمليات طبية، وفق الآليات والمعايير المعتمدة لدى الجمعية.",
      en: "This program helps patients in need whose condition requires a medical procedure or surgery, according to the society's approved procedures and criteria.",
    },
    contact: supportContact,
    donation: { ...pendingDonation },
  },
  {
    id: "patient-fund",
    slug: "patient-fund",
    icon: "fund",
    title: { ar: "صندوق المريض الفقير", en: "Patients in Need Fund" },
    summary: {
      ar: "مساندة المرضى غير القادرين على تحمل أعباء العلاج وتخفيف تكاليفه عنهم.",
      en: "Supporting patients who cannot bear the cost of treatment and easing that burden.",
    },
    description: {
      ar: "يهدف صندوق المريض الفقير إلى مساندة المرضى غير القادرين على تحمل أعباء العلاج، والمساهمة في تخفيف التكاليف الصحية عنهم وفق الأنظمة المعتمدة لدى الجمعية.",
      en: "The Patients in Need Fund supports patients who cannot bear the cost of their treatment, helping to reduce their healthcare costs under the society's approved regulations.",
    },
    contact: supportContact,
    donation: { ...pendingDonation },
  },
];

export function getSupportProgram(id: SupportProgramId): PatientSupportProgram {
  const program = supportPrograms.find((p) => p.id === id);
  if (!program) throw new Error(`Unknown support program: ${id}`);
  return program;
}

/** Dial exactly the published number. */
export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function mailtoHref(email: string): string {
  return `mailto:${email}`;
}

/** True once any banking / online donation channel has been supplied for the program. */
export function hasDonationChannel(donation: DonationDetails): boolean {
  return Boolean(donation.accountNumber || donation.iban || donation.bankName || donation.donationUrl || donation.qrCode);
}

/** Only official https links are ever rendered as a donation link. */
export function safeDonationUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
