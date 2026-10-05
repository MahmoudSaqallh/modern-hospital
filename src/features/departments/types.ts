import type { LocalizedText } from "@/lib/localized";

export type DepartmentIconName =
  | "maternity"
  | "pediatrics"
  | "internal"
  | "surgery"
  | "cardiology"
  | "orthopedics"
  | "radiology"
  | "laboratory"
  | "dental"
  | "emergency";

export interface Department {
  id: string;
  icon: DepartmentIconName;
  name: LocalizedText;
  /** One-line descriptor used on tiles and booking options. */
  summary: LocalizedText;
  /** Longer copy for the departments page. */
  description: LocalizedText;
  /**
   * Whether patients can book a scheduled appointment online.
   * Urgent-care departments are informational only.
   */
  bookable: boolean;
  /** Urgent context — rendered with the red accent. */
  urgent?: boolean;
}
