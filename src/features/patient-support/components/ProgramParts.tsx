import { safeDonationUrl } from "@/data/patientSupport";
import type { PatientSupportProgram } from "@/features/patient-support/types";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import { cn } from "@/lib/localized";
import { ButtonLink, buttonClasses, ForwardArrow } from "@/components/ui/Button";

/** "To be added" — a clear, honest empty state for details not yet supplied. */
export function PendingValue({ dict, className }: { dict: Dictionary; className?: string }) {
  return (
    <span data-pending className={cn("inline-flex items-center gap-2 text-muted", className)}>
      <span aria-hidden className="size-1.5 rounded-full border border-muted" />
      {dict.patientSupport.program.pending}
    </span>
  );
}

/**
 * The program's "contribute" action: the official donation page once one is
 * approved (https only, opens in a new tab), otherwise the program's
 * contribution details on this page. Never a fake checkout.
 */
export function ContributeLink({
  program,
  dict,
  size = "md",
  variant = "primary",
  className,
}: {
  program: PatientSupportProgram;
  dict: Dictionary;
  size?: "md" | "lg";
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const label = dict.patientSupport.program.contribute[program.id];
  const external = safeDonationUrl(program.donation.donationUrl);
  if (external) {
    return (
      <a href={external} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant, size, className })}>
        <span>{label}</span>
        <ForwardArrow />
        <span className="visually-hidden"> ({dict.a11y.opensExternal})</span>
      </a>
    );
  }
  return (
    <ButtonLink href={`#contribute-${program.id}`} variant={variant} size={size} arrow className={className}>
      {label}
    </ButtonLink>
  );
}
