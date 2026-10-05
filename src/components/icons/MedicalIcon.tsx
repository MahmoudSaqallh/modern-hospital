import type { SVGProps } from "react";
import {
  Ambulance,
  Baby,
  Bone,
  Ear,
  HandHelping,
  HeartPulse,
  Microscope,
  PersonStanding,
  Pill,
  Salad,
  ScanLine,
  ShieldPlus,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/**
 * One icon language for clinics and departments — lucide where a precise
 * medical glyph exists, plus custom drawings on the same 24px grid /
 * 1.5 stroke so the set stays uniform.
 */

export type MedicalIconName =
  | "maternity"
  | "pediatrics"
  | "internal"
  | "surgery"
  | "cardiology"
  | "orthopedics"
  | "dental"
  | "dermatology"
  | "ent"
  | "emergency"
  | "radiology"
  | "laboratory"
  | "pharmacy"
  | "sterilization"
  | "physiotherapy"
  | "nutrition"
  | "support";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function CustomIcon({ size = 24, strokeWidth = 1.5, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

function ToothIcon(props: IconProps) {
  return (
    <CustomIcon {...props}>
      <path d="M8.2 3.6c-2.5-.3-4.4 1.4-4.4 4.1 0 1.9.7 3.3 1.2 4.9.7 2.3.9 7.8 2.9 7.8 1.6 0 1.7-4.4 2.7-5.8.6-.8 1.6-.8 2.2 0 1 1.4 1.1 5.8 2.7 5.8 2 0 2.2-5.5 2.9-7.8.5-1.6 1.2-3 1.2-4.9 0-2.7-1.9-4.4-4.4-4.1-1.4.2-2.2.9-3.4.9s-2-.7-3.6-.9Z" />
      <path d="M9 7.2c.9.4 1.9.6 3 .6" />
    </CustomIcon>
  );
}

function ScalpelIcon(props: IconProps) {
  return (
    <CustomIcon {...props}>
      <path d="m3.5 20.5 6.4-6.4" />
      <path d="M9.9 14.1 18.6 5.4a1.6 1.6 0 0 1 2.4 2c-1.4 2.8-4.5 6.1-8.6 8.2Z" />
      <path d="m8.4 12.6 3 3" />
    </CustomIcon>
  );
}

function MaternityIcon(props: IconProps) {
  return (
    <CustomIcon {...props}>
      <circle cx="11" cy="4.2" r="2" />
      <path d="M9.5 21v-5.2c-1-.5-1.7-1.6-1.7-2.9V10a2.6 2.6 0 0 1 2.6-2.6h1.1c1.2 0 2.2.7 2.6 1.8" />
      <path d="M14.1 9.2c2.2.6 3.6 2.3 3.6 4.4 0 2.3-1.8 3.9-4.1 3.9H12.5V21" />
      <path d="M13.6 12.4h.01" />
    </CustomIcon>
  );
}

/** Skin cross-section: surface wave over layered tissue. */
function SkinIcon(props: IconProps) {
  return (
    <CustomIcon {...props}>
      <path d="M3 8.5c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0" />
      <path d="M3 13h18" />
      <path d="M3 17.5h18" />
      <path d="M8 8.8V13" />
      <path d="M15.5 8.8V13" />
      <path d="M11.7 13v4.5" />
    </CustomIcon>
  );
}

/** Sterilization: shield with steam lines. */
function SterilizationIcon(props: IconProps) {
  return (
    <CustomIcon {...props}>
      <path d="M12 21s-7-3.2-7-9.2V6l7-2.5L19 6v5.8C19 17.8 12 21 12 21Z" />
      <path d="M9.5 9.5c.8.8.8 1.7 0 2.5s-.8 1.7 0 2.5" />
      <path d="M12 8.5c.8.8.8 1.7 0 2.5s-.8 1.7 0 2.5s.8 1.7 0 2.5" />
      <path d="M14.5 9.5c.8.8.8 1.7 0 2.5s-.8 1.7 0 2.5" />
    </CustomIcon>
  );
}

const lucideMap: Partial<Record<MedicalIconName, LucideIcon>> = {
  pediatrics: Baby,
  internal: Stethoscope,
  cardiology: HeartPulse,
  orthopedics: Bone,
  ent: Ear,
  emergency: Ambulance,
  radiology: ScanLine,
  laboratory: Microscope,
  pharmacy: Pill,
  physiotherapy: PersonStanding,
  nutrition: Salad,
  support: HandHelping,
};

const customMap: Partial<Record<MedicalIconName, (props: IconProps) => React.JSX.Element>> = {
  dental: ToothIcon,
  surgery: ScalpelIcon,
  maternity: MaternityIcon,
  dermatology: SkinIcon,
  sterilization: SterilizationIcon,
};

export function MedicalIcon({
  name,
  size = 24,
  strokeWidth = 1.5,
  className,
}: {
  name: MedicalIconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Custom = customMap[name];
  if (Custom) return <Custom size={size} strokeWidth={strokeWidth} className={className} />;
  const Lucide = lucideMap[name] ?? ShieldPlus;
  return <Lucide size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}
