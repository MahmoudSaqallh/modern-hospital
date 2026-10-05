import type { MedicalIconName } from "@/components/icons/MedicalIcon";
import type { LocalizedText } from "@/lib/localized";

/**
 * Therapeutic departments treat patients directly; supporting departments
 * enable diagnosis, treatment and operations behind the scenes.
 */
export type DepartmentCategory = "therapeutic" | "supporting";

/**
 * A hospital department — an organizational unit, not something patients
 * book directly (patients book clinics: see features/clinics).
 */
export interface Department {
  id: string;
  category: DepartmentCategory;
  icon: MedicalIconName;
  name: LocalizedText;
  /** What the department does, in one or two sentences. */
  role: LocalizedText;
  services: LocalizedText[];
  /** Outpatient clinics this department runs or works with. */
  clinicIds: string[];
}
