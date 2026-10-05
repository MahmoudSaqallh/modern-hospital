import type { ReactNode } from "react";
import { CircleAlert, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/localized";

type Tone = "info" | "error" | "privacy";

const tones: Record<Tone, { icon: typeof Info; classes: string; iconClass: string }> = {
  info: { icon: Info, classes: "border-line bg-mist", iconClass: "text-ink-2" },
  error: { icon: CircleAlert, classes: "border-medical/25 bg-medical-tint", iconClass: "text-medical" },
  privacy: { icon: ShieldCheck, classes: "border-care/20 bg-care-tint/60", iconClass: "text-care-deep" },
};

/**
 * Inline message block. Errors are announced (role="alert"); other tones use
 * role="status" only when `live` is set, so static notes stay quiet.
 */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  live = false,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  live?: boolean;
  className?: string;
}) {
  const { icon: Icon, classes, iconClass } = tones[tone];
  const role = tone === "error" ? "alert" : live ? "status" : undefined;
  return (
    <div role={role} className={cn("flex gap-3.5 border-s-2 border-y border-e px-4 py-3.5", classes, className)}>
      <Icon aria-hidden strokeWidth={1.75} className={cn("mt-1 size-[1.15rem] shrink-0", iconClass)} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className={cn("text-[0.9375rem] leading-7 text-ink-2", title ? "mt-0.5" : undefined)}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
