import { cn } from "@/lib/localized";

export type Availability = "available" | "later" | "none";

/**
 * Availability indicator. Always paired with visible text by the caller —
 * colour is never the only signal.
 */
export function StatusDot({ status, className }: { status: Availability; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-2 shrink-0", className)}>
      {status === "available" && (
        <span className="absolute inset-0 animate-beat rounded-full bg-care motion-reduce:hidden" />
      )}
      <span
        className={cn(
          "relative size-2 rounded-full",
          status === "available" && "bg-care",
          status === "later" && "bg-care/45",
          status === "none" && "border border-muted/60 bg-transparent",
        )}
      />
    </span>
  );
}
