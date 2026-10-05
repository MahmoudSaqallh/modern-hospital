export type ComplaintType = "medical" | "appointments" | "conduct" | "facilities" | "digital" | "other";

export type ContactPreference = "phone" | "email" | "none";

/** What the patient fills in. All values are strings as typed; the API normalizes them. */
export interface ComplaintForm {
  type: ComplaintType | "";
  /** Clinic or department id the complaint concerns, or "" when unspecified. */
  target: string;
  subject: string;
  details: string;
  name: string;
  phone: string;
  email: string;
  contactPreference: ContactPreference | "";
}

/** Payload accepted by the complaints API. */
export interface ComplaintSubmission {
  type: ComplaintType;
  target?: string;
  subject: string;
  details: string;
  name: string;
  phone: string;
  email?: string;
  contactPreference: ContactPreference;
}

export interface ComplaintReceipt {
  reference: string;
}

export type ComplaintFailure = "network" | "server" | "rate_limited" | "invalid_request";
