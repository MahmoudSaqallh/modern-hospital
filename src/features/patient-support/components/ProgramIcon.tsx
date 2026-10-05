import { HandHeart } from "lucide-react";
import { MedicalIcon } from "@/components/icons/MedicalIcon";
import type { PatientSupportProgram } from "@/features/patient-support/types";

/** Surgery support uses the site's surgical mark; the fund, a supporting hand. */
export function ProgramIcon({ icon, size = 24, className }: { icon: PatientSupportProgram["icon"]; size?: number; className?: string }) {
  if (icon === "operations") return <MedicalIcon name="surgery" size={size} className={className} />;
  return <HandHeart aria-hidden strokeWidth={1.5} width={size} height={size} className={className} />;
}
