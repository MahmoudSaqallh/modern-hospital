import type { MedicalIconName } from "@/components/icons/MedicalIcon";
import type { LocalizedText } from "@/lib/localized";

/**
 * An outpatient clinic — a medical specialty patients can book directly.
 * (Departments are a separate, organizational concept: see features/departments.)
 */
export interface Clinic {
  id: string;
  icon: MedicalIconName;
  /** e.g. "عيادة الأطفال" */
  name: LocalizedText;
  /** One-line descriptor used on tiles and booking options. */
  summary: LocalizedText;
  /** Longer copy for the clinics page. */
  description: LocalizedText;
  /** Whether online booking is currently open for this clinic. */
  bookable: boolean;
}
