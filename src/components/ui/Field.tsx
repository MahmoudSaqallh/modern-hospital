import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/localized";

export const inputClasses = (invalid: boolean) =>
  cn(
    "w-full border bg-white px-4 text-[1rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60",
    "focus:shadow-[0_0_0_3px_rgb(11_107_44/0.12)]",
    invalid
      ? "border-medical focus:border-medical focus:shadow-[0_0_0_3px_rgb(201_21_30/0.12)]"
      : "border-line-strong hover:border-ink/35 focus:border-care-deep",
  );

/**
 * Labelled form field: visible label, optional hint, and an error message
 * wired through aria-describedby. Placeholders are never used as labels.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optionalLabel,
  counter,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  optionalLabel?: string;
  counter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.9375rem] font-medium text-ink">
          {label}
          {optionalLabel && <span className="ms-2 text-[0.8125rem] font-normal text-muted">({optionalLabel})</span>}
        </label>
        {counter}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-meta">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-2 text-[0.875rem] leading-6 text-medical">
          <CircleAlert aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** aria-describedby value for a field's hint and error. */
export function describedBy(id: string, hasHint: boolean, hasError: boolean): string | undefined {
  const ids = [hasHint && `${id}-hint`, hasError && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}
